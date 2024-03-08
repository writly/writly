import { $isCodeNode } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getNearestNodeFromDOMNode,
  $getSelection,
  $setSelection,
} from "lexical";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";

interface Props {
  getCodeDOMNode: () => HTMLElement | null;
}

export const CodeCopyButton = ({ getCodeDOMNode }: Props) => {
  const [editor] = useLexicalComposerContext();
  const [isCopyCompleted, setIsCopyCompleted] = useState<boolean>(false);

  const removeSuccessIcon = useDebounce(() => {
    setIsCopyCompleted(false);
  }, 1000);

  const handleClick = async () => {
    const codeDOMNode = getCodeDOMNode();

    if (!codeDOMNode) {
      return;
    }

    let content = "";

    editor.update(() => {
      const codeNode = $getNearestNodeFromDOMNode(codeDOMNode);

      if ($isCodeNode(codeNode)) {
        content = codeNode.getTextContent();
      }

      const selection = $getSelection();
      $setSelection(selection);
    });

    try {
      await navigator.clipboard.writeText(content);
      setIsCopyCompleted(true);
      removeSuccessIcon();
    } catch (err) {
      console.error("Failed to copy");
    }
  };
  return (
    <button
      className="wtly-code-action-menu__code-copy-button"
      onClick={handleClick}
      aria-label="copy"
    >
      {isCopyCompleted ? (
        <Check className="wtly-code-action-menu__check" />
      ) : (
        <Copy className="wtly-code-action-menu__copy" />
      )}
    </button>
  );
};
