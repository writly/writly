import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useEffect } from "react";

export const localStorageKey = "wtly";

export const LocalStoragePlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const state = editor.parseEditorState(
      (localStorage?.getItem(localStorageKey) ||
        editor.getEditorState().toJSON()) as string
    );
    editor.setEditorState(state);
    editor.focus();
  }, [editor]);

  return (
    <OnChangePlugin
      onChange={(editorState) => {
        editorState.read(() => {
          const value = JSON.stringify(editorState);
          localStorage.setItem(localStorageKey, value);
        });
      }}
    />
  );
};
