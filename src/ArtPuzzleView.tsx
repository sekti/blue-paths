import { useState } from "react";

interface Props {
  sol: string[][][];
}

export function ArtPuzzleView({ sol }: Props) {
  const [S, setS] = useState<Map<string, number>>(new Map());
  return (
    <div>
      <p>
        Click a position to reveal one word. Click again to reveal the other.
      </p>
      <table className="mb-2">
        <tbody>
          {sol.map((R, i) => (
            <tr key={i}>
              {R.map(([letter, w1, w2], j) => {
                const key = `${i}-${j}`;
                const status: number = S.get(key) ?? 0;
                const handler = () => {
                  const SS = new Map(S);
                  SS.set(key, status == 2 ? 2 : status + 1);
                  setS(SS);
                };
                return (
                  <td
                    key={j}
                    tabIndex={0}
                    style={{
                      position: "relative",
                      width: "50px",
                      height: "50px",
                      border: "1px solid black",
                      overflow: "visible", // allow words to spill out
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                    onClick={handler}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        handler();
                      }
                    }}
                  >
                    {
                      /* Big background letter */
                      status >= 2 && (
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            fontSize: "50px",
                            color: "lightblue",
                            pointerEvents: "none",
                            lineHeight: "1",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {letter}
                        </div>
                      )
                    }

                    {/* Foreground small words */}
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "12px",
                        color: "black",
                        lineHeight: "1.1",
                        textAlign: "center",
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {status >= 1 && w1}
                      <br />
                      {status >= 2 && w2}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
