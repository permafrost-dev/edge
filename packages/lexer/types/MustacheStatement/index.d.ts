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
import { Statement, MustacheProp } from '../Contracts';
declare class MustacheStatement implements Statement {
    private startPosition;
    started: boolean;
    ended: boolean;
    props: MustacheProp;
    private currentProp;
    private internalBraces;
    constructor(startPosition: number);
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
    private getName(chars, charCode);
    /**
     * Returns a boolean telling whether the current char and surrounding
     * chars form the closing of mustache.
     *
     * @param  {string[]} chars
     * @param  {number} charCode
     *
     * @returns boolean
     */
    private isClosing(chars, charCode);
    /**
     * We are seeking for more content, when the found
     * opening braces but waiting for curly braces.
     *
     * @returns boolean
     */
    readonly seeking: boolean;
    /**
     * Process one char at a time
     *
     *
     * @param  {string[]} chars
     * @param  {string} char
     *
     * @returns void
     */
    private processChar(chars, char);
    /**
     * Feed a new line to be parsed as mustache. For performance it is recommended
     * to check that line contains alteast one `{{` statement and is not escaped.
     *
     * @param  {string} line
     *
     * @returns void
     */
    feed(line: string): void;
}
export = MustacheStatement;
