import type { Ref, RefObject } from "react";

import { ChangeEvent, forwardRef } from "react";

type BaseEquationEditorProps = {
  equation: string;
  inline: boolean;
  setEquation: (equation: string) => void;
};

function EquationEditor(
  { equation, setEquation, inline }: BaseEquationEditorProps,
  forwardedRef: Ref<HTMLInputElement | HTMLTextAreaElement>,
): JSX.Element {
  const onChange = (event: ChangeEvent) => {
    setEquation((event.target as HTMLInputElement).value);
  };
  return (
    <div className="wtly-equation__editor-container">
      <input
        className="wtly-equation__editor-input"
        value={equation}
        onChange={onChange}
        ref={forwardedRef as RefObject<HTMLInputElement>}
      />
    </div>
  );
}

export default forwardRef(EquationEditor);
