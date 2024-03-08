import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { TextNode } from "lexical";
import { useCallback, useMemo, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  ComponentPicker,
  ComponentPickerOption,
  getBaseOptions,
} from "./ComponentPicker";

export const ComponentPickerMenuPlugin = (): JSX.Element => {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const options = useMemo(() => {
    const baseOptions = getBaseOptions(editor);

    if (!queryString) {
      return baseOptions;
    }

    const regex = new RegExp(queryString, "i");

    return [
      ...baseOptions.filter(
        (option) =>
          regex.test(option.title) ||
          option.keywords.some((keyword) => regex.test(keyword)),
      ),
    ];
  }, [editor, queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string,
    ) => {
      editor.update(() => {
        nodeToRemove?.remove();
        selectedOption.onSelect(matchingString);
        closeMenu();
      });
    },
    [editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) => {
        return anchorElementRef.current && options.length
          ? ReactDOM.createPortal(
              <ComponentPicker
                options={options}
                selectedIndex={selectedIndex}
                selectOptionAndCleanUp={selectOptionAndCleanUp}
                setHighlightedIndex={setHighlightedIndex}
              />,
              anchorElementRef.current,
            )
          : null;
      }}
    />
  );
};
