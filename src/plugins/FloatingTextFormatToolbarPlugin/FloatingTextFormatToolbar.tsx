import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { createPortal } from "react-dom";

export const FloatingTextFormatToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  return createPortal(<FloatingTextFormatToolbar />, document?.body);
};
