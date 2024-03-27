import type { Meta, StoryObj } from "@storybook/react";
import { LexicalEditor } from "lexical";
import { createRef } from "react";
import { Writly } from ".";
import "./editor.css";
import "./font.css";
import "./plugins.css";

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof Writly> = {
  component: Writly,
  decorators: [
    (Story) => {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              minWidth: "650px",
              width: "500px",
              height: "100%",
              padding: "50px",
            }}
          >
            <Story />
          </div>
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof Writly>;

const WritlyRef = createRef<LexicalEditor>();

export const Base: Story = {
  args: {},
};
