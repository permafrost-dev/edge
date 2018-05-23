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
/**
 * The mustache statement parses the content inside the curly
 * braces. Since the statement can be in multiple lines, this
 * class seeks for more content unless closing braces are
 * detected.
 *
 * ```
 * const statement = new MustacheStatement(1)
 * statement.feed('Hello {{ username }}!')
 *
 * console.log(statement.props)
 * {
 *   name: 'mustache',
 *   jsArg: ' username ',
 *   raw: '{{ username }}',
 *   textLeft: 'Hello ',
 *   textRight: '!'
 * }
 * ```
 */
declare class MustacheStatement implements Statement {
    startPosition: number;
    /**
     * Whether or not the statement has been started. Statement
     * is considered as started, when opening curly braces
     * are detected.
     */
    started: boolean;
    /**
     * Whether or not the statement has been ended. Once ended, you
     * cannot feed more content.
     */
    ended: boolean;
    props: MustacheProp;
    private currentProp;
    private internalBraces;
    private internalProps;
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
     * Returns `true` when seeking for more content.
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
     * Sets the value from internal prop to the public prop
     * as a string
     *
     * @returns void
     */
    private setProp();
    /**
     * Feed a new line to be parsed as mustache. For performance it is recommended
     * to check that line contains alteast one `{{` statement and is not escaped
     * before calling this method.
     *
     * @param  {string} line
     *
     * @returns void
     */
    feed(line: string): void;
}
export = MustacheStatement;
