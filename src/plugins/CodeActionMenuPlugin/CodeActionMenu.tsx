import { Check, ChevronDown, Search } from "lucide-react";

import { Command, CommandGroup, CommandInput, CommandItem } from "cmdk";
import * as Popover from "@radix-ui/react-popover";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { CODE_LANGUAGE_FRIENDLY_NAME_MAP } from "@lexical/code";

import { Dispatch, SetStateAction } from "react";
import { CodeCopyButton } from "./CodeCopyButton";

export interface Position {
  top: string;
  right: string;
}

function getCodeLanguageOptions(): [string, string][] {
  const options: [string, string][] = [];

  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  )) {
    options.push([lang, friendlyName]);
  }

  return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

export const CodeActionMenu = ({
  position,
  open,
  setOpen,
  codeFriendlyName,
  onItemSelect,
  getCodeDOMNode,
  lang,
}: {
  position: Position;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  codeFriendlyName: string;
  onItemSelect: (currentValue: string) => void;
  getCodeDOMNode: () => HTMLElement | null;
  lang: string;
}) => {
  return (
    <div className="wtly-code-action-menu__container" style={{ ...position }}>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger className="wtly-code-action-menu__trigger" asChild>
          <div
            className="wtly-code-action-menu__trigger-container"
            aria-expanded={open}
          >
            <span>{codeFriendlyName}</span>
            <ChevronDown className="wtly-code-action-menu__chevron-down" />
          </div>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="wtly-code-action-menu__content">
            <ScrollArea.Root>
              <ScrollArea.Viewport className="wtly-code-action-menu__content-viewport">
                <Command>
                  <div
                    className="wtly-code-action-menu__input-container"
                    cmdk-input-wrapper=""
                  >
                    <Search className="wtly-code-action-menu__search" />
                    <CommandInput
                      className="wtly-code-action-menu__input"
                      placeholder="Search language..."
                    />
                  </div>
                  <CommandGroup>
                    {CODE_LANGUAGE_OPTIONS.map(([_lang, friendlyName]) => {
                      return (
                        <CommandItem
                          key={_lang}
                          value={`${_lang} ${friendlyName}`}
                          className="wtly-code-action-menu__item"
                          onSelect={onItemSelect}
                        >
                          {friendlyName}
                          <Check
                            className={
                              "wtly-code-action-menu__check " +
                              (lang === _lang ? "selected" : "")
                            }
                          />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </Command>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar orientation="vertical"></ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <CodeCopyButton getCodeDOMNode={getCodeDOMNode} />
    </div>
  );
};
