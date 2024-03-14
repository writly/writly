import type { Meta, StoryObj } from "@storybook/react";
import { LexicalEditor } from "lexical";
import { LegacyRef, MutableRefObject, createRef } from "react";
import { Writly } from ".";
import {
  convertHTMLToYjsUpdate,
  getEditorStateAsHTML,
  getEditorStateAsYjsUpdate,
} from "./serde";
import "./editor.css";
import "./font.css";
import "./plugins.css";

const writlyRef = createRef<LexicalEditor | null>();
const writlyId = "defaultEditor";

const meta: Meta<typeof Writly> = {
  component: Writly,
  decorators: [
    (Story) => {
      return (
        <div
          style={{
            minWidth: "650px",
            width: "80%",
            height: "100%",
            padding: "50px",
          }}
        >
          <div
            style={{
              backgroundColor: "#121212",
              display: "flex",
              flexDirection: "column",
              width: "fit-content",
            }}
          >
            <button
              style={{ height: "20px" }}
              onClick={() => {
                console.log(getEditorStateAsYjsUpdate(writlyRef));
              }}
            >
              getEditorStateAsYjsupdate
            </button>
            <button
              style={{ height: "20px" }}
              onClick={() => {
                console.log(convertHTMLToYjsUpdate(writlyId));
              }}
            >
              convertHTMLToYjsUpdate
            </button>
            <button
              style={{ height: "20px" }}
              onClick={async () => {
                console.log(await getEditorStateAsHTML(writlyRef));
              }}
            >
              getEditorStateAsHTML
            </button>
          </div>
          <Story />
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof Writly>;

export const Base: Story = {
  args: {
    ref: writlyRef as LegacyRef<MutableRefObject<LexicalEditor> | null>,
    id: writlyId,
  },
};
