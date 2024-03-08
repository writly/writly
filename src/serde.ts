import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, $insertNodes } from "lexical";
import { encodeStateAsUpdate } from "yjs";
import { WritlyRef, createHeadlessCollaborativeEditor } from "./editor";
import { NODES } from "./plugins/MarkdownShortcutPlugin";
import { theme } from "./theme";

export const getContentAsYjsUpdate = () => {
  const editor = WritlyRef.current!;

  const { binding, editor: headlessEditor } =
    createHeadlessCollaborativeEditor(NODES);
  headlessEditor.setEditorState(editor.getEditorState());

  const yjsUpdate = encodeStateAsUpdate(binding.doc).buffer;

  return yjsUpdate;
};

export const convertHTMLToYjsUpdate = () => {
  const { binding, editor: headlessEditor } =
    createHeadlessCollaborativeEditor(NODES);

  headlessEditor.update(
    () => {
      const parser = new DOMParser();

      const dom = parser.parseFromString(
        document!.getElementsByClassName(theme.root!)[0]?.outerHTML!,
        "text/html",
      );

      const nodes = $generateNodesFromDOM(headlessEditor, dom);

      $getRoot().select();
      $insertNodes(nodes);
    },
    { discrete: true },
  );

  const yjsUpdate = encodeStateAsUpdate(binding.doc).buffer;

  return yjsUpdate;
};
export const getContentAsHTML = async () => {
  const editor = WritlyRef.current!;

  const promise = new Promise<string>((resolve, reject) => {
    editor._editorState.read(async () => {
      const html = $generateHtmlFromNodes(WritlyRef.current!, null);
      resolve(html);
    });
  });

  return promise;
};
