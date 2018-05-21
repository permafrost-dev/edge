import { Prop, Node } from '../Contracts';
declare class Tokenizer {
    private template;
    private tagsDef;
    private tokens;
    private currentStatement;
    private openedTags;
    private line;
    constructor(template: string, tagsDef: object);
    /**
     * Returns the recently opened block tag. It is used
     * to feed children unless the tag gets closed
     *
     * @returns Node
     */
    readonly recentOpenedTag: Node;
    /**
     * Returns the tag defination when line matches the regex
     * of a tag.
     *
     * @param  {string} line
     *
     * @returns object
     */
    getTag(line: string): null | {
        block?: boolean;
        seekable?: boolean;
        escaped?: boolean;
    };
    /**
     * Returns the node for a tag
     *
     * @param  {Prop} properties
     *
     * @returns Node
     */
    getTagNode(properties: Prop): Node;
    /**
     * Returns the node for a raw string
     *
     * @param  {string} value
     *
     * @returns Node
     */
    getRawNode(value: string): Node;
    /**
     * Returns a boolean, when line content is a closing
     * tag
     *
     * @param  {string} line
     *
     * @returns boolean
     */
    isClosingTag(line: string): boolean;
    /**
     * Returns a boolean, which tells whether the currentStatement is
     * seeking for more data or not. Since we allow multi line
     * statements, we need to wait for multiple lines to
     * processed until a statement gets over.
     *
     * @returns boolean
     */
    isStatementSeeking(): boolean;
    /**
     * Returns a boolean, telling that there is an open statement, but
     * not seeking for any more content.
     *
     * @returns boolean
     */
    isStatementSeeked(): boolean;
    /**
     * Consumes a statement when it's not seeking for more
     * content. This is basically a start of a tag.
     *
     * @returns void
     */
    consumeStatement(): void;
    /**
     * Here we feed the line to the current statement
     * and check whether it needs more content or
     * not.
     *
     * @param  {string} line
     *
     * @returns void
     */
    feedLineAsStatement(line: string): void;
    /**
     * Here we add the node to tokens or as children for
     * the recentOpenedTag (if one exists).
     *
     * @param  {Node} tag
     *
     * @returns void
     */
    consumeNode(tag: Node): void;
    /**
     * Process one line at time
     *
     * @param  {string} line
     *
     * @returns void
     */
    processLine(line: string): void;
    /**
     * Parses the AST
     *
     * @returns void
     */
    parse(): void;
}
export = Tokenizer;
