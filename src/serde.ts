import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, $insertNodes, LexicalEditor } from "lexical";
import { MutableRefObject } from "react";
import { encodeStateAsUpdate } from "yjs";
import { createHeadlessCollaborativeEditor } from "./editor";
import { NODES } from "./plugins/MarkdownShortcutPlugin";
import { hashCode } from "./utils";

export const getEditorStateAsYjsUpdate = (
  ref: MutableRefObject<LexicalEditor | null>
) => {
  const editor = ref.current;

  if (!editor) {
    return;
  }

  const { binding, editor: headlessEditor } =
    createHeadlessCollaborativeEditor(NODES);

  headlessEditor.setEditorState(editor.getEditorState());

  const yjsUpdate = encodeStateAsUpdate(binding.doc).buffer;

  return yjsUpdate;
};

export const convertHTMLToYjsUpdate = (id?: string) => {
  if (!id) {
    return;
  }

  const { binding, editor: headlessEditor } =
    createHeadlessCollaborativeEditor(NODES);

  headlessEditor.update(
    () => {
      const parser = new DOMParser();

      const html = document!.getElementById(hashCode(id))?.outerHTML;

      if (!html) {
        return;
      }

      const dom = parser.parseFromString(html, "text/html");

      const nodes = $generateNodesFromDOM(headlessEditor, dom);

      $getRoot().select();
      $insertNodes(nodes);
    },
    { discrete: true }
  );

  const yjsUpdate = encodeStateAsUpdate(binding.doc).buffer;

  return yjsUpdate;
};

export const getEditorStateAsHTML = async (
  ref: MutableRefObject<LexicalEditor | null>
) => {
  const editor = ref.current;

  if (!editor) {
    return;
  }

  const promise = new Promise<string>((resolve, reject) => {
    editor._editorState.read(async () => {
      const html = $generateHtmlFromNodes(editor, null);
      resolve(html);
    });
  });

  return promise;
};
