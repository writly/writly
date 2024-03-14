import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useEffect } from "react";

export const getLocalStorageKey = (id?: string) => `wtly__${id}`;

export const LocalStoragePlugin = ({ id }: { id?: string }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const state = editor.parseEditorState(
      (localStorage?.getItem(getLocalStorageKey(id)) ||
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
          localStorage.setItem(getLocalStorageKey(id), value);
        });
      }}
    />
  );
};
