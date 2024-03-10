import {
  Binding,
  Provider,
  createBinding,
  syncLexicalUpdateToYjs,
  syncYjsChangesToLexical,
} from "@lexical/yjs";
import { Klass, LexicalEditor, LexicalNode, createEditor } from "lexical";

import { registerCodeHighlighting } from "@lexical/code";
import { Doc } from "yjs";

export const createHeadlessCollaborativeEditor = (
  nodes: Array<Klass<LexicalNode>>
): {
  editor: LexicalEditor;
  provider: Provider;
  binding: Binding;
} => {
  const editor = createEditor({
    namespace: "headless",
    nodes,
    onError: (error) => {
      console.error(error);
    },
  });
  const id = "main";
  const doc = new Doc();
  const docMap = new Map([[id, doc]]);
  const provider = createNoOpProvider();
  const binding = createBinding(editor, provider, id, doc, docMap);
  registerCollaborationListeners(editor, provider, binding);
  registerCodeHighlighting(editor);
  return {
    binding,
    editor,
    provider,
  };
};

export const registerCollaborationListeners = (
  editor: LexicalEditor,
  provider: Provider,
  binding: Binding
): void => {
  editor.registerUpdateListener(
    ({
      dirtyElements,
      dirtyLeaves,
      editorState,
      normalizedNodes,
      prevEditorState,
      tags,
    }) => {
      if (tags.has("skip-collab") === false) {
        syncLexicalUpdateToYjs(
          binding,
          provider,
          prevEditorState,
          editorState,
          dirtyElements,
          dirtyLeaves,
          normalizedNodes,
          tags
        );
      }
    }
  );

  binding.root.getSharedType().observeDeep((events, transaction) => {
    if (transaction?.origin !== binding) {
      syncYjsChangesToLexical(binding, provider, events, false);
    }
  });
};

export const createNoOpProvider = (): Provider => {
  const emptyFunction = () => {};
  return {
    awareness: {
      getLocalState: () => null,
      getStates: () => new Map(),
      off: emptyFunction,
      on: emptyFunction,
      setLocalState: emptyFunction,
    },
    connect: emptyFunction,
    disconnect: emptyFunction,
    off: emptyFunction,
    on: emptyFunction,
  };
};
