import type {
  DOMConversionMap,
  DOMConversionOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";

import katex from "katex";
import { $applyNodeReplacement, DecoratorNode, DOMExportOutput } from "lexical";
import * as React from "react";
import { Suspense } from "react";

const EquationComponent = React.lazy(() => import("./EquationComponent"));

export type SerializedEquationNode = Spread<
  {
    equation: string;
    inline: boolean;
  },
  SerializedLexicalNode
>;

function convertEquationElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  let equation = domNode.getAttribute("data-wtly-equation");
  const inline = domNode.getAttribute("data-wtly-inline") === "true";
  equation = atob(equation || "");
  if (equation) {
    const node = $createEquationNode(equation, inline);
    return { node };
  }

  return null;
}

export class EquationNode extends DecoratorNode<JSX.Element> {
  __equation: string;
  __inline: boolean;

  static getType(): string {
    return "equation";
  }

  static clone(node: EquationNode): EquationNode {
    return new EquationNode(node.__equation, node.__inline, node.__key);
  }

  constructor(equation: string, inline?: boolean, key?: NodeKey) {
    super(key);
    this.__equation = equation;
    this.__inline = inline ?? false;
  }

  static importJSON(serializedNode: SerializedEquationNode): EquationNode {
    const node = $createEquationNode(
      serializedNode.equation,
      serializedNode.inline,
    );
    return node;
  }

  exportJSON(): SerializedEquationNode {
    return {
      equation: this.getEquation(),
      inline: this.__inline,
      type: "equation",
      version: 1,
    };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const element = document.createElement("span");
    element.className = "wtly__equation";
    return element;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    const equation = btoa(this.__equation);
    element.className = "wtly__equation";
    element.setAttribute("data-wtly-equation", equation);
    element.setAttribute("data-wtly-inline", `${this.__inline}`);
    katex.render(this.__equation, element, {
      displayMode: !this.__inline,
      errorColor: "#cc0000",
      output: "html",
      strict: "warn",
      throwOnError: false,
      trust: false,
    });
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-wtly-equation")) {
          return null;
        }
        return {
          conversion: convertEquationElement,
          priority: 2,
        };
      },
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-wtly-equation")) {
          return null;
        }
        return {
          conversion: convertEquationElement,
          priority: 1,
        };
      },
    };
  }

  updateDOM(prevNode: EquationNode): boolean {
    return this.__inline !== prevNode.__inline;
  }

  getTextContent(): string {
    return this.__equation;
  }

  getEquation(): string {
    return this.__equation;
  }

  setEquation(equation: string): void {
    const writable = this.getWritable();
    writable.__equation = equation;
  }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <EquationComponent
          equation={this.__equation}
          inline={this.__inline}
          nodeKey={this.__key}
        />
      </Suspense>
    );
  }
}

export function $createEquationNode(
  equation = "",
  inline = false,
): EquationNode {
  const equationNode = new EquationNode(equation, inline);
  return $applyNodeReplacement(equationNode);
}

export function $isEquationNode(
  node: LexicalNode | null | undefined,
): node is EquationNode {
  return node instanceof EquationNode;
}
