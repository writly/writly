import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getNodeByKey,
  $getRoot,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  DRAGOVER_COMMAND,
  DROP_COMMAND,
} from "lexical";
import React, {
  DragEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { devtools } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import { $createImageNode } from "../ImagesPlugin/ImageNode";

type Draggable = {
  htmlElement: HTMLElement;
  data: {
    top: number;
    left: number;
    height: number;
  };
};

type Line = {
  htmlElement: HTMLElement;
  data: {
    top: number;
    left: number;
    height: number;
    width: number;
  };
};
interface MiniLibraryStoreProps {
  draggable?: Draggable;
  setDraggable: (value: Draggable) => void;
  line?: Line;
  setLine: (value: Line) => void;
  resetState: () => void;
}

const draggableStore = createWithEqualityFn<
  MiniLibraryStoreProps,
  [["zustand/devtools", never]]
>(
  devtools(
    (setState, getState) => ({
      draggable: undefined,
      setDraggable: (value) => {
        setState({ draggable: value }, false, { type: "setDraggable", value });
      },
      line: undefined,
      setLine: (newLine) => {
        const prevLine = getState().line?.data;
        if (
          prevLine?.top === newLine.data.top &&
          prevLine.left === newLine.data.left &&
          prevLine?.height === newLine.data.height &&
          prevLine?.width === newLine.data.width
        ) {
          return;
        }
        setState({ line: newLine }, false, { type: "setLine", value: newLine });
      },

      resetState: () => {
        setState(
          {
            draggable: undefined,
            line: undefined,
          },
          false,
          {
            type: "resetState",
          },
        );
      },
    }),
    { name: "draggableStore" },
  ),
);

const useDraggableLineStore = () =>
  draggableStore(({ line }) => ({ line }), shallow);

const useDraggableStore = () =>
  draggableStore(
    ({ draggable, resetState }) => ({ draggable, resetState }),
    shallow,
  );

const DRAGGABLE_KEY = "draggable-key";

export const CAN_USE_DOM: boolean =
  typeof window !== "undefined" &&
  typeof window.document !== "undefined" &&
  typeof window.document.createElement !== "undefined";

export const DraggableBlockPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [isSmallWidthViewport, setIsSmallWidthViewport] =
    useState<boolean>(false);

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia("(max-width: 640px)").matches;

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };
    updateViewPortWidth();
    window.addEventListener("resize", updateViewPortWidth);

    return () => {
      window.removeEventListener("resize", updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);

  useDragListeners();
  useOnDrop();

  const isEditable = editor.isEditable();
  if (typeof document === "undefined") {
    return null;
  }
  const wrapperHTMLElement = document.getElementById(DRAGGABLE_WRAPPER_ID);
  if (!isEditable || !wrapperHTMLElement) {
    return null;
  }
  return !isSmallWidthViewport ? (
    createPortal(
      <>
        <DraggableElement />
        <OnDragLine />
      </>,
      wrapperHTMLElement,
    )
  ) : (
    <></>
  );
};

const setDraggableElement = ({ target }: MouseEvent) => {
  const coordinates = (target as HTMLCanvasElement).getBoundingClientRect();

  const state = draggableStore.getState();

  state.setDraggable({
    htmlElement: target as HTMLElement,
    data: {
      top: coordinates.top,
      left: coordinates.left,
      height: coordinates.height,
    },
  });
};

const useDragListeners = () => {
  const [editor] = useLexicalComposerContext();
  const { handleOnDragEnter } = useOnDragEnter();

  const { keys } = useEditorKeys();
  useEffect(() => {
    const addListeners = () => {
      keys.forEach((key) => {
        const htmlElement = editor.getElementByKey(key);

        if (!htmlElement) {
          console.warn("[useDragListeners] No html element");
          return;
        }

        htmlElement.setAttribute(DRAGGABLE_KEY, key);
        htmlElement.addEventListener("mouseenter", setDraggableElement);

        // @ts-ignore
        htmlElement.addEventListener("dragenter", handleOnDragEnter);
      });
    };

    addListeners();

    const removeListeners = () => {
      keys.forEach((key) => {
        const htmlElement = editor.getElementByKey(key);
        htmlElement?.removeEventListener("mouseenter", setDraggableElement);

        // @ts-ignore
        htmlElement?.removeEventListener("dragenter", handleOnDragEnter);
      });
    };
    return () => {
      removeListeners();
    };
  }, [editor, handleOnDragEnter, keys]);

  useEffect(() => {
    editor.registerCommand(
      DRAGOVER_COMMAND,
      // @ts-ignore
      (event) => handleOnDragEnter(event),
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, handleOnDragEnter]);
};

const useOnDragEnter = () => {
  const [editor] = useLexicalComposerContext();

  const handleOnDragEnter = useCallback(
    (event: DragEvent): boolean => {
      event.preventDefault();
      const target = event.currentTarget;

      const key = target.getAttribute(DRAGGABLE_KEY);
      if (!key) {
        return false;
      }
      const element = editor.getElementByKey(key);

      const coordinates = element?.getBoundingClientRect();

      if (coordinates) {
        draggableStore.getState().setLine({
          htmlElement: element!,
          data: {
            top: coordinates.top,
            left: coordinates.left,
            height: coordinates.height,
            width: coordinates.width,
          },
        });
      }
      return true;
    },
    [editor],
  );
  return { handleOnDragEnter };
};

const useEditorKeys = () => {
  const [editor] = useLexicalComposerContext();
  const { resetState } = useDraggableStore();

  const getEditorKeys = useCallback(() => {
    return editor.getEditorState().read(() => $getRoot().getChildrenKeys());
  }, [editor]);
  const [keys, setKeys] = useState<string[]>(getEditorKeys());
  useEffect(() => {
    return editor.registerUpdateListener(() => {
      setKeys(getEditorKeys());
      resetState();
    });
  }, [editor, getEditorKeys, resetState]);

  return { keys };
};

const useOnDrop = () => {
  const [editor] = useLexicalComposerContext();

  const handleOnDrop = useCallback((dragEvent: DragEvent): boolean => {
    dragEvent.preventDefault();

    const lineElement = draggableStore.getState().line?.htmlElement;

    const closestToLineElementKey = lineElement?.getAttribute(DRAGGABLE_KEY);
    if (!closestToLineElementKey) {
      return false;
    }

    if (dragEvent.dataTransfer?.types.includes("Files")) {
      if (dragEvent.dataTransfer?.items) {
        Array.from(dragEvent.dataTransfer.items).forEach((item) => {
          if (item.kind === "file") {
            const file = item.getAsFile();

            if (file) {
              const blob = new Blob([file], { type: file.type });
              const urlCreator = window.URL || window.webkitURL;
              let imageUrl = urlCreator.createObjectURL(blob);

              const image = $createImageNode({
                altText: "File",
                src: imageUrl,
              });

              const lineLexicalNode = $getNodeByKey(closestToLineElementKey);
              lineLexicalNode?.insertAfter(image);
            }
          }
        });
      }
      return true;
    }

    const draggableElement = draggableStore.getState().draggable?.htmlElement;
    const draggableKey = draggableElement?.getAttribute(DRAGGABLE_KEY);

    if (!draggableKey) {
      return false;
    }

    const lineLexicalNode = $getNodeByKey(closestToLineElementKey);
    const draggableLexicalNode = $getNodeByKey(draggableKey);

    if (!draggableLexicalNode) {
      return false;
    }

    lineLexicalNode?.insertAfter(draggableLexicalNode);
    return true;
  }, []);

  useEffect(() => {
    editor.registerCommand(
      DROP_COMMAND,
      (event) => {
        return handleOnDrop(event as unknown as DragEvent);
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor, handleOnDrop]);

  return { handleOnDrop };
};

const _DraggableElement = () => {
  const { draggable, resetState } = useDraggableStore();

  const handleOnDragStart = useCallback(
    ({ dataTransfer }: DragEvent<HTMLDivElement>) => {
      if (!dataTransfer || !draggable?.htmlElement) {
        return;
      }
      dataTransfer.setDragImage(draggable.htmlElement, 0, 0);
    },
    [draggable?.htmlElement],
  );

  if (!draggable?.data) {
    return null;
  }
  const scrollOffset = document.body.getBoundingClientRect().top;
  return (
    <div
      draggable={true}
      className="wtly-draggable__block"
      onDragStart={handleOnDragStart}
      onDragEnd={() => {
        resetState();
      }}
      style={{
        top: draggable.data.top - scrollOffset,
        left: (draggable.data.left ?? 0) - 29,
        height: Math.max(draggable.data.height, 4),
      }}
    />
  );
};

const DraggableElement = React.memo(_DraggableElement, () => true);

const _OnDragLine = () => {
  const { line } = useDraggableLineStore();

  if (!line?.data) {
    return null;
  }

  const scrollOffset = document.body.getBoundingClientRect().top;

  return (
    <div
      className="wtly-draggable__line"
      style={{
        top: line.data.top + line.data.height - scrollOffset,
        left: line.data.left,
        width: line.data.width,
      }}
    />
  );
};

const OnDragLine = React.memo(_OnDragLine, () => true);

const DRAGGABLE_WRAPPER_ID = "draggable-wrapper";

export const DraggableWrapper = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const callback = () => {
      draggableStore.getState().resetState();
    };

    const current = ref.current;
    current?.addEventListener("mouseleave", callback);
    window.addEventListener("wheel", callback);

    return () => {
      current?.removeEventListener("mouseleave", callback);
      window.removeEventListener("wheel", callback);
    };
  }, []);
  return (
    <div ref={ref} id={DRAGGABLE_WRAPPER_ID}>
      {children}
    </div>
  );
};
