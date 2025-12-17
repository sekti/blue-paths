import type { Trit } from "./GlobalState";
import clsx from "clsx";
import { pseudoRef, type VarReference } from "./StateLogic";
import type { ReactNode } from "react";
import { showAlert } from "./App";

interface Props {
  v: VarReference;
  labelRight?: ReactNode;
  labelLeft?: ReactNode;
}

export function TritSetterView({ v, labelRight, labelLeft }: Props) {
  const handleChoice = (choice: Trit) => {
    if (v.isLocked()) {
      if (v.getUserChoice() == choice) {
        v.set(undefined);
      } else if (choice == v.get()) {
        v.set(choice);
      } else {
        showAlert(
          `This answer would contradict an answer given in ${v.getLockedReason()}`
        );
      }
      return;
    }
    if (choice === v.get()) {
      v.set(undefined);
    } else {
      v.set(choice);
    }
  };
  return (
    <div>
      {labelLeft && labelLeft}
      <label
        className={clsx([
          "switch",
          `set-to-${String(v.get())}`,
          v.isLocked() && v.getUserChoice() === undefined && "locked",
        ])}
        tabIndex={0}
        onClick={(e) => {
          e.preventDefault();
          const rect = (
            e.currentTarget.querySelector(".slider") as HTMLElement
          ).getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          handleChoice(clickX > rect.width / 2);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            handleChoice(false);
          } else if (e.key === "ArrowRight") {
            handleChoice(true);
          } else if (e.key === " ") {
            handleChoice(undefined);
          }
        }}
      >
        <input
          type="checkbox"
          id="triSwitch"
          role="checkbox"
          aria-checked="mixed"
        />
        <span className="slider">
          <span className="knob"></span>
        </span>
      </label>
      {labelRight && labelRight}
    </div>
  );
}

interface PropsList {
  vars: VarReference[];
  names?: string[];
  setAllRemainingTexts?: [string, string, string];
}

export function TritSetterListView({
  vars,
  names,
  setAllRemainingTexts: setAllRemainingTexts,
}: PropsList) {
  const nodes = vars.map((v, i) => (
    <TritSetterView
      v={v}
      key={v.displayName}
      labelRight={names ? names[i] : v.displayName}
    ></TritSetterView>
  ));
  if (setAllRemainingTexts && vars.some((v) => v.get() === undefined)) {
    const pseudoVar = pseudoRef(undefined, (val: Trit) =>
      vars.forEach((v) => v.get() === undefined && v.set(val))
    );
    nodes.push(
      <TritSetterView
        v={pseudoVar}
        key={"setRemaining"}
        labelLeft={
          <span>
            <span className="emph">{setAllRemainingTexts[0]}</span>{" "}
            {setAllRemainingTexts[1]}
          </span>
        }
        labelRight={setAllRemainingTexts[2]}
      ></TritSetterView>
    );
  }
  return nodes;
}
