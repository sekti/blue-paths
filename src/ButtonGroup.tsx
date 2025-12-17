import { Fragment, useId } from "react";

interface Props {
  choice: number | undefined;
  setChoice: (i: number | undefined) => void;
  choices: string[];
}

export function ButtonGroup({ choice, setChoice, choices }: Props) {
  const id = useId();
  return (
    <div>
      {choices.map((c, i) => {
        const checked = i === choice;
        return (
          <Fragment key={c}>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id={id + i}
                checked={checked}
                readOnly={true}
                onClick={() => {
                  setChoice(choice === i ? undefined : i);
                }}
              />
              <label
                style={{ cursor: "pointer" }}
                className="form-check-label"
                htmlFor={id + i}
              >
                {c}
              </label>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
