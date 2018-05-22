declare class Tokenizer {
    private template;
    private tagsDef;
    private tokens;
    private blockStatement;
    private mustacheStatement;
    private line;
    private openedTags;
    constructor(template: string, tagsDef: object);
    /**
     * Returns the tag defination when line matches the regex
     * of a tag.
     *
     * @param  {string} line
     *
     * @returns object
     */
    private getTag(line);
    /**
     * Returns the node for a tag
     *
     * @param  {Prop} properties
     * @param  {number} lineno
     *
     * @returns Node
     */
    private getTagNode(properties, lineno);
    /**
     * Returns the node for a raw string
     *
     * @param  {string} value
     *
     * @returns Node
     */
    private getRawNode(value);
    /**
     * Returns the node for a newline
     *
     * @returns Node
     */
    private getBlankLineNode();
    /**
     * Returns the mustache node
     *
     * @param  {Prop} properties
     * @param  {number} lineno
     *
     * @returns MustacheNode
     */
    private getMustacheNode(properties, lineno);
    /**
     * Returns a boolean, when line content is a closing
     * tag
     *
     * @param  {string} line
     *
     * @returns boolean
     */
    private isClosingTag(line);
    /**
     * Returns a boolean, telling if a given statement is seeking
     * for more content or not
     *
     * @param  {BlockStatement|MustacheStatement} statement
     *
     * @returns boolean
     */
    private isSeeking(statement);
    /**
     * Returns a boolean, telling if a given statement has ended or
     * not.
     *
     * @param  {BlockStatement|MustacheStatement} statement
     *
     * @returns boolean
     */
    private isSeeked(statement);
    /**
     * Here we add the node to tokens or as children for
     * the recentOpenedTag (if one exists).
     *
     * @param  {Node} tag
     *
     * @returns void
     */
    private consumeNode(tag);
    /**
     * Feeds the text to the currently opened block statement.
     * Make sure that `seeking` is true on the block
     * statement, before calling this method.
     *
     * @param  {string} text
     *
     * @returns void
     */
    private feedTextToBlockStatement(text);
    /**
     * Feeds text to the currently opened mustache statement. Make sure
     * to check `seeking` is true, before calling this method.
     *
     * @param  {string} text
     *
     * @returns void
     */
    private feedTextToMustacheStatement(text);
    /**
     * Process a piece of text, by finding if text has reserved keywords,
     * otherwise process it as a raw node.
     *
     * @param  {string} text
     *
     * @returns void
     */
    private processText(text);
    /**
     * Parses the AST
     *
     * @returns void
     */
    parse(): void;
}
export = Tokenizer;
