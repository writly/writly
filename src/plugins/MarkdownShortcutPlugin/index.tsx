import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  ElementTransformer,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
  TextMatchTransformer,
  Transformer,
} from "@lexical/markdown";
import { OverflowNode } from "@lexical/overflow";
import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from "@lexical/react/LexicalHorizontalRuleNode";
import { MarkdownShortcutPlugin as LexicalMarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { $getNearestBlockElementAncestorOrThrow } from "@lexical/utils";
import { $createParagraphNode, LexicalNode } from "lexical";
import {
  $createEquationNode,
  $isEquationNode,
  EquationNode,
} from "../EquationsPlugin/EquationNode";
import {
  $createImageNode,
  $isImageNode,
  ImageNode,
} from "../ImagesPlugin/ImageNode";

export const HR: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node: LexicalNode) => {
    return $isHorizontalRuleNode(node) ? "***" : null;
  },
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _1, _2, isImport) => {
    const line = $createHorizontalRuleNode();

    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
    }

    line.selectNext();
  },
  type: "element",
};

export const INLINE_EQUATION: TextMatchTransformer = {
  dependencies: [EquationNode],
  export: (node) => {
    if (!$isEquationNode(node)) {
      return null;
    }

    return `$${node.getEquation()}$`;
  },
  importRegExp: /\$([^$]+?)\$/,
  regExp: /(?<!\$)\$([^$]+?)\$(?!\$)/,

  replace: (textNode, match) => {
    const [, equation] = match;
    const equationNode = $createEquationNode(equation, true);
    textNode.replace(equationNode);
  },
  trigger: "$",
  type: "text-match",
};

export const EQUATION: TextMatchTransformer = {
  dependencies: [EquationNode],
  export: (node) => {
    if (!$isEquationNode(node)) {
      return null;
    }

    return `$$${node.getEquation()}$$`;
  },
  importRegExp: /\$\$([^$]+?)\$\$/,
  regExp: /\$\$([^$]+?)\$\$/,
  replace: (textNode, match) => {
    const [, equation] = match;
    const equationNode = $createEquationNode(equation, false);

    const parentNode = $getNearestBlockElementAncestorOrThrow(textNode);

    if (parentNode.getNextSibling() === null) {
      const paragraphNode = $createParagraphNode();
      parentNode.insertAfter(paragraphNode);
      paragraphNode.select();
    }

    textNode.replace(equationNode);
  },
  trigger: "$",
  type: "text-match",
};

export const IMAGE: TextMatchTransformer = {
  dependencies: [ImageNode],
  export: (node) => {
    if (!$isImageNode(node)) {
      return null;
    }

    return `![${node.getAltText()}](${node.getSrc()})`;
  },
  importRegExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))/,
  regExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))$/,
  replace: (textNode, match) => {
    const [, altText, src] = match;

    if (!src) {
      return;
    }

    const imageNode = $createImageNode({
      altText: altText || "alt text",
      src,
    });

    const parentNode = $getNearestBlockElementAncestorOrThrow(textNode);

    textNode.replace(imageNode);

    if (parentNode.getNextSibling() === null) {
      const paragraphNode = $createParagraphNode();
      parentNode.insertAfter(paragraphNode);
      paragraphNode.select();
    }
  },
  trigger: ")",
  type: "text-match",
};

const TRANSFORMERS: Array<Transformer> = [
  HR,
  IMAGE,
  EQUATION,
  INLINE_EQUATION,
  CHECK_LIST,
  ...ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
];

export const NODES = [
  HashtagNode,
  AutoLinkNode,
  CodeNode,
  CodeHighlightNode,
  HeadingNode,
  LinkNode,
  OverflowNode,
  ListNode,
  ListItemNode,
  ImageNode,
  QuoteNode,
  HorizontalRuleNode,
  EquationNode,
];

export const MarkdownShortcutPlugin = () => {
  return <LexicalMarkdownShortcutPlugin transformers={TRANSFORMERS} />;
};
