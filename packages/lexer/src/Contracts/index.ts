/**
 * @module Lexer
 */

enum NodeType {
  BLOCK = 'block',
  RAW = 'raw',
  NEWLINE = 'newline',
  MUSTACHE = 'mustache'
}

enum WhiteSpaceModes { NONE, ALL, CONTROLLED }

interface Statement {
  started: boolean
  ended: boolean
  props: Prop
  feed (line:string): void
}

interface Prop {
  name: string
  jsArg: string,
  raw: string
}

interface MustacheProp extends Prop {
  textLeft: string
  textRight: string
}

interface Node {
  type: NodeType
  value?: string
  lineno: number
}

interface BlockNode extends Node {
  properties: Prop
  children: (Node | BlockNode)[]
}

interface MustacheNode extends Node {
  properties: Prop
}

export { Prop as Prop }
export { Node as Node }
export { BlockNode as BlockNode }
export { MustacheNode as MustacheNode }
export { NodeType as NodeType }
export { Statement as Statement }
export { MustacheProp as MustacheProp }
export { WhiteSpaceModes as WhiteSpaceModes }
