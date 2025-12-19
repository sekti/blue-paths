import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  freshGlobalState,
  stateFromString,
  numStateVars,
  type GlobalState,
} from "./GlobalState.tsx";
import { isQuizDone, QuizView } from "./MainQuiz.tsx";
import {
  pseudoRef,
  StateLogicHandler,
  useState_LocalStorageTrit,
} from "./StateLogic.tsx";
import { HintDialogView } from "./HintSequence.tsx";
import { Todo, Todos } from "./Todo.tsx";
import qmark from "./assets/qmark.png";
import share from "./assets/share.png";
import reset from "./assets/trash.png";
import logo from "./assets/blue-paths-logo.png";
import github from "./assets/github-mark-white.png";
import pointer from "./assets/pointing-finger.png";
import clsx from "clsx";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import QRCode from "react-qr-code";
import { TritSetterView } from "./TritSetterView.tsx";
const base = import.meta.env.BASE_URL; // "/blue-paths/"

export function showAlert(message: string, timeout = 3000) {
  console.log(`Alert: ${message}`);
  const alertBox = document.getElementById("alertBox") as HTMLDivElement;
  alertBox.textContent = message;
  alertBox.style.display = "block";
  setTimeout(() => {
    alertBox.style.display = "none";
  }, timeout);
}

interface LandingPageProps {
  tabSetter: (t: Tab) => void;
}
function LandingPage({ tabSetter }: LandingPageProps) {
  const demoQuestion = [
    ["reached Room 46", false],
    ["found Security", true],
    ["unlocked Orchard", undefined],
    ["read “The Fixed Stars”", undefined],
  ] as const;

  const demoTodos = [
    "📚 Read books",
    "🔎 Artwork",
    //"🔨 Craft",
    "🏃‍♂️ reach Antechamber",
  ];

  function Clickable(tab: Tab) {
    return (
      <button
        className="btn btn-primary"
        style={{ verticalAlign: "baseline" }}
        onClick={() => tabSetter(tab)}
      >
        {tab}
      </button>
    );
  }

  return (
    <div className="landing-page">
      <img src={logo} style={{ width: "100%" }} alt="Blue Paths" />
      <div>
        <h4 style={{ textAlign: "center" }}>
          <b>Blue</b> <b>P</b>rince <b>A</b>utomatic <b>T</b>odo List and{" "}
          <b>H</b>
          int <b>S</b>ystem
        </h4>
        <p>
          <Emph>
            This website is a spoiler free way to track your progress in Blue
            Prince, helps you focus on promising clues and assists with
            personalised hints. Use it to reinvigorate your Blue Prince runs if
            you struggle.
          </Emph>
        </p>
      </div>
      <h5>1. Report your progress in a {Clickable("Quiz")}</h5>
      <div className="demo watermarked">
        <div className="watermark" style={{ top: "63%", left: "15%" }}>
          <img src={pointer} style={{ width: "2em" }} />
        </div>
        {demoQuestion.map(([label, val]) => (
          <TritSetterView
            key={label}
            v={pseudoRef(val)}
            labelRight={label}
          ></TritSetterView>
        ))}
        <p style={{ marginLeft: "2em" }}>…</p>
      </div>
      <h5>2. View personalised {Clickable("Todos")}</h5>
      <div className="demo watermarked">
        <div className="watermark" style={{ top: "50%", left: "70%" }}>
          <img src={pointer} style={{ width: "2em" }} />
        </div>
        <div className="d-grid gap-2" style={{ textAlign: "center" }}>
          {demoTodos.map((label) => (
            <button
              key={label}
              type="button"
              className={clsx("btn", "todo", "btn-light")}
              data-bs-toggle="button"
            >
              <span key="yes">{label}</span>
            </button>
          ))}
          <p>…</p>
        </div>
      </div>
      <h5>3. Get 💡 {Clickable("Hints")} (if you like)</h5>
    </div>
  );
}

function Testimonials() {
  return (
    <>
      <h5 style={{ textAlign: "center" }}>Testimonials</h5>
      <div className="memo babbage">
        <p>
          After wasting several days trying to draft the Cloister next to the
          Chapel, this guide reminded me of more promising clues I had
          completely forgotten about!
        </p>
        <p style={{ textAlign: "right" }}>– Anne Babbage</p>
      </div>
      <div className="memo darren">
        <p>
          The information on this site is incomplete and riddled with errors.
        </p>
        <p style={{ textAlign: "right" }}>– Kirk Darren</p>
      </div>
      <div className="memo moore">
        <p>
          At first, you should explore the manor without any help. But when you
          get frustrated after days of drafting with little progress, there is
          no shame in getting a nudge in the right direction!
        </p>
        <p style={{ textAlign: "right" }}>– Randolph Moore</p>
      </div>
    </>
  );
}

interface EmphProps {
  children: ReactNode;
}
function Emph({ children }: EmphProps) {
  return <span className="emph">{children}</span>;
}

function HelpView() {
  return (
    <div>
      <h5>What is this?</h5>
      <p>
        <a href={"https://www.blueprincegame.com/"}>Blue Prince</a> is a
        rogue-like puzzle game by{" "}
        <a href={"http://www.dogubomb.com/"}>Dogubomb</a>. This page is a
        fan-made hint system (not affiliated with or endorsed by Dogubomb in any
        way).
      </p>
      <h5>How to use this hint system?</h5>
      <ol>
        <li>
          Answer all <Emph>Quiz</Emph> questions.
        </li>
        <li>
          View the resulting list of <Emph>Todos</Emph>.
        </li>
        <li>
          Click a <Emph>Todo</Emph> to receive hints for it.
        </li>
      </ol>
      <h5>Why another Blue Prince guide?</h5>
      <p>
        Blue Prince is non-linear. Different players solve puzzles in a
        different order and possibly based on different clues.{" "}
        <Emph>Static</Emph> guides like videos cannot properly account for that.
        What's more, it is hard to distinguish if you are stuck on a puzzle and
        need a hint or if you're not yet meant to solve the puzzle. This guide
        addresses both problems by considering your game state and distilling a{" "}
        <Emph>personalised </Emph> list of Todos.
      </p>
      <h5>Is all of Blue Prince covered (including the late game)?</h5>
      <p>
        Almost all puzzles are covered, with certain pure logic puzzles (like
        Parlor Game Puzzles) being a notable exception. This hint system also
        does not cover drafting strategy, resource management (keys, gems, gold,
        dice) and certain related achievements, all of which are well covered by
        existing guides.
      </p>
      <h5>Is the guide spoiler free?</h5>
      <p>
        That was the goal. The hint system is designed to reveal information
        only piece by piece and only if you ask for it. Sometimes Quiz questions
        require you to type in an answer because providing you with a set of
        options might give away too much information. That being said, the Quiz{" "}
        <Emph>does</Emph> in some cases acknowledge the existence of certain
        items or locations you may not know about, but only when the names
        themselves are not particularly revealing. For example, just knowing
        that “The Den” exists doesn't tell you much about it.
      </p>
      <h5>How to get help for a specific puzzle?</h5>
      <p>
        Answer the Quiz and check if you find a matching Todo. If there isn't
        one, this usually means that no progress can be made at the moment
        and/or further clues for the puzzle will organically arise at a later
        point in your playthrough. In other words, consider the absence of a
        Todo as a hint to focus on something else.{" "}
        {/*If you keep following the Todos of
        this hint system you will eventually solve every puzzle that Blue Prince
        has to offer.*/}
      </p>
      <h5>I'm unsure about an answer. How to proceed?</h5>
      <p>
        This might happen if you have forgotten the name of a place or item. If
        in doubt, answer questions negatively. In that case you may be presented
        with “outdated” Todos that you have already completed. If you step
        through all hints in such Todos you will reach a button that marks this
        Todo as completed and edits your Quiz answers accordingly.
      </p>
      <h5>How does this guide work?</h5>
      <p>
        This hint system tracks your progress using {numStateVars} Boolean
        variables (each true or false). It asks you about some variables
        directly (e.g. “Have you reached Room 46”) but infers as much as
        possible automatically (e.g. if you have (not) reached Room 46 this
        implies that you have (not) done certain other things). This means the
        answers of earlier quiz questions determine which quiz questions are
        shown after. While basic automatic reasoning was instrumental for
        creating this hint system, most of the effort was spent in crafting{" "}
        {Todos.length} interactive dialogs that provide personalised hints.
      </p>
      <h5>Where is my progress stored?</h5>
      <p>
        The answers you provide to the quiz questions are stored in your
        browser. Nothing is ever sent to the server. You can transfer your state
        to a different device or share it with friends via link sharing (see
        button in header). In that case your answers are stored in the link.
      </p>
    </div>
  );
  /*
    Usage Questions
    Why another Blue Prince guide?
      • This guide helps you decide what you should focus on.
    How to use this guide?
      • Answer Questions
      • Pick Todo
      • View Hints
    What is the scope of this guide?
      • all puzzles, some exceptions
      • not logic puzzles

    Is this guide spoiler free?
      • assumes you're really stuck
      • asumes you're somewhat observant
      • mentions some names
      • tries to use inconspicuous descriptions ()
    I just want help with a specific puzzle
    Can I transfer my state to other devices?
      • see link sharing

    Trouble Shooting
    I cannot find hints for a specific puzzle
      • come back later
    I cannot change an answer in the Quiz
      • locked variables
    I have trouble answering some of the questions.
      • forgotten names

    Technical Questions

    How does this guide work?
      • Graph of Variables
      • number of variables
      • copy inferred state into keyboard
      • copy user state into keyboard
    
    Where is my state stored?
      • Browser Local Storage
  */
}

function HintsView() {
  const [todo, _] = useContext(TodoContext)!;
  if (!todo) {
    return <div className="emph">Select an item in "todos".</div>;
  }
  return <HintDialogView key={todo.title} todo={todo} />;
}

interface TodosViewProps {
  classes: string;
}

function TodosView({ classes }: TodosViewProps) {
  const [todo, setTodo] = useContext(TodoContext)!;
  const divRef = useRef<HTMLDivElement>(null);
  const availableTodos = Todos.filter((t) => t.isRelevant());
  const showTodosRef = useState_LocalStorageTrit("showTodos");

  const [numShown, setNumShown] = useState<number>(0);

  const handleScroll = () => {
    const el = divRef.current;
    if (!el) return;

    const scrollTop = el.scrollTop;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const scrolled = scrollTop / maxScroll;
    const shouldShow = Math.round(scrolled * availableTodos.length);
    if (numShown !== shouldShow) {
      setNumShown(shouldShow);
    }
  };
  return (
    <div
      ref={divRef}
      className={classes}
      onScroll={handleScroll}
      style={{ minWidth: 0 }}
    >
      <div className="todoSticky">
        <div className="d-grid gap-2" style={{ textAlign: "center" }}>
          <TritSetterView v={showTodosRef} labelRight={"reveal all"} />
          {isQuizDone() || (
            <p key="quiz-incomplete-warning" className="emph">
              You have unanswered quiz questions. The following list assumes all
              open questions are answered negatively.
            </p>
          )}
          {availableTodos.map((t, i) => (
            <button
              key={t.title}
              type="button"
              disabled={i >= numShown && !showTodosRef.get()}
              className={clsx(
                "btn",
                "todo",
                todo === t ? "btn-primary" : "btn-light"
              )}
              data-bs-toggle="button"
              onClick={() => {
                setTodo(t);
              }}
            >
              {i >= numShown && !showTodosRef.get() ? (
                <span key="no">scroll to reveal</span>
              ) : (
                <span key="yes">{t.title}</span>
              )}
            </button>
          ))}
          {availableTodos.length == 0 && (
            <p className="emph">
              Congratulations, you're done! (as far as this guide is concerned)
              <br />
              Except of course, that “there is no end to this journey”...
            </p>
          )}
        </div>
      </div>
      {showTodosRef.get() || <div className="todoPadding"></div>}
    </div>
  );
}

function ShareView() {
  const t: string[] = StateLogicHandler.instance.export();
  const t_str = JSON.stringify(t);
  const t_comp = compressToEncodedURIComponent(t_str);
  const shareUrl = `${location.origin}${base}/?state=${t_comp}`;

  const [copied, setCopied] = useState(false);
  async function copyToClipboard() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  }
  return (
    <>
      <h5>State</h5>
      <p>
        The state is made up the answers given to quiz questions. The latest
        state you interacted with is stored in your browser.
      </p>
      <h5>State Snapshots</h5>
      <p>
        You can make a snapshop of your state in form of a sharing link. This
        allows you to transfer your state to other devices or save them for
        future reference.
      </p>
      <h5>Snapshot of Your Current State</h5>
      <div
        style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: 8 }}
      >
        <div>
          <QRCode value="hey" />
        </div>
        <div
          style={{
            wordBreak: "break-all",
            userSelect: "all",
            marginBottom: "0.5rem",
          }}
        >
          {shareUrl}
        </div>

        <button onClick={copyToClipboard}>
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
      </div>
    </>
  );
}

function restoreState(): GlobalState {
  // option 1: shared state via url
  const state_enc_comp = new URLSearchParams(location.search).get("state");
  const state_enc =
    state_enc_comp && decompressFromEncodedURIComponent(state_enc_comp);
  const state_seq = state_enc && JSON.parse(state_enc);
  const state_arr =
    state_seq instanceof Array && state_seq.length == numStateVars && state_seq;
  const state = state_arr && stateFromString(state_arr);
  if (state) {
    console.log("Successfully loaded shared state.");
    history.replaceState(
      { tab: "Quiz" },
      "",
      `${location.origin}${base}/#Quiz`
    );
    return state;
  }
  // option 2: local storage
  const storedStr = localStorage.getItem("savedState");
  if (storedStr) {
    try {
      const s = JSON.parse(storedStr);
      console.log("Loaded state from JSON string in localStorage.");
      return s;
    } catch {
      console.log(`Failed to Parse JSON string in localStorage: ${storedStr}`);
    }
  }
  // option 3: blank state
  console.log("No stored state found. Starting blank.");
  return freshGlobalState();
}

type TodoStatePair = [Todo | undefined, (t: Todo | undefined) => void];
const TodoContext = createContext<TodoStatePair | undefined>(undefined);

type Tab = "Start" | "Hints" | "Todos" | "Quiz" | "Help" | "Share" | "Reset";
function tabFromUrl(): Tab {
  return (
    (["Quiz", "Todos", "Hints", "Help", "Share", "Start"] as const).find((t) =>
      window.location.hash.includes(t)
    ) ?? "Start"
  );
}

function useIsLargeScreen() {
  const [isLarge, setIsLarge] = useState(window.innerWidth >= 992); // lg breakpoint

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 992px)");
    const handler = (e: MediaQueryListEvent) => setIsLarge(e.matches);

    mq.addEventListener("change", handler);

    return () => mq.removeEventListener("change", handler);
  }, []);

  return isLarge;
}

function App() {
  // on small screens: Only one tab is shown
  const [tab, setTab] = useState<Tab>(tabFromUrl());
  useEffect(() => {
    const currentTab = history.state?.tab;
    if (currentTab !== tab) {
      history.pushState({ tab: tab }, "", `#${tab}`);
    }
  }, [tab]);
  useEffect(() => {
    const handler = (e: PopStateEvent) => {
      const restoredTab: Tab = e.state?.tab || "Start";
      setTab(restoredTab);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const GSP = useState<GlobalState>(restoreState);
  const json = JSON.stringify(GSP[0]);
  localStorage.setItem("savedState", json);
  const [todo, setTodo] = useState<Todo | undefined>(undefined);
  useEffect(() => {
    if (todo !== undefined) {
      setTab("Hints");
    }
  }, [todo]);

  useEffect(() => {
    if (todo && !todo.isRelevant()) {
      setTodo(undefined);
    }
  });

  StateLogicHandler.instance.bind(GSP);

  const twinTabs: Tab[] = ["Todos", "Hints"];
  const large = useIsLargeScreen();
  let shown: Tab[] = [tab];
  if (large && twinTabs.includes(tab)) {
    shown = twinTabs;
  }

  function tabClasses(t: Tab, extraClass?: string) {
    return clsx([
      shown.includes(t) ? "d-flex" : ["position-absolute", "invisible"],

      "h-100",
      "contentTab",
      "overflow-auto",
      "flex-grow-1",
      "flex-basis-0",
      "p-4",
      "overflow-auto",
      "flex-column",
      extraClass,
    ]);
  }

  function trySetTab(newTab: Tab) {
    if (tab !== newTab) {
      setTab(newTab);
      return;
    } else if (!["Quiz", "Hints", "Todos"].includes(tab)) {
      setTab("Quiz"); // return from other tab
    }
  }

  return (
    <div
      className="app-container d-flex flex-column"
      style={{ height: "100%" }}
    >
      <header className="bg-dark text-white text-center">
        <p>
          <span className="headerButtons">
            <button
              type="button"
              className="btn btn-dark logo"
              onClick={() => trySetTab("Start")}
            >
              <img
                src={logo}
                style={{ transform: "translateY(2pt)" }}
                alt="Blue Paths"
              />
            </button>
            <button
              type="button"
              className="btn btn-dark"
              onClick={() => trySetTab("Help")}
            >
              <img src={qmark} alt="how to use this page" />
            </button>
            <button
              type="button"
              className="btn btn-dark"
              onClick={() => trySetTab("Reset")}
            >
              <img src={reset} alt="reset state" />
            </button>
            <button
              type="button"
              className="btn btn-dark"
              onClick={() => trySetTab("Share")}
            >
              <img src={share} alt="share state" />
            </button>
            <a
              href="https://github.com/sekti/blue-paths"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-dark"
            >
              <img src={github} alt="github icon" />
            </a>
          </span>
        </p>

        <ul
          className="nav nav-tabs bg-dark text-light d-flex"
          id="myTab"
          role="tablist"
        >
          <li style={{ flex: 1 }}></li>
          <li className="nav-item" role="presentation">
            <button
              className={clsx(["nav-link", shown.includes("Quiz") && "active"])}
              data-bs-toggle="tab"
              type="button"
              role="tab"
              onClick={() => trySetTab("Quiz")}
            >
              <span>QUIZ{isQuizDone() ? "" : "⚠"}</span>
            </button>
          </li>
          <li style={{ flex: twinTabs.includes(tab) ? 0.1 : 0 }}></li>
          <li className="nav-item" role="presentation">
            <button
              className={clsx([
                "nav-link",
                shown.includes("Todos") && "active",
              ])}
              data-bs-toggle="tab"
              type="button"
              role="tab"
              onClick={() => trySetTab("Todos")}
            >
              <span>TODOS</span>
            </button>
          </li>
          <li style={{ flex: large && twinTabs.includes(tab) ? 1 : 0 }}></li>
          <li className="nav-item" role="presentation">
            <button
              className={clsx([
                "nav-link",
                shown.includes("Hints") && "active",
              ])}
              data-bs-toggle="tab"
              type="button"
              role="tab"
              onClick={() => trySetTab("Hints")}
            >
              <span>HINTS</span>
            </button>
          </li>
          <li style={{ flex: 1 }}></li>
        </ul>
      </header>
      <TodoContext value={[todo, setTodo]}>
        <main className="flex-grow-1" style={{ minHeight: 0 }}>
          <div
            className="h-100"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              minHeight: 0,
            }}
          >
            <div className={tabClasses("Quiz", "quiz")}>
              <QuizView />
            </div>
            <TodosView classes={tabClasses("Todos")} />{" "}
            {/* needs its own scroll handler ... */}
            <div className={tabClasses("Hints", "hintdialog")}>
              <HintsView />
            </div>
            <div className={tabClasses("Help")}>
              <HelpView />
            </div>
            {large ? (
              <>
                <div className={tabClasses("Start")}>
                  <LandingPage tabSetter={trySetTab} />
                </div>
                <div className={tabClasses("Start")}>
                  <Testimonials />
                </div>
              </>
            ) : (
              <div className={tabClasses("Start")}>
                <LandingPage tabSetter={trySetTab} />
                <Testimonials />
              </div>
            )}
            <div className={tabClasses("Reset")}>
              Are you sure you want to reset your progress?
              <p>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    StateLogicHandler.instance.resetState();
                    trySetTab("Quiz");
                  }}
                >
                  <span>🗑️ Yes, reset everything.</span>
                </button>
              </p>
            </div>
            {/* should only exist when shown, requires expensive qr-code computation */}
            {tab === "Share" && (
              <div key="Share" className={tabClasses("Share")}>
                <ShareView />
              </div>
            )}
          </div>
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              left: "50%",
              transform: "translate(-50%)",
              zIndex: 9999,
              display: "block",
            }}
          >
            <div
              id="alertBox"
              style={{ display: "none" }}
              className="alert alert-warning"
              role="alert"
            >
              Warnings go here.
            </div>
          </div>
        </main>
      </TodoContext>
    </div>
  );
}

export default App;
