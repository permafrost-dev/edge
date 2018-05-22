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
const OPENING_BRACE = 40;
const CLOSING_BRACE = 41;
class TagStatement {
    constructor(startPosition, seekable = true) {
        this.startPosition = startPosition;
        this.seekable = seekable;
        this.started = false;
        this.ended = false;
        this.props = {
            name: '',
            jsArg: '',
            raw: ''
        };
        this.internalProps = {
            name: new CharBucket(Contracts_1.WhiteSpaceModes.NONE),
            jsArg: new CharBucket(Contracts_1.WhiteSpaceModes.CONTROLLED)
        };
        this.currentProp = 'name';
        this.internalParens = 0;
    }
    /**
     * Tells whether statement is seeking for more content
     * or not. When seeking is false, it means the
     * statement has been parsed successfully.
     *
     * @returns boolean
     */
    get seeking() {
        return this.started && !this.ended;
    }
    /**
     * Returns a boolean telling if charcode should be considered
     * as the start of the statement.
     *
     * @param  {number} charcode
     *
     * @returns boolean
     */
    isStartOfStatement(charcode) {
        return charcode === OPENING_BRACE && this.currentProp === 'name';
    }
    /**
     * Returns a boolean telling if charCode should be considered
     * as the end of the statement
     *
     * @param  {number} charcode
     *
     * @returns boolean
     */
    isEndOfStatement(charcode) {
        return charcode === CLOSING_BRACE && this.internalParens === 0;
    }
    /**
     * Starts the statement by switching the currentProp to
     * `jsArg` and setting the started flag to true.
     *
     * @returns void
     */
    startStatement() {
        this.setProp();
        this.currentProp = 'jsArg';
        this.started = true;
    }
    /**
     * Ends the statement by switching the ended flag to true. Also
     * if `started` flag was never switched on, then it will throw
     * an exception.
     *
     * @returns void
     */
    endStatement(char) {
        if (!this.started) {
            throw new Error(`Unexpected token ${char}. Wrap statement inside ()`);
        }
        this.ended = true;
        this.setProp();
        this.internalProps = null;
    }
    /**
     * Feeds character to the currentProp. Also this method will
     * record the toll of `opening` and `closing` parenthesis.
     *
     * @param  {string} char
     * @param  {number} charCode
     *
     * @returns void
     */
    feedChar(char, charCode) {
        if (charCode === OPENING_BRACE) {
            this.internalParens++;
        }
        if (charCode === CLOSING_BRACE) {
            this.internalParens--;
        }
        this.internalProps[this.currentProp].feed(char);
    }
    /**
     * Throws exception when end of the statement is reached, but there
     * are more chars to be feeded. This can be because of unclosed
     * statement or following code is not in a new line.
     *
     * @param  {Array<string>} chars
     *
     * @returns void
     */
    ensureNoMoreCharsToFeed(chars) {
        if (chars.length) {
            throw new Error(`Unexpected token {${chars.join('')}}. Write in a new line`);
        }
    }
    /**
     * Sets the prop value for the current Prop and set the
     * corresponding ChatBucket to null.
     *
     * @returns void
     */
    setProp() {
        this.props[this.currentProp] = this.internalProps[this.currentProp].get();
    }
    /**
     * Records the line as raw string
     *
     * @param  {string} line
     *
     * @returns void
     */
    recordRaw(line) {
        if (!this.props.raw) {
            this.props.raw += line;
        }
        else {
            this.props.raw += `\n${line}`;
        }
    }
    /**
     * Feeds a non-seekable statement
     *
     * @param  {string} line
     *
     * @returns void
     */
    feedNonSeekable(line) {
        this.props.name = line.trim();
        this.ended = true;
        this.started = true;
        this.internalProps = null;
    }
    /**
     * Feeds a seekable statement
     *
     * @param  {string} line
     *
     * @returns void
     */
    feedSeekable(line) {
        const chars = line.split('');
        while (chars.length) {
            const char = chars.shift();
            const charCode = char.charCodeAt(0);
            if (this.isStartOfStatement(charCode)) {
                this.startStatement();
            }
            else if (this.isEndOfStatement(charCode)) {
                this.ensureNoMoreCharsToFeed(chars);
                this.endStatement(char);
                break;
            }
            else {
                this.feedChar(char, charCode);
            }
        }
        if (!this.seeking) {
            this.internalProps = null;
        }
    }
    /**
     * Feed a new line to be tokenized into a statement.
     * This method will collapse all whitespaces.
     *
     * @param  {string} line
     *
     * @returns void
     *
     * @example
     *
     * ```js
     * statement.feed('if(2 + 2 === 4)')
     *
     * statement.ended // true
     * statement.props.name // if
     * statement.props.jsArg // 2+2===4
     * ```
     */
    feed(line) {
        if (this.ended) {
            throw new Error(`Unexpected token {${line}}. Write in a new line`);
        }
        /**
         * Recording the raw line for debugging
         */
        this.recordRaw(line);
        /**
         * If statement doesn't seek for args, then end it
         * write their
         */
        if (!this.seekable) {
            this.feedNonSeekable(line);
            return;
        }
        /**
         * Feed a seekable string by tokenizing it
         */
        this.feedSeekable(line);
    }
}
module.exports = TagStatement;
//# sourceMappingURL=index.js.map