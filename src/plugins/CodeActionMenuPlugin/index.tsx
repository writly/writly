import {
  $isCodeNode,
  CODE_LANGUAGE_MAP,
  CodeNode,
  getLanguageFriendlyName,
} from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNearestNodeFromDOMNode } from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDebounce } from "../../hooks/useDebounce";
import { CodeActionMenu, Position } from "./CodeActionMenu";

const CODE_PADDING = 12;

const CodeActionMenuContainer = ({
  anchorElem,
}: {
  anchorElem: HTMLElement;
}): JSX.Element => {
  const [editor] = useLexicalComposerContext();

  const [lang, setLang] = useState("js");
  const [open, setOpen] = useState<boolean>(false);
  const [isShown, setIsShown] = useState<boolean>(false);
  const [shouldListenMouseMove, setShouldListenMouseMove] =
    useState<boolean>(false);
  const [position, setPosition] = useState<Position>({
    top: "0",
    right: "0",
  });
  const codeSetRef = useRef<Set<string>>(new Set());
  const codeDOMNodeRef = useRef<HTMLElement | null>(null);

  const getCodeDOMNode = (): HTMLElement | null => {
    return codeDOMNodeRef.current;
  };

  const debounceOnMouseMove = useDebounce(
    (event: MouseEvent) => {
      const { codeDOMNode, isOutside } = getMouseInfo(event);

      if (isOutside) {
        setIsShown(false);
        setOpen(false);
        return;
      }

      if (!codeDOMNode) {
        return;
      }

      codeDOMNodeRef.current = codeDOMNode;
      let codeNode: CodeNode | null = null;
      let _lang = "";

      editor.update(() => {
        const maybeCodeNode = $getNearestNodeFromDOMNode(codeDOMNode);

        if ($isCodeNode(maybeCodeNode)) {
          codeNode = maybeCodeNode;
          _lang = codeNode.getLanguage() || "";
        }
      });

      if (codeNode) {
        const { y: editorElemY, right: editorElemRight } =
          anchorElem.getBoundingClientRect();

        const { y, right } = codeDOMNode.getBoundingClientRect();

        setLang(_lang ? CODE_LANGUAGE_MAP[_lang] || _lang : "");
        setIsShown(true);
        setPosition({
          right: `${editorElemRight - right + CODE_PADDING}px`,
          top: `${y - editorElemY}px`,
        });
      }
    },
    50,
    1000
  );

  const updateLanguage = useCallback((language: string) => {
    let codeNode: CodeNode | null = null;

    editor.update(() => {
      const codeDOMNode = codeDOMNodeRef.current;
      if (!codeDOMNode) {
        return;
      }
      const maybeCodeNode = $getNearestNodeFromDOMNode(codeDOMNode);

      if ($isCodeNode(maybeCodeNode)) {
        codeNode = maybeCodeNode;
        if ($isCodeNode(codeNode)) {
          codeNode.setLanguage(language);
        }
      }
    });

    setLang(language);
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", debounceOnMouseMove);
    return () => {
      setIsShown(false);
      setOpen(false);
      debounceOnMouseMove.cancel();
      document.removeEventListener("mousemove", debounceOnMouseMove);
    };
  }, [shouldListenMouseMove, debounceOnMouseMove]);

  editor.registerMutationListener(CodeNode, (mutations) => {
    editor.getEditorState().read(() => {
      // @ts-ignore
      for (const [key, type] of mutations) {
        switch (type) {
          case "created":
            codeSetRef.current.add(key);
            setShouldListenMouseMove(codeSetRef.current.size > 0);
            break;

          case "destroyed":
            codeSetRef.current.delete(key);
            setShouldListenMouseMove(codeSetRef.current.size > 0);
            break;

          default:
            break;
        }
      }
    });
  });

  const codeFriendlyName = getLanguageFriendlyName(lang);

  return (
    <>
      {isShown ? (
        <CodeActionMenu
          position={position}
          open={open}
          setOpen={setOpen}
          codeFriendlyName={codeFriendlyName}
          onItemSelect={(currentValue: string) => {
            updateLanguage(currentValue.split(" ")[0] || "js"); // Hack for seacrh
            setOpen(false);
          }}
          getCodeDOMNode={getCodeDOMNode}
          lang={lang}
        />
      ) : null}
    </>
  );
};

const getMouseInfo = (
  event: MouseEvent
): { codeDOMNode: HTMLElement | null; isOutside: boolean } => {
  const target = event.target;

  // @ts-expect-error
  const codeDOMNode = target.closest<HTMLElement>("code.wtly__code");

  const isOutside = !(
    codeDOMNode || // @ts-expect-error
    target.closest<HTMLElement>("div.wtly-code-action-menu__container") || // @ts-expect-error
    target.closest<HTMLElement>("div.wtly-code-action-menu__content")
  );

  return { codeDOMNode, isOutside };
};

export const CodeActionMenuPlugin = (): React.ReactPortal | null => {
  return createPortal(
    <CodeActionMenuContainer anchorElem={document?.body} />,
    document?.body
  );
};
