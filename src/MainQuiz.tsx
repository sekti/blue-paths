import {
  booksFromShop,
  booksFromStock,
  locksFound,
  RealmIcon,
  Realms,
  sanctumDoors,
  sanctumKeys,
  sanctumSigils,
  tools,
  trophies,
  type BlackbridgeKey,
  type CombinationLock,
  type FireLocation,
  type FoundFloorplan,
  type PowerHammerLocation,
  type Realm,
  type Document,
  type StudioAddition,
  type MicrochipLocation,
  type StateVar,
  numStateVars,
} from "./GlobalState";
import {
  BingoInput,
  CustomQuizItem,
  QuizItemWrapper,
  renderQuizItem,
  TritSetter,
  TritSetterList,
  type Condition,
} from "./Quiz";
import {
  ref,
  StateLogicHandler,
  useState_LocalStorageTrit,
} from "./StateLogic";
import { TritSetterView } from "./TritSetterView";

const Q46 = new QuizItemWrapper({
  title: "Did you reach Room 46?",
  subitems: [new TritSetter({ v: "R46", labelLeft: "No", labelRight: "Yes" })],
});
/*
const Q462 = new QuizItemWrapper({
  title: "Did you reach Room 46 twice?",
  subitems: [
    new TritSetter({ v: ref("locR46"), labelLeft: "No", labelRight: "Yes" }),
  ],
});*/
const Qtrophies = new QuizItemWrapper({
  title: "Which trophies have you unlocked?",
  condition: "R46",
  subitems: [
    new TritSetterList({
      vars: trophies,
      setAllRemainingTexts: ["set remaining to: ", "no", "yes"],
    }),
  ],
});
const QPA = new QuizItemWrapper({
  title: "Which permanent additions have you unlocked?",
  subitems: [
    new BingoInput({
      varsAndAliases: [
        ["PA.Blackbridge Grotto", ["Grotto", "Blackbridge"]],
        ["PA.Gem Cavern", ["Gemstone Cavern", "Gem Cave", "Gemstone Cave"]],
        ["PA.West Path", ["West Gate Path", "Outer Room"]],
        [
          "PA.Satellite Dish",
          ["Sattellite Dish", "Sattelite Dish", "Satelite Dish"],
        ],
        ["PA.Blue Tents", []],
        ["PA.Orchard", []],
      ],
      prompt: "enter name as displayed in menu",
    }),
  ],
});
const QKeys = new QuizItemWrapper({
  title: "Sanctum Keys Found",
  condition: "locR46",
  subitems: [
    new TritSetterList({
      vars: sanctumKeys,
      names: [
        '1: "found on the furthest rank"',
        '2: "locked tight in the vault of a bank"',
        '3: "high up, among all the clocks"',
        '4: "down below, beneath all the docks"',
        '5: "held by a king on his throne"',
        '6: "in a station, left by one of your own"',
        '7: "major if you draft it quite late"',
        '8: "waiting behind the last door of eight"',
      ],
      setAllRemainingTexts: ["set remaining: ", "", ""],
    }),
  ],
});
const QSanctum = new QuizItemWrapper({
  title: "Inner Sanctum",
  condition: "locR46",
  subitems: [
    new CustomQuizItem({
      vars: [...sanctumSigils, ...sanctumDoors],
      render: () => (
        <table style={{ textAlign: "center" }} key={"sanctumTable"}>
          <thead>
            <tr>
              <td></td>
              <td>opened</td>
              <td>solved</td>
            </tr>
          </thead>
          <tbody>
            {Realms.map((R: Realm) => (
              <tr key={R}>
                <td>{RealmIcon(R)}</td>
                <td>
                  <TritSetterView key={R} v={ref(`sanctumDoors.${R}`)} />
                </td>
                <td>
                  <TritSetterView key={R} v={ref(`sanctumSigils.${R}`)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    }),
  ],
});

const Qtools = new QuizItemWrapper({
  title: "Contraptions crafted in the workshop",
  subitems: [
    new CustomQuizItem({
      render: () => (
        <p key="don't worry" className="emph">
          Don't worry if you forget something, not all are relevant.
        </p>
      ),
    }),
    new BingoInput({
      varsAndAliases: tools.map((t) => [t, []]),
      prompt: "enter contraption name",
    }),
  ],
});

const DocsWithConditions: [Document, Condition][] = [
  ["Electronic Mail", []],
  ["Will of Herbert S Sinclair", ["locR46"]],
  ["Birth Certificate of Mary Epsen", []],
  ["The Blue Prince Manuscript", []],
  ["The Red Prince Manuscript", []],
  //["A New Clue Manuscript", []], // not needed, is it?
  ["Her Ladyship's Diary", []],
  ["A note containing “steady, deadly, heavy, ready”", []],
  ["Security Camera Footage", []],
  ["A note explaining how 86455 relates to 18", []],
  [
    "A note with a 5 × 5 grid of words",
    ["docs.A note explaining how 86455 relates to 18"],
  ],
  ["A hidden hue", ["docs.A note with a 5 × 5 grid of words"]],
  ["Baron Bafflers", []],
];

const Qdocs = new QuizItemWrapper({
  title: "Documents viewed",
  subitems: (() => {
    const items = DocsWithConditions.map(
      ([v, cond]) =>
        new TritSetter({
          v: `docs.${v}`,
          labelRight: ref(`docs.${v}`).displayName,
          condition: cond,
        })
    );
    items.push(
      new TritSetter({
        v: "bafflersPuzzle",
        condition: "docs.Baron Bafflers",
        labelLeft: "✗",
        labelRight: "✓ solved",
      })
    );
    return items;
  })(),
});

const PHlocAliases: [PowerHammerLocation, string[]][] = [
  ["Greenhouse", []],
  ["Weight Room", []],
  ["Secret Garden", []],
  ["The Precipice", ["precipice", "chess"]],
  ["Sealed Entrance", ["grounds", "basement"]],
  ["Freezer", []],
  ["Tunnel", ["unknown"]],
];

const QPHlocs = new QuizItemWrapper({
  title: "Power Hammer usage",
  condition: "tools.Power Hammer",
  subitems: [
    new BingoInput({
      varsAndAliases: PHlocAliases.map(([loc, aliases]) => [
        `powerHammer.${loc}`,
        aliases,
      ]),
      prompt: "enter name of location",
    }),
  ],
});

const fireLocAliases: [FireLocation, string[]][] = [
  ["Tunnel (Torches)", ["Tunnel", "Grounds"]],
  ["Tunnel (Candles)", ["Tunnel", "Unknown"]],
  ["Chapel 🐷", ["Chapel"]],
  ["Tomb", []],
  ["Freezer", []],
  ["Trading Post (🧨)", ["Trading Post", "dynamite"]],
  [
    "Abandoned Mine (Torch Chamber)",
    ["Torch Chamber", "Abandoned Mine", "Precipice"],
  ],
  ["Orchard (Sun Dial)", ["Orchard", "Sun Dial"]],
];

const QfireLocs = new QuizItemWrapper({
  title: "Usage of fire",
  condition: "hasFire",
  subitems: [
    new BingoInput({
      varsAndAliases: fireLocAliases.map(([loc, aliases]) => [
        `fire.${loc}`,
        aliases,
      ]),
      prompt: "enter name of location",
    }),
  ],
});

const combLockAliases: [CombinationLock, string[]][] = [
  ["Office", []],
  ["Shelter", []],
  ["Drawing Room", []],
  ["Drafting Studio", ["Studio"]],
  ["Boudoir", ["Budoir", "Boudor", "Boudir", "Bodoir"]],
  ["Study", []],
  ["Rotating Gear", ["Reservoir", "Underground", "Underpass", "Gear"]],
  ["Orchard", ["Grounds", "Campsite", "Apple"]],
];

const Qlocks = new QuizItemWrapper({
  title: "Safes and locked gates",
  subitems: [
    new CustomQuizItem({
      render: (s) => (
        <p key="0">
          Safes and other combination locks you have discovered
          {locksFound.every((l) => !s[l]) && " (need not be unlocked)"}.
        </p>
      ),
    }),
    new BingoInput({
      varsAndAliases: combLockAliases.map(([loc, aliases]) => [
        `locksFound.${loc}`,
        aliases,
      ]),
      prompt: "enter location",
    }),
    new CustomQuizItem({
      condition: (s) => locksFound.some((l) => s[l]),
      render: () => <p key="1">Unlocked?</p>,
    }),

    ...combLockAliases.map(
      ([l, _]) =>
        new TritSetter({
          v: `locksOpened.${l}`,
          labelRight: l,
          condition: `locksFound.${l}`,
          showDespiteDone: true,
        })
    ),
  ],
});

const Qbooks = new QuizItemWrapper({
  title: "What have you read in the Library?",
  subitems: [
    new CustomQuizItem({
      condition: "R46",
      render: () => (
        <p key="h1" className="mb-1">
          Initial Stock:
        </p>
      ),
    }),
    new TritSetterList({
      vars: booksFromStock,
      setAllRemainingTexts: ["set remaining: ", "", ""],
    }),
    new CustomQuizItem({
      condition: "R46",
      render: () => (
        <p key="h2" className="mb-1">
          Purchased from Bookshop:
        </p>
      ),
    }),
    new TritSetterList({
      condition: "R46",
      vars: booksFromShop,
      setAllRemainingTexts: ["set remaining: ", "", ""],
    }),
  ],
});

const QblueDoors = new QuizItemWrapper({
  title: "Blue Doors Found",
  // note that it is possible to find blue doors before this question is unlocked
  // its a mild spoiler if that question appears after answering positively to a hidden hue... but I think it's acceptable
  condition: (s) =>
    !!s["rooms.Throne of the Blue Prince"] ||
    !!s["fire.Tunnel (Candles)"] ||
    !!s["docs.A hidden hue"],
  subitems: [
    new BingoInput({
      varsAndAliases: [
        [
          "blueDoors.Secret Passage",
          [
            "West Path",
            "Outer Room",
            "Atelier",
            "Attelier",
            "Atellier",
            "Attellier",
          ],
        ],
        ["blueDoors.Tunnel", ["Unknown", "Grounds"]],
      ],
      prompt: "describe location",
    }),
  ],
});

const roomAliasList: [FoundFloorplan, string[]][] = [
  ["Planetarium", []],
  ["Mechanarium", ["Machanarium", "Machenarium", "Mechenarium"]],
  ["Treasure Trove", []],
  ["Throne Room", []],
  ["Throne of the Blue Prince", []],
  ["Tunnel", []],
  ["Conservatory", []],
  ["Closed Exhibit", ["Closed Exibit"]],
  ["Lost & Found", ["Lost and Found"]],
];

const studioAliasList: [StudioAddition, string[]][] = [
  ["Dovecote", []],
  ["The Kennel", ["Kennel"]],
  ["Clock Tower", []],
  ["Classroom", []],
  ["Solarium", []],
  ["Dormitory", []],
  ["Vestibule", []],
  ["Casino", []],
];

const Qfloorplans = new QuizItemWrapper({
  title: "Special Floorplans",
  subitems: [
    new CustomQuizItem({
      condition: (s) => !s["trophies.Explorer's Trophy"],
      render: () => (
        <p key="1" className="mb-1">
          Studio Additions:
        </p>
      ),
    }),
    new BingoInput({
      varsAndAliases: studioAliasList.map(([r, aliases]) => [
        `rooms.${r}`,
        aliases,
      ]),
      prompt: "enter name as in room directory",
    }),
    /*new TritSetterList({
      vars: studioAdditions,
      setAllRemainingTexts: ["set remaining: ", "", ""],
    }),*/
    new CustomQuizItem({
      render: () => (
        <p key="0" className="mb-1">
          Found Floorplans:
        </p>
      ),
    }),
    new BingoInput({
      varsAndAliases: roomAliasList.map(([r, aliases]) => [
        `rooms.${r}`,
        aliases,
      ]),
      prompt: "enter name as in room directory ",
    }),
  ],
});

const QroughDraft = new QuizItemWrapper({
  title: "Mount Holly Rough Draft",
  condition: ["blueDoors.Secret Passage", "rooms.Throne of the Blue Prince"],
  subitems: [
    new TritSetter({
      v: "locRoughDraft",
      labelRight: "entered the Mount Holly Rough Draft",
    }),
    new TritSetter({
      v: "roughDraftArt",
      condition: "locRoughDraft",
      labelRight: "got the message from the 45 art pairs",
    }),
    new TritSetter({
      v: "roughDraftMoraJai",
      condition: "locRoughDraft",
      labelRight: "opened the 45 Mora Jai boxes",
    }),
    new TritSetter({
      v: "roughDraftMoonDoor",
      condition: "locRoughDraft",
      labelRight: "opened the moon door in the Vestibule",
    }),
    new TritSetter({
      v: "roughDraft46",
      condition: "locRoughDraft",
      labelRight: "found a room behind the moon door",
    }),
    new TritSetter({
      v: "roughDraftGallery",
      condition: ["roughDraftMoonDoor", "roughDraft46", "roughDraftArt"],
      labelRight: "found Gallery solutions",
    }),
  ],
});

const Qlocs = new QuizItemWrapper({
  title: "Locations discovered",
  subitems: [
    new CustomQuizItem({
      render: () => (
        <p key="warning" className="mb-0">
          As shown on the bottom right of the screen.
        </p>
      ),
    }),
    new TritSetter({
      v: "locAntechamber",
      labelRight: "Antechamber",
    }),
    new TritSetter({
      v: "locUnderpass",
      labelRight: "The Underpass",
    }),
    new TritSetter({
      v: "locCatacombs",
      condition: "PA.West Path",
      labelRight: "Catacombs",
    }),
    new TritSetter({
      v: "locBasement",
      condition: "locAntechamber", // power hammer opening implies it already
      labelRight: "Basement",
    }),
    new TritSetter({
      v: "locPrecipice",
      // note: path via torch chamber has already been asked
      // so the only other way is to have all the valves turned
      condition: ["PA.Gem Cavern", "PA.Orchard", "PA.West Path"],
      labelRight: "The Precipice",
    }),
  ],
});

const Qaries = new QuizItemWrapper({
  title: "“Aries Court”",
  condition: "locPrecipice",
  subitems: [
    new TritSetter({
      v: "locAriesCourt",
      labelRight: "I encountered that phrase",
    }),
    /*
    new CustomQuizItem({
      render: () => (
        <p key="warning">
          ❕ The “Unknown” refers to a place with several Mora Jai boxes. If you
          have not found such a place, revert your answer.
        </p>
      ),
      condition: "locAriesCourt",
    }),*/
    new TritSetter({
      v: "itAriesKey",
      condition: "locAriesCourt",
      labelRight: "I have found an item there",
    }),
    new TritSetter({
      v: "itScepter",
      condition: "itAriesKey",
      labelRight: "I used Key of Aries",
    }),
  ],
});

const QItems = new QuizItemWrapper({
  title: "Items Found",
  subitems: [
    new TritSetter({
      v: "itCrown",
      labelRight: "Crown of the Blueprints",
    }),
    new TritSetter({
      v: "itPaperCrown",
      condition: "rooms.Closed Exhibit",
      labelRight: "Paper Crown",
    }),
    new TritSetter({
      // also implies chess puzzle!
      v: "itTorch",
      condition: (s) =>
        s["hasFire"] ||
        (!!s["PA.West Path"] && !!s["PA.Orchard"] && !!s["PA.Gem Cavern"]),
      labelRight: "Self-Igniting Torch",
    }),
  ],
});

const microchipAliases: [MicrochipLocation, string[]][] = [
  ["Blackbridge Grotto", []], // never entered by the user
  ["West Path", ["Bridge"]],
  ["Entrance Hall", ["Entrance"]],
];

const QMicrochips = new QuizItemWrapper({
  title: "Microchips found",
  condition: "PA.Blackbridge Grotto",
  subitems: [
    new BingoInput({
      varsAndAliases: microchipAliases.map(([k, a]) => [`microchip.${k}`, a]),
      prompt: "enter location it was found",
    }),
  ],
});

const blackbridgeKeysAliases: [BlackbridgeKey, string[]][] = [
  ["Personnel Access (BabbA)", ["BabbA"]],
  ["Admin Access (MoorR, ThomK)", ["MoorR", "ThomK"]],
  ["Archive Access (LeeB)", ["LeeB", "ProvC", "HounU"]],
  ["Archive Access (RibbJ, WithP)", ["RibbJ", "WithP"]],
];

const Qblackbridge = new QuizItemWrapper({
  title: "Blackbridge Grotto Terminal Access",
  condition: "PA.Blackbridge Grotto",
  subitems: [
    new BingoInput({
      varsAndAliases: blackbridgeKeysAliases.map(([k, a]) => [
        `blackbridgeKey.${k}`,
        a,
      ]),
      prompt: "enter access key(s)",
    }),
  ],
});

const Qmisc = new QuizItemWrapper({
  title: "Miscellaneous",
  subitems: [
    new TritSetter({
      v: "artPuzzle",
      labelRight: "obtained 44 letter message mentioned in Study",
    }),
    new TritSetter({
      v: "billiardPuzzle",
      labelRight: "I can solve the Billiard Room puzzles",
    }),
    new TritSetter({
      v: "chessPuzzle",
      condition: "locPrecipice",
      labelRight: "activated the chessboard in the Precipice",
    }),
    new TritSetter({
      v: "curseMode",
      condition: ["books.The Curse of Black Bridge", "R46"],
      labelRight: "unlocked curse mode",
    }),
    new TritSetter({
      v: "basementClutterPuzzle",
      condition: "locBasement",
      labelRight: "pressed a button in the basement",
    }),
  ],
});

function ProgressGauge() {
  const gaugeEnabled = useState_LocalStorageTrit("progressGauge");
  const done = Object.entries(StateLogicHandler.instance.overallState).filter(
    ([_, val]) => val === true
  ).length;
  const perc = (done / numStateVars) * 100;
  return (
    <>
      <TritSetterView v={gaugeEnabled} labelRight={"show progress meter"} />
      {gaugeEnabled.get() && (
        <div>
          <div className="progress">
            <div
              className="progress-bar"
              style={{ width: `${perc}%` }}
              role="progressbar"
              aria-valuenow={done}
              aria-valuemin={0}
              aria-valuemax={numStateVars}
            ></div>
          </div>
          <p className="mt-1" style={{ textAlign: "center" }}>
            {done} out of {numStateVars} tracked events achieved
          </p>
        </div>
      )}
    </>
  );
}

const Qdone = new QuizItemWrapper({
  title: "You have answered all questions!",
  showDespiteDone: true,
  subitems: [
    new CustomQuizItem({
      render: () => (
        <div key="allQ">
          <p key="checktodos">
            Check your Todos for inspiration on what to try next.
          </p>
          <ProgressGauge key="gauge" />
        </div>
      ),
    }),
  ],
});

/* for easier reordering, construct array from constants */
export const QuizItems: QuizItemWrapper[] = [
  Q46,
  Qtrophies,
  Qfloorplans,
  QPA,
  QblueDoors,
  QroughDraft,
  Qtools,
  QPHlocs,
  QfireLocs,
  QItems,
  QMicrochips,
  QSanctum,
  Qlocs,
  Qmisc,
  Qaries,
  QKeys,
  Qdocs,
  Qlocks,
  Qbooks,
  Qblackbridge,
  Qdone,
];

const SHOW_ALL_QUIZ_ITEMS = false;

export function isQuizDone(): boolean {
  return !QuizItems.some(
    (it) => (it.isReady() || it.isPinned()) && !it.isDone()
  );
}

export function getQuestionWith(v: StateVar): undefined | QuizItemWrapper {
  return QuizItems.find(
    (it) =>
      (it.isReady() || it.isPinned()) && it.variables().some((w) => w.is(v))
  );
}

export function QuizView() {
  // this is where the logic for deciding which quiz items to show should exist
  let filtered = QuizItems.filter(
    (it) =>
      (it.isReady() && !it.isDone()) || it.showDespiteDone || it.isPinned()
  );
  const first = filtered.findIndex((it) => !it.isDone());
  if (first >= 0) {
    filtered = filtered.filter((it, idx) => idx <= first || it.isPinned());
  }
  const items = (SHOW_ALL_QUIZ_ITEMS ? QuizItems : filtered).map((item) =>
    renderQuizItem(item)
  );
  if (first >= 0 && filtered.length - 1 > first) {
    items.push(
      <p key={"incompleteAnswerComplaint"} className="emph">
        To continue complete your answer to the question “
        {filtered[first].title}”.
      </p>
    );
  } else if (first >= 0) {
    // unanswered question is the current one
    items.push(
      <p
        key={"incompleteAnswerComplaint"}
        className="mb-5 mt-5 emph"
        style={{ opacity: 0.5 }}
      >
        (There will be further questions after this one.)
      </p>
    );
  }
  return items;

  // bottom should have button: jump to active question
}
