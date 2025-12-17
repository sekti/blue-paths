import type { ReactNode } from "react";
import { ref, StateLogicHandler, type VarReference } from "./StateLogic";
import { TritSetterListView, TritSetterView } from "./TritSetterView";
import { BingoInputView } from "./BingoInputView";
import type { GlobalState, StateVar } from "./GlobalState";
import { renderToString } from "react-dom/server";

export function RewindIcon(onClick: () => void) {
  return (
    <button
      type="button"
      className="btn btn-link p-0"
      title="reset"
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        className="bi bi-rewind-circle"
        viewBox="0 0 16 16"
      >
        <path d="M7.729 5.055a.5.5 0 0 0-.52.038l-3.5 2.5a.5.5 0 0 0 0 .814l3.5 2.5A.5.5 0 0 0 8 10.5V8.614l3.21 2.293A.5.5 0 0 0 12 10.5v-5a.5.5 0 0 0-.79-.407L8 7.386V5.5a.5.5 0 0 0-.271-.445" />
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8" />
      </svg>
    </button>
  );
}

export type Condition = ((s: GlobalState) => boolean) | StateVar[] | StateVar;
export function evaluate(c: Condition): boolean {
  const s = StateLogicHandler.instance.overallState;
  switch (typeof c) {
    case "function":
      return c(s);
    case "object":
      return c.every((v) => s[v] === true);
    case "string":
      return s[c] === true;
  }
}

export abstract class QuizItem {
  protected condition?: Condition;
  showDespiteDone: boolean = false;
  public abstract variables(): VarReference[];
  isPinned(): boolean {
    // must not hide Item if a variable I handle is touched (so it can be reset)
    // important: do not resolve aliases here!
    return this.variables().some(
      (v) => v.getUserChoice() !== undefined && !v.isAlias()
    );
  }
  isDone(): boolean {
    // grey out if all parts answered
    return this.variables().every((v) => v.get() !== undefined);
  }
  isReady(): boolean {
    if (this.isDone() && !this.showDespiteDone && this.variables().length > 0) {
      return false;
    }
    return !this.condition || evaluate(this.condition);
  }
  abstract reset(): void;
}

interface QuizItemWrapperProps {
  title: string;
  subitems: QuizItem[];
  subtitle?: string;
  condition?: Condition;
  showDespiteDone?: boolean;
}
export class QuizItemWrapper extends QuizItem {
  subitems: QuizItem[];
  title: string;
  subtitle?: string;
  constructor({
    title,
    subitems,
    subtitle,
    condition,
    showDespiteDone: showDespiteDone,
  }: QuizItemWrapperProps) {
    super();
    this.title = title;
    this.subitems = subitems;
    this.subtitle = subtitle;
    this.condition = condition;
    this.showDespiteDone = showDespiteDone ?? false;
  }
  variables(): VarReference[] {
    return this.subitems
      .filter((sub) => sub.isReady() || sub.isPinned())
      .flatMap((sub) => sub.variables());
  }
  override isReady(): boolean {
    // any of my subitems must be shown
    return super.isReady() && this.subitems.some((sub) => sub.isReady());
  }
  reset(): void {
    this.subitems.forEach((sub) => sub.reset());
  }
}

type Variable = StateVar | VarReference;
function toVarReference(v: Variable): VarReference {
  switch (typeof v) {
    case "string":
      return ref(v);
    case "object":
      return v;
  }
}

interface TritSetterProps {
  v: Variable;
  labelLeft?: ReactNode;
  labelRight?: ReactNode;
  condition?: Condition;
  showDespiteDone?: boolean;
}

export class TritSetter extends QuizItem {
  v: VarReference;
  labelLeft?: ReactNode;
  labelRight?: ReactNode;
  constructor({
    v,
    labelLeft,
    labelRight,
    condition,
    showDespiteDone,
  }: TritSetterProps) {
    super();
    this.v = toVarReference(v);
    this.labelLeft = labelLeft;
    this.labelRight = labelRight;
    this.condition = condition;
    this.showDespiteDone = showDespiteDone ?? false;
  }
  variables(): VarReference[] {
    return [this.v];
  }
  reset(): void {
    this.v.set(undefined);
  }
}

interface TritSetterListProps {
  vars: Variable[];
  names?: string[];
  condition?: Condition;
  setAllRemainingTexts?: [string, string, string];
}

export class TritSetterList extends QuizItem {
  vars: VarReference[];
  names?: string[];
  setAllRemainingTexts?: [string, string, string];

  constructor({
    vars,
    names,
    condition,
    setAllRemainingTexts: setRemainingToFalseText,
  }: TritSetterListProps) {
    super();
    this.vars = vars.map((v) => toVarReference(v));
    this.names = names;
    this.condition = condition;
    this.setAllRemainingTexts = setRemainingToFalseText;
  }
  variables(): VarReference[] {
    return this.vars;
  }
  reset(): void {
    this.vars.forEach((v) => v.set(undefined));
  }
}

interface BingoInputProps {
  varsAndAliases: [Variable, string[]][];
  prompt: string;
  condition?: Condition;
}

export class BingoInput extends QuizItem {
  prompt: string;
  varsAndAliases: [VarReference, string[]][];
  constructor({ varsAndAliases, prompt, condition }: BingoInputProps) {
    super();
    this.varsAndAliases = varsAndAliases.map(([v, a]) => [
      toVarReference(v),
      a,
    ]);
    this.prompt = prompt;
    this.condition = condition;
  }
  variables(): VarReference[] {
    return this.varsAndAliases.map(([v, _]) => v);
  }
  reset(): void {
    this.varsAndAliases.forEach(([v, _]) => v.set(undefined));
  }
}

interface CustomQuizItemProps {
  vars?: Variable[];
  render: (s: GlobalState) => ReactNode;
  condition?: Condition;
}

export class CustomQuizItem extends QuizItem {
  vars: VarReference[];
  render: (s: GlobalState) => ReactNode;
  constructor({ vars, render, condition }: CustomQuizItemProps) {
    super();
    this.vars = (vars ?? []).map((v) => toVarReference(v));
    this.render = render;
    this.condition = condition;
  }
  variables(): VarReference[] {
    return this.vars;
  }
  reset(): void {
    this.vars.forEach((v) => v.set(undefined));
  }
}

interface QuizItemWrapperViewProps {
  item: QuizItemWrapper;
}

function QuestionNotDoneMark() {
  return <span style={{ minWidth: "1em", color: "red" }}>⚠</span>;
}
function QuestionDoneMark() {
  return <span style={{ minWidth: "1em", color: "blue" }}>✓</span>;
}

function QuizItemWrapperView({ item }: QuizItemWrapperViewProps) {
  return (
    <div key={item.title}>
      <h5 className="query-title">
        {item.isDone() ? QuestionDoneMark() : QuestionNotDoneMark()}
        {item.title}
        {/*RewindIcon(() => item.reset())*/}
      </h5>
      {/* uses array index as key*/}
      {item.subitems
        .filter((it) => it.isReady() || it.isPinned())
        .map((x) => renderQuizItem(x))}
    </div>
  );
}

export function renderQuizItem(item: QuizItem): ReactNode {
  if (item instanceof QuizItemWrapper) {
    return <QuizItemWrapperView key={item.title} item={item} />;
  }
  if (item instanceof TritSetter) {
    return (
      <TritSetterView
        key={renderToString(item.labelLeft) + renderToString(item.labelRight)}
        v={item.v}
        labelLeft={item.labelLeft}
        labelRight={item.labelRight}
      ></TritSetterView>
    );
  }
  if (item instanceof TritSetterList) {
    return (
      <TritSetterListView
        key={item.vars.map((v) => v.displayName).reduce((s, t) => s + t)}
        vars={item.vars}
        names={item.names}
        setAllRemainingTexts={item.setAllRemainingTexts}
      />
    );
  }
  if (item instanceof BingoInput) {
    return (
      <BingoInputView
        key={item.prompt}
        varsAndAliases={item.varsAndAliases}
        prompt={item.prompt}
      />
    );
  }
  if (item instanceof CustomQuizItem) {
    return item.render(StateLogicHandler.instance.overallState);
  }
  return <p>Not Implemented</p>;
}
