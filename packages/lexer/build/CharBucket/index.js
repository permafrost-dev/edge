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
const whitespace = require("is-whitespace-character");
const Contracts_1 = require("../Contracts");
class CharBucket {
    constructor(whitespace) {
        this.whitespace = whitespace;
        this.chars = '';
        this.lastChar = '';
    }
    /**
     * Returns all chars recorded so far
     *
     * @returns string
     */
    get() {
        return this.chars;
    }
    /**
     * Feed a char to the bucket
     *
     * @param  {string} char
     *
     * @returns void
     */
    feed(char) {
        if (this.whitespace === Contracts_1.WhiteSpaceModes.CONTROLLED) {
            if (whitespace(char) && whitespace(this.lastChar)) {
                return;
            }
            this.chars += char;
            this.lastChar = char;
            return;
        }
        if (this.whitespace === Contracts_1.WhiteSpaceModes.NONE) {
            if (whitespace(char)) {
                return;
            }
            this.chars += char;
            return;
        }
        this.chars += char;
    }
}
module.exports = CharBucket;
//# sourceMappingURL=index.js.map