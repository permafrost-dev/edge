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
const Contracts_1 = require("../Contracts");
const CharBucket = require("../CharBucket");
const OPENING_BRACE = 123;
const CLOSING_BRACE = 125;
class MustacheStatement {
    constructor(startPosition) {
        this.startPosition = startPosition;
        this.started = false;
        this.ended = false;
        this.props = {
            name: '',
            jsArg: '',
            raw: '',
            textLeft: '',
            textRight: ''
        };
        this.internalProps = {
            jsArg: new CharBucket(Contracts_1.WhiteSpaceModes.CONTROLLED),
            textLeft: new CharBucket(Contracts_1.WhiteSpaceModes.ALL),
            textRight: new CharBucket(Contracts_1.WhiteSpaceModes.ALL)
        };
        this.internalBraces = 0;
        this.currentProp = 'textLeft';
    }
    /**
     * Returns the name of the type of the mustache tag. If char and
     * surrounding chars, doesn't form an opening `{{` mustache
     * pattern, then `null` will be returned
     *
     *
     * @param  {string[]} chars
     * @param  {number} charCode
     *
     * @returns null
     */
    getName(chars, charCode) {
        if (charCode !== OPENING_BRACE || !chars.length) {
            return null;
        }
        let next = chars[0].charCodeAt(0);
        /**
         * Will be considered as mustache, when consecutive chars
         * are {{
         */
        const isMustache = next === OPENING_BRACE;
        if (!isMustache) {
            return null;
        }
        chars.shift();
        this.props.raw += '{{';
        if (!chars.length) {
            return 'mustache';
        }
        /**
         * Will be considered as `escaped mustache`, when consecutive
         * chars are {{{
         */
        next = chars[0].charCodeAt(0);
        const isEMustache = next === OPENING_BRACE;
        if (!isEMustache) {
            return 'mustache';
        }
        chars.shift();
        this.props.raw += '{';
        return 'emustache';
    }
    /**
     * Returns a boolean telling whether the current char and surrounding
     * chars form the closing of mustache.
     *
     * @param  {string[]} chars
     * @param  {number} charCode
     *
     * @returns boolean
     */
    isClosing(chars, charCode) {
        if (charCode !== CLOSING_BRACE || this.internalBraces !== 0) {
            return false;
        }
        /**
         * If opening statement was detected as `emustache`, then expect
         * 2 more consecutive chars as CLOSING_BRACE
         */
        if (this.props.name === 'emustache' && chars.length >= 2) {
            const next = chars[0].charCodeAt(0);
            const nextToNext = chars[1].charCodeAt(0);
            if (next === CLOSING_BRACE && nextToNext === CLOSING_BRACE) {
                chars.shift();
                chars.shift();
                this.props.raw += '}}';
                return true;
            }
            return false;
        }
        /**
         * If opening statement was detected as `mustache`, then expect
         * 1 more consecutive char as CLOSING_BRACE
         */
        if (this.props.name === 'mustache' && chars.length >= 1) {
            const next = chars[0].charCodeAt(0);
            if (next === CLOSING_BRACE) {
                chars.shift();
                this.props.raw += '}';
                return true;
            }
            return false;
        }
        return false;
    }
    /**
     * We are seeking for more content, when the found
     * opening braces but waiting for curly braces.
     *
     * @returns boolean
     */
    get seeking() {
        return this.started && !this.ended;
    }
    /**
     * Process one char at a time
     *
     *
     * @param  {string[]} chars
     * @param  {string} char
     *
     * @returns void
     */
    processChar(chars, char) {
        let name = null;
        const charCode = char.charCodeAt(0);
        /**
         * Store raw statement
         */
        if (this.currentProp === 'jsArg') {
            this.props.raw += char;
        }
        /**
         * Only process name, when are not in inside mustache
         * statement.
         */
        if (!this.started) {
            name = this.getName(chars, charCode);
        }
        /**
         * When a name is found, we consider it as a start
         * of `mustache` statement
         */
        if (name) {
            this.props.name = name;
            this.started = true;
            this.setProp();
            this.currentProp = 'jsArg';
            return;
        }
        /**
         * If statement was started and not ended and is a closing
         * tag, then close mustache
         */
        if (this.started && !this.ended && this.isClosing(chars, charCode)) {
            this.setProp();
            this.currentProp = 'textRight';
            this.ended = true;
            return;
        }
        if (charCode === OPENING_BRACE) {
            this.internalBraces++;
        }
        if (charCode === CLOSING_BRACE) {
            this.internalBraces--;
        }
        this.internalProps[this.currentProp].feed(char);
    }
    /**
     * Sets the value from internal prop to the public prop
     * as a string
     *
     * @returns void
     */
    setProp() {
        this.props[this.currentProp] = this.internalProps[this.currentProp].get();
    }
    /**
     * Feed a new line to be parsed as mustache. For performance it is recommended
     * to check that line contains alteast one `{{` statement and is not escaped.
     *
     * @param  {string} line
     *
     * @returns void
     */
    feed(line) {
        if (this.ended) {
            throw new Error(`Unexpected token {${line}}`);
        }
        this.props.raw = this.props.raw ? `${this.props.raw}\n` : this.props.raw;
        const chars = line.split('');
        while (chars.length) {
            const char = chars.shift();
            this.processChar(chars, char);
        }
        if (!this.seeking) {
            this.setProp();
            this.internalProps = null;
        }
    }
}
module.exports = MustacheStatement;
//# sourceMappingURL=index.js.map