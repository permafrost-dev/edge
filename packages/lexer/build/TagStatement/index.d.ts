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
import { Prop, Statement } from '../Contracts';
/**
 * The tag statement parses multiline content inside
 * an edge tag starting block.
 *
 * ```
 * const statement = new TagStatement(1)
 * statement.feed('@if(')
 * statement.feed('username')
 * statement.feed(')')
 *
 * console.log(statement.props)
 * {
 *   name: 'if',
 *   jsArg: ' username ',
 *   raw: 'if(\nusername\n)'
 * }
 * ```
 */
declare class TagStatement implements Statement {
    startPosition: number;
    private seekable;
    /**
     * Whether or not the statement has been started. This flag
     * is set to true when we detect first `(`.
     */
    started: boolean;
    /**
     * Whether or not statement is ended. This flag is set when last closing
     * `)` is detected.
     */
    ended: boolean;
    props: Prop;
    private currentProp;
    private internalParens;
    private internalProps;
    constructor(startPosition: number, seekable?: boolean);
    /**
     * Tells whether statement is seeking for more content
     * or not. When seeking is false, it means the
     * statement has been parsed successfully.
     *
     * @returns boolean
     */
    readonly seeking: boolean;
    /**
     * Returns a boolean telling if charcode should be considered
     * as the start of the statement.
     *
     * @param  {number} charcode
     *
     * @returns boolean
     */
    private isStartOfStatement(charcode);
    /**
     * Returns a boolean telling if charCode should be considered
     * as the end of the statement
     *
     * @param  {number} charcode
     *
     * @returns boolean
     */
    private isEndOfStatement(charcode);
    /**
     * Starts the statement by switching the currentProp to
     * `jsArg` and setting the started flag to true.
     *
     * @returns void
     */
    private startStatement();
    /**
     * Ends the statement by switching the ended flag to true. Also
     * if `started` flag was never switched on, then it will throw
     * an exception.
     *
     * @returns void
     */
    private endStatement(char);
    /**
     * Feeds character to the currentProp. Also this method will
     * record the toll of `opening` and `closing` parenthesis.
     *
     * @param  {string} char
     * @param  {number} charCode
     *
     * @returns void
     */
    private feedChar(char, charCode);
    /**
     * Throws exception when end of the statement is reached, but there
     * are more chars to be feeded. This can be because of unclosed
     * statement or following code is not in a new line.
     *
     * @param  {Array<string>} chars
     *
     * @returns void
     */
    private ensureNoMoreCharsToFeed(chars);
    /**
     * Sets the prop value for the current Prop and set the
     * corresponding ChatBucket to null.
     *
     * @returns void
     */
    private setProp();
    /**
     * Records the line as raw string
     *
     * @param  {string} line
     *
     * @returns void
     */
    private recordRaw(line);
    /**
     * Feeds a non-seekable statement
     *
     * @param  {string} line
     *
     * @returns void
     */
    private feedNonSeekable(line);
    /**
     * Feeds a seekable statement
     *
     * @param  {string} line
     *
     * @returns void
     */
    private feedSeekable(line);
    /**
     * Feed a new line to be tokenized into a statement.
     * This method will collapse all whitespaces.
     *
     * @param  {string} line
     *
     * @returns void
     *
     * ```js
     * statement.feed('if(2 + 2 === 4)')
     *
     * statement.ended // true
     * statement.props.name // if
     * statement.props.jsArg // 2+2===4
     * ```
     */
    feed(line: string): void;
}
export = TagStatement;
