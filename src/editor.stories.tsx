import type { Meta, StoryObj } from "@storybook/react";
import { Writly } from ".";
import "./editor.css";
import "./plugins.css";
import "./font.css";

//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof Writly> = {
  component: Writly,
  decorators: [
    (Story) => (
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
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Writly>;

export const Base: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};
