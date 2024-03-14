import type { Meta, StoryObj } from "@storybook/react";
import { Writly } from ".";
import "./editor.css";
import "./plugins.css";
import "./font.css";
import { createRef } from "react";
import { LexicalEditor } from "lexical";

//👇 This default export determines where your story goes in the story list
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
          <Story />
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof Writly>;

const WritlyRef = createRef<LexicalEditor>();

export const Base: Story = {
  args: {
    ref: WritlyRef,
  },
};
