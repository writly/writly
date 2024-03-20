import { mergeRegister } from "@lexical/utils";
import {
  COMMAND_PRIORITY_LOW,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { $getSelection } from "lexical";
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
  Subscript,
  Superscript,
  Underline,
} from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { Root as SeparatorRoot } from "@radix-ui/react-separator";

const strokeWidth = 1.6;

export const FloatingTextFormatToolbar = ({
  editor,
  anchorElem,
}: {
  editor: LexicalEditor;
  anchorElem: HTMLElement;
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

      setFloatingElemPosition(rangeRect, toolbarElem, anchorElem);
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
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, updateToolbar]);

  return (
    <div ref={toolbarRef} className="wtly-floating-toolbar__popup">
      <button className="wtly-floating-toolbar__icon">
        <Bold strokeWidth={strokeWidth} />
      </button>
      <button className="wtly-floating-toolbar__icon">
        <Italic strokeWidth={strokeWidth} />
      </button>
      <button className="wtly-floating-toolbar__icon">
        <Underline strokeWidth={strokeWidth} />
      </button>
      <button className="wtly-floating-toolbar__icon">
        <Strikethrough strokeWidth={strokeWidth} />
      </button>
      <button className="wtly-floating-toolbar__icon">
        <Code strokeWidth={strokeWidth} />
      </button>
      <SeparatorRoot
        decorative
        orientation="vertical"
        className="wtly-floating-toolbar__separator"
      />
      <button className="wtly-floating-toolbar__icon">
        <List strokeWidth={strokeWidth} />
      </button>
      <button className="wtly-floating-toolbar__icon">
        <ListOrdered strokeWidth={strokeWidth} />
      </button>
      <button className="wtly-floating-toolbar__icon">
        <ListTodo strokeWidth={strokeWidth} />
      </button>
      <SeparatorRoot
        decorative
        orientation="vertical"
        className="wtly-floating-toolbar__separator"
      />
      <button className="wtly-floating-toolbar__icon">
        <Heading1 strokeWidth={strokeWidth} />
      </button>
      <button className="wtly-floating-toolbar__icon">
        <Heading2 strokeWidth={strokeWidth} />
      </button>
      <button className="wtly-floating-toolbar__icon">
        <Heading3 strokeWidth={strokeWidth} />
      </button>
    </div>
  );
};

export function getDOMRangeRect(
  nativeSelection: Selection,
  rootElement: HTMLElement
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

const VERTICAL_GAP = -60;
const HORIZONTAL_OFFSET = -60;

export function setFloatingElemPosition(
  targetRect: DOMRect | null,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement,
  verticalGap: number = VERTICAL_GAP,
  horizontalOffset: number = HORIZONTAL_OFFSET
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
