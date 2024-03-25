import { $isCodeHighlightNode } from "@lexical/code";
import { $isLinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isAtNodeEnd } from "@lexical/selection";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  ElementNode,
  LexicalNode,
  RangeSelection,
  TextNode,
} from "lexical";
import { $isListItemNode, $isListNode, ListNode } from "@lexical/list";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FloatingTextFormatToolbar } from "./FloatingTextFormatToolbar";
import { $isHeadingNode, HeadingNode } from "@lexical/rich-text";

const getListTypeFromNodes = (nodes: LexicalNode[]) => {
  let hasListItem = false;
  let hasList = false;
  let sampleNode = undefined;

  for (const node of nodes) {
    if ($isListItemNode(node)) {
      hasListItem = true;
      sampleNode = node;
    } else if ($isListNode(node)) {
      hasList = true;
    }

    if (hasListItem && hasList) {
      return undefined;
    }
  }

  if (!hasListItem) {
    return undefined;
  }

  return $getNearestNodeOfType(sampleNode!, ListNode)?.__listType;
};

export const FloatingTextFormatToolbarPlugin = ({
  anchorElem = document?.body,
}: {
  anchorElem?: HTMLElement;
}) => {
  const [isText, setIsText] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);
  const [isUnorderedList, setIsUnorderedList] = useState(false);
  const [isCheckList, setIsCheckList] = useState(false);
  const [isHeading1, setIsHeading1] = useState(false);
  const [isHeading2, setIsHeading2] = useState(false);
  const [isHeading3, setIsHeading3] = useState(false);

  const [editor] = useLexicalComposerContext();

  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      // Should not to pop up the floating toolbar when using IME input
      if (editor.isComposing()) {
        return;
      }
      const selection = $getSelection();
      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) ||
          rootElement === null ||
          !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }

      const node = getSelectedNode(selection);

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsCode(selection.hasFormat("code"));

      switch (getListTypeFromNodes(selection.getNodes())) {
        case "bullet":
          setIsUnorderedList(true);
          setIsOrderedList(false);
          setIsCheckList(false);
          break;
        case "number":
          setIsUnorderedList(false);
          setIsOrderedList(true);
          setIsCheckList(false);
          break;
        case "check":
          setIsUnorderedList(false);
          setIsOrderedList(false);
          setIsCheckList(true);
          break;
        default:
          setIsUnorderedList(false);
          setIsOrderedList(false);
          setIsCheckList(false);
          break;
      }

      switch ($getNearestNodeOfType(node, HeadingNode)?.__tag) {
        case "h1":
          setIsHeading1(true);
          setIsHeading2(false);
          setIsHeading3(false);
          break;
        case "h2":
          setIsHeading1(false);
          setIsHeading2(true);
          setIsHeading3(false);
          break;
        case "h3":
          setIsHeading1(false);
          setIsHeading2(false);
          setIsHeading3(true);
          break;
        default:
          setIsHeading1(false);
          setIsHeading2(false);
          setIsHeading3(false);
          break;
      }

      // Update links
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (
        !$isCodeHighlightNode(selection.anchor.getNode()) &&
        selection.getTextContent() !== ""
      ) {
        setIsText($isTextNode(node) || $isParagraphNode(node));
      } else {
        setIsText(false);
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, "");
      if (!selection.isCollapsed() && rawTextContent === "") {
        setIsText(false);
        return;
      }
    });
  }, [editor]);

  useEffect(() => {
    document.addEventListener("selectionchange", updatePopup);
    return () => {
      document.removeEventListener("selectionchange", updatePopup);
    };
  }, [updatePopup]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updatePopup();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      })
    );
  }, [editor, updatePopup]);

  if (!isText) {
    return null;
  }

  return createPortal(
    <FloatingTextFormatToolbar
      editor={editor}
      anchorElem={anchorElem}
      isLink={isLink}
      isBold={isBold}
      isItalic={isItalic}
      isStrikethrough={isStrikethrough}
      isSubscript={isSubscript}
      isSuperscript={isSuperscript}
      isUnderline={isUnderline}
      isCode={isCode}
      isUnorderedList={isUnorderedList}
      isOrderedList={isOrderedList}
      isCheckList={isCheckList}
      isHeading1={isHeading1}
      isHeading2={isHeading2}
      isHeading3={isHeading3}
    />,
    anchorElem
  );
};

export function getSelectedNode(
  selection: RangeSelection
): TextNode | ElementNode {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
  }
}
