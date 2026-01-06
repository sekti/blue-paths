import { useState } from "react";
import type { VarReference } from "./StateLogic";
import clsx from "clsx";
import { showAlert } from "./App";

interface Props {
  varsAndAliases: [VarReference, string[]][];
  prompt: string;
}

function containsNormalized(haystack: string, needle: string) {
  return haystack
    .replace(/\s+/g, "")
    .toLowerCase()
    .includes(needle.replace(/\s+/g, "").toLowerCase());
}

export function BingoInputView({ varsAndAliases, prompt }: Props) {
  // include the name of the variable as an alias:
  varsAndAliases = varsAndAliases.map(([v, aliases]) => [
    v,
    [...aliases, v.displayName],
  ]);
  const vars = varsAndAliases.map(([v, _]) => v);
  const shown = vars.filter((v) => v.get());
  const hidden = vars.filter((v) => !v.get());
  const hasUndef = vars.some((v) => v.get() === undefined);
  const [missingIsNo, reactSetMissingIsNo] = useState<boolean>(!hasUndef);

  function setMissingIsNo(val: boolean) {
    hidden.forEach((v) => {
      v.set(val ? false : undefined);
    });
    reactSetMissingIsNo(val);
  }

  // variables can be reset, then I have to reset this state as well
  if (vars.some((v) => v.get() === undefined) && missingIsNo === true) {
    reactSetMissingIsNo(false);
  }

  return (
    <div>
      {shown.length > 0 && (
        <ul>
          {shown.map((v) => {
            const remove = () => {
              if (v.isLocked()) {
                showAlert(
                  `To remove this answer you need to first revoke a positive answer given in ${v.getLockedReason()}`
                );
              } else {
                v.set(missingIsNo ? false : undefined);
              }
            };
            return (
              <li
                className={clsx(
                  "bingo",
                  v.getUserChoice() !== true && "locked"
                )}
                key={v.displayName}
              >
                <button className="unstyled-button" onClick={remove}>
                  {v.displayName}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <div className="input-group mb-3">
        <div className="input-group-text">
          <input
            className="form-check-input mt-0 me-1"
            type="checkbox"
            value=""
            aria-label="Checkbox for following text input"
            checked={missingIsNo}
            onChange={() => setMissingIsNo(!missingIsNo)}
          />
          <label className="form-check-label mb-0">
            {shown.length ? "that's all" : "none"}
          </label>
        </div>
        <input
          type="text"
          className="form-control"
          placeholder={prompt}
          aria-label={prompt}
          aria-describedby="basic-addon1"
          style={{ minWidth: "200px" }}
          onInput={(e) => {
            let T = e.currentTarget.value;
            const matches = varsAndAliases
              .filter(([_, aliases]) =>
                aliases.some((bingo) => containsNormalized(T, bingo))
              )
              .map(([v, _]) => v);
            if (matches.length == 0) {
              return;
            }
            const goodMatches = matches.filter(
              (v) => !v.isLocked() && v.get() !== true
            );
            if (goodMatches.length) {
              // use first match
              e.currentTarget.value = "";
              goodMatches[0].set(true);
            } else {
              // variables are locked or already true
              const reasons = matches.map((v) =>
                v.get() === true
                  ? `${v.displayName} already listed`
                  : `adding ${
                      v.displayName
                    } requires marking something else as completed in ${v.getLockedReason()}`
              );
              showAlert(reasons.join("; "));
            }
          }}
        />
      </div>
    </div>
  );
}
