import {
  cloneElement,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { TritSetterView } from "./TritSetterView";
import { pseudoRef, StateLogicHandler } from "./StateLogic";
import type { GlobalState, StateVar, Trit } from "./GlobalState";
import { ButtonGroup } from "./ButtonGroup";
import type { Todo } from "./Todo";

type Answers = number[];

function tritToNum(t: Trit): number | undefined {
  switch (t) {
    case false:
      return 0;
    case true:
      return 1;
    case undefined:
      return undefined;
  }
}

function numToTrit(n: number | undefined): Trit {
  switch (n) {
    case 0:
      return false;
    case 1:
      return true;
    case undefined:
      return undefined;
    default:
      throw new Error(`numToTrit called with number ${n}.`);
  }
}

class HintSequenceBuilder {
  private nodes: ReactNode[] = [];
  private answers: Answers;
  private nextAnswerIdx: number = 0;
  private setAnswers: (A: Answers) => void;
  public firstHint: boolean = false;
  public constructor(state: Answers, setAnswers: (S: Answers) => void) {
    this.answers = state;
    this.setAnswers = setAnswers;
  }
  static currentInstance?: HintSequenceBuilder = undefined;
  buildHintSequence(t: Todo) {
    HintSequenceBuilder.currentInstance = this;
    addTitle(t.title);
    t.sequence(StateLogicHandler.instance.overallState);
  }
  static getInstance(): HintSequenceBuilder {
    if (HintSequenceBuilder.currentInstance == undefined) {
      throw new Error(
        "HintSequenceBuilder.currentInstance not currently defined"
      );
    }
    return HintSequenceBuilder.currentInstance;
  }

  generateKey(): string {
    return (
      this.answers
        .slice(0, this.nextAnswerIdx)
        .map((v) => v.toString())
        .join(".") +
      ":" +
      this.nodes.length
    );
  }
  addNode(node: ReactElement) {
    if (this.nextAnswerIdx <= this.answers.length) {
      this.nodes.push(cloneElement(node, { key: this.generateKey() }));
    }
  }
  peekAnswer(): number | undefined {
    return this.answers[this.nextAnswerIdx];
  }
  addAnswerNode(
    nodeGen: (
      answer: number | undefined,
      setAnswer: (answer: number | undefined) => void
    ) => ReactElement
  ) {
    if (this.nextAnswerIdx > this.answers.length) {
      return;
    }
    const currAnswer = this.answers[this.nextAnswerIdx];
    const currAnswerIdx = this.nextAnswerIdx;
    const giveAnswer = (answer: number | undefined) => {
      if (currAnswerIdx > this.answers.length) {
        console.error("Answer to hint dialog given out of order.");
        return;
      }
      const newAnswers = this.answers.slice(0, currAnswerIdx);
      if (answer !== undefined) {
        newAnswers.push(answer);
      }
      this.setAnswers(newAnswers);
    };
    const node = nodeGen(currAnswer, giveAnswer);
    this.nodes.push(cloneElement(node, { key: this.generateKey() }));
    this.nextAnswerIdx++;
  }
  render(): ReactNode {
    return this.nodes;
  }
}

export function askOptionIdx(options: string[]): number | undefined {
  const me = HintSequenceBuilder.getInstance();
  let currAnswer = me.peekAnswer();
  if (currAnswer && currAnswer >= options.length) {
    currAnswer = undefined;
  }
  me.addAnswerNode((answer, setAnswer) => {
    return (
      <ButtonGroup choice={answer} choices={options} setChoice={setAnswer} />
    );
  });
  separator();
  return currAnswer;
}

export function askOption<const T extends readonly string[]>(
  options: T
): T[number] | undefined {
  const i = askOptionIdx(Array.from(options));
  return i === undefined ? undefined : options[i];
}

export function askBit([labelLeft, labelRight]: [string, string]): Trit {
  const me = HintSequenceBuilder.getInstance();
  const currAnswer: Trit = numToTrit(me.peekAnswer());
  me.addAnswerNode((answer, setAnswer) => {
    // to use TritSetter I need a VarReference
    const v = pseudoRef(numToTrit(answer), (val: Trit) =>
      setAnswer(tritToNum(val))
    );
    return (
      <div>
        <TritSetterView v={v} labelLeft={labelLeft} labelRight={labelRight} />
      </div>
    );
  });
  return currAnswer;
}

export function askYesNo(): Trit {
  return askBit(["no", "yes"]);
}

export function show(node: ReactElement) {
  const me = HintSequenceBuilder.getInstance();
  me.addNode(node);
}

export const linkClasses =
  "link-underline link-underline-opacity-0 link-underline-opacity-100-hover";
export function link(url: string, label?: string) {
  const me = HintSequenceBuilder.getInstance();
  me.addNode(
    <p>
      <a href={url} target="_blank" className={linkClasses}>
        {label ?? url}
      </a>
    </p>
  );
}

function addTitle(title: string) {
  show(<h5 className="hint-dialog-title">{title}</h5>);
}

export function renderEmphasis(input: string): React.ReactNode {
  const parts = input.split(/(\*[^*]+\*)/g); // keep the *...* parts

  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("*") && part.endsWith("*")) {
          const content = part.slice(1, -1); // remove the stars
          return (
            <span key={i} className="emph">
              {content}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

function separator() {
  const me = HintSequenceBuilder.getInstance();
  me.addNode(
    <p style={{ borderBottom: "1px solid #ccc" }}>
      <span
        style={{
          margin: "0 3px",
        }}
      ></span>
    </p>
  );
}

export function say(message: string) {
  const me = HintSequenceBuilder.getInstance();
  me.addNode(<p>{renderEmphasis(message)}</p>);
}

export function confirm(message?: string, icon: string = "💡") {
  const me = HintSequenceBuilder.getInstance();
  if (message === undefined) {
    message = me.firstHint ? "Next Hint." : "Show Hint.";
    me.firstHint = true;
  }
  me.addAnswerNode((answer, setAnswer) => {
    const confirmed = answer !== undefined;
    return (
      <p>
        <button
          type="button"
          className={`wide-btn ${confirmed ? "open" : ""}`}
          data-bs-toggle="button"
          onClick={() => {
            setAnswer(confirmed ? undefined : 1);
          }}
        >
          <span>{icon + " " + message}</span>
        </button>
      </p>
    );
  });
}

export function confirmSol(message: string = "Show solution.") {
  confirm(message, "❗");
}

export function confirmReveal(message: string = "Show effect.") {
  confirm(message, "⏩");
}

type HintDialogEffect = (() => void) | StateVar[] | StateVar;
export function solved(prompt: string, effect: HintDialogEffect) {
  const me = HintSequenceBuilder.getInstance();
  me.addNode(
    <p key={prompt}>
      <button
        type="button"
        className="wide-btn solved"
        onClick={() => {
          switch (typeof effect) {
            case "function":
              effect();
              return;
            case "string":
              return StateLogicHandler.instance.setVar(effect, true);
            case "object":
              return effect.forEach((v) =>
                StateLogicHandler.instance.setVar(v, true)
              );
          }
          ((_: never) => {})(effect); // should be exhaustive
        }}
      >
        {"✔ " + prompt}
      </button>
    </p>
  );
}

export type HintSequence = (s: GlobalState) => void;

interface HintSequenceViewProps {
  todo: Todo;
}

export function HintDialogView({ todo }: HintSequenceViewProps) {
  const [state, setState] = useState<Answers>([]);
  const builder = new HintSequenceBuilder(state, setState);
  builder.buildHintSequence(todo);
  return builder.render();
}
