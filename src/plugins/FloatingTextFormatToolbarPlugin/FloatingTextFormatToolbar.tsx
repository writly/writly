import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { $createHeadingNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { mergeRegister } from "@lexical/utils";
import { Root as SeparatorRoot } from "@radix-ui/react-separator";
import {
  $createParagraphNode,
  $getSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  ListTodo,
  Strikethrough,
  Underline,
} from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

const strokeWidth = 1.6;
const dynamicStrokeWidth = (on: boolean) => {
  return strokeWidth + (on ? 0.5 : 0);
};

export const FloatingTextFormatToolbar = ({
  editor,
  anchorElem,
  verticalGap,
  horizontalOffset,
  isLink,
  isBold,
  isItalic,
  isUnderline,
  isCode,
  isStrikethrough,
  isSubscript,
  isSuperscript,
  isUnorderedList,
  isOrderedList,
  isCheckList,
  isHeading1,
  isHeading2,
  isHeading3,
}: {
  editor: LexicalEditor;
  anchorElem: HTMLElement;
  verticalGap: number;
  horizontalOffset: number;
  isBold: boolean;
  isCode: boolean;
  isItalic: boolean;
  isLink: boolean;
  isStrikethrough: boolean;
  isSubscript: boolean;
  isSuperscript: boolean;
  isUnderline: boolean;
  isUnorderedList: boolean;
  isOrderedList: boolean;
  isCheckList: boolean;
  isHeading1: boolean;
  isHeading2: boolean;
  isHeading3: boolean;
}) => {
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  const mouseMoveListener = (e: MouseEvent) => {
    if (toolbarRef?.current && (e.buttons === 1 || e.buttons === 3)) {
      if (toolbarRef.current.style.pointerEvents !== "none") {
        const x = e.clientX;
        const y = e.clientY;
        const elementUnderMouse = document.elementFromPoint(x, y);

        if (!toolbarRef.current.contains(elementUnderMouse)) {
          // Mouse is not over the target element => not a normal click, but probably a drag
          toolbarRef.current.style.pointerEvents = "none";
        }
      }
    }
  };
  const mouseUpListener = (e: MouseEvent) => {
    if (toolbarRef?.current) {
      if (toolbarRef.current.style.pointerEvents !== "auto") {
        toolbarRef.current.style.pointerEvents = "auto";
      }
    }
  };

  useEffect(() => {
    if (toolbarRef?.current) {
      document.addEventListener("mousemove", mouseMoveListener);
      document.addEventListener("mouseup", mouseUpListener);

      return () => {
        document.removeEventListener("mousemove", mouseMoveListener);
        document.removeEventListener("mouseup", mouseUpListener);
      };
    }
  }, [toolbarRef]);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    const toolbarElem = toolbarRef.current;

    if (toolbarElem === null) {
      return;
    }

    const nativeSelection = window.getSelection();
    const rootElement = editor.getRootElement();

    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

      setFloatingElemPosition(
        rangeRect,
        toolbarElem,
        anchorElem,
        verticalGap,
        horizontalOffset,
      );
    }
  }, [editor, anchorElem]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateToolbar();
      });
    };

    window.addEventListener("resize", update);
    if (scrollerElem) {
      scrollerElem.addEventListener("scroll", update);
    }

    return () => {
      window.removeEventListener("resize", update);
      if (scrollerElem) {
        scrollerElem.removeEventListener("scroll", update);
      }
    };
  }, [editor, updateToolbar, anchorElem]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateToolbar();
    });
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updateToolbar]);

  return (
    <div ref={toolbarRef} className="wtly-floating-toolbar__popup">
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        className={"wtly-floating-toolbar__icon " + (isBold ? "active" : "")}
      >
        <Bold strokeWidth={dynamicStrokeWidth(isBold)} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        className={"wtly-floating-toolbar__icon " + (isItalic ? "active" : "")}
      >
        <Italic strokeWidth={dynamicStrokeWidth(isItalic)} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        className={
          "wtly-floating-toolbar__icon " + (isUnderline ? "active" : "")
        }
      >
        <Underline strokeWidth={dynamicStrokeWidth(isUnderline)} />
      </button>
      <button
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }
        className={
          "wtly-floating-toolbar__icon " + (isStrikethrough ? "active" : "")
        }
      >
        <Strikethrough strokeWidth={dynamicStrokeWidth(isStrikethrough)} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
        className={"wtly-floating-toolbar__icon " + (isCode ? "active" : "")}
      >
        <Code strokeWidth={dynamicStrokeWidth(isCode)} />
      </button>
      <SeparatorRoot
        decorative
        orientation="vertical"
        className="wtly-floating-toolbar__separator"
      />
      <button
        onClick={() =>
          editor.dispatchCommand(
            isUnorderedList
              ? REMOVE_LIST_COMMAND
              : INSERT_UNORDERED_LIST_COMMAND,
            undefined,
          )
        }
        className={
          "wtly-floating-toolbar__icon " + (isUnorderedList ? "active" : "")
        }
      >
        <List strokeWidth={dynamicStrokeWidth(isUnorderedList)} />
      </button>
      <button
        onClick={() =>
          editor.dispatchCommand(
            isOrderedList ? REMOVE_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
            undefined,
          )
        }
        className={
          "wtly-floating-toolbar__icon " + (isOrderedList ? "active" : "")
        }
      >
        <ListOrdered strokeWidth={dynamicStrokeWidth(isOrderedList)} />
      </button>
      <button
        onClick={() =>
          editor.dispatchCommand(
            isCheckList ? REMOVE_LIST_COMMAND : INSERT_CHECK_LIST_COMMAND,
            undefined,
          )
        }
        className={
          "wtly-floating-toolbar__icon " + (isCheckList ? "active" : "")
        }
      >
        <ListTodo strokeWidth={dynamicStrokeWidth(isCheckList)} />
      </button>
      <SeparatorRoot
        decorative
        orientation="vertical"
        className="wtly-floating-toolbar__separator"
      />
      <button
        onClick={() =>
          editor.update(() => {
            const selection = $getSelection();
            $setBlocksType(selection, () =>
              isHeading1 ? $createParagraphNode() : $createHeadingNode("h1"),
            );
          })
        }
        className={
          "wtly-floating-toolbar__icon " + (isHeading1 ? "active" : "")
        }
      >
        <Heading1 strokeWidth={dynamicStrokeWidth(isHeading1)} />
      </button>
      <button
        onClick={() =>
          editor.update(() => {
            const selection = $getSelection();
            $setBlocksType(selection, () =>
              isHeading2 ? $createParagraphNode() : $createHeadingNode("h2"),
            );
          })
        }
        className={
          "wtly-floating-toolbar__icon " + (isHeading2 ? "active" : "")
        }
      >
        <Heading2 strokeWidth={dynamicStrokeWidth(isHeading2)} />
      </button>
      <button
        onClick={() =>
          editor.update(() => {
            const selection = $getSelection();
            $setBlocksType(selection, () =>
              isHeading3 ? $createParagraphNode() : $createHeadingNode("h3"),
            );
          })
        }
        className={
          "wtly-floating-toolbar__icon " + (isHeading3 ? "active" : "")
        }
      >
        <Heading3 strokeWidth={dynamicStrokeWidth(isHeading3)} />
      </button>
    </div>
  );
};

export function getDOMRangeRect(
  nativeSelection: Selection,
  rootElement: HTMLElement,
): DOMRect {
  const domRange = nativeSelection.getRangeAt(0);

  let rect;

  if (nativeSelection.anchorNode === rootElement) {
    let inner = rootElement;
    while (inner.firstElementChild != null) {
      inner = inner.firstElementChild as HTMLElement;
    }
    rect = inner.getBoundingClientRect();
  } else {
    rect = domRange.getBoundingClientRect();
  }

  return rect;
}

export function setFloatingElemPosition(
  targetRect: DOMRect | null,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement,
  verticalGap: number,
  horizontalOffset: number,
): void {
  const scrollerElem = anchorElem.parentElement;

  if (targetRect === null || !scrollerElem) {
    floatingElem.style.opacity = "0";
    floatingElem.style.transform = "translate(-10000px, -10000px)";
    return;
  }

  const floatingElemRect = floatingElem.getBoundingClientRect();
  const anchorElementRect = anchorElem.getBoundingClientRect();
  const editorScrollerRect = scrollerElem.getBoundingClientRect();

  let top = targetRect.top - floatingElemRect.height - verticalGap;
  let left = targetRect.left - horizontalOffset;

  if (top < editorScrollerRect.top) {
    // adjusted height for link element if the element is at top
    top += floatingElemRect.height + targetRect.height + verticalGap * 2;
  }

  if (left + floatingElemRect.width > editorScrollerRect.right) {
    left = editorScrollerRect.right - floatingElemRect.width - horizontalOffset;
  }

  top -= anchorElementRect.top;
  left -= anchorElementRect.left;

  floatingElem.style.opacity = "1";
  floatingElem.style.transform = `translate(${left}px, ${top}px)`;
}
