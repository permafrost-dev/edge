"use strict";
/**
 * @module Lexer
*/
/**
* edge-lexer
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
const os_1 = require("os");
const BlockStatement = require("../TagStatement");
const MustacheStatement = require("../MustacheStatement");
const Contracts_1 = require("../Contracts");
const TAG_REGEX = /^(\\)?@(?:!)?(\w+)/;
const IGNORED_MUSTACHE_REGEX = /@{{2}/;
const MUSTACHE_REGEX = /{{2}/;
const ESCAPE_REGEX = /^(\s*)\\/;
const TRIM_TAG_REGEX = /^@/;
class Tokenizer {
    constructor(template, tagsDef) {
        this.template = template;
        this.tagsDef = tagsDef;
        this.tokens = [];
        this.openedTags = [];
        this.blockStatement = null;
        this.mustacheStatement = null;
        this.line = 0;
    }
    /**
     * Returns the tag defination when line matches the regex
     * of a tag.
     *
     * @param  {string} line
     *
     * @returns object
     */
    getTag(line) {
        const match = TAG_REGEX.exec(line.trim());
        if (!match) {
            return null;
        }
        const tagName = match[2];
        if (!this.tagsDef[tagName]) {
            return null;
        }
        if (match[1]) {
            return { escaped: true };
        }
        return this.tagsDef[tagName];
    }
    /**
     * Returns the node for a tag
     *
     * @param  {Prop} properties
     * @param  {number} lineno
     *
     * @returns Node
     */
    getTagNode(properties, lineno) {
        return {
            type: Contracts_1.NodeType.BLOCK,
            properties,
            lineno,
            children: []
        };
    }
    /**
     * Returns the node for a raw string
     *
     * @param  {string} value
     *
     * @returns Node
     */
    getRawNode(value) {
        return {
            type: Contracts_1.NodeType.RAW,
            value,
            lineno: this.line
        };
    }
    /**
     * Returns the node for a newline
     *
     * @returns Node
     */
    getBlankLineNode() {
        return {
            type: Contracts_1.NodeType.NEWLINE,
            lineno: this.line
        };
    }
    /**
     * Returns the mustache node
     *
     * @param  {Prop} properties
     * @param  {number} lineno
     *
     * @returns MustacheNode
     */
    getMustacheNode(properties, lineno) {
        return {
            type: Contracts_1.NodeType.MUSTACHE,
            lineno,
            properties: {
                name: properties.name,
                jsArg: properties.jsArg,
                raw: properties.raw
            }
        };
    }
    /**
     * Returns a boolean, when line content is a closing
     * tag
     *
     * @param  {string} line
     *
     * @returns boolean
     */
    isClosingTag(line) {
        if (!this.openedTags.length) {
            return false;
        }
        const recentTag = this.openedTags[this.openedTags.length - 1];
        return line.trim() === `@end${recentTag.properties.name}`;
    }
    /**
     * Returns a boolean, telling if a given statement is seeking
     * for more content or not
     *
     * @param  {BlockStatement|MustacheStatement} statement
     *
     * @returns boolean
     */
    isSeeking(statement) {
        return statement && statement.seeking;
    }
    /**
     * Returns a boolean, telling if a given statement has ended or
     * not.
     *
     * @param  {BlockStatement|MustacheStatement} statement
     *
     * @returns boolean
     */
    isSeeked(statement) {
        return statement && !statement.seeking;
    }
    /**
     * Here we add the node to tokens or as children for
     * the recentOpenedTag (if one exists).
     *
     * @param  {Node} tag
     *
     * @returns void
     */
    consumeNode(tag) {
        if (this.openedTags.length) {
            this.openedTags[this.openedTags.length - 1].children.push(tag);
            return;
        }
        this.tokens.push(tag);
    }
    /**
     * Feeds the text to the currently opened block statement.
     * Make sure that `seeking` is true on the block
     * statement, before calling this method.
     *
     * @param  {string} text
     *
     * @returns void
     */
    feedTextToBlockStatement(text) {
        this.blockStatement.feed(text);
        if (!this.isSeeked(this.blockStatement)) {
            return;
        }
        const { props, startPosition } = this.blockStatement;
        /**
         * If tag is a block level, then we added it to the openedTags
         * array, otherwise we add it to the tokens.
         */
        if (this.tagsDef[props.name].block) {
            this.openedTags.push(this.getTagNode(props, startPosition));
        }
        else {
            this.consumeNode(this.getTagNode(props, startPosition));
        }
        this.consumeNode(this.getBlankLineNode());
        this.blockStatement = null;
    }
    /**
     * Feeds text to the currently opened mustache statement. Make sure
     * to check `seeking` is true, before calling this method.
     *
     * @param  {string} text
     *
     * @returns void
     */
    feedTextToMustacheStatement(text) {
        this.mustacheStatement.feed(text);
        if (!this.isSeeked(this.mustacheStatement)) {
            return;
        }
        const { props, startPosition } = this.mustacheStatement;
        /**
         * Process text left when exists
         */
        if (props.textLeft) {
            const textNode = this.getRawNode(props.textLeft);
            textNode.lineno = startPosition;
            this.consumeNode(textNode);
        }
        /**
         * Then consume the actual mustache expression
         */
        this.consumeNode(this.getMustacheNode(props, startPosition));
        this.mustacheStatement = null;
        /**
         * Finally, there is no content to the right, then process
         * it, otherwise add a new line token
         */
        if (props.textRight) {
            this.processText(props.textRight);
        }
        else {
            this.consumeNode(this.getBlankLineNode());
        }
    }
    /**
     * Process a piece of text, by finding if text has reserved keywords,
     * otherwise process it as a raw node.
     *
     * @param  {string} text
     *
     * @returns void
     */
    processText(text) {
        /**
         * Block statement is seeking for more content
         */
        if (this.isSeeking(this.blockStatement)) {
            this.feedTextToBlockStatement(text);
            return;
        }
        /**
         * Mustache statement is seeking for more content
         */
        if (this.isSeeking(this.mustacheStatement)) {
            this.feedTextToMustacheStatement(text);
            return;
        }
        const tag = this.getTag(text);
        /**
         * Text is a escaped tag
         */
        if (tag && tag.escaped) {
            this.consumeNode(this.getRawNode(text.replace(ESCAPE_REGEX, '$1')));
            this.consumeNode(this.getBlankLineNode());
            return;
        }
        /**
         * Text is a tag
         */
        if (tag) {
            this.blockStatement = new BlockStatement(this.line, tag.seekable);
            this.feedTextToBlockStatement(text.trim().replace(TRIM_TAG_REGEX, ''));
            return;
        }
        /**
         * Text is a closing block tag
         */
        if (this.isClosingTag(text)) {
            this.consumeNode(this.openedTags.pop());
            this.consumeNode(this.getBlankLineNode());
            return;
        }
        /**
         * Text contains mustache expressions
         */
        if (MUSTACHE_REGEX.test(text)) {
            this.mustacheStatement = new MustacheStatement(this.line);
            this.feedTextToMustacheStatement(text);
            return;
        }
        /**
         * A plain raw node
         */
        this.consumeNode(this.getRawNode(text));
        this.consumeNode(this.getBlankLineNode());
    }
    /**
     * Parses the AST
     *
     * @returns void
     */
    parse() {
        const lines = this.template.split(os_1.EOL);
        while (lines.length) {
            this.line++;
            this.processText(lines.shift());
        }
        /**
         * Process entire text, but there is an open statement, so we will
         * process it as a raw node
         */
        if (this.blockStatement) {
            this.consumeNode(this.getRawNode(`@${this.blockStatement.props.raw}`));
            this.blockStatement = null;
            this.consumeNode(this.getBlankLineNode());
        }
        /**
         * Process entire text, but there is an open statement, so we will
         * process it as a raw node
         */
        if (this.mustacheStatement) {
            const { textLeft, textRight, raw } = this.mustacheStatement.props;
            this.mustacheStatement = null;
            this.consumeNode(this.getRawNode(`${textLeft}${raw}${textRight}`));
            this.consumeNode(this.getBlankLineNode());
        }
    }
}
module.exports = Tokenizer;
//# sourceMappingURL=index.js.map