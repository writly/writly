import { MenuOption } from "@lexical/react/LexicalTypeaheadMenuPlugin";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { LexicalEditor } from "lexical";

import { $createCodeNode } from "@lexical/code";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $getSelection, $isRangeSelection } from "lexical";
import {
  Code2,
  Heading1,
  Heading2,
  Heading3,
  ListIcon,
  ListOrdered,
  ListTodoIcon,
  Sigma,
  SplitSquareVertical,
  TextQuote,
} from "lucide-react";
import { INSERT_EQUATION_COMMAND } from "../EquationsPlugin";

export class ComponentPickerOption extends MenuOption {
  title: string;
  icon?: JSX.Element;
  keywords: Array<string>;
  keyboardShortcut?: string;
  onSelect: (queryString: string) => void;

  constructor(
    title: string,
    options: {
      icon?: JSX.Element;
      keywords?: Array<string>;
      keyboardShortcut?: string;
      onSelect: (queryString: string) => void;
    },
  ) {
    super(title);
    this.title = title;
    this.keywords = options.keywords || [];
    this.icon = options.icon;
    this.keyboardShortcut = options.keyboardShortcut;
    this.onSelect = options.onSelect.bind(this);
  }
}

export const getBaseOptions = (editor: LexicalEditor) => {
  return [
    new ComponentPickerOption(`Heading 1`, {
      icon: <Heading1 className="wtly-component-picker__icon" />,
      keywords: ["heading", "header", "h1"],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode("h1"));
          }
        }),
    }),
    new ComponentPickerOption(`Heading 2`, {
      icon: <Heading2 className="wtly-component-picker__icon" />,
      keywords: ["heading", "header", "h2"],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode("h2"));
          }
        }),
    }),
    new ComponentPickerOption(`Heading 3`, {
      icon: <Heading3 className="wtly-component-picker__icon" />,
      keywords: ["heading", "header", "h3"],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode("h3"));
          }
        }),
    }),
    new ComponentPickerOption("Divider", {
      icon: <SplitSquareVertical className="wtly-component-picker__icon" />,
      keywords: ["horizontal rule", "divider", "hr"],
      onSelect: () =>
        editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
    }),
    new ComponentPickerOption("Numbered List", {
      icon: <ListOrdered className="wtly-component-picker__icon" />,
      keywords: ["numbered list", "ordered list", "ol"],
      onSelect: () =>
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Bulleted List", {
      icon: <ListIcon className="wtly-component-picker__icon" />,
      keywords: ["bulleted list", "unordered list", "ul"],
      onSelect: () =>
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Check List", {
      icon: <ListTodoIcon className="wtly-component-picker__icon" />,
      keywords: ["check list", "todo list"],
      onSelect: () =>
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Quote", {
      icon: <TextQuote className="wtly-component-picker__icon" />,
      keywords: ["block quote"],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode());
          }
        }),
    }),
    new ComponentPickerOption("Code", {
      icon: <Code2 className="wtly-component-picker__icon" />,
      keywords: ["javascript", "python", "js", "codeblock"],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            if (selection.isCollapsed()) {
              $setBlocksType(selection, () => $createCodeNode());
            } else {
              const textContent = selection.getTextContent();
              const codeNode = $createCodeNode();
              selection.insertNodes([codeNode]);
              selection.insertRawText(textContent);
            }
          }
        }),
    }),
    new ComponentPickerOption("Equation", {
      icon: <Sigma className="wtly-component-picker__icon" />,
      keywords: ["equation", "math", "latex"],
      onSelect: () =>
        editor.dispatchCommand(INSERT_EQUATION_COMMAND, {
          equation: "xyz",
          inline: false,
        }),
    }),
  ];
};

export const ComponentPickerMenu = ({
  options,
  selectedIndex,
  selectOptionAndCleanUp,
  setHighlightedIndex,
}: {
  options: ComponentPickerOption[];
  selectedIndex: number | null;
  selectOptionAndCleanUp: (option: ComponentPickerOption) => void;
  setHighlightedIndex: (index: number) => void;
}) => (
  <ScrollArea.Root className="wtly-component-picker__root">
    <ScrollArea.Viewport className="wtly-component-picker__viewport">
      <ul className="wtly-component-picker__ul">
        {options.map((option, i: number) => {
          const isSelected = selectedIndex === i;
          return (
            <li
              key={option.key}
              tabIndex={-1}
              className={
                "wtly-component-picker__li " + (isSelected ? "selected" : "")
              }
              ref={option.setRefElement}
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                setHighlightedIndex(i);
                selectOptionAndCleanUp(option);
              }}
              onMouseEnter={() => {
                setHighlightedIndex(i);
              }}
            >
              {option.icon} <span>{option.title}</span>
            </li>
          );
        })}
      </ul>
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar orientation="vertical"></ScrollArea.Scrollbar>
  </ScrollArea.Root>
);
