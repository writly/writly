import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

import { ImageNode } from "../ImagesPlugin/ImageNode";
import { $isHeadingNode, HeadingNode } from "@lexical/rich-text";
import {
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $nodesOfType,
  LexicalEditor,
  LexicalNode,
  ParagraphNode,
  PointType,
  RangeSelection,
} from "lexical";

export const setNodePlaceholderFromSelection = (
  editor: LexicalEditor,
): void => {
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return;
    }
    setPlaceholderOnSelection({ selection, editor });
  });
};

export const getAllLexicalChildren = (editor: LexicalEditor) => {
  const childrenNodes = editor.getEditorState().read(() => {
    return [
      ...$nodesOfType(HeadingNode),
      ...$nodesOfType(ParagraphNode),
      ...$nodesOfType(ImageNode),
    ];
  });

  return childrenNodes.map((node) => ({
    node,
    htmlElement: editor.getElementByKey(node.getKey()),
  }));
};

const PLACEHOLDER_CLASS_NAME = "wtly-node-placeholder";

const isHtmlHeadingElement = (el: HTMLElement): el is HTMLHeadingElement => {
  return el instanceof HTMLHeadingElement;
};

const setPlaceholderOnSelection = ({
  selection,
  editor,
}: {
  selection: RangeSelection;
  editor: LexicalEditor;
}): void => {
  const children = getAllLexicalChildren(editor);

  children.forEach(({ htmlElement, node }) => {
    if (!htmlElement) {
      return;
    }

    if (isHtmlHeadingElement(htmlElement)) {
      return;
    }

    const classList = htmlElement.classList;

    try {
      classList.remove(PLACEHOLDER_CLASS_NAME);
      htmlElement.removeAttribute("wtly-data-placeholder");
    } catch (e) {
      return;
    }
  });

  if (
    children.length === 1 &&
    children[0]?.htmlElement &&
    !isHtmlHeadingElement(children[0].htmlElement)
  ) {
    return;
  }

  const anchor: PointType = selection.anchor;

  const placeholder = getNodePlaceholder(anchor.getNode());

  if (placeholder) {
    const selectedHtmlElement = editor.getElementByKey(anchor.key);

    selectedHtmlElement?.classList.add(PLACEHOLDER_CLASS_NAME);
    selectedHtmlElement?.setAttribute("wtly-data-placeholder", placeholder);
  }
};

export const getNodePlaceholder = (lexicalNode: LexicalNode) => {
  let placeholder;

  if ($isHeadingNode(lexicalNode)) {
    const tag = lexicalNode.getTag();
    placeholder = "Heading";
    switch (tag) {
      case "h1": {
        placeholder += " 1";
        break;
      }
      case "h2": {
        placeholder += " 2";
        break;
      }
      case "h3": {
        placeholder += " 3";
        break;
      }
      case "h4": {
        placeholder += " 4";
        break;
      }
      case "h5": {
        placeholder += "5";
        break;
      }
      case "h6": {
        placeholder += "6";
        break;
      }
    }
  }

  if ($isParagraphNode(lexicalNode)) {
    placeholder = "Type '/' to browse options";
  }
  return placeholder;
};

export const PlaceholderPlugin = () => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(() => {
      setNodePlaceholderFromSelection(editor);
    });
  }, [editor]);

  return null;
};
