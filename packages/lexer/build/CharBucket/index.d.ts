import { WhiteSpaceModes } from '../Contracts';
declare class CharBucket {
    private whitespace;
    private chars;
    private lastChar;
    constructor(whitespace: WhiteSpaceModes);
    /**
     * Returns all chars recorded so far
     *
     * @returns string
     */
    get(): string;
    /**
     * Feed a char to the bucket
     *
     * @param  {string} char
     *
     * @returns void
     */
    feed(char: string): void;
}
export = CharBucket;
