import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import ClickableLinkPlugin from "@lexical/react/LexicalClickableLinkPlugin";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { LexicalEditor } from "lexical";
import { createRef, useEffect, useState } from "react";

import { AutoLinkPlugin } from "./plugins/AutoLinkPlugin";
import { CodeActionMenuPlugin } from "./plugins/CodeActionMenuPlugin";
import { CodeHighlightPlugin } from "./plugins/CodeHighlightPlugin";
import CollaborationPlugin from "./plugins/CollaborationPlugin";
import { ComponentPickerMenuPlugin } from "./plugins/ComponentPickerPlugin";
import {
  DraggableBlockPlugin,
  DraggableWrapper,
} from "./plugins/DraggableBlockPlugin";
import EquationsPlugin from "./plugins/EquationsPlugin";
import { ImagesPlugin } from "./plugins/ImagesPlugin";
import {
  MarkdownShortcutPlugin,
  NODES,
} from "./plugins/MarkdownShortcutPlugin";
import { MaxLengthPlugin } from "./plugins/MaxLengthPlugin";
import { PlaceholderPlugin } from "./plugins/PlaceholderPlugin";
import { theme } from "./theme";

export interface WritlyProps extends InitialConfigType {
  id?: string;
  collaborative?: boolean;
  spellCheck?: boolean;
  maxLength?: number;
}

export const WritlyRef = createRef<LexicalEditor>();

export const Writly = ({
  id,
  collaborative = false,
  maxLength,
  ...props
}: WritlyProps) => {
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <LexicalComposer
      initialConfig={{
        editor__DEPRECATED: props?.editor__DEPRECATED,
        namespace: props?.namespace || "wtly",
        nodes: props?.nodes || NODES,
        onError:
          props?.onError ||
          ((error: Error) => {
            console.error(error);
          }),
        editable: props?.editable,
        theme: props?.theme || theme,
        editorState: collaborative ? props?.editorState : null,
        html: props?.html,
      }}
    >
      {/* Default Plugins */}
      <RichTextPlugin
        contentEditable={
          <DraggableWrapper>
            <ContentEditable spellCheck={false} />
          </DraggableWrapper>
        }
        placeholder={<></>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <AutoFocusPlugin />
      <HistoryPlugin />
      <LinkPlugin />
      <CheckListPlugin />
      <ClickableLinkPlugin />
      <HashtagPlugin />
      <ListPlugin />
      <TabIndentationPlugin />
      <EditorRefPlugin editorRef={WritlyRef} />
      <HorizontalRulePlugin />
      <ClearEditorPlugin />
      {/* Custom Plugins */}
      <MarkdownShortcutPlugin />
      {isClient && <ComponentPickerMenuPlugin />}
      {isClient && <CodeActionMenuPlugin />}
      {isClient && id ? <CollaborationPlugin id={id} /> : <></>}
      <CodeHighlightPlugin />
      <AutoLinkPlugin />
      <ImagesPlugin />
      <EquationsPlugin />
      {maxLength ? <MaxLengthPlugin maxLength={maxLength} /> : <></>}
      <DraggableBlockPlugin />
      <PlaceholderPlugin />
    </LexicalComposer>
  );
};

export { createHeadlessCollaborativeEditor } from "./headless";
