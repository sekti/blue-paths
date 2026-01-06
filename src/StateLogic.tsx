import { useState, type SetStateAction } from "react";
import {
  ALIASES,
  displayNameMap,
  freshGlobalState,
  REQUIREMENTS,
  stateFromString,
  stateToString,
  stringToTrit,
  tritToString,
  type GlobalState,
  type StateVar,
  type Trit,
} from "./GlobalState";
import { getQuestionWith } from "./MainQuiz";

export type StateSetter<T> = React.Dispatch<SetStateAction<T>>;
export type StatePair<T> = [T, StateSetter<T>];

export class StateLogicHandler {
  resolveAlias(alias: StateVar): StateVar {
    const mapEntry = this.aliasMap.get(alias);
    return mapEntry ? mapEntry : alias;
  }

  private constructor() {}

  bind(SP: StatePair<GlobalState>) {
    this.aliasMap = new Map();
    this.lockMap = new Map();
    for (const [alias, groundTruth] of ALIASES) {
      this.aliasMap.set(alias, groundTruth);
    }
    for (const [_, value] of this.aliasMap) {
      if (this.aliasMap.get(value)) {
        throw new Error(`Used ${value} as an alias, but it is itself aliased!`);
      }
    }

    this.stateSetter = SP[1];
    this.userState = SP[0];
    // userState + Implications:
    this.overallState = { ...this.userState };

    // de-alias requirements:
    for (let i = 0; i < REQUIREMENTS.length; ++i) {
      REQUIREMENTS[i] = [
        this.resolveAlias(REQUIREMENTS[i][0]),
        this.resolveAlias(REQUIREMENTS[i][1]),
      ];
    }

    // define graph
    const V = new Set<StateVar>();
    for (const [from, to] of REQUIREMENTS) {
      V.add(from);
      V.add(to);
    }
    const G = new Map<
      StateVar,
      { ein: StateVar[]; eout: StateVar[]; dcounted: number }
    >(Array.from(V, (v) => [v, { ein: [], eout: [], dcounted: 0 }]));
    for (const [from, to] of REQUIREMENTS) {
      G.get(from)!.eout.push(to);
      G.get(to)!.ein.push(from);
    }
    // topological sort
    const topoSort: StateVar[] = [];
    {
      const Q = Array.from(V).filter((v) => G.get(v)?.ein.length == 0);
      while (Q.length) {
        const v: StateVar = Q.pop()!;
        topoSort.push(v);
        for (const w of G.get(v)!.eout) {
          G.get(w)!.dcounted += 1;
          if (G.get(w)!.dcounted == G.get(w)!.ein.length) {
            Q.push(w);
          }
        }
      }
      if (topoSort.length != V.size) {
        const problemNodes = Array.from(V).filter(
          (v) => G.get(v)!.dcounted < G.get(v)!.ein.length
        );
        throw new Error(
          `Implication graph not acyclic, remaining nodes: ${problemNodes}!`
        );
      }
    }
    // state inference
    for (const v of topoSort) {
      if (this.overallState[v] === false) {
        const reason = this.lockMap.get(v) ?? v;
        for (const w of G.get(v)!.eout) {
          if (this.overallState[w] === true) {
            throw new Error(
              "State Logic Contradiction: 'true' variable is implied to be false."
            );
          }
          // console.log(`Inferred False: ${w} (from ${v})`);
          this.overallState[w] = false;
          this.lockMap.set(w, reason);
        }
      }
    }
    const topoSortRev = topoSort.slice().reverse();
    for (const v of topoSortRev) {
      if (this.overallState[v] === true) {
        const reason = this.lockMap.get(v) ?? v;
        for (const w of G.get(v)!.ein) {
          if (this.overallState[w] === false) {
            throw new Error(
              "State Logic Contradiction: 'false' variable is implied to be true."
            );
          }
          // console.log(`Inferred True: ${w} (from ${v})`);
          this.overallState[w] = true;
          this.lockMap.set(w, reason);
        }
      }
    }

    // copy derived values to aliases
    for (let [alias, truth] of this.aliasMap) {
      this.overallState[alias] = this.overallState[truth];
      this.userState[alias] = this.userState[truth];
    }
  }
  stateSetter: StateSetter<GlobalState> = () => {};
  protected userState: GlobalState = freshGlobalState();
  protected lockMap: Map<StateVar, StateVar> = new Map();
  protected aliasMap: Map<StateVar, StateVar> = new Map();
  public overallState: GlobalState = freshGlobalState();

  getUserChoice(v: StateVar): Trit {
    // do not resolve alias here!
    return this.userState[v];
  }
  isVarLocked(v: StateVar): boolean {
    return this.lockMap.has(this.resolveAlias(v));
  }
  getVarLockedQuestion(v: StateVar): string {
    v = this.resolveAlias(v);
    if (!this.isVarLocked(v)) {
      throw new Error(
        `getVarLockedQuestion called for non-locked variable ${v}`
      );
    }
    const w: StateVar = this.lockMap.get(v)!;
    const QI = getQuestionWith(w);
    return QI ? `“${QI.title}”` : "[unknown]";
  }
  getVar(v: StateVar): Trit {
    return this.overallState[this.resolveAlias(v)];
  }
  setVar(v: StateVar, val: Trit): void {
    if (
      this.isVarLocked(v) &&
      val !== undefined &&
      val !== this.overallState[v]
    ) {
      throw new Error(
        `Trying to set locked variable. Lock Reason: ${this.lockMap.get(v)}`
      );
    }
    this.stateSetter((prev: GlobalState) => ({
      ...prev,
      [this.resolveAlias(v)]: val,
    }));
  }
  isAlias(v: StateVar): boolean {
    return this.aliasMap.has(v);
  }
  export(): string[] {
    return stateToString(this.userState);
  }
  import(t: string[]) {
    this.stateSetter(stateFromString(t));
  }
  resetState() {
    this.stateSetter(freshGlobalState());
  }
  static instance = new StateLogicHandler();
}

export function ref(v: StateVar): VarReference {
  const logic = StateLogicHandler.instance;
  return {
    set: (val: Trit) => logic.setVar(v, val),
    getLockedReason: () => {
      return logic.getVarLockedQuestion(v);
    },
    is: (w: StateVar) => logic.resolveAlias(w) === logic.resolveAlias(v),
    get: () => logic.getVar(v),
    isLocked: () => logic.isVarLocked(v),
    getUserChoice: () => logic.getUserChoice(v),
    isAlias: () => logic.isAlias(v),
    displayName: displayNameMap.get(v) ?? v.replace(/.*\./g, ""), // remove prefix
  };
}
export function refs(vars: StateVar[]): VarReference[] {
  return vars.map((v) => ref(v));
}
export function pseudoRef(
  val: Trit,
  setter: (val: Trit) => void = () => {}
): VarReference {
  return {
    set: setter,
    getLockedReason: () => {
      throw new Error("PseudoRef should never be locked.");
    },
    is: () => false,
    get: () => val,
    isLocked: () => false,
    getUserChoice: () => val,
    isAlias: () => false,
    displayName: "pseudoVariable" + val,
  };
}

export function useState_LocalStorageTrit(varName: string): VarReference {
  const [v, setV] = useState<Trit>(stringToTrit(localStorage[varName]));
  return {
    set: (val: Trit) => {
      setV(val);
      localStorage[varName] = tritToString(val);
    },
    getLockedReason: () => {
      throw new Error("localStorageRef should never be locked.");
    },
    is: () => false,
    get: () => v,
    isLocked: () => false,
    getUserChoice: () => v,
    isAlias: () => false,
    displayName: varName,
  };
}

export interface VarReference {
  displayName: string;
  set(val: Trit): void;
  getLockedReason(): string;
  get(): Trit;
  is(w: StateVar): boolean;
  getUserChoice(): Trit;
  isLocked(): boolean;
  isAlias(): boolean;
}
