import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import ClickableLinkPlugin from "@lexical/react/LexicalClickableLinkPlugin";
import {
  InitialEditorStateType,
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
import {
  EditorThemeClasses,
  HTMLConfig,
  Klass,
  LexicalEditor,
  LexicalNode,
  LexicalNodeReplacement,
} from "lexical";
import {
  MutableRefObject,
  createRef,
  forwardRef,
  useEffect,
  useState,
} from "react";

import { AutoLinkPlugin } from "./plugins/AutoLinkPlugin";
import { CodeActionMenuPlugin } from "./plugins/CodeActionMenuPlugin";
import { CodeHighlightPlugin } from "./plugins/CodeHighlightPlugin";
import { CollaborationPlugin } from "./plugins/CollaborationPlugin";
import { ComponentPickerMenuPlugin } from "./plugins/ComponentPickerMenuPlugin";
import {
  DraggableBlockPlugin,
  DraggableWrapper,
} from "./plugins/DraggableBlockPlugin";
import { EquationsPlugin } from "./plugins/EquationsPlugin";
import { ImagesPlugin } from "./plugins/ImagesPlugin";
import { LocalStoragePlugin } from "./plugins/LocalStoragePlugin";
import {
  MarkdownShortcutPlugin,
  NODES,
} from "./plugins/MarkdownShortcutPlugin";
import { MaxLengthPlugin } from "./plugins/MaxLengthPlugin";
import { PlaceholderPlugin } from "./plugins/PlaceholderPlugin";
import { theme } from "./theme";
import { hashCode } from "./utils";
import { FloatingTextFormatToolbarPlugin } from "./plugins/FloatingTextFormatToolbarPlugin";

export interface WritlyProps {
  id?: string;
  collaborative?: boolean;
  spellCheck?: boolean;
  maxLength?: number;
  /* InitialConfigType */
  editor__DEPRECATED?: LexicalEditor | null;
  namespace?: string;
  nodes?: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement>;
  onError?: (error: Error, editor: LexicalEditor) => void;
  editable?: boolean;
  theme?: EditorThemeClasses;
  editorState?: InitialEditorStateType;
  html?: HTMLConfig;
}

export const Writly = forwardRef<
  MutableRefObject<LexicalEditor> | null,
  WritlyProps
>(({ id, collaborative = false, maxLength, ...props }, ref) => {
  const [isClient, setIsClient] = useState<boolean>(false);

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

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
        editorState: collaborative ? null : props?.editorState,
        html: props?.html,
      }}
    >
      {/* Default Plugins */}
      <RichTextPlugin
        contentEditable={
          <DraggableWrapper>
            <div ref={onRef} className="wtly-editor">
              <ContentEditable spellCheck={false} id={hashCode(id)} />
            </div>
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
      {ref ? (
        <EditorRefPlugin
          editorRef={ref as MutableRefObject<LexicalEditor | null>}
        />
      ) : (
        <></>
      )}
      <HorizontalRulePlugin />
      <ClearEditorPlugin />
      {/* Custom Plugins */}
      <MarkdownShortcutPlugin />
      {isClient && <ComponentPickerMenuPlugin />}
      {isClient && <CodeActionMenuPlugin />}
      {floatingAnchorElem && (
        <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />
      )}
      {isClient && collaborative && id ? (
        <CollaborationPlugin id={id} />
      ) : (
        <></>
      )}
      {!collaborative && <LocalStoragePlugin id={id} />}
      <CodeHighlightPlugin />
      <AutoLinkPlugin />
      <ImagesPlugin />
      <EquationsPlugin />
      {maxLength ? <MaxLengthPlugin maxLength={maxLength} /> : <></>}
      <DraggableBlockPlugin />
      <PlaceholderPlugin />
    </LexicalComposer>
  );
});
