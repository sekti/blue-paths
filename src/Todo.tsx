import React from "react";
import { ArtPuzzleView } from "./ArtPuzzleView";
import {
  booksFromShop,
  booksFromStock,
  microchipLocations,
  powerHammerLocations,
  RealmIcon,
  Realms,
  sanctumDoors,
  sanctumKeys,
  sanctumSigils,
  studioAdditions,
  tools,
  trophies,
  type GlobalState,
  type PowerHammerLocation,
  type Realm,
  type Tool,
} from "./GlobalState";
import {
  askBit,
  askOptionIdx,
  say,
  confirm,
  type HintSequence,
  solved,
  show,
  link,
  askOption,
  askYesNo,
  confirmSol,
  confirmReveal,
  linkClasses,
} from "./HintSequence";
import { evaluate, type Condition } from "./Quiz";
import { ref } from "./StateLogic";

const VERYHIGH: number = 3;
const HIGH: number = 2;
const LOW: number = 0;
const MID: number = 1;
interface TodoProps {
  title: string;
  condition?: Condition;
  goal?: Condition;
  priority?: number;
  sequence: HintSequence;
}

export class Todo {
  title: string;
  priority: number;
  sequence: HintSequence;
  protected condition?: Condition;
  protected goal?: Condition;
  public constructor({
    title,
    sequence,
    condition,
    goal,
    priority,
  }: TodoProps) {
    this.title = title;
    this.sequence = sequence;
    this.condition = condition;
    this.goal = goal;
    this.priority = priority ?? MID;
  }
  isRelevant(): boolean {
    // condition fulfilled (if any) and goal not reached (if any)
    return (
      (!this.condition || evaluate(this.condition)) &&
      (!this.goal || !evaluate(this.goal))
    );
  }
}

function getFireSource(s: GlobalState) {
  if (s["tools.Burning Glass"] && s["itTorch"]) {
    return "Burning Glass or Self Igniting Torch";
  }
  return s["tools.Burning Glass"] ? "Burning Glass" : "Self Igniting Torch";
}

function blessingOfTheMonkHint() {
  say("What you need is mentioned in Drafting Strategy Vol 5.");
  confirm("Specific hint.");
  say("You need a Shrine Blessing (page 11).");
  confirm("Show relevant blessing.");
  say(
    "Blessing of the Monk. (“If you call it a day in a room on your estate, you will draw that room while drafting from the grounds the following day.”)"
  );
  confirm("Show donation amount.");
  say(
    "13 gold works. The only way to know is trial and error. See the following link for a full list."
  );
  link(
    "https://blue-prince.fandom.com/wiki/Shrine_Blessings",
    "→ Open Blue Prince Wiki Entry"
  );
}

function suggestOnlineRead(nameAndUrl: [string, string][]) {
  if (askBit(["", "view book transcripts"])) {
    say(
      "The following transcripts are found on the Blue Prince wiki at fandom.com."
    );
    show(
      <ul>
        {nameAndUrl.map(([name, url]) => (
          <li key={name}>
            <a href={url} target="_blank" className={linkClasses}>
              {name}
            </a>
          </li>
        ))}
      </ul>
    );
  }
}

export const Todos: Todo[] = [
  new Todo({
    goal: ["tools.Power Hammer", "hasFire"],
    title: "🔨 Craft",
    sequence: (s) => {
      say("Combine items in the workshop.");
      confirm();
      say(
        "Select random combinations on the workbench. They will show up as red or green depending on whether there is a recipe containing this combination of items."
      );
      confirmSol("Reveal important combinations.");
      if (!s["tools.Power Hammer"]) {
        say("Power Hammer: Sledgehammer + Battery Pack+ Broken Lever");
        solved("Mark Power Hammer as crafted", "tools.Power Hammer");
      }
      if (!s["hasFire"]) {
        say("Burning Glass: Magnifying Glass + Metal Detector");
        solved("Mark Burning Glass as crafted", "tools.Burning Glass");
      }
      say(
        "The rest of the contraptions can be useful but are not needed to progress in the story."
      );
    },
  }),
  new Todo({
    condition: ["tools.Power Hammer", "tools.Burning Glass", "R46"],
    priority: LOW,
    goal: "trophies.Trophy of Invention",
    title: "🏆 Craft it all",
    sequence: (s) => {
      if (tools.every((t) => s[t])) {
        say("You crafted all tools.");
        solved(
          "Mark Trophy of Invention as claimed.",
          "trophies.Trophy of Invention"
        );
        return;
      }
      say("Create all 8 workshop contraptions.");
      confirm();
      say(
        "Select random combinations on the workbench. As you probably noticed, they will show up as red or green depending on whether there is a recipe containing this combination of items."
      );
      if (s["books.Drafting Strategy Vol 4"]) {
        say("Also, take another look at Drafting Strategy Vol 4.");
      } else {
        say("Also, the bookshop has an affordable book that might help.");
        confirm("Reveal book.");
        say("Drafting Strategy Vol 4.");
      }
      confirmSol("Reveal missing combinations.");
      const Recipes: [Tool, string][] = [
        ["Burning Glass", "Magnifying Glass + Metal Detector"],
        ["Detector Shovel", "Shovel + Metal Detector"],
        ["Dowsing Rod", "Shovel + Compass"],
        ["Electromagnet", "Compass + Battery Pack"],
        ["Jack Hammer", "Shovel + Battery Pack+ Broken Lever"],
        ["Lucky Purse", "Coin Purse + Lucky Rabbit's Foot"],
        ["Pick Sound Amplifier", "Lockpick + Metal Detector"],
        ["Power Hammer", "Sledgehammer + Battery Pack+ Broken Lever"],
      ];
      Recipes.filter(([t, _]) => !s[`tools.${t}`]).forEach(([t, r]) => {
        say(`${t}: ${r}`);
        solved(`Mark ${t} as crafted.`, `tools.${t}`);
      });
    },
  }),
  new Todo({
    condition: [
      "tools.Power Hammer",
      "blackbridgeKey.Admin Access (MoorR, ThomK)",
    ],
    goal: "powerHammer.Weight Room",
    title: "💻 Read Email",
    sequence: () => {
      say(
        "In the Blackbridge Grotto, you presumably enabled email access at all other terminals. Did you read them?"
      );
      confirm();
      say("An email in Security stands out.");
      confirmReveal("Reveal relevant content.");
      say(
        "Kirk Darren suggests to conceal an Antechamber access lever in the Weight Room."
      );
      confirm();
      say("Such a lever is in fact hidden behind a brick wall.");
      confirmSol();
      say("Use the Power Hammer to break the weak wall in the Weight Room.");
      solved(
        "Mark the Weight Room as power-hammered",
        "powerHammer.Weight Room"
      );
    },
  }),
  new Todo({
    condition: "tools.Power Hammer",
    goal: [
      "powerHammer.Greenhouse",
      "powerHammer.Weight Room",
      "powerHammer.Secret Garden",
      "powerHammer.Sealed Entrance",
    ],
    title: "👁 Hammer time", // for basic locations
    sequence: (s) => {
      say("Keep an eye out for use cases for the Power Hammer.");
      if (!powerHammerLocations.some((loc) => s[loc])) {
        confirm("Show what to look for.");
        say("Brittle barriers such as weak walls.");
      }
      confirm("Show specific hints.");
      let options: [PowerHammerLocation, string][] = [
        ["Greenhouse", "A dead end room."],
        //["Weight Room", "A red room."],
        ["Secret Garden", "A large room."],
        ["Sealed Entrance", "Outside the mansion."],
      ];
      options = options.filter(([loc, _]) => !s[`powerHammer.${loc}`]);

      let choice: PowerHammerLocation | undefined = undefined;
      if (options.length == 1) {
        say("You are missing: " + options[0][1]);
        confirm("Show exact location.");
        choice = options[0][0];
      } else {
        say("Choose an option for exact location:");
        const idx = askOptionIdx(options.map(([_, d]) => d));
        if (idx !== undefined) choice = options[idx][0];
      }

      switch (choice) {
        case "Greenhouse":
          say("There is a weak wall in the Greenhouse.");
          solved(
            "Mark Greenhouse wall as power-hammered",
            "powerHammer.Greenhouse"
          );
          return;
        /*
        case "Weight Room":
          say("There is a weak wall in the Weight Room.");
          solved(
            "Mark Weight Room wall as power-hammered",
            "powerHammer.Weight Room"
          );
          return;*/
        case "Secret Garden":
          say("There is a weak wall in the Secret Garden.");
          solved(
            "Mark Secret Garden wall as power-hammered",
            "powerHammer.Secret Garden"
          );
          return;
        case "Sealed Entrance":
          say("There is a boarded up mine entrance on the grounds.");
          solved(
            "Mark Sealed Entrance as power-hammered",
            "powerHammer.Sealed Entrance"
          );
          return;
      }
    },
  }),

  new Todo({
    condition: ["tools.Power Hammer", "locSafehouse"],
    goal: "powerHammer.The Precipice",
    title: "👁 Safehouse sketch (crate)",
    sequence: () => {
      say("The note on the crate shows a sketch of a weak wall.");
      confirm();
      say("You have seen this wall before.");
      confirm();
      say("In the room with the chess puzzle.");
      confirmSol("Reveal what to do.");
      say("Use the power hammer to break the weak wall.");
      solved(
        "Mark the Precipice as power-hammered",
        "powerHammer.The Precipice"
      );
    },
  }),
  new Todo({
    condition: ["PA.Satellite Dish", "tools.Power Hammer"],
    goal: "powerHammer.Tunnel",
    title: "🏃‍♂️ a new experiment",
    sequence: () => {
      say(
        "With the Satellite Dish unlocked, you have access to new experiments. One experiment stands out."
      );
      confirm("Reveal special experiment.");
      say("“remove a crate from the tunnel”");
      confirm("Reveal what is next.");
      const crates = askBit(["", "I removed all crates"]);
      if (!crates) {
        say("Go do that. This might take a few days of experiments.");
        return;
      }
      const door = askBit([
        "",
        "I opened the regular door at the end of the tunnel.",
      ]);
      if (!door) {
        say("Go do that. A regular key is enough.");
        return;
      }
      const basementDoor = askBit(["", "I opened the basement door."]);
      if (!basementDoor) {
        say("Go do that using the Basement Key.");
        return;
      }
      const securityDoor = askBit(["", "I opened the security door."]);
      if (!securityDoor) {
        say("Go do that using the Keycard.");
        return;
      }
      const powerHammer = askBit(["", "I found a way to proceed."]);
      if (!powerHammer) {
        say("Look around. You're missing something obvious.");
        confirmSol("Reveal what to do.");
        say("There is a weak wall you can break.");
      }
      solved("Mark the Tunnel as power-hammered.", "powerHammer.Tunnel");
    },
  }),
  new Todo({
    condition: "hasFire",
    priority: LOW,
    goal: "fire.Tunnel (Torches)",
    title: "🔎 The Grounds",
    sequence: (s) => {
      say("There is something hidden outside the mansion (“The Grounds”).");
      confirm();
      say("It's quite dark in there.");
      confirm();
      say("You need a tool to light up the tunnel.");
      confirm("Show what to do.");
      say(
        `Use a source of fire (${getFireSource(
          s
        )}) to ignite the torches on the walls of the tunnel.`
      );
      solved("Mark the tunnel torches as lit.", "fire.Tunnel (Torches)");
    },
  }),
  new Todo({
    goal: booksFromShop,
    condition: "R46",
    title: "💰 Buy out the Bookshop",
    sequence: (s) => {
      say(
        "Buy and read every book in the Bookshop. Note that the Bookshop can only be drafted from the Library."
      );

      const nameAndUrl: [string, string][] = [
        [
          "The History of Orindia (1st ed.)",
          "https://blue-prince.fandom.com/wiki/The_History_of_Orindia_(1st_ed.)",
        ],
        ["A New Clue", "https://blue-prince.fandom.com/wiki/A_New_Clue"],
        [
          "The Curse of Black Bridge",
          "https://blue-prince.fandom.com/wiki/The_Curse_of_Black_Bridge",
        ],
        ["Realm & Rune", "https://blue-prince.fandom.com/wiki/Realm_%26_Rune"],
        [
          "Drafting Strategy Vol. 4",
          "https://blue-prince.fandom.com/wiki/Drafting_Strategy_Vol._4",
        ],
        [
          "Drafting Strategy Vol. 5",
          "https://blue-prince.fandom.com/wiki/Drafting_Strategy_Vol._5",
        ],
      ];

      booksFromShop
        .filter((b) => !s[b])
        .forEach((b) => solved(`Mark ${ref(b).displayName} as read.`, b));

      suggestOnlineRead(nameAndUrl);
    },
  }),
  new Todo({
    goal: booksFromStock,
    title: "📚 Read",
    sequence: (s) => {
      say(
        "Most library books contain useful information. Go read all of them."
      );
      booksFromStock
        .filter((b) => !s[b])
        .forEach((b) => solved(`Mark ${ref(b).displayName} as read.`, b));

      const nameAndUrl: [string, string][] = [
        [
          "A Sightseer's Guide to Reddington",
          "https://blue-prince.fandom.com/wiki/A_Sightseer%27s_Guide_to_Reddington",
        ],
        ["Swim Bird", "https://blue-prince.fandom.com/wiki/Swim_Bird"],
        [
          "The Fixed Stars",
          "https://blue-prince.fandom.com/wiki/The_Fixed_Stars",
        ],
        [
          "The History of Orindia (2nd ed.)",
          "https://blue-prince.fandom.com/wiki/The_History_of_Orindia_(2nd_ed.)",
        ],
        [
          "EPCW Pump System User Manual",
          "https://blue-prince.fandom.com/wiki/EPCW_Pump_System_User_Manual",
        ],
        [
          "Drafting Strategy Vol. 3",
          "https://blue-prince.fandom.com/wiki/Drafting_Strategy_Vol._3",
        ],
      ];
      suggestOnlineRead(nameAndUrl);
    },
  }),
  new Todo({
    condition: ["hasFire", "books.Drafting Strategy Vol 4"],
    goal: "litCandles",
    title: "👁 tool tips",
    sequence: (s) => {
      say("Didn't “Drafting Strategy Vol 4” mention something about candles?");
      confirm("Remind me.");
      say(
        `Keep an eye out for ruby socketed candlesticks and light using the ${getFireSource(
          s
        )}.`
      );
    },
  }),
  new Todo({
    condition: "litCandles",
    goal: "fire.Chapel 🐷",
    title: "🔎 Chapel",
    sequence: () => {
      say("You're missing something in the Chapel.");
      confirmSol("Reveal what to do.");
      say("There are ruby socketed candlesticks at the altar. Light them.");
      solved("Mark the chapel candles as lit.", "fire.Chapel 🐷");
    },
  }),
  new Todo({
    condition: ["litCandles", "powerHammer.Tunnel"],
    goal: "fire.Tunnel (Candles)",
    title: "🏃‍♂️ Advance in the Tunnel ",
    sequence: (s) => {
      say("You reported that you power-hammered the weak wall in the tunnel.");
      if (!s["locksFound.Rotating Gear"]) {
        say(
          "The red box behind it resembles a red box found in the Underpass. Come back when you have opened that one."
        );
        return;
      }
      const remoteBox = askBit([
        "",
        "I opened the red door with the remote power box.",
      ]);
      if (!remoteBox) {
        say(
          "Open it the same way you opened the red door in the underpass (power the high pressure condenser in the boiler room)."
        );
        return;
      }
      const candles = askBit(["", "I opened the passage with the candles."]);
      if (!candles) {
        say(`Light them using the ${getFireSource(s)}.`);
      }
      solved("Mark the Tunnel candles as lit.", "fire.Tunnel (Candles)");
    },
  }),
  new Todo({
    condition: "hasFire",
    goal: "fire.Freezer",
    title: "🔎 Freezer",
    sequence: (s) => {
      say(
        "The cooler labeled “Master Sinclair's personal freezer” sounds relevant."
      );
      confirm("How hint.");
      say("A tool related to fire might help.");
      confirmSol();
      say(`Use a source of fire (${getFireSource(s)}) to melt the ice.`);
      solved(
        "Mark the Freezer as a location where fire was used.",
        "fire.Freezer"
      );
    },
    // drafting strategy vol II explains the furnace / freezer interaction
    // Blue Tents Note: THE ICE IN MASTER SINCLAIR'S PERSONAL FREEZER CAN ONLY BE THAWED BY APPLYING A DIRECT HEAT SOURCE.
  }),
  new Todo({
    condition: (s) =>
      !!s["fire.Tomb"] ||
      (!!s["docs.Will of Herbert S Sinclair"] &&
        !!s["hasFire"] &&
        !!s["PA.West Path"]),
    goal: ["fire.Tomb", "docs.Her Ladyship's Diary"],
    title: "🏃‍♂️ Discover Her Ladyship's Secrets",
    sequence: (s) => {
      if (!s["fire.Tomb"]) {
        say("The will of Herbert Sinclair speaks of Clara Epsen's belongings.");
        confirm("Reveal relevant will contents.");
        say(
          "Clara Epsen's diary is kept in her room, the key is kept beside her grave."
        );
        confirm("Hint regarding the key.");
        say("Her grave is hidden in the tomb.");
        confirm();
        if (!s["litCandles"]) {
          say("It may be time to (re)read Drafting Strategy Vol 4.");
          confirm();
        }
        say("Maybe light a candle in her memory?");
        confirmSol("Reveal what to do.");
        say(
          "Light the ruby socketed candlesticks in the tomb to open a path to Lady Epsen's tomb."
        );
        solved("Mark the Tomb candles as lit.", "fire.Tomb");
        return;
      }
      say("Did you find the Diary Key?");
      const candles = askYesNo();
      if (!candles) {
        if (!s["docs.Will of Herbert S Sinclair"]) {
          say("Nevermind then. Come back later.");
        } else {
          say("You overlooked something.");
          confirm("Recall what I should know.");
          say(
            "Herbert's will mentions the location of the key to be Lady Epsen's grave."
          );
          confirm();
          say(
            "The grave is in the tomb. You previously lighted some ruby socketed candles there."
          );
          confirm();
          say(
            "Did you overlook the second pair of candles in the tomb? They lead to Lady Epsen's grave. The key can be found there."
          );
        }
        return;
      }
      say("Can you reliably draft Her Ladyship's Chambers?");
      const chambers = askYesNo();
      if (!chambers) {
        if (!s["rooms.Conservatory"]) {
          say("Come back when you have solved the Music Sheet puzzle.");
          return;
        }
        say("You may have missed a clue in the conservatory.");
        confirm("Reveal the clue.");
        say(
          "Her Ladyship's Chambers can only be drafted in the west wing from south-facing doors."
        );
        return;
      }
      say("Nothing prevents you from using the key on the diary.");
      solved("Mark Her Ladyship's Diary as read.", "docs.Her Ladyship's Diary");
    },
  }),
  new Todo({
    condition: ["PA.West Path", "hasFire"],
    goal: "fire.Trading Post (🧨)",
    title: "🔎 Trading Post",
    sequence: (s) => {
      say("This is a dare more so than a puzzle.");
      confirmSol("Reveal what to do.");
      say(`Light the dynamite stick with a fire source (${getFireSource(s)}).`);
      solved("Mark the dynamite as lit.", "fire.Trading Post (🧨)");
    },
  }),
  new Todo({
    condition: ["litCandles", "locCartSide"],
    goal: "fire.Abandoned Mine (Torch Chamber)",
    title: "🔎 Abandoned Mine",
    sequence: () => {
      say("There is more to do in the Abandoned Mine.");
      confirm("Reveal location.");
      say("Look around the torch chamber.");
      confirmSol("Reveal what to do.");
      say("Light the ruby socketed candlesticks in the torch chamber.");
      solved(
        "Mark the torch chamber candles as lit.",
        "fire.Abandoned Mine (Torch Chamber)"
      );
    },
  }),
  new Todo({
    condition: ["hasFire", "PA.Orchard", "books.A New Clue", "locSafehouse"],
    priority: HIGH,
    goal: "fire.Orchard (Sun Dial)",
    title: "📚 A New Clue: “Have you seen all the signs?”",
    sequence: (s) => {
      say("“A New Clue” contains several useful clues.");
      confirm("Suggest a good place to start.");
      say(
        "Consider the picture with the desk and the red stop sign in the background. A magnifying glass is needed to see all details."
      );
      confirm("Describe what can be seen.");
      // <p>Note: “Assume page count starts on title page.”</p>
      // <p>“covers” is linked to the colors.</p>
      // <p>“the way” is linked to the letter sequence.</p>
      // <p>Note: “Have you seen all the signs?</p>
      // <p>Letter sequence X → Y → Z → A → B → C.</p>
      say("Among other things, the following is visible:");
      show(
        <div>
          <table className="quotedText">
            <tbody>
              <tr>
                <td>red</td>
                <td>page A</td>
                <td>word X</td>
              </tr>
              <tr>
                <td>green</td>
                <td>page C</td>
                <td>word A</td>
              </tr>
              <tr>
                <td>violet</td>
                <td>page B</td>
                <td>word Y</td>
              </tr>
              <tr>
                <td>blue</td>
                <td>page Z</td>
                <td>word X</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
      say("Choose what you want a hint for.");
      const options = [
        "red/green/violet/blue",
        "X→Y→Z→A→B→C",
        "the combination",
      ];
      switch (askOptionIdx(options)) {
        case 0:
          say("A red line connects the word “covers” to the colors.");
          confirm();
          say(
            "A different page shows a stack of books with covers of those colors. The books are called “Tender Cipher”, “Lunar Renamed”, “Uncle Awe”, “Draft The Sixes”."
          );
          confirm();
          say(
            "A different page shows the detective anagramming “Draft the Sixes”."
          );
          confirm("Reveal meaning of colors.");
          show(
            <div>
              <p>The colors correspond to library books as follows.</p>
              <table>
                <tbody>
                  <tr>
                    <td>red</td>
                    <td>The Red Prince</td>
                  </tr>
                  <tr>
                    <td>green</td>
                    <td>Realm & Rune</td>
                  </tr>
                  <tr>
                    <td>violet</td>
                    <td>A New Clue</td>
                  </tr>
                  <tr>
                    <td>blue</td>
                    <td>The Fixed Stars</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
          return;
        case 1:
          say(
            "A red line connects the word “the way” to the sequence X→Y→Z→A→B→C."
          );
          confirm();
          say("Have you seen all the signs?");
          confirm("Reveal signs.");
          show(
            <div>
              <p>The road signs in the pictures are, in order:</p>
              <ul className="quotedText">
                <li>“Route 8”</li>
                <li>Depart</li>
                <li>keep left</li>
                <li>to Tanner Fork</li>
                <li>↱</li>
                <li>Dead End</li>
                <li>record</li>
                <li>each</li>
                <li>stop</li>
                <li>on the way</li>
              </ul>
            </div>
          );
          confirm();
          say("Did you notice the map on the desk?");
          confirm();
          say("Pay a visit to the Safehouse.");
          confirm("Reveal meaning of X→Y→Z→A→B→C.");
          show(
            <div>
              <p>
                The signs describe a route in the Orinda Aries metro. The stops
                along the way are numbered 8, 7, 3, 10, 1, 13. Therefore:
              </p>
              <ul>
                <li>X = 8</li>
                <li>Y = 7</li>
                <li>Z = 3</li>
                <li>A = 10</li>
                <li>B = 1</li>
                <li>C = 13</li>
              </ul>
            </div>
          );
          return;
        case 2:
          say("Continue only if you have exhausted the other two options.");
          confirmReveal("Continue.");
          show(
            <div>
              <p>Substituting the solutions, the table reads:</p>
              <table>
                <tbody>
                  <tr>
                    <td>The Red Prince</td>
                    <td>page 10</td>
                    <td>word 8</td>
                  </tr>
                  <tr>
                    <td>Realm & Rune</td>
                    <td>page 13</td>
                    <td>word 10</td>
                  </tr>
                  <tr>
                    <td>A New Clue</td>
                    <td>page 1</td>
                    <td>word 7</td>
                  </tr>
                  <tr>
                    <td>The Fixed Stars</td>
                    <td>page 3</td>
                    <td>word 8</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
          confirm("Next step.");
          say(
            "Clearly you need to look up a specific word in those four books. Keep in mind that “page count starts on title pages” (the page where the library card goes would be page 0)."
          );
          confirm("Reveal resulting words.");
          say("“turn scorched sundial base”");
          confirmSol("Reveal what to do.");
          say(
            `Go to the sundial in the orchard. Use a fire source (${getFireSource(
              s
            )}) on its footing. Turn the segments to align the additional dark line on each.`
          );
          solved(
            "Mark that you applied fire to the sundial.",
            "fire.Orchard (Sun Dial)"
          );
          return;
      }
    },
  }),
  new Todo({
    goal: "PA.Blackbridge Grotto",
    priority: HIGH,
    title: "🔎 Lab",
    sequence: () => {
      say("There is a machine with 10 levers in the lab.");
      confirm("How to power it?");
      say(
        "As the blue note says, the machine needs power from the boiler room. This is straightforward, though it might need some luck with drafting. The following hints concern what to do once power is available."
      );
      confirm();
      say("All the information you need is in the lab.");
      confirm();
      say("Look at the periodic table next to the machine.");
      confirm();
      say("It contains each numbers from 1 to 12 exactly once.");
      confirm();
      say(
        "By comparing with the regular periodic table, 1 corresponds to Plutonium (Pu), 2 corresponds to Silver (S)..."
      );
      confirmSol();
      say(
        "The numbers 1-12 give the sequence Pu S H Th Re Eu Pa F Te Rn I Ne. Hence, push up lever 9, then push up lever 3."
      );
      confirmReveal();
      say("Solving the puzzle unlocks the Blackbridge Grotto.");
      solved("Mark Blackbridge Grotto as unlocked", "PA.Blackbridge Grotto");
    },
  }),
  new Todo({
    goal: "docs.Baron Bafflers",
    condition: "R46", // not in the beginning of the game
    priority: LOW,
    title: "🔎 The Treasure Map",
    sequence: () => {
      say(
        "The treasure map can lead you to something more interesting than gold or gems."
      );
      confirm();
      say("👇 (← hint)");
      confirm();
      say("There is a “👇” in the Bedroom.");
      confirmSol();
      say(
        "If you draft the Bedroom in the location indicated on the Treasure Map, then digging will permanently unearth “Baron Bafflers”."
      );
      solved("Mark “Baron Bafflers” as found.", "docs.Baron Bafflers");
    },
  }),
  new Todo({
    goal: "bafflersPuzzle",
    condition: "docs.Baron Bafflers",
    priority: LOW,
    title: "🧩 Baron Bafflers",
    sequence: () => {
      say(
        "This puzzle is just for fun. And extremely hard. Solve it only if you enjoy it."
      );
      confirm();
      say(
        "The directions given on the puzzle are accurate. There is no trick. No in-game knowledge is required."
      );
      confirm();
      show(
        <div>
          <p>Here are the clues for reference.</p>
          <ol className="quotedText">
            <li>
              Kept behind locked doors.
              <br />
              ⬜⬜⬛⬛⬛⬜
            </li>
            <li>
              Can affect one greatly when made by someone with a strong spirit.
              <br />
              ⬜⬛⬛⬛⬜⬜⬜
            </li>
            <li>
              Makes the validity of a statement clear.
              <br />
              ⬛⬛⬛⬜⬜⬜
            </li>
            <li>
              On a certain scale, this is very hot.
              <br />
              ⬜⬜⬜⬛⬛⬛
            </li>
            <li>
              Informs you that there's no school today.
              <br />
              ⬜⬜⬜⬛⬛⬛
            </li>
            <li>
              A group composed of members that have similar characteristics.
              <br />
              ⬜⬜⬛⬛⬛⬛
            </li>
          </ol>
        </div>
      );
      say("Pick a number to get clues.");
      const i = askOptionIdx(["1", "2", "3", "4", "5", "6", "solution"]);
      if (i === undefined) {
        return;
      }
      switch (i + 1) {
        case 1:
          say("Long word: A person.");
          confirm();
          say("Short word: An object lying on the floor.");
          confirmSol();
          say("IN(MAT)E.");
          return;
        case 2:
          say("Long word: An alcoholic beverage.");
          confirm();
          say("Short word: Found in a gallery.");
          confirmSol();
          say("M(ART)INI.");
          return;
        case 3:
          say("Long word: A profession.");
          confirm();
          say("Short word: Marks invalidity.");
          confirmSol();
          say("(NOT)ARY.");
          return;
        case 4:
          say("Long word: A property of matter.");
          confirm();
          say("Short word: It's the highest number on a made-up scale.");
          confirmSol();
          say("MOL(TEN).");
          return;
        case 5:
          say("Long word: Possibly a piece of paper.");
          confirm();
          say("Short word: Weather-related.");
          confirmSol();
          say("NOT(ICE).");
          return;
        case 6:
          say("Small word: The members share certain beliefs.");
          confirm();
          say("Large word: A group of animals.");
          confirmSol();
          say("IN(SECT).");
          return;
        case 7:
          confirmSol("Reveal 6 letter solution.");
          say("MANTIS.");
          solved("Mark Baron Bafflers as solved.", "bafflersPuzzle");
          return;
      }
    },
  }),
  new Todo({
    goal: "PA.Gem Cavern",
    condition: "docs.Electronic Mail",
    title: "🧩 Utility Closet",
    sequence: () => {
      say("Surely, the “V.A.C. indicators” have a purpose.");
      confirm("Where to get information?");
      say("Check the mail room and the emails in the office.");
      confirmSol();
      say(
        "The required sequence is ⚫🔵🟢⚪🔴🟣. If you need help putting that in, check the following website."
      );
      link("https://blueprince.wiki.gg/wiki/Utility_Closet");
      confirm("Show effect.");
      say("Solving the puzzle unlocks the Gem Cavern.");
      solved("Mark Gem Cavern as unlocked", "PA.Gem Cavern");
    },
  }),
  new Todo({
    goal: "PA.West Path",
    priority: HIGH,
    title: "🧩 Unlock West Path",
    sequence: () => {
      say("There is a wooden gate west of the fountain.");
      confirm();
      say("It can only be unlocked from the other side.");
      confirm();
      say(
        "You need to exit the house from its west wing. Unfortunately, you cannot jump out of windows..."
      );
      confirm();
      say(
        "If the garage door were open, you could walk right out... You'll find more information in Drafting Strategy Vol. 3 in the library."
      );
      confirmSol();
      say(
        "Draft the garage (on the west wing). Power it using the utility closet or boiler room. Then walk outside and open the west path gate."
      );
      solved("Mark West Path as unlocked.", "PA.West Path");
    },
    // ! Drafting Strategy Volume 3 explains that Garage gives west path access and that the boiler room can power it
  }),
  new Todo({
    condition: ["allMicrochips", "fire.Orchard (Sun Dial)"],
    priority: VERYHIGH,
    goal: "PA.Satellite Dish",
    title: "🔑 Use the Sundial",
    sequence: () => {
      say("It seems you are missing something obvious.");
      confirmSol("Reveal what to do.");
      say(
        "Having scorched the sundial base, you can rotate its rings to unlock the top. Get the three microchips from the Blackbridge Grotto and put them in to unlock a permanent addition."
      );
      solved("Mark Satellite Dish as unlocked.", "PA.Satellite Dish");
    },
  }),
  new Todo({
    condition: "R46",
    goal: "PA.Blue Tents",
    title: "💰 Buy out the Gift Shop",
    sequence: (s) => {
      if (trophies.filter((t) => s[t]).length < 8) {
        say("Recall that you need 8 trophies to unlock the blue tents.");
      } else {
        say("400 gold is a lot, but it can be done.");
        solved("Mark Blue Tents as unlocked.", "PA.Blue Tents");
      }
    },
  }),
  new Todo({
    goal: (s) =>
      (!!s["locksFound.Shelter"] || !s["PA.West Path"]) &&
      !!s["locksFound.Boudoir"] &&
      !!s["locksFound.Study"] &&
      !!s["locksFound.Orchard"],
    title: "👁 Safes and Locked Gates",
    sequence: (s) => {
      say(
        "There are some easy to find locks that you didn't mark as discovered."
      );
      confirm("List them.");
      if (!s["locksFound.Boudoir"]) {
        solved("Mark Boudoir safe as discovered.", "locksFound.Boudoir");
      }
      if (!s["locksFound.Orchard"]) {
        solved("Mark Orchard gate as discovered.", "locksFound.Orchard");
      }
      if (!s["locksFound.Study"]) {
        solved("Mark Study safe as discovered.", "locksFound.Study");
      }
      if (!s["locksFound.Shelter"] && s["PA.West Path"]) {
        solved("Mark Shelter safe as discovered.", "locksFound.Shelter");
      }
    },
  }),
  new Todo({
    goal: "locksFound.Office",
    title: "🔎 Office",
    sequence: () => {
      say("Look around the office.");
      confirmSol();
      say("There is a switch in one of the drawers.");
      solved("Mark Office safe as discovered.", "locksFound.Office");
    },
  }),
  new Todo({
    goal: "locksFound.Drawing Room",
    title: "🔎 Drawing Room",
    sequence: () => {
      say("There is something to find in the Drawing Room.");
      confirm();
      say("Ignore the pictures on the wall for now.");
      confirm();
      say("Take a closer look at the portrait of the baron.");
      confirm();
      say("It's neither the baron nor the chair.");
      confirmSol();
      say("Pull on the left candelabrum as shown in the picture.");
      solved(
        "Mark Drawing Room safe as discovered.",
        "locksFound.Drawing Room"
      );
    },
  }),
  new Todo({
    // used drafting studio and not beginning of the game
    condition: (s) => studioAdditions.some((r) => s[r]) && !!s.R46,
    goal: "locksFound.Drafting Studio",
    title: "🔎 Drafting Studio",
    sequence: () => {
      say("You may have missed something in the drafting studio.");
      confirm();
      say("There is a paper model of a safe. It's so tiny though...");
      confirm();
      say("You can interact with it if you have a magnifying glass.");
      solved(
        "Mark Drafting Studio safe as discovered.",
        "locksFound.Drafting Studio"
      );
    },
  }),
  new Todo({
    condition: ["locUnderpass", "powerHammer.Sealed Entrance"],
    goal: "locksFound.Rotating Gear",
    priority: HIGH,
    title: "🔎 Underpass",
    sequence: () => {
      say("There is something to be discovered in the underpass.");
      confirm("What might that be?");
      say(
        "There is a red door connected to a red box. Now where else have you seen such a box?"
      );
      confirm();
      say(
        "There is a helpful diagram in the sealed entrance (connecting the basement to the grounds)."
      );
      confirmSol();
      say(
        "In the boiler room, power the high pressure condenser (the box downstairs that seems to do nothing). Then the remote power box (in the underpass) will allow you to open the red door."
      );
      confirm("What is next?");
      say(
        "Two upstairs alcoves become reachable via the rotating gears when raised."
      );
      solved(
        "Mark the combination lock in the rotating gear area as discovered.",
        "locksFound.Rotating Gear"
      );
    },
  }),
  new Todo({
    goal: "locksOpened.Office",
    condition: ["locksFound.Office", "artPuzzle"],
    title: "🧩 open the safe in the office",
    sequence: () => {
      say(
        "Have you seen the bust above the safe somewhere else in the estate?"
      );
      confirm();
      say("The bust can be found in the Foyer. It depicts Count Isaac Gates.");
      confirm();
      say("Recall the message you deciphered in the art puzzle.");
      confirm("Explicit hint.");
      say(
        "You need a date in format MM.DD. Get the day by “counting small Gates”."
      );
      confirmSol();
      say("The code is 0303.");
      say("Month = “March of the count” as per the note in the office.");
      say("Day = 3 = number of small Gates busts in the office.");
      solved("Mark Office safe as opened.", "locksOpened.Office");
    },
  }),
  new Todo({
    goal: "locksOpened.Shelter",
    condition: "locksFound.Shelter",
    title: "🧩 open the safe in the shelter",
    sequence: () => {
      say(
        "The terminal literally tells you how that safe can be opened. There is just one minor complication..."
      );
      confirm("Show complication.");
      say("What is the current date?");
      confirm("Show how to find out.");
      say(
        "Check the drafting studio, staff announcements, mail room, or check out a book in the library."
      );
      confirmSol();
      say(
        "Day 1 is November 7th. Calculate the current date from the current day and check an in-game clock for the time. Open the safe as per the provided instructions. This involves waiting up to 2 in-game hours (15 actual minutes)."
      );
      solved("Mark Shelter safe as opened.", "locksOpened.Shelter");
      // date: drafting studio, library, staff announcements
      // day 1: november 7
    },
  }),
  new Todo({
    goal: "locksOpened.Drawing Room",
    condition: ["locksFound.Drawing Room", "artPuzzle"],
    title: "🧩 open the safe in the drawing room",
    sequence: (s) => {
      say("Look around the room.");
      confirm();
      say("Reflect carefully on the message you deciphered in the art puzzle.");
      confirm();
      say(
        "A particular homophone in the message is easy to miss (especially if you're not a native speaker)."
      );
      if (s["books.A New Clue"]) {
        say("You should have seen it pointed out in a book by now.");
      } else {
        say("You can wait for the game to explicitly point it out later.");
      }
      confirm("Reveal relevant homophone.");
      say("“Gate” (point of entry) sounds like “gait” (way of walking).");
      confirm();
      say(
        "To crack the safe, you need to “count small gaits” to obtain a date."
      );
      confirm();
      say(
        "The safe code is a date in format MM-DD. There are two types of small gaits to count."
      );
      confirmSol();
      say(
        "There are 15 men and 4 women expressing “small gaits”. Both 1504 and 0415 work to open the safe."
      );
      solved("Mark Drawing Room safe as opened.", "locksOpened.Drawing Room");
    },
  }),
  new Todo({
    goal: "locksOpened.Drafting Studio",
    condition: "locksFound.Drafting Studio",
    title: "🧩 open the safe in the drafting studio",
    sequence: () => {
      say("That safe sure is really tiny.");
      confirm();
      say("You need a magnifying glass to interact with it.");
      confirm();
      say(
        "Recall the message you deciphered in the art puzzle. Everything else you need is in the room."
      );
      confirm();
      say("You need a date in format MM-DD. Oh, look: A calender!");
      confirm();
      say("Count small gates to get a day.");
      confirmSol();
      say(
        "There are 8 small gates in the picture. The month is November. Both 1108 and 0811 work to open the safe."
      );
      solved(
        "Mark the Drafting Studio safe as opened.",
        "locksOpened.Drafting Studio"
      );
    },
  }),
  new Todo({
    goal: "locksOpened.Boudoir",
    condition: ["locksFound.Boudoir", "artPuzzle"],
    title: "🧩 open the safe in the boudoir",
    sequence: () => {
      say("Look around the room.");
      confirm();
      say("As per the solution of the art puzzle, safes are cracked by dates.");
      confirmSol();
      say(
        "The picture hints at December 25th (Christmas Day). Both 2512 and 1225 work to open the safe."
      );
      solved("Mark the Boudoir safe as opened", "locksOpened.Boudoir");
    },
    // hint on postcard: merry christmas
  }),
  new Todo({
    goal: "locksOpened.Study",
    condition: ["locksFound.Study", "artPuzzle"],
    title: "🧩 open the safe in the Study",
    sequence: () => {
      say("Don't overthink it.");
      confirm();
      say(
        "The code is a date and it is related to the chess board in the Study."
      );
      confirm();
      say("The chess piece is standing in the square D8.");
      confirm();
      say("Which date is best represented by D8?");
      confirmSol();
      say("It's December 8th. The code is 1208.");
      solved("Mark the Study safe as opened.", "locksOpened.Study");
    },
  }),
  new Todo({
    goal: "locksOpened.Rotating Gear",
    condition: ["locksFound.Rotating Gear", "artPuzzle"],
    title: "🧩 open the gate above the rotating gear",
    sequence: () => {
      say("Take another look at the available symbols.");
      confirm();
      say(
        "There are only letters, except for the number 8 in the last position."
      );
      confirm();
      say("You should know by now that “dates crack safes”.");
      confirmSol();
      say(
        "The gate is unlocked by the only date that you can put in, which is MAY8."
      );
      solved(
        "Mark the gate at the rotating gears as opened and the Treasure Trove floor plan as discovered.",
        "locksOpened.Rotating Gear"
      );
    },
  }),
  new Todo({
    goal: "locksOpened.Orchard",
    condition: "locksFound.Orchard",
    title: "🔎 Darkroom",
    sequence: () => {
      say("There is something to be found.");
      confirm();
      say(
        "To restore the light, check the fuse box in the Utility Closet (after entering the Darkroom)."
      );
      confirm();
      say("Did you look *closely* at the photos?");
      confirm();
      say(
        "A magnifying glass reveals information that you need to open the orchard gate."
      );
      confirmSol();
      say(
        "There is a date in the heart (11-28) on the tree. The code for the orchard is 1128."
      );
      solved("Mark the orchard gate as opened.", "locksOpened.Orchard");
    },
    // hint on postcard: I'm stumped.
  }),
  new Todo({
    goal: studioAdditions,
    condition: "R46", // I only ask about these when R46 is reached
    priority: LOW, // people are going to do that anyway
    title: "🔑 Unlock floor plans in the Drafting Studio",
    sequence: (s) => {
      say(
        "The Drafting Studio is a rare floorplan that let's you unlock other floorplans."
      );
      confirm("List floor plans you are missing.");
      studioAdditions
        .filter((r) => !s[r])
        .forEach((r) => {
          solved(`Mark ${ref(r).displayName}`, r);
        });
    },
  }),
  new Todo({
    goal: "rooms.Planetarium",
    priority: LOW,
    condition: "R46", // I only ask about these when R46 is reached
    title: "📧 Receive Mail",
    sequence: () => {
      say(
        "There is a useful effect you can select for Laboratory experiments."
      );
      confirm("Reveal the effect in question.");
      say("Effect: “A letter will be delivered to the Mail Room”.");
      confirm("Reveal what can be learned.");
      say(
        "In his letters, Randolph Moore reveals solutions to several puzzles. In letter six he mentions a hidden floor plan that you are unlikely to find without his help."
      );
      confirmSol("Reveal floor plan and location.");
      say(
        "The Planetarium floor plan is found in the lens compartment of the telescope in the observatory."
      );
      solved("Mark Planetarium as found.", "rooms.Planetarium");
    },
  }),
  new Todo({
    goal: "rooms.Mechanarium",
    condition: "locUnderpass",
    priority: HIGH,
    title: "🔎 Rotating Gear",
    sequence: () => {
      say("Did you reach all eight alcoves?");
      confirmSol("Reveal what can be found.");
      say("The east alcove contains the Mechanarium floor plan.");
      solved("Mark the Mechanarium floor plan as found.", "rooms.Mechanarium");
    },
  }),
  new Todo({
    goal: "rooms.Throne Room",
    condition: microchipLocations,
    priority: VERYHIGH,
    title: "🔎 Black Bridge Grotto",
    sequence: () => {
      say("You have all three microchips, so...");
      confirm("Reveal the obvious.");
      say("Place all microchips in the pedestal in the Blackbridge Grotto.");
      confirm("Assume that's done.");
      solved("Mark the Throne Room floor plan as found.", "rooms.Throne Room");
    },
  }),
  new Todo({
    goal: "rooms.Throne of the Blue Prince",
    condition: [
      "itCrown",
      "curseMode",
      "itScepter",
      "docs.A note containing “steady, deadly, heavy, ready”",
    ],
    priority: VERYHIGH,
    title: "👑 Get Crowned",
    sequence: () => {
      say("You are ready to use the function of the Throne Room.");
      confirm();
      show(
        <div>
          <p>Recall the note:</p>
          <ul className="quotedText">
            <li>Steady is the Scepter</li>
            <li>Deadly is the Stone</li>
            <li>Heavy is the Crown</li>
            <li>Ready is the Throne</li>
          </ul>
        </div>
      );
      confirmSol();
      show(
        <div>
          <p>Enter the throne room with the following three items:</p>
          <ul>
            <li>the Royal Scepter, set to blue</li>
            <li>the Cursed Effigy</li>
            <li>the Crown of the Blueprints</li>
          </ul>
        </div>
      );
      confirm("Show effect.");
      say(
        "You will see a cutscene and the Throne Room floor plan will “ascend”."
      );
      solved(
        "Mark the Throne of the Blue Prince floor plan as found.",
        "rooms.Throne of the Blue Prince"
      );
    },
  }),
  new Todo({
    goal: "rooms.Conservatory",
    title: "👁 Music Sheets",
    sequence: () => {
      say(
        "There is a puzzle related to music sheets that are scattered throughout the estate."
      );
      confirm("Reveal locations.");
      show(
        <ul>
          <li>Pages 1-4 in the Music Room.</li>
          <li>Page 5 in the Greenhouse.</li>
          <li>Page 6-7 in the Ballroom.</li>
          <li>Page 8 in the Workshop.</li>
        </ul>
      );
      confirm("Reveal first step.");
      say("There is a bold word on each sheet. These words spell a message.");
      confirm("Reveal message.");
      say("The bold words read: “First words on the sheets are true message.”");
      confirm("Reveal true message.");
      say(
        "The first words read: “Find Among The White Trees Under Two Stones.”"
      );
      confirmSol("Reveal what to do.");
      say(
        "Go to the white trees at the Campsite. Bring a shovel and get digging."
      );
      solved("Mark Conservatory floor plan as found.", "rooms.Conservatory");
    },
  }),
  new Todo({
    goal: "rooms.Lost & Found",
    condition: ["locBasement", "rooms.Mechanarium"], // under pass for full map access
    title: "🔎 Underground Map",
    sequence: () => {
      say("There is something you missed.");
      confirm();
      say(
        "Take a close look at the underground map (found in an alcove of the rotating gears area)."
      );
      confirm();
      say("Closer.");
      confirmSol();
      say("The map shows the location of a buried floor plan.");
      solved(
        "Mark the “Lost & Found” floor plan as found.",
        "rooms.Lost & Found"
      );
    },
  }),
  new Todo({
    goal: "docs.Birth Certificate of Mary Epsen",
    condition: "locSafehouse", // player knows his pumping
    title: "👁 Get Pumping",
    sequence: () => {
      say("There is more to be revealed by using the pump room.");
      confirm();
      say(
        "There is an interesting effect for each of the six associated locations, but the following hints concern the Aquarium."
      );
      confirm("Show relevant water level.");
      say("Fully drain the Aquarium.");
      confirm("Reveal what there is to see.");
      say(
        "There is an X in front of the patio's grill and the second dryer in the Laundry Room. There is an arrow pointing at a filing cabinet in the Archives."
      );
      confirmSol("Reveal what to do.");
      say(
        "Dig in the Laundry Room and the Patio to get file cabinet keys. Use them in the Archives to find some lore."
      );
      solved(
        "Mark the Birth Certificate of Mary Epsen as found.",
        "docs.Birth Certificate of Mary Epsen"
      );
    },
  }),
  new Todo({
    goal: "blueDoors.Tunnel",
    condition: "fire.Tunnel (Candles)",
    priority: HIGH,
    title: "🏃‍♂️ Advance in the Tunnel  ",
    sequence: () => {
      say("There is nothing that prevents you from advancing in the tunnel.");
      confirm("Show obvious next steps.");
      say(
        "Get the three microchips from the Blackbridge Grotto to open the sealed door."
      );
      solved(
        "Mark the blue door in the Tunnel as discovered.",
        "blueDoors.Tunnel"
      );
    },
  }),
  new Todo({
    goal: "docs.The Blue Prince Manuscript",
    condition: [
      "rooms.Throne of the Blue Prince",
      "fire.Tunnel (Candles)",
      "blueDoors.Tunnel",
    ],
    priority: HIGH,
    title: "🏃‍♂️ Advance in the Tunnel   ",
    sequence: () => {
      say(
        "With your upgraded Throne Room, the blue door in the tunnel will open."
      );
      confirmReveal("Reveal what there is to find.");
      say("In the left box you will find a manuscript by your mother.");
      solved(
        "Mark the Blue Prince Manuscript as discovered.",
        "docs.The Blue Prince Manuscript"
      );
    },
  }),
  new Todo({
    goal: "docs.A New Clue Manuscript",
    condition: ["docs.Will of Herbert S Sinclair", "locCatacombs"],
    title: "🧩 Claim Herbert Sinclair's final gift",
    sequence: (s) => {
      say(
        "In his last will and testament, which is well worth reading carefully, Herbert S. Sinclair bequeaths one final gift to you that it seems you have not yet claimed."
      );
      confirm();
      say(
        "The passage in question is linked to a different passage of the same document."
      );
      confirm();
      say("This is about the natural order of the Adjeran Angels.");
      confirm();
      say(
        "You need to activate the angels in the order that Herbert uses in his will. There is just one complication..."
      );
      confirm("Reveal complication.");
      say("You may have trouble matching the Adjeran names to the statues.");
      const help = askBit(["show solution", "help with matching names"]);
      if (!help) {
        say("Activate the angels in this order:");
        show(
          <ul>
            <li>1. Crown + Scepter (Orinda) </li>
            <li>2. Riding Crop + Helmet (Lydia) </li>
            <li>3. Garden Hoe (Rynna) </li>
            <li>4. Chef's Hat + Peel (Joya) </li>
            <li>5. Pitchfork (Dauja) </li>
            <li>6. Top Hat + Feather Duster (Veia) </li>
            <li>7. Broom + Bonnet (Mila) </li>
            <li>8. Scythe (Draxus) </li>
          </ul>
        );
        confirm("Show what happens.");
        say("An alcove opens that contains the manuscripts in question.");
        solved(
          "Mark the manuscripts of “A New Clue” and “The Red Prince” as discovered.",
          "docs.A New Clue Manuscript"
        );
      } else {
        say("Select an angel to get a hint on its name.");
        switch (
          askOption([
            "Gardener",
            "Chef",
            "Farmer",
            "Chimney Sweep",
            "Maid",
            "Equestrian",
            "Queen",
            "Death",
          ])
        ) {
          case "Gardener": // "Gardener",
            say("Check the Orchard.");
            if (!s["PA.Orchard"]) {
              say("(It's high time you crack the gate to it...");
            }
            confirm("Show answer.");
            say("Rynna (Gardener's Logbook).");
            return;
          case "Chef":
            say("Check the Gift Shop.");
            confirm("Show answer.");
            say("Joya (Lunch Box).");
            return;
          case "Farmer":
            say("Check the Drafting Studio.");
            confirm("Show answer.");
            say("Dauja (Drafting Strategy Vol 1 + Magnifying Glass).");
            return;
          case "Chimney Sweep":
            say("Check Drafting Strategy Vol 5.");
            confirm("Show answer.");
            say("Veia.");
            // Observatory Blue Tents Note: THE LARGEST PLANET IN THE NIGHT SKY IS NAMED AFTER THE PARAGON OF ASH.
            return;
          case "Maid":
            say("Check the Maid's chamber.");
            confirm("Show answer.");
            say("Mila.");
            return;
          case "Equestrian":
            say("Check the Drafting Studio.");
            confirm("Show answer.");
            say("Lydia (Drafting Strategy Vol 1 + Magnifying Glass)..");
            return;
          case "Queen":
            say("Check History of Orindia (1st Ed.).");
            if (!s["books.The History of Orindia (1st ed)"]) {
              say("(It's high time you buy it from the bookshop...)");
            }
            confirm("Show answer.");
            say("Orinda.");
            return;
          case "Death":
            say("Check Drafting Strategy Vol 5 or the Fixed Stars.");
            confirm("Show answer.");
            say("Draxus.");
            return;
        }
      }
    },
    /*
      Orinda: History of Orindia (1st Ed.)
      Lydia: Drafting Strategy Vol 1
      Rynna: gardener's logbook
      Joya: Lunchbox/Gift Shop
      Dauja: Drafting Strategy Vol 1
      Veia: drafting strategy 5
      Mila: Maid's chamber.
      Draxus: Conservatory, drafting strategy 5
    */
  }),
  new Todo({
    goal: "docs.A note containing “steady, deadly, heavy, ready”",
    condition: [
      "docs.Her Ladyship's Diary",
      "R46",
      "books.Drafting Strategy Vol 5",
    ],
    title: "🧩 Her Ladyship's Clue",
    sequence: () => {
      say("Lady Epsen's diary contains a clue.");
      confirm("What page is this about?");
      say("The sketch on the last page.");
      confirm();
      say(
        "To act on this clue you need to understand what the sketch shows and apply an advanced drafting technique. Make your choice for further hints."
      );

      switch (
        askOption(["sketch content", "drafting technique", "what to do"])
      ) {
        case "sketch content":
          say("The river and bridge look like the West Path.");
          confirm();
          say(
            "The sketch of the outer room resembles an abstract drawing you have seen before."
          );
          confirm();
          say(
            "Normally, this drawing has a forth little square where the entrance now is. Also, one of the four little squares is usually red."
          );
          confirmSol();
          say("The sketch depicts the Antechamber in place of an outer room.");
          return;
        case "drafting technique":
          blessingOfTheMonkHint();
          return;
        case "what to do":
          say("Continue only if you have exhausted the other two options.");
          confirmReveal("Continue.");
          say(
            "Acquire the Blessing of the Monk in the Shrine (donate 13 gold). Call it a day in the Antechamber. On the next day draft the Antechamber as an outer room."
          );
          confirm("Next step.");
          say("Use the north lever and find a cryptic note.");
          solved(
            "Mark the Monk's Riddle as discovered.",
            "docs.A note containing “steady, deadly, heavy, ready”"
          );
          return;
      }
    },
    // drafting strategy vol 5 explains that blessing of the monk exists
  }),
  new Todo({
    goal: "docs.Security Camera Footage",
    condition: "locSafehouse",
    title: "👁 Safehouse sketch (table)",
    sequence: () => {
      say("The Safehouse has a note showing a stack of monitors.");
      confirm();
      say(
        "A similar note can be found in the Attic (take a sharp right after coming up the stairs)."
      );
      confirm();
      say(
        "Despite the note saying so, the puzzle does not involve you “deleting” anything."
      );
      confirm();
      say("You have seen these monitors before.");
      confirm("Reveal monitor location.");
      say("Security.");
      confirm();
      say(
        "Each monitor corresponds to a letter, giving you an 11-letter result (8 of which will seem familiar)."
      );
      confirm();
      say("The monitor that has an A on it in the sketch shows the Archives.");
      confirmSol();
      say(
        "Taking the first letters of the rooms that the monitors show in Security gives “SWANSONGHSS”."
      );
      confirmSol("Reveal what to do.");
      say(
        "Use “SWANSONGHSS” in place of the network password in security to get access to “Home Security Surveillance”."
      );
      solved(
        "Mark Security Camera Footage as discovered.",
        "docs.Security Camera Footage"
      );
    },
  }),
  new Todo({
    goal: "docs.A note explaining how 86455 relates to 18",
    condition: "powerHammer.Tunnel",
    title: "🔑 The miner's key",
    sequence: () => {
      say(
        "You have cleared the tunnel of crates, but have you noticed the key on the stone table? Where might it fit?"
      );
      confirm();
      say(
        "Given that it is a file cabinet, you are looking for a file cabinet."
      );
      confirm();
      say(
        "This key was left behind by a miner. Check the places where you have found the Foreman's logs."
      );
      confirmSol();
      say(
        "The key fits in the Foreman's office, reached via the south west alcove of the rotating gear."
      );
      solved(
        "Mark that you found the note on computing cores (86455 → 18).",
        "docs.A note explaining how 86455 relates to 18"
      );
    },
  }),
  new Todo({
    goal: "docs.A note with a 5 × 5 grid of words",
    condition: ["PA.Blue Tents"],
    title: "🏃‍♂️ Collect Blue Memos",
    sequence: (s) => {
      say(
        "Some Blue Tents Memos relate to a major puzzle. Collect as many as you can."
      );
      confirm("Am I ready for the major puzzle?");
      if (
        !s["trophies.Trophy 8"] ||
        !s["docs.A note explaining how 86455 relates to 18"]
      ) {
        say("No.");
        return;
      } else if (!s["rooms.Throne of the Blue Prince"]) {
        say("Yes, though you are missing a useful clue.");
        confirmReveal("Reveal starting point.");
      } else {
        say("Yes.");
        confirm("Reveal starting point.");
      }
      say("The puzzle regards the “Family Core”.");
      confirm();
      say("Start with the blue memos in the Mechanarium and the Wine Cellar.");
      confirmReveal("Reveal memo contents.");
      say(
        "Wine Cellar: “The numerals below the coat of arms are four different numbers, not one.”"
      );
      say(
        "Mechanarium: “On the coat of arms, the first number is one numeral. The rest are each two numerals.”"
      );
      confirm();
      if (s["rooms.Throne of the Blue Prince"]) {
        say("Consider the blue memo in the blue Throne Room.");
        confirmReveal("Reveal memo content.");
        say(
          "Throne of the Blue Prince: “The family core is kept in the family vault.”"
        );
        confirm();
      }
      say("Consider the blue memo in the vault.");
      confirmReveal("Reveal memo content.");
      say(
        "Vault: “The family core is unlocked only by the sum of its digits.”"
      );
      confirm();
      say("You need no further memos.");
      confirm();
      say("What do you need a hint for?");
      switch (askOptionIdx(["Step 1: Numerology", "Step 2: Unlocking"])) {
        case 0:
          say(
            "The Coat of Arms (in Wine Cellar and Master Bedroom) features the roman number MCCXIII."
          );
          confirm();
          say(
            "The number is really four numbers MCCXIII → M CC XI II → 1000 200 11 2."
          );
          say("Recall the note in the miner's file cabinet?");
          confirm();
          say(
            "Compute the numeric core of the sequence 1000 200 11 2. This should give a 2 digit number."
          );
          confirm("Reveal numeric core.");
          say("53, via the computation + 1000, / 200, * 11, - 2.");
          return;
        case 1:
          say("Continue only if you completed Step 1.");
          confirmReveal("Continue.");
          say("The family core is deposit box 53 in the vault.");
          confirm();
          say("You have previously unlocked something with 8.");
          confirm("Show what to do.");
          say(
            "Get Key 8 from the Gallery and unlock deposit box 53 in the vault."
          );
          solved(
            "Mark the family core as discovered (note with 5 × 5 words).",
            "docs.A note with a 5 × 5 grid of words"
          );
          return;
      }
      // relevant blue tents memos:
      // Wine Cellar: The Numerals Below The Coat Of Arms Are Four Different Numbers, Not One.
      // Mechanarium: On The Coat Of Arms, The First Number Is One Numeral. The Rest Are Each Two Numerals.
      // Vault:  	The Family Core Is Unlocked Only By The Sum Of Its Digits.
      // Throne Of The Blue Prince: The Family Core Is Kept In The Family Vault.
    },
  }),
  new Todo({
    goal: "docs.A hidden hue",
    condition: [
      "docs.A note with a 5 × 5 grid of words",
      "fire.Trading Post (🧨)",
    ],
    priority: HIGH,
    title: "🧩 Understand the 5 × 5 word grid",
    sequence: (s) => {
      say("The following regards the cryptogram you found in deposit box 53.");
      confirm("I want a hint.");
      say("Did you decipher the cryptogram?");
      if (!askYesNo()) {
        say(
          "There are no further clues to find. Given the 25 words (and knowledge you possess by now), you can solve this puzzle with the game closed."
        );
        confirm();
        say(
          "The fact that the words are arranged in a 5 × 5 grid is irrelevant. It may as well be a 25 word sequence."
        );
        confirm();
        say("The fact that every word has four letters is relevant.");
        confirm();
        say("PIGS → S and SAND → T.");
        say("The puzzle involves numeric cores again.");
        confirm();
        say("Think of a way to convert letters into numbers and vice versa.");
        confirm();
        say("PIGS → 16 9 7 19 → 19 → S.");
        confirm("Reveal what to do.");
        say(
          "For each word, convert it into a sequence of four numbers using the substitution A → 1, B → 2, C → 3, …. Then compute the numeric core of that sequence. Convert the result back into a letter using the substitution 1 → A, 2 → B, 3 → C, …."
        );
        confirmSol("Reveal 25 letter solution.");
        say("“still water tints blank books”.");
        return;
      }
      say("You do in fact need to apply still water to blank books.");
      confirm();
      say("For what step do you seek a hint?");
      switch (
        askOption(["still water", "blank books", "apply one to the other"])
      ) {
        case "still water":
          say("Still does not mean “quiet” nor “ongoing” in this context.");
          confirm();
          say("You may need a dictionary.");
          if (s["powerHammer.Greenhouse"]) {
            confirm();
            say("A book in the Greenhouse refers to a still.");
          }
          confirm();
          say("A still or distillery is an apparatus used to purify liquids.");
          confirm("Reveal still location.");
          say("The hidden room in the Trading Post contains a still.");
          return;
        case "blank books":
          say("This hint is not cryptic, nor are these books hidden.");
          confirm();
          say("They are with all the other books.");
          confirm("Reveal location of blank books.");
          say("The library prominently features two blank books.");
          return;
        case "apply one to the other":
          say("You cannot carry around water in your pocket.");
          confirm("Reveal required tool.");
          say(
            "A watering can will do the trick. Note that you need you empty it of regular water before you can fill it with “still water”."
          );
          confirmSol(
            "Reveal full solution (including “still water” and “blank books”)."
          );
          show(
            <ul>
              <li>Find a watering can.</li>
              <li>Deplete it.</li>
              <li>Refill it in the trading post still.</li>
              <li>Bring it to the library.</li>
              <li>Use it on the blank books.</li>
            </ul>
          );
          solved("Mark “A hidden hue” as discovered.", "docs.A hidden hue");
          return;
      }
    },
  }),
  new Todo({
    goal: "blackbridgeKey.Admin Access (MoorR, ThomK)",
    condition: "PA.Blackbridge Grotto",
    title: "🔎 Servant's Quarters",
    sequence: () => {
      say("You may have missed a note.");
      confirm("Reveal location.");
      say("There is a note in the bin.");
      confirm("Reveal relevance.");
      say(
        "The note concerns access to the terminal in the Blackbridge Grotto."
      );
      confirm();
      say("The Servant is called Hartley Ruota, meaning his key is “RuotH”.");
      confirm("...");
      say(
        "The key has been deactivated. But maybe you can now guess keys that work?"
      );
      confirmSol();
      say(
        "Anne Babbage (BabbA), Randolph Moore (MoorR) and Kimberly Thompson (ThomK) have access."
      );
      solved(
        "Mark Admin Access as achieved.",
        "blackbridgeKey.Admin Access (MoorR, ThomK)"
      );
    },
  }),
  new Todo({
    goal: "blackbridgeKey.Archive Access (RibbJ, WithP)",
    priority: LOW,
    condition: "blackbridgeKey.Admin Access (MoorR, ThomK)",
    title: "💻 More Keys for the Blackbridge Terminal",
    sequence: (s) => {
      if (!s["blackbridgeKey.Archive Access (LeeB)"]) {
        say("The user data base mentions three delisted admin keys...");
      } else {
        say("You're not quite done.");
      }
      confirm();
      say("This is mostly a matter of brute forcing every name you can find.");
      confirm("Narrow the search.");
      say("It's a pseudonym. And no, not Kirk Darren.");
      confirm();
      say("Check the Vault.");
      confirmSol("Reveal Key.");
      say("Jean Ribbon (RibbJ) works (one of Mary's Pseudonyms).");
      solved(
        "Mark this key as discovered.",
        "blackbridgeKey.Archive Access (RibbJ, WithP)"
      );
    },
  }),
  new Todo({
    goal: "blackbridgeKey.Archive Access (LeeB)",
    priority: LOW,
    condition: [
      "books.A New Clue",
      "blackbridgeKey.Admin Access (MoorR, ThomK)",
    ],
    title: "📚 A New Clue: The Suspect",
    sequence: () => {
      say("“A New Clue” contains several useful clues.");
      confirm("Suggest a good place to start.");
      say("Consider the picture on the last page, mentioning a suspect.");
      confirm();
      say("There are two steps (though the first can be partly skipped).");
      if (
        askOptionIdx(["who is the suspect", "what to do with the suspect"]) == 0
      ) {
        say(
          "Did you find the suspects on page 5 (near the corners cases)? You need a magnifying glass."
        );
        confirm("Reveal suspect list.");
        show(
          <ul className="quotedText">
            <li>Rose Bali, age 50</li>
            <li>Richard Scott, age 12</li>
            <li>Frond Mayford, age 32</li>
            <li>Sandra Dillon, age 14</li>
            <li>Bo Lee, age 16</li>
            <li>Charles Riscal, age 12</li>
            <li>Christoph Clark, age 25</li>
          </ul>
        );
        confirm("Help narrow it down.");
        say(
          "As blue memos are reliable, you know that the suspect is minor (as in under the age of 18), narrowing the list to:"
        );
        show(
          <ul className="quotedText">
            <li>Richard Scott, age 12</li>
            <li>Sandra Dillon, age 14</li>
            <li>Bo Lee, age 16</li>
            <li>Charles Riscal, age 12</li>
          </ul>
        );
        confirm();
        say(
          "In case you already know some Erajan, there is more you can deduce (optional)."
        );
        confirm("Reveal the suspect.");
        say(
          "The memo claiming that “the suspect is major” is true. “Major” in Erajan means “small name”. The suspect is Bo Lee."
        );
      } else {
        say("Consider the note that “The suspect is A.Key.”");
        confirm();
        say("The sketch above this text should be familiar.");
        confirm();
        say("The sketch is related to the Blackbridge Protocol.");
        confirm();
        say(
          "The user data base in the Blackbridge terminal mentions delisted admin keys."
        );
        confirm();
        say(
          "In a log, MoorR speaks of an admin key not fitting the length formatting."
        );
        confirmReveal("Continue only if you have seen the “suspect list”.");
        say("Bo Lee has less than four letters in their last name.");
        confirmSol("Reveal what to do.");
        say(
          "Using the key “LeeB” to access the Blackbridge Terminal grants access to additional logs."
        );
        solved(
          "Mark this key as discovered.",
          "blackbridgeKey.Archive Access (LeeB)"
        );
      }
    },
  }),
  new Todo({
    goal: (s) =>
      sanctumDoors.filter((v) => s[v]).length >=
      sanctumKeys.filter((v) => s[v]).length,
    priority: VERYHIGH,
    title: "🔑 Open a door in the Sanctum",
    sequence: () => {
      say(
        "You have marked more sanctum keys as found than you have marked sanctum doors as opened."
      );
    },
  }),
  new Todo({
    goal: "trophies.Full House Trophy",
    condition: "R46",
    priority: LOW,
    title: "🏆 Draft a Full House",
    sequence: () => {
      say("Good luck!");
      solved(
        "Mark the Full House Trophy as achieved.",
        "trophies.Full House Trophy"
      );
    },
  }),
  new Todo({
    goal: "trophies.Trophy of Sigils",
    condition: sanctumSigils,
    priority: VERYHIGH,
    title: "🏆 Claim the Trophy of Sigils",
    sequence: () => {
      say(
        "You should have found it in the Sanctum after solving the last sigil."
      );
      solved(
        "Mark the Trophy of Sigils as achieved.",
        "trophies.Trophy of Sigils"
      );
    },
  }),
  new Todo({
    goal: "trophies.Trophy of Drafting",
    condition: ["R46", "books.Drafting Strategy Vol 5"],
    // require R46 because I only reveal trophies then
    title: "🏆 Win the Sweepstakes",
    sequence: () => {
      say("Do you recall what the sweepstakes is about?");
      if (askYesNo()) {
        say("Then good luck!");
        solved(
          "Mark the Trophy of Drafting as achieved.",
          "trophies.Trophy of Drafting"
        );
      } else {
        say("Re-read Drafting Strategy Vol 5.");
        confirm("Just tell me.");
        say(
          "Draft 20 or more dead end rooms in a single day. Collect your trophy in the mail room. Good luck!"
        );
      }
    },
  }),
  new Todo({
    goal: "trophies.Trophy 8",
    condition: ["R46", "PA.West Path"], // I want the schoolhouse to be discovered and trophies to be revealed
    title: "🧩 The Gallery",
    sequence: () => {
      say("Have you encountered the Gallery?");
      if (!askYesNo()) {
        say("Nevermind.");
        return;
      }
      say("Have you solved its puzzles?");
      if (!askYesNo()) {
        confirm("Show minor hint.");
        say(
          "You need to guess the title of each of the pictures from their contents. No information from outside the room is required."
        );
        confirm("Next minor hint.");
        say(
          "Not all letters are available in all positions. Use that to your advantage."
        );
        confirm("Next minor hint.");
        show(
          <p>
            These puzzles are rebuses. For instance “🍎π” would be “apple pie”
            and “
            <span
              style={{ transform: "scale(-1, 1)", display: "inline-block" }}
            >
              2
            </span>{" "}
            bay 6” would be “back to the basics”.
          </p>
        );
        confirm("Show hints for specific paintings.");
        say(
          "Choose the number of letters in the title of the painting you need help with."
        );
        say("(Recommendation: Increasing order of length.)");
        switch (askOption(["5", "6", "7", "8"])) {
          case "5":
            say("Focus on “𝐓𝐇𝐈𝐂K”, ignore the rest.");
            confirm();
            say("The K is not thick.");
            confirm();
            say("The K is thin.");
            confirm();
            say("THIN is the K.");
            confirmSol();
            say("THINK");
            return;
          case "6":
            say("The items in the carts have something in common.");
            confirm();
            say("The left half of the picture represents a three letter word.");
            confirm();
            say(
              "The left half means “red”. The solution is constructed from the right half."
            );
            confirm();
            say("The right cart is a mirror image of the left cart.");
            confirm();
            say("There is a P on top of the mirror image of “red”.");
            confirmSol();
            say("PONDER");
            return;
          case "7":
            say("This rebus contains two sub-rebuses.");
            confirm();
            say("What do you want a hint for?");
            switch (askOptionIdx(["“genu”", "“veri”", "final solution"])) {
              case 0:
                say("Is that wine?");
                confirmSol("Reveal sub-rebus solution.");
                say("It's “genu”-wine, so “GENUINE”.");
                return;
              case 1:
                say("The “veri” is on stilts of some kinds.");
                confirm();
                say("It's a table.");
                confirmSol("Reveal sub-rebus solution.");
                say("It's a “veri”-table, so “VERITABLE”.");
                return;
              case 2:
                say("Yes, those are eyes...");
                confirm();
                say("... that's not how it's spelled though.");
                confirm();
                say(
                  "The word is of the form ????ISE. The words “actual”, “objective” and the sub-rebus solutions tell you what the first part is."
                );
                confirmSol();
                say("REALIZE (or REALISE).");
            }
            return;
          case "8":
            say(
              "This one makes sense in retrospect, but is much less clear than the other rebuses. Fortunately you may have picked up on a theme the other solutions have in common. Don't be ashamed to guess."
            );
            confirm();
            say(
              "It's probably best if you pretend that the skin, pins, fin, bins, sins and plinths are not there..."
            );
            confirm();
            say("... at best these help with two letters of the solution.");
            confirm();
            say(
              "What's left is the walls, the floor, the door and the infinity symbol."
            );
            confirm();
            say("Actually, that thing is much less than infinity.");
            confirm();
            say("What's walls, a floor and a door taken together?");
            confirmSol("Reveal solution components.");
            say("That's a ROOM and an EIGHT connected by IN.");
            confirmSol();
            say("RUMINATE");
            return;
        }
      }
      say("Did you unlock something with Key 8?");
      if (!askYesNo()) {
        say(
          "There is no harm in trying this key on any locked door you come across."
        );
        confirm();
        say(
          "Much like the secret garden can only appear on the wings, Room 8 can only appear in certain parts of the manor."
        );
        confirmSol();
        say("Room 8 can only appear on rank 8. Use the key accordingly.");
        return;
      }
      say("Did you solve the puzzle in Room 8?");
      if (!askYesNo()) {
        say("Select an animal to reveal the meaning of it's clue.");
        switch (
          askOption([
            "Penguin",
            "Lion",
            "Swan",
            "Dog",
            "Elephant",
            "Rabbit",
            "Bear",
            "Monkey",
          ])
        ) {
          case "Penguin":
            say("Goes to the bin with 8 letters.");
            confirmSol("Reveal bin.");
            say("GLUTTONY.");
            return;
          case "Lion":
            say("Goes to ENVY, GLUTTONY or MUNDANITY.");
            confirmSol("Reveal bin.");
            say("ENVY.");
            return;
          case "Swan":
            say("Goes on the left, i.e. to HUBRIS, ENVY or LUST.");
            confirmSol("Reveal bin.");
            say("LUST.");
            return;
          case "Dog":
            say("Goes to the left-most or right-most bin.");
            confirmSol("Reveal bin.");
            say("MUNDANITY.");
            return;
          case "Elephant":
            say("Goes next to MUNDANITY or GLUTTONY.");
            confirmSol("Reveal bin.");
            say("WRATH.");
            return;
          case "Rabbit":
            say(
              "The correct bin and one of its neighbors contain the same letter twice."
            );
            confirmSol("Reveal bin.");
            say("AVARICE.");
            return;
          case "Bear":
            say("Goes to a bin associated with relaxing.");
            confirmSol("Reveal bin.");
            say("SLOTH.");
            return;
          case "Monkey":
            say("Goes into HUBRIS.");
            return;
        }
        return;
      }
      say("Congratulations then.");
      solved("Mark Trophy 8 as claimed.", "trophies.Trophy 8");
      return;
    },
    // full will of herbert sinclair: first letters of the solutions
  }),
  new Todo({
    goal: "trophies.Trophy of Wealth",
    condition: "R46",
    title: "🏆 Buy out the Show Room",
    sequence: () => {
      say("Good fortune.");
      solved(
        "Mark the Trophy of Wealth as achieved.",
        "trophies.Trophy of Wealth"
      );
    },
  }),
  new Todo({
    goal: "trophies.Diploma Trophy",
    condition: ["R46", "rooms.Classroom", "PA.West Path"],
    title: "🏆 Earn the Diploma Trophy",
    priority: LOW,
    sequence: () => {
      say("The in-game description says to “Ace the Classroom Final Exam.”");
      confirm("Reveal final exam location.");
      say("It's held in the 9th classroom.");
      confirm("Help with questions.");
      say(
        "The answers to most questions can be inferred from material in the 8 classrooms leading up to the exam or from library books. The difficult questions are mostly knowledge questions rather than puzzles and if you have trouble getting the necessary score it is probably best to just come back later with additional information. If you must, you can find all solutions here:"
      );
      link(
        "https://blue-prince.fandom.com/wiki/Final_Exam",
        "→ Open Blue Prince Wiki Entry"
      );
      solved("Mark the Diploma Trophy as achieved.", "trophies.Diploma Trophy");
    },
    // drafting strategy vol II explains that you need 9 classrooms
  }),
  new Todo({
    goal: "trophies.Bullseye Trophy",
    condition: "R46",
    priority: LOW,
    title: "🏆 Work on the Bullseye Trophy",
    sequence: () => {
      say("This requires solving 40 dartboard puzzles. You can do it!");
      solved(
        "Mark the Bullseye Trophy as achieve.",
        "trophies.Bullseye Trophy"
      );
    },
  }),
  new Todo({
    goal: "trophies.A Logical Trophy",
    condition: "R46",
    priority: LOW,
    title: "🏆 Work on the Logical Trophy",
    sequence: () => {
      say("This requires winning 40 Parlor games. You can do it!");
      solved(
        "Mark the Logical Trophy as achieve.",
        "trophies.A Logical Trophy"
      );
    },
  }),
  new Todo({
    goal: "blueDoors.Secret Passage",
    condition: "docs.A hidden hue",
    priority: HIGH,
    title: "📚 Lady Auravei's final counsel",
    sequence: (s) => {
      say("Follow the clues given in the “blank” books.");
      confirm();
      say(
        "The only thing you need for now is: “The waters of the west spring shall yet reveal more secrets than these mere passages.”"
      );
      confirm();
      say("Note the emphasis on “west spring”, “secret” and “passage”.");
      confirm();
      if (!s["docs.A note containing “steady, deadly, heavy, ready”"]) {
        say("You need an advanced drafting technique to continue.");
        confirm("Show hints regarding this technique.");
        blessingOfTheMonkHint();
      } else {
        say(
          "This calls for an advanced drafting technique you have used before."
        );
        confirm("Reveal technique.");
        say(
          "You need the Blessing of the Monk for this (Shrine, 13, 29, 45, 61 or 77 gold)."
        );
      }
      confirm();
      say(
        "Using the Blessing of the Monk, draft the Secret Passage as an outer room."
      );
      confirm();
      say("Find what is different in this version of the Secret Passage.");
      confirm();
      say("Is that a Blank Book?");
      confirmSol();
      say(
        "Apply still water to the blank book that appears in the secret passage only if drafted as an outer room. This requires that you store the Watering Can containing still water in the Coat Check. The book turns blue (permanently) and pulling it reveals a blue door."
      );
      solved(
        "Mark the blue door in the Secret Passage as discovered.",
        "blueDoors.Secret Passage"
      );
    },
  }),
  new Todo({
    goal: "R46",
    condition: ["locAntechamber", "locUnderpass"],
    priority: VERYHIGH,
    title: "🏃‍♂️ Reach rank 10",
    sequence: () => {
      say("You know what to do, right?");
      confirmSol();
      say(
        "Pull the north lever in the underpass and then enter the Antechamber in the same run."
      );
      confirmReveal("Reveal what is on rank 10.");
      say("Room 46.");
      solved("Mark Room 46 as reached.", "R46");
    },
  }),
  new Todo({
    goal: "itCrown",
    condition: "R46",
    priority: VERYHIGH,
    title: "🏃‍♂️ Reach Room 46 (again)",
    sequence: () => {
      say("Two time's the charm.");
      confirmReveal("Reveal why this is relevant.");
      say(
        "The cutscene will only play the first time you reach Room 46. The second time you are free to explore Room 46 yourself, finding, among other things, a crown."
      );
      solved("Mark the Crown of the Blueprints as found.", "itCrown");
    },
  }),
  new Todo({
    goal: "itAriesKey",
    condition: "locAriesCourt",
    priority: HIGH,
    title: "🧩 Solve the Puzzle in the “Unknown”",
    sequence: (s) => {
      say("This place looks important.");
      confirm();
      say("Did you open the Mora Jai boxes?");
      if (!askYesNo()) {
        say("Come back when you have.");
        return;
      }
      say("Have you made any other progress?");
      if (!askYesNo()) {
        show(
          <div>
            <p>
              Recall the poem contained in the Mora Jai boxes (numbers for later
              reference):
            </p>
            <p className="quotedText">
              (1) in aries court where the king now lays
              <br />
              (2) on the sacred hour that timeworn phrase
              <br />
              (3) will a youth approach with empty arms
              <br />
              (4) without gifts nor gold nor mannered charms
              <br />
              (5) and in sky above a brilliant sign
              <br />
              (6) a sullen cross as five stars align
              <br />
              (7) a patient figure a reckoning great
              <br />
              (8) the black key is lying with the last king of eight
            </p>
          </div>
        );
        say("Choose what you want a hint for.");
        switch (
          askOption([
            "line 1",
            "line 2",
            "lines 3-4",
            "lines 5-6",
            "lines 7-8",
            "all of it",
          ])
        ) {
          case "line 1":
            say(
              "This just tells you that you are standing in Aries Court, a place where a king has been buried."
            );
            return;
          case "line 2":
            say("The “sacred hour” refers to a time of day.");
            confirm();
            if (s["docs.Will of Herbert S Sinclair"]) {
              say(
                "The phrase is explicitly mentioned in Herbert Sinclair's will."
              );
              confirm();
            } else {
              say("Some clocks have stopped at suspiciously identical times.");
            }
            if (s["sanctumKeys.3"]) {
              say("The time was significant for finding a Sanctum Key.");
              confirm();
            }
            say("It is shown in the Gift Shop.");
            confirm("Reveal meaning.");
            say("The sacred hour is 1:30pm to 2:30pm.");
            return;
          case "lines 3-4":
            say("The youth should be empty handed.");
            confirm("Reveal meaning.");
            say(
              "You are the youth. The puzzle involves you not having any gold, keys, gems, dice or other items on you."
            );
            return;
          case "lines 5-6":
            say(
              "This sounds like astronomy. Maybe take a look at “The Fixed Stars” in the observatory?"
            );
            confirm("Reveal meaning.");
            say(
              "The puzzle involves the Southern Cross constellation being activated."
            );
            confirm("Reveal required number of stars.");
            say(
              "The Southern cross can be observed if the star count is 5, 9, 13, 16, 25, 29, 32, 33, 36, 40, 45, 46 or 49. Recall that drafting the observatory gives +1 star."
            );
            return;
          case "lines 7-8":
            say("You can safely ignore these lines for solving this puzzle.");
            return;
          case "all of it":
            say("Continue only after exhausting the other hints.");
            confirmSol();
            say(
              "Be in Aries Court (i.e. “The Unknown”) at 1:30 without any coins, gems, keys, dice or other items. Activate the Southern Cross in the observatory before. The sarcophagus will rise."
            );
            say(
              "(This qualifies as “progress” regarding the question you answered above.)"
            );
            return;
        }
      }
      say("Did you manage to activate the clock?");
      if (!askYesNo()) {
        if (!s["powerHammer.The Precipice"]) {
          say(
            "You do not have sufficient information to solve this yet. Come back later."
          );
          return;
        }
        say("This part is particularly tricky.");
        confirm();
        say("The left side of the sarcophagus contains a grid of squares.");
        confirm("Reveal what this refers to.");
        say(
          "You need the completed 6 × 3 letter grid (see corresponding Todo). If you do not have it yet, consider coming back later."
        );
        confirm("Reveal completed 6 × 3 letter grid.");
        show(
          <div className="quotedText">
            <p>
              CIX
              <br />
              ADD
              <br />
              SIX
              <br />
              TOR
              <br />
              LOR
              <br />
              ETT
            </p>
          </div>
        );
        confirm("Show hint on what to do with it.");
        say("These are instructions on how to use the clock.");
        confirm("Next step.");
        say(
          "The three instructions are “CIX”, “ADD SIX” and “TOR LOR ETT”. Choose an option for further hints."
        );
        switch (askOption(["step 1", "step 2", "step 3", "all of it"])) {
          case "step 1":
            say("This is a roman number.");
            confirm("Reveal Step 1.");
            say("Turn the clock to 1:09.");
            return;
          case "step 2":
            say("Add 6 minutes to the time from the previous step.");
            return;
          case "step 3":
            say("This is Erajan.");
            confirm();
            say(
              "The meaning of “LOR” and “ETT” can be inferred from classroom 8. For “TOR” check classroom 4 or the description of the Rotunda in the house directory."
            );
            confirm("Reveal meaning of Erajan words.");
            say("“TOR” is the opposite of “ROT” and “ROT” means clock-wise.");
            say("“LOR” means word.");
            say("“ETT” means east.");
            confirm("Reveal Step 3.");
            say("Rotate the minute hand counter-clockwise to be on EAST.");
            return;
          case "all of it":
            say("Are you sure?");
            confirmSol();
            say(
              "Set the clock to 1:09. Press the red button. Set the clock forward to 1:15. Press the red button. Set the clock backward to 12:26. Press the red button. This activates the clock."
            );
            return;
        }
        return;
      }
      say("Congratulations!");
      solved("Mark the Aries Key as discovered.", "itAriesKey");
    },
    // post card: It's about time you visit mount holly.
    // full will of herbert sinclair: cuckoo “clocks eternally set on the sacred hour”
  }),
  new Todo({
    goal: "itAriesKey", // seemingly two independent puzzles
    condition: ["powerHammer.The Precipice"],
    title: "👁 Castle Letter Grid",
    sequence: (s) => {
      say(
        "Breaking the weak wall in the precipice revealed the word “CASTLE”. But it looks like additional letters are supposed to go to the right of it."
      );
      confirm("Show minor hint.");
      say(
        "The missing letters are scattered throughout the estate. Keep an eye out for them, you will need them at some point."
      );
      confirm("Reveal all locations of missing letters.");
      say("Choose a location to reveal what can be found there.");

      const opts: [string, string[], string][] = [
        [
          "The Kennel",
          ["C..", "A..", "...", "...", "...", ".T."],
          "On the note with the cat.",
        ],
        [
          "Secret Passage",
          ["...", "..D", "...", ".O.", ".OR", "..."],
          "Behind the bookshelf (enter from the other side before pulling a book).",
        ],
        ["Vault", [".I.", ".D.", "...", "...", "...", "..."], "In lockbox ..."],
        [
          "Locker Room",
          ["...", "...", "SIX", ".OR", ".O.", "..."],
          "On a torn algebra worksheet.",
        ],
        [
          "Cloister",
          ["C.X", "...", "...", "...", "...", "E.T"],
          "On the statue.",
        ],
        [
          "Classroom 7",
          ["..X", "...", "..X", ".O.", ".O.", "..."],
          "On the blackboard.",
        ],
        [
          "Blackbridge Grotto",
          [".I.", "...", ".I.", ".O.", ".O.", "..."],
          "On a note attached to a server.",
        ],
      ];
      if (s["docs.A New Clue Manuscript"]) {
        opts.push([
          "A New Clue Manuscript",
          ["...", "...", "S..", ".O.", ".O.", "..T"],
          "The picture with “keep left”.",
        ]);
      }
      const idx = askOptionIdx(opts.map(([s, _, __]) => s));
      if (idx === undefined) return;
      say(opts[idx][2]);

      function showCastleCypher(rows: string[]) {
        show(
          <table
            className="quotedText"
            style={{
              border: "1px solid black",
              borderCollapse: "collapse",
              maxWidth: "8em",
            }}
          >
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {[0, 1, 2].map((j) => (
                    <td
                      key={j}
                      style={{
                        width: "1.2em",
                        height: "2em",
                        border: "1px solid black",
                        padding: "4px",
                        textAlign: "center",
                      }}
                    >
                      {r[j] === "." ? " " : r[j]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      showCastleCypher(opts[idx][1]);
    },
  }),
  new Todo({
    goal: "itScepter",
    condition: ["rooms.Treasure Trove"],
    priority: HIGH,
    title: "🧩 Treasure Trove",
    sequence: (s) => {
      say("Make sure to take notes about the chests.");
      confirm();
      say(
        "While there are many more memos to find, the first 7 memos in the first 7 boxes suffice to find the True Treasure of the Trove."
      );
      confirm("Reveal relevant memos.");
      show(
        <div>
          <p>
            From the familiar rules regarding blue and red memos, you can deduce
            that:
          </p>
          <ul>
            <li>
              The statement: “The true treasure of the trove is not in the
              house.” is true.
            </li>
            <li>
              The statement: “The true treasure of the trove is not in this
              room.” is false.
            </li>
          </ul>
        </div>
      );
      say("You can find a list of all memos here:");
      link(
        "https://blue-prince.fandom.com/wiki/Treasure_Trove_Notes",
        "→ Open Blue Prince Wiki Entry"
      );
      confirm();
      say(
        "What can you conclude from the treasure being in the Trove but not in the house?"
      );
      confirm("Reveal implication.");
      say("It seems the Trove has to be outside the house.");
      confirm();
      if (
        !s["docs.A note containing “steady, deadly, heavy, ready”"] &&
        !s["blueDoors.Secret Passage"]
      ) {
        say("You need an advanced drafting technique to continue.");
        confirm("Show hints regarding this technique.");
        blessingOfTheMonkHint();
      } else {
        say(
          "This calls for an advanced drafting technique you have used before."
        );
        confirm("Reveal technique.");
        say(
          "You need the Blessing of the Monk for this (Shrine, 13, 29, 45, 61 or 77 gold)."
        );
      }
      confirm();
      say(
        "Using the Blessing of the Monk, draft the Treasure Trove as an outer room."
      );
      confirm("Reveal what happens.");
      if (!s["itAriesKey"]) {
        say(
          "A different chest appears. Unfortunately, you cannot open it at the moment. Come back later."
        );
        return;
      } else {
        say("A different chest appears. But how to open it?");
        confirm("Reveal answer.");
        say("The chest can be opened with the key of Aries.");
        solved("Mark the Key of Aries as used.", "itScepter");
      }
    },
  }),
  new Todo({
    goal: "itPaperCrown",
    condition: ["rooms.Closed Exhibit"],
    title: "🔎 Closed Exhibit",
    sequence: (s) => {
      say("There has got to be a way to get it... right?");
      confirm();
      if (!s["locSafehouse"]) {
        say(
          "This was used to train for a heist. Come back when you learned more about the real thing."
        );
        return;
      }
      say(
        "This room was used as a model to train for a heist. Can you find information on the real Closed Exhibit?"
      );
      confirm("Reveal where to look.");
      say("Check the Safehouse.");
      confirm();
      say(
        "Using a magnifying glass on the plan of the Royal Museum, you learn that there are “System Security Controls” behind the exhibit on the other side of the wall."
      );
      confirm();
      say("Recall the Foundation elevator?");
      confirm("Reveal what to do.");
      say(
        "Draft a room behind the closed exhibit with a door to where the Closed Exhibit seemingly has none. You will be able to access security controls."
      );
      confirm("How to get the crown.");
      say(
        "Resetting the Alarm system gives you 10 seconds to get the crown. With the right room layout, this is enough to go around."
      );
      solved("Mark the Paper Crown as found", "itPaperCrown");
    },
  }),
  new Todo({
    goal: "microchip.West Path",
    condition: "books.A New Clue",
    priority: HIGH,
    title: "📚 A New Clue: “searched every corner”",
    sequence: () => {
      say("“A New Clue” contains several useful clues.");
      confirm("Suggest a good place to start.");
      say("Begin with the phrase “search every corner and check every space”.");
      confirm();
      say("You need a magnifying glass for this.");
      confirm();
      say("There are tiny numbers in between the words:");
      show(
        <p className="quotedText">
          He had looked high and low⁸ in¹² all¹ of the rooms⁵,¹⁴, He had
          searched every corner³ in each of the¹³ tombs, In this particular
          case⁴,⁹ he had⁶ checked² every space. If he found¹¹ a⁷ new clue¹⁰,
          he'd know what to do.
        </p>
      );
      confirm();
      say("This gives a 14 word message.");
      confirmReveal("Reveal message.");
      say(
        "“all checked corner case rooms had a low case clue found in the rooms”"
      );
      confirm();
      say(
        "The checked corner case rooms are found on the previous page: Parlor, Patio, Nook, Office."
      );
      confirm();
      say(
        "In each of these rooms there is a note. Each note contains a word suspiciously typed in lower case."
      );
      confirmSol();
      say("The four words are “buried beside west bridge”.");
      confirmReveal("Reveal what to find.");
      say(
        "Digging with a shovel next to the bridge on the West Path yields a microchip."
      );
      solved("Mark Microchip on West Path as found.", "microchip.West Path");
    },
  }),
  new Todo({
    goal: "microchip.Entrance Hall",
    condition: ["books.A New Clue"],
    priority: HIGH,
    title: "📚 A New Clue: “Overlooked but now in view”",
    sequence: () => {
      say("“A New Clue” contains several useful clues.");
      confirm("Suggest a good place to start.");
      say("Look at the picture where the detective is kneeling.");
      confirm();
      say("The squares on the floor form a familiar 9 × 5 grid.");
      confirm();
      say("The detective is where the Entrance Hall would be.");
      confirm();
      say("You have walked past that vase many times.");
      confirm();
      say("There is a hammer next to the vase.");
      confirmSol();
      say(
        "Break the vase in the Entrance Hall with a hammer. You will find a Microchip."
      );
      solved(
        "Mark Microchip in Entrance Hall as found.",
        "microchip.Entrance Hall"
      );
    },
  }),
  new Todo({
    goal: "curseMode",
    condition: ["PA.West Path", "books.The Curse of Black Bridge", "R46"],
    title: "🔎 Cursed Coffers",
    sequence: () => {
      say("Did you buy the Cursed Coffers in the Gift Shop?");
      if (!askYesNo()) {
        say("Chicken!");
        say(
          "⚠ Note: For the Coffers to appear you need to have read “The Curse of Black Bridge” in the Library."
        );
        return;
      }
      say("Did you open them?");
      if (!askYesNo()) {
        say("The coffers appear in the shrine. None would dare to open it.");
        confirm();
        say(
          "I someone were to dare to open it, they'd likely do it the same way it was done in the book."
        );
        confirm("Reveal how.");
        say(
          "Like in The Curse of Black Bridge, the chest can be opened with a blunt instrument (a hammer will do)."
        );
        return;
      }
      say("How foolish of you.");
      solved("Mark Curse Mode as unlocked.", "curseMode");
    },
  }),
  new Todo({
    goal: "docs.Electronic Mail",
    title: "💻 Get Access to Electronic Mail",
    sequence: () => {
      say("Access the network via the terminals throughout the estate.");
      confirm();
      say("Do you know the password?");
      if (!askYesNo()) {
        say(
          "There is a note in the Commissary as well as Security. Unfortunately the password is crossed out."
        );
        confirm();
        say("Maybe you can get a closer look?");
        confirm("Reveal what to do.");
        say("Use a magnifying glass on one of the notes.");
        confirmSol("Reveal password.");
        say("The network password is “SWANSONG”.");
        return;
      }
      say("Using it, you can access electronic mail in the Office.");
      solved("Mark electronic mail as read.", "docs.Electronic Mail");
    },
  }),
  new Todo({
    goal: "docs.Will of Herbert S Sinclair",
    condition: (s) =>
      !!s["locR46"] &&
      !!s["PA.West Path"] &&
      sanctumSigils.filter((sig) => s[sig]).length >= 6, // almost all
    priority: HIGH,
    title: "🧩 8 Realms Puzzle",
    sequence: (s) => {
      say("The map in Room 46 allows you to place 8 pins.");
      confirm();
      say(
        "The late baron has visited all 8 realms. You can find a postcard from each realm in the inner sanctum."
      );
      if (!sanctumSigils.every((sig) => s[sig])) {
        say(
          "Since you have not solved all sigils yet, consider coming back later."
        );
        confirmReveal("Continue anyway.");
      } else {
        confirm();
      }
      say(
        "The purpose of this puzzle is to determine the order in which the baron has visited the 8 realms."
      );
      confirm();
      say("Do you need help the realms and their geographic locations?");
      const locations: [Realm, string][] = [
        ["Orinda Aries", "east"],
        ["Fenn Aries", "east (same as Orinda Aries)"],
        ["Arch Aries", "north east"],
        ["Eraja", "south east"],
        ["Corarica", "far west"],
        ["Mora Jai", "north west"],
        ["Verra", "south west"],
        ["Nuance", "west of Eraja"],
      ];
      const order: number[] = [0, 3, 2, 5, 6, 4, 7, 1];
      if (askYesNo()) {
        say("You can find all you need in classroom 4.");
        confirm("Reveal assignments.");
        show(
          <ul>
            {locations.map(([r, desc]) => (
              <li key={r}>
                {RealmIcon(r)}
                {r}: {desc}
              </li>
            ))}
          </ul>
        );
      }
      say("Do you need help interpreting the post cards?");
      if (askBit(["no, just reveal solution", "yes"])) {
        say("Pick a realm to reveal what can be learned from its postcard.");
        switch (askOption(Realms)) {
          case "Orinda Aries":
            say(
              "Orinda Aries is first. The second realm is south of Orinda Aries."
            );
            return;
          case "Fenn Aries":
            say("Fenn Aries is last.");
            return;
          case "Arch Aries":
            say(
              "Arch Aries was reached by boat, though train travel would have been possible in the old days."
            );
            return;
          case "Eraja":
            say("Nothing rock-solid...");
            return;
          case "Corarica":
            say("Comes directly after Verra. Herbert ditches his books.");
            return;
          case "Mora Jai":
            say("Herbert still has his books.");
            return;
          case "Verra":
            say("Comes directly after Mora Jai.");
            return;
          case "Nuance":
            say(
              "Comes after Corarica and Mora Jai. Likely comes shortly before he travels home."
            );
            return;
        }
      }
      show(
        <div>
          <p>The correct order is:</p>
          <ul>
            {order
              .map((i) => locations[i])
              .map(([r, desc]) => (
                <li key={r}>
                  {RealmIcon(r)}
                  {r}: ({desc})
                </li>
              ))}
          </ul>
        </div>
      );
      solved(
        "Mark the 8 Realms Puzzle as solved and the Will of Herbert Sinclair as found.",
        "docs.Will of Herbert S Sinclair"
      );
    },
  }),
  new Todo({
    goal: "basementClutterPuzzle",
    condition: ["locBasement"],
    priority: HIGH,
    title: "🔎 Basement",
    sequence: (s) => {
      say("Surely these trolleys have a purpose.");
      confirm();
      if (s["rooms.Mechanarium"]) {
        say(
          "The underground map showed a connection between the Basement and the Reservoir."
        );
        confirm();
      }
      say(
        "There is a green button near the basement door. You cannot reach it from the floor."
      );
      confirmSol();
      say(
        "By moving the trolleys around you can climb the clutter and reach the green button to open a passage to the Reservoir."
      );
      solved(
        "Mark the button in the Basement as pressed.",
        "basementClutterPuzzle"
      );
    },
  }),
  new Todo({
    goal: "locAntechamber",
    title: "🏃‍♂️ Reach the Antechamber",
    priority: VERYHIGH,
    sequence: () => {
      say("It sounds important.");
      confirm("Continue if you need help.");
      say(
        "Note that this guide will not assist with resource management (steps, gems, keys, coins). Continue only if you need help with something else."
      );
      confirmReveal("Continue.");
      say(
        "The Antechamber has doors to the west, south and east, but these are sealed."
      );
      confirm();
      say("Each seal can be lifted by a specific lever.");
      confirm("Reveal lever locations.");
      say(
        "Check the Great Hall, the Secret Garden and the Greenhouse. In each case there is a slight complication. Make a choice for more detailed instructions."
      );
      switch (askOption(["Great Hall", "Secret Garden", "Greenhouse"])) {
        case "Great Hall":
          say(
            "The lever is behind one of the doors. There is no reliable way of knowing where so just try your luck."
          );
          break;
        case "Secret Garden":
          say(
            "To find the Secret Garden you need to be lucky enough to find a special key. You can access the west lever by pointing all arrows of the weather vane to the west."
          );
          break;
        case "Greenhouse":
          say(
            "The south lever in the Greenhouse is missing. But if you find a broken lever you can reattach it."
          );
          break;
      }
      solved("Mark the Antechamber as reached.", "locAntechamber");
    },
  }),
  new Todo({
    goal: "locPrecipice",
    condition: ["PA.West Path", "PA.Gem Cavern", "PA.Orchard"],
    priority: HIGH,
    title: "👁 Valves",
    sequence: () => {
      say(
        "By now you have likely encountered a valve that lights a blue flame on the grounds."
      );
      confirm("Reveal what to do.");
      say("You need to activate four such valves.");
      confirm("Hints for valve locations.");
      say("Click for solutions.");
      switch (
        askOption(["🍎", "💎", "👣🏚", "🎓", "reveal what happens after"])
      ) {
        case "🍎":
          say("Apple Orchard.");
          return;
        case "🎓":
          say("The Schoolhouse.");
          return;
        case "💎":
          say("The Gem Cavern.");
          return;
        case "👣🏚":
          say("The Hovel.");
          return;
        case "reveal what happens after":
          say(
            "Once all valves are activated, an elevator will appear on the grounds, that takes you to “The Precipice”."
          );
          solved("Mark the Precipice as discovered.", "locPrecipice");
      }
    },
    // the gardener's logbook mentions the valves
  }),
  new Todo({
    goal: "locAriesCourt",
    condition: "powerHammer.The Precipice",
    title: "🧩 “CASTLE”",
    sequence: (s) => {
      say("What to make of that word?");
      confirm();
      say(
        "While “castle” seems to be part of a 6 × 3 letter grid, it has a significance of its own."
      );
      confirm();
      if (!s["PA.Blue Tents"]) {
        say(
          "You have not seen all relevant clues at this moment. Come at a later point but keep the puzzle in mind."
        );
        confirmSol("Reveal clues now (not recommended).");
        say("“The rook can perform a special move with another piece.”");
        confirm("Next clue.");
        say("“The king can castle by swapping with another piece.”");
      } else {
        say(
          "The Blue Tents give you access to two vital clues for this puzzle."
        );
        confirm("Reveal relevant rooms.");
        say("The Nook and the Office.");
        confirm("Reveal memos.");
        say("Nook: The rook can perform a special move with another piece.");
        say("Office: The king can castle by swapping with another piece.");
      }
      confirm("Show hint regarding interpretation.");
      say("Castling involves swapping king and rook.");
      confirm();
      say("In what sense can you “swap” rook and king in the Precipice?");
      confirmSol();
      say(
        "In the Precipice, swap out the king's perk (Banner of the King) for the rook's perk (Resilience of the Rook) or vice versa."
      );
      confirmReveal("Reveal effect.");
      say("A passage towards the “Unknown” will open.");
      solved(
        "Mark the Unknown / “Aries Court” as discovered.",
        "locAriesCourt"
      );
    },
    // Nook Blue Note: THE ROOK CAN PERFORM A SPECIAL MOVE WITH ANOTHER PIECE.
    // Office: THE KING CAN CASTLE BY SWAPPING WITH ANOTHER PIECE.
  }),
  new Todo({
    goal: "locCatacombs",
    condition: "PA.West Path",
    title: "🧩 Tomb Statues",
    sequence: () => {
      say("You can interact with the statues in the tomb.");
      confirm();
      say("Those angels can be seen elsewhere on the estate.");
      confirm();
      say("Check the Chapel.");
      confirm();
      say("This puzzle is about activating the statues in a particular order.");
      confirmSol();
      say(
        "The stained glass windows in the Chapel have roman numerals indicating the correct order of activation:"
      );
      show(
        <ol type="1">
          <li>Gardener with hoe</li>
          <li>Chef with peel</li>
          <li>Farmer with pitchfork</li>
          <li>Chimney sweep with chimney brush</li>
          <li>Maid with broom</li>
          <li>Equestrian with riding crop</li>
          <li>Queen with Scepter</li>
        </ol>
      );
      confirmReveal("Reveal what happens.");
      say("A secret passage opens.");
      solved("Mark the Catacombs as discovered.", "locCatacombs");
    },
  }),
  new Todo({
    goal: "locUnderpass",
    condition: "locAntechamber",
    priority: VERYHIGH,
    title: "🏃‍♂️ To continue up, one must go down.",
    sequence: (s) => {
      if (!s["PA.West Path"]) {
        say("Good to keep in mind.");
        confirm();
        say(
          "It is hard to “continue up” without unlocking the West Path first. Focus on that and come back afterwards."
        );
        return;
      }
      say("Apparently it's time to go underground.");
      confirm();
      if (s["rooms.Mechanarium"]) {
        say("The underground map that you found mentions a “north lever”.");
        confirm();
      } else if (s["locCartSide"]) {
        say(
          "The map fragment that you found in the torch chamber mentions a “north lever”."
        );
        confirm();
      }

      if (s["locBasement"] && !s["basementClutterPuzzle"]) {
        say(
          "Focus on the Todo “🔎 Basement”. It will make things easier. Then come back here."
        );
        return;
      }
      if (s["basementClutterPuzzle"] && !s["rooms.Mechanarium"]) {
        say(
          "The basement gives you access to giant rotating gears. Play around with them and come back when you have found the Mechanarium."
        );
        solved("Mark the Mechanarium as found.", "rooms.Mechanarium");
        return;
      }
      // from here on out basement implies mechanarium
      if (s["rooms.Mechanarium"] && s["locCatacombs"]) {
        // easy access to both sides
        say(
          "If that pesky mine cart where out of the way, you could reach the north lever easily."
        );
        confirmSol("Reveal what to do.");
        say(
          "By activating the statue of the angel of death in the Catacombs you can get behind the mine cart and pull it back (the position will not reset at the end of the day). Now it is easy to reach the other side of the gears when coming from the reservoir."
        );
        solved("Mark the Underpass as reached.", "locUnderpass");
        return;
      }
      if (!s["locCatacombs"]) {
        if (s["rooms.Mechanarium"]) {
          say("The underground map mentions a Tomb Entrance.");
        }
        say(
          "Solving a puzzle in the Tomb will make your life much easier. Come back afterwards."
        );
        return;
      }
      // Player HAS solved the catacombs, but apparently not found the basement nor the mechanarium. Needs a boat ride
      say(
        "The Reservoir has a boat in it. Unfortunately the water level makes it unreachable."
      );
      confirmSol("Reveal what to do.");
      say(
        "Draft the Pump Room to set the water level of the Reservoir to 13. You can then use the boat to go to the other side."
      );
      confirmReveal("Reveal what can be found.");
      solved("Mark the Mechanarium as found.", "rooms.Mechanarium");
    },
    // drafting strategy vol 3 explains that the pump room can be powered with the boiler room
  }),
  new Todo({
    goal: "chessPuzzle", // "itTorch",
    condition: "locPrecipice",
    title: "🧩 Chess Puzzle",
    sequence: () => {
      say("Play around with the chess board in the Precipice.");
      confirm();
      say("Surely you have noticed the chess pieces throughout the manor.");
      confirm();
      say("The colour of the chess pieces is irrelevant.");
      confirmSol();
      say(
        "For each of the chess pieces, draft at least one corresponding room. In the Precipice, put the pieces in corresponding locations. You get to choose a permanent bonus (can be switched by resolving the puzzle)."
      );
      solved("Mark the Chess Puzzle as solved.", "chessPuzzle");
    },
  }),
  new Todo({
    goal: "billiardPuzzle",
    title: "🧩 Billiard Room",
    sequence: (s) => {
      let level: number = askBit(["", "I have solved at least 1 puzzle"])
        ? 1
        : 0;
      if (level == 1) {
        level = 1 + (askBit(["", "I have solved at least 10 puzzles"]) ? 1 : 0);
      }
      if (level == 0) {
        say("Check out the dart board. You can click the numbers 1-20.");
        confirm();
        say(
          "Experiment a little. The puzzle simply resets when you make an error."
        );
        confirm();
      }
      if (level <= 1) {
        say("You will find clues in the Nook using a magnifying glass.");
        confirmReveal("Reveal instructions from the Nook");
        say(
          "Billiard puzzles involves addition (cyan), subtraction (yellow), multiplication (magenta) and division (purple). Carry out the operations from the inside out."
        );
        solved("Register ability to solve Billiard puzzles.", "billiardPuzzle");
        return;
      }
      //  level == 2
      if (!s["PA.West Path"]) {
        say(
          "You can find further clues at a later point in the game. Consider waiting."
        );
        confirmReveal("Continue.");
      } else {
        say(
          "If you draft a Schoolhouse as an outer room you will find clues for advanced Billiard puzzles in the seventh Classroom you draft."
        );
        confirm();
      }
      say("Choose what you need help with.");
      switch (askOption(["⬜", "◇", "~/≈", "details or something else"])) {
        case "⬜":
          say("Its a square.");
          confirmReveal("Reveal meaning.");
          say(
            "This is about squaring numbers, i.e. multiplying a number with itself."
          );
          return;
        case "~/≈":
          say("The wavy lines represent approximation.");
          confirmReveal("Reveal meaning.");
          say(
            "This is about rounding a number to the next integer, the next multiple of 10 or the next multiple of 100."
          );
          return;
        case "◇":
          say("This does nothing when applied to 11.");
          confirmReveal("Reveal meaning.");
          say("This is about reversing a number (e.g. 21 becomes 12).");
          return;
        case "details or something else":
          say("The full details are beyond the scope of this hint system.");
          link(
            "https://www.adamrb.com/blue-prince-dartboard-puzzle-solver/",
            "→ Open Blue Dart Board Solver by Adam Boeglin"
          );
          return;
      }
    },
  }),
  new Todo({
    goal: "artPuzzle",
    title: "🔎 Artwork",
    priority: HIGH,
    sequence: () => {
      const sol: string[][][] = [
        [
          ["I", "Chief", "Chef"],
          ["F", "Flight", "Light"],
          ["", "", "—"],
          ["W", "Wheat", "Heat"],
          ["E", "Create", "Crate"],
        ],
        [
          ["C", "Crate", "Rate"],
          ["O", "Boat", "Bat"],
          ["U", "House", "Hose"],
          ["N", "Crown", "Crow"],
          ["T", "Plant", "Plan"],
        ],
        [
          ["S", "Spine", "Pine"],
          ["M", "Time", "Tie"],
          ["A", "Paint", "Pint"],
          ["L", "Flan", "Fan"],
          ["L", "Plane", "Pane"],
        ],
        [
          ["G", "Grain", "Rain"],
          ["A", "Coast", "Cost"],
          ["T", "Planet", "Plane"],
          ["E", "Stage", "Stag"],
          ["S", "Coast", "Coat"],
        ],
        [
          ["E", "Tube", "Tub"],
          ["I", "Pilot", "Plot"],
          ["G", "Tiger", "Tier"],
          ["H", "Chart", "Cart"],
          ["T", "Tent", "Ten"],
        ],
        [
          ["D", "Card", "Car"],
          ["A", "Coat", "Cot"],
          ["T", "Stage", "Sage"],
          ["E", "Fire", "Fir"],
          ["S", "Sand", "And"],
        ],
        [
          ["C", "Crow", "Row"],
          ["R", "Tier", "Tie"],
          ["A", "Road", "Rod"],
          ["C", "Clock", "Lock"],
          ["K", "Peak", "Pea"],
        ],
        [
          ["E", "Plane", "Plan"],
          ["I", "Stair", "Star"],
          ["G", "Bridge", "Bride"],
          ["H", "Bath", "Bat"],
          ["T", "Cart", "Car"],
        ],
        [
          ["S", "Dessert", "Desert"],
          ["A", "Pray", "Pry"],
          ["F", "Face", "Ace"],
          ["E", "Pine", "Pin"],
          ["S", "Stag", "Tag"],
        ],
      ];
      say("The art in the rooms means something.");

      if (!askBit(["", "I know how this puzzle works in principle."])) {
        say("Have you ever drafted the Study?");
        if (!askYesNo()) {
          say("Come again when you have.");
          confirmReveal("Continue anyway.");
        }
        say(
          "As indicated in the Study: The Entrance Hall contains two drawings. One shows “FACE” and one shows “ACE”. The difference is “F”."
        );
        confirmSol("Explain what to do.");
        say(
          "Each position in the manner (except for the Antechamber) corresponds to a letter in this way. (Note that the same room will contain different art if drafted in a different place.) Together the 44 letters spell a message."
        );
      }
      show(<ArtPuzzleView sol={sol} />);
      confirmSol("Reveal complete solution.");
      say("“If we count small gates eight dates crack eight safes.”");
      solved("Mark this message as discovered.", "artPuzzle");
    },
  }),
  new Todo({
    goal: "sanctumKeys.2",
    condition: "locR46",
    priority: HIGH,
    title: "🔑 Sanctum Key: “Locked tight in the vault of a bank”.",
    sequence: (s) => {
      say("Find Sanctum Key number 2.");
      confirm();
      say(
        "You need to find the right Vault Key. Sometimes it can be found when digging with a shovel."
      );
      if (s["PA.West Path"]) {
        say(
          "Sometimes you can trade for a Vault Key in the Trading Post. Good luck!"
        );
      }
      solved("Mark the Sanctum Key as found.", "sanctumKeys.2");
    },
  }),
  new Todo({
    goal: "sanctumKeys.3",
    condition: ["locR46", "rooms.Clock Tower"],
    priority: HIGH,
    title: "🔑 Sanctum Key: “High up, among all the clocks”.",
    sequence: () => {
      say("Find Sanctum Key number 3.");
      confirm();
      say("The clue is a rather direct hint at the Clock Tower.");
      confirm();
      say("One of the clocks is broken... Wait, what a strange coincidence.");
      confirm();
      say(
        "The clocks has stopped at 1:30pm. So have the clocks in Room 46. The time shown on the ground of the Clock Tower is likewise 1:30pm."
      );
      confirm("Reveal first step.");
      say("Be in the Clock Tower at 1:30pm.");
      confirm();
      say("A secret door has opened to reveal a logic puzzle.");
      confirm();
      show(
        <div>
          <p>Recall from Security:</p>
          <ul>
            <li>Blue memos tell the truth.</li>
            <li>Red memos are lies, unless written by hand.</li>
          </ul>
        </div>
      );
      confirm("Help with the logic.");
      say(
        "There are only five times ending in “:00” that avoid the forbidden digits 1,2,3,4 (note that trying to use 00:00 gives you 12:00 instead). This means you need to use each of the times 5:00, 6:00, 7:00, 8:00 and 9:00."
      );
      confirm("More help.");
      show(
        <div>
          <p>You can reason in the following order.</p>
          <ul>
            <li>Derive the time of the fifth clock.</li>
            <li>Derive where the time 5:00 must go.</li>
            <li>Derive where 8:00 and 9:00 must go.</li>
            <li>Derive the time of the third clock.</li>
            <li>Derive the time of the forth clock.</li>
            <li>Derive the times of the remaining two clocks.</li>
          </ul>
        </div>
      );
      confirmSol();
      show(
        <div>
          <p>The times are, from left to right:</p>
          <ul>
            <li>5:00</li>
            <li>5:08</li>
            <li>5:57</li>
            <li>6:00</li>
            <li>7:00</li>
            <li>8:00</li>
            <li>8:05</li>
            <li>9:00</li>
          </ul>
        </div>
      );
      solved(
        "Mark the Sanctum Key in the Clock Tower as found.",
        "sanctumKeys.3"
      );
    },
  }),
  new Todo({
    goal: "sanctumKeys.4",
    condition: "locR46",
    priority: HIGH,
    title: "🔑 Sanctum Key: “Down below, beneath all the docks”.",
    sequence: (s) => {
      say("Find Sanctum Key number 4.");
      confirm();
      say("The Reservoir has docks.");
      confirm("Show what to do.");
      say("Use the Pump Room to drain the Reservoir.");
      confirm("Show how.");
      say(
        "You need to use the reserve tank in the Pump Room. This requires powering the Pump Room from the Boiler room."
      );
      confirm("Show next step.");
      say(
        "One of the chests at the bottom contains the key. They can be opened with regular keys. If you do not know which chest to open just try a few at random."
      );
      confirmSol("Reveal correct chest.");
      say(
        "The black box with a moon behind the stone pillar contains the Sanctum Key."
      );
      if (s["locCatacombs"]) {
        say("(The angel of death in the catacombs points to this location.)");
      }
      solved(
        "Mark the Sanctum Key in the Reservoir as found.",
        "sanctumKeys.4"
      );
    },
  }),
  new Todo({
    goal: "sanctumKeys.5",
    condition: ["locR46", "rooms.Throne Room"],
    priority: HIGH,
    title: "🔑 Sanctum Key: “Held by a king on his throne”.",
    sequence: () => {
      say("Find Sanctum Key number 5.");
      confirm();
      say("It's in the Throne Room.");
      solved(
        "Mark the Sanctum Key in the Throne Room as found.",
        "sanctumKeys.5"
      );
    },
  }),
  new Todo({
    goal: "sanctumKeys.6",
    condition: ["locksFound.Rotating Gear", "locR46"],
    priority: HIGH,
    title: "🏃‍♂️ Entry Level Nautics",
    sequence: (s) => {
      say(
        "On the upper level of the rotating gears area, there are two alcoves you can reach. One had a window to the reservoir with some kind of diagram."
      );
      confirm();
      say(
        "Water level 13 is marked as dock level. Water level 6 is marked as “entry level”. You have found the Pump Room, right?"
      );
      confirmSol("Reveal what to do.");
      say(
        "The water level of the Reservoir can be controlled in the Pump Room. " +
          (s["basementClutterPuzzle"]
            ? ""
            : "Set the gears and mine cart such that you can reach both sides of the Reservoir without using the boat. ") +
          "Row the boat to the side of the rotating gears, if it is not there already (requires water level 13). Then set the water level to 6 and use the boat from the rotating gear side. You will be able to reach a new area via cave previously submerged in water."
      );
      confirmReveal("Reveal what can be found.");
      say(
        "You will reach the Safehouse and find a Sanctum Key (among other things)."
      );
      solved(
        "Mark the Sanctum Key in the Safehouse as found.",
        "sanctumKeys.6"
      );
    },
  }),
  new Todo({
    goal: "sanctumKeys.7",
    condition: "locR46",
    priority: HIGH,
    title: "🔑 Sanctum Key: “Major if you draft it quite late”.",
    sequence: () => {
      say("Find Sanctum Key number 7.");
      confirm();
      say("You are looking for a “Major Key”.");
      confirm();
      say("The Music Room always spawns a Major Key.");
      confirmSol();
      say(
        "When drafting the Music Room “late” its Sanctum Key can spawn. Several interpretations of “late” all work:"
      );
      show(
        <ul>
          <li>At least 37 rooms have been drafted.</li>
          <li>The in-game time is 7:05 or later.</li>
          <li>The Music Room is on Rank 9.</li>
        </ul>
      );
      solved(
        "Mark the Sanctum Key in the Music Room as found.",
        "sanctumKeys.7"
      );
    },
  }),
  new Todo({
    goal: "sanctumKeys.8",
    condition: ["locR46", "rooms.Mechanarium"],
    priority: HIGH,
    title: "🔑 Sanctum Key: Waiting behind the last door of eight.",
    sequence: (s) => {
      say("Find Sanctum Key number 8.");
      confirm();
      say(
        "In case you're on the wrong track: The “last door of eight” is not referring to a door in the sanctum. It's also not related to rank 8 or Trophy 8." +
          (s["powerHammer.Tunnel"] ||
          s["docs.A note explaining how 86455 relates to 18"]
            ? " Nor is it related to the doors in the Tunnel"
            : "")
      );
      if (s["powerHammer.Tunnel"]) {
        say("Nor is it referring to the sequence of doors in the tunnel.");
      }
      confirm();
      say("Check your Room Directory.");
      confirm();
      say("Specifically, found floor plans.");
      confirm();
      say("This is about the Mechanarium.");
      confirmSol();
      say(
        "The Mechanarium tries to spawn as many doors as you have Mechanical rooms. Each of the four regular doors can only spawn if the space behind it does not yet contain a room, or contains a room with a door facing the Mechanarium. If not enough doors can be spawned in the regular places, up to four doors are spawned in the corners of the Mechanarium. The forth of these doors hides a Sanctum Key. Note that it can suffice to draft the Mechanarium as the fifth mechanical room to get the Sanctum Key, provided that the three regular door spots (other than the one from which the Mechanarium is entered) are blocked."
      );
      solved(
        "Mark the Sanctum Key in the Mechanarium as found.",
        "sanctumKeys.8"
      );
    },
  }),
  new Todo({
    // every sigil solved that has been found
    goal: (s) =>
      Realms.every((r) => !s[`sanctumDoors.${r}`] || !!s[`sanctumSigils.${r}`]),
    priority: HIGH,
    title: "🧩 Sanctum Sigils",
    sequence: (s) => {
      /* 
      Realm and Rune
        • Full Sigil of Fenn Aries
        • Mapping name to sigil; except Corarica, Mora Jai and Verra
        • Mapping color to border
      The History of Orindia?
        • Arch Aries ↔ Train
        • Eraja ↔ Train
      Secret Garden, Throne Room, Torch Room
        • Full Sigil of Orinda Aries      
      Stamps (entrance Hall and Mail Room, colors not reliable)
        • Eraja ↔ Purple ↔ Rain
        • Nuance ↔ Green ↔ Air Travel
        • Mora Jai ↔ Sea Travel ↔ White
        • Arch Aries ↔ Black
        • (Fenn Aries)
        • Verra ↔ Turtles ↔ (Hot)
        • Arch Aries ↔ Stormy ↔ Industrial
      Classrooms (colors)
        • Arch Aries ↔ yellow
        • Eraja ↔ purple
        • Corarica ↔ orange
      Classrooms (Geography)
        • Cores ↔ Names
      Classrooms (History)
        • Orinda Aries ↔ railways
        • air travel ↔ green
      File Cabinet in Archives:
        • Eraja ↔ Poetic
      Clock Tower
        • Poetic ↔ Purple
      Lost & Found
        • Heat ↔ Spiritual ↔ pink
      Bunk Room
        • Turtles ↔ Verra
      Dormitory
        • Corarica ↔ Orange ↔ Academic
      Tomb
        • Eraja ↔ Rain
      Master Bedroom
        • Mora Jai ↔ White (but Mora Jai box disappears after being solved...)
      Dovecote
        • Corarica ↔ Academic ↔ Snowy
      Room West of the Entrance Hall
        • Verra ↔ Spiritual

      "Orinda Aries",
      "Fenn Aries",
      "Arch Aries",
      "Eraja",
      "Corarica",
      "Mora Jai",
      "Verra",
      "Nuance",
      */
      function needs(R: Realm): boolean {
        return !!s[`sanctumDoors.${R}`] && !s[`sanctumSigils.${R}`];
      }
      say(
        "You have opened a Sanctum Door but not solved the puzzle behind it."
      );
      confirm();
      if (!s["books.Realm and Rune"]) {
        say("You're missing important literature on the subject.");
        confirm("Reveal which.");
        say(
          "You need to purchase Realm and Rune from the bookshop and read it."
        );
        return;
      }
      say(
        "The book “Realm and Rune” is useful here. If you failed to take notes, you can find screenshots here:"
      );
      link(
        "https://blue-prince.fandom.com/wiki/Realm_%26_Rune",
        "→ Open Blue Prince Wiki Entry"
      );
      if (needs("Fenn Aries")) {
        confirm("Reveal a rather obvious thing to do.");
        say(
          "The Sigil of Fenn Aries (the pentagon) is used as an example in Realm and Rune. Enter it in the Sanctum."
        );
        return;
      }
      confirm();
      if (needs("Orinda Aries")) {
        say("You have seen the solution for the left-most door before.");
        confirm("Reveal where.");
        say(
          "The torch chamber near the reservoir depicts everything you need except for the border."
        );
        confirm("Reveal correct border.");
        say(
          "The sigil in the torch chamber is black and that is the correct colour."
        );
        solved(
          "Mark the Sanctum Sigil for Orinda Aries as solved.",
          "sanctumSigils.Orinda Aries"
        );
        return;
      }
      if (!s["PA.West Path"]) {
        say(
          "You are likely missing important information. Unlock the West Path before you continue working on this puzzle."
        );
        return;
      }
      say("Do you know the names and corresponding cores of all eight realms?");
      if (!askYesNo()) {
        say("Draft the Schoolhouse as an outer room and visit the classrooms.");
        confirmSol("Reveal assignments of realms to cores.");
        show(
          <ul>
            {Realms.map((R: Realm) => (
              <li key={R}>
                {RealmIcon(R)}: {R}
              </li>
            ))}
          </ul>
        );
        return;
      }
      say(
        "You need to find a realms symbol (core), method of transportation (rays), weather (ray style), society type (mote) and color (border). Most of this information is scattered throughout the rooms of the manor. However, in a few cases some guessing seems to be required."
      );
      if (!askBit(["show solutions", "help locate clues"])) {
        const R = askOption(Realms);
        const sols: [Realm, string][] = [
          ["Orinda Aries", "black, metropolitan, foggy, train"],
          ["Fenn Aries", "red, martial, foggy, roads"],
          ["Arch Aries", "yellow, industrial, stormy, train"],
          ["Eraja", "violet, poetic, rainy, train"],
          ["Corarica", "orange, academic, snowy, roads"],
          ["Mora Jai", "white, agricultural, normal, naval"],
          ["Verra", "pink, spiritual, heat, turtleback"],
          ["Nuance", "green, martial, windy, aviation"],
        ];
        sols.forEach(([r, s]) => {
          if (R == r) {
            say(s);
            if (needs(r)) {
              solved(`Mark the sigil of ${r} as solved.`, `sanctumSigils.${r}`);
            }
          }
        });
        return;
      }
      say(
        "The effect “a letter will be delivered to the Mail Room” triggerable through lab experiments is helpful here."
      );
      confirmSol("Reveal how.");
      say("Check the stamps of the delivered letters with a magnifying glass.");
      confirm("Further hints.");
      const clues: [string, string][] = [];
      clues.push([
        "Stamps",
        "Arch Aries is industrial and stormy. Eraja is purple and rainy. Corarica is snowy. Mora Jai is white and uses ships. Verra uses Turtles. Nuance is green and uses aviation.",
      ]);
      s["sanctumSigils.Orinda Aries"] ||
        clues.push([
          "The Torch Chamber",
          "Orinda Aries is black, metropolitan, foggy, train.",
        ]);
      clues.push([
        "The History of Orindia (1st ed)",
        "Eraja and Arch Aries use trains. Eraja is poetic.",
      ]);
      s["sanctumSigils.Corarica"] ||
        clues.push([
          s["rooms.Dormitory"]
            ? "Dormitory"
            : "A room you have not yet unlocked.",
          "Corarica is orange and academic.",
        ]);
      s["sanctumSigils.Corarica"] ||
        clues.push([
          s["rooms.Dovecote"]
            ? "Dovecote"
            : "A room you have not yet unlocked.",
          "Corarica is academic and snowy.",
        ]);
      s["sanctumSigils.Verra"] ||
        clues.push([
          s["rooms.Lost & Found"]
            ? "Lost & Found"
            : "A room you have not yet unlocked.",
          "Pink, hot weather and spirituality go together.",
        ]);
      s["sanctumSigils.Eraja"] ||
        clues.push([
          s["rooms.Clock Tower"]
            ? "Clock Tower"
            : "A room you have not yet unlocked.",
          "Poetry and purple go together.",
        ]);
      clues.push([
        "Classroom Grade 1 (Colors)",
        "Arch Aries is yellow. Eraja is purple. Corarica is orange.",
      ]);
      s["sanctumSigils.Nuance"] ||
        clues.push([
          "Classroom Grade 6 (History)",
          "Aviation and green go together.",
        ]);
      s["sanctumSigils.Verra"] ||
        clues.push([
          "The room west of the Entrance Hall.",
          "Verra is spiritual (the drawing with the praying hands has a Verra symbol).",
        ]);
      s["sanctumSigils.Mora Jai"] ||
        clues.push([
          "Secret Garden description (rather vague)",
          "Mora Jai is agricultural.",
        ]);
      say(
        "Here are places you can check out. Click them to learn what can be found."
      );
      const i = askOptionIdx(clues.map(([label, _]) => `${label}`));
      if (i !== undefined) {
        say(clues[i][1]);
      }
    },
  }),
  new Todo({
    goal: "locRoughDraft",
    condition: ["blueDoors.Secret Passage", "rooms.Throne of the Blue Prince"],
    priority: HIGH,
    title: "🏃‍♂️ Open the Blue Door in the Secret Passage",
    sequence: () => {
      say(
        "Thanks to the upgraded Throne Room, you can explore behind the blue door in the Secret Passage."
      );
      confirmReveal("Reveal what can be found.");
      solved(
        "Mark the Mount Holly Rough Draft as discovered.",
        "locRoughDraft"
      );
    },
  }),
  new Todo({
    goal: "roughDraftMoonDoor",
    condition: ["locRoughDraft", "docs.A hidden hue"],
    priority: HIGH,
    title: "🧩 Mount Holly Rough Draft: A Hidden Hue",
    sequence: () => {
      say("Recall the “Hidden Hue” poem from the library.");
      confirm("Show it here.");
      show(
        <p className="quotedText">
          From prism pristine, three paths convene.
          <br />
          Three lines of light, three shades foreseen.
          <br />
          Three colours to count, a sum of eighteen.
          <br />
          But the one left hidden, remains to be seen.
        </p>
      );
      confirm();
      say("Focus on the first two lines.");
      confirm();
      say("You solve this puzzle just by walking around.");
      confirm();
      say("The “prism” refers to the lanterns on rank 1 (see Atelier poster).");
      confirm();
      say("The paths convene at the Vestibule.");
      confirm();
      say("There is a red path, an orange path and a purple path.");
      confirmSol();
      say(
        "Starting at the red, orange or purple lantern on rank one, reach the Vestibule without ever passing a lantern of a different color."
      );
      confirmReveal("Reveal what happens.");
      say(
        "The moon door in the Vestibule can be opened. But a note will clarify that each was “not the true path”."
      );
      solved("Mark the moon door as opened.", "roughDraftMoonDoor");
    },
  }),
  new Todo({
    goal: "roughDraftMoraJai",
    condition: "locRoughDraft",
    priority: HIGH,
    title: "🏃‍♂️ Mount Holly Rough Draft: Mora Jai Boxes",
    sequence: () => {
      say("This is going to be a lot of work...");
      confirmSol("Reveal all solutions.");
      const words = [
        ["through", "lantern", "light", "in", "sketches"],
        ["cast", "a", "tint", "of", "truth"],
        ["to", "find", "our", "path", "a"],
        ["hue", "of", "wisdom", "to", "turn"],
        ["us", "right", "a", "shade", "of"],
        ["rain", "to", "pass", "the", "light"],
        ["through", "lantern", "light", "in", "shadows"],
        ["past", "we", "seek", "what's", "left"],
        ["of", "the", "lies", "we", "cast"],
      ];
      say("Formatted as a 9 × 5 grid of words:");
      show(
        <table className="mb-3">
          <tbody>
            {words.map((list, i) => (
              <tr key={i}>
                {list.map((word, j) => (
                  <td key={j} style={{ textAlign: "center" }}>
                    {word}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
      say("Formated as a poem:");
      show(
        <p className="quotedText">
          through lantern light in sketches cast
          <br />
          a tint of truth to find our path
          <br />
          a hue of wisdom to turn us right
          <br />
          a shade of rain to pass the light
          <br />
          through lantern light in shadows past
          <br />
          we seek what's left of the lies we cast
        </p>
      );
      solved("Mark the Mora Jai Boxes as opened.", "roughDraftMoraJai");
    },
  }),
  new Todo({
    goal: "roughDraftArt",
    condition: "locRoughDraft",
    priority: HIGH,
    title: "🧩 Mount Holly Rough Draft: Art Pairings",
    sequence: () => {
      const sol: string[][][] = [
        [
          ["T", "rot", "trot"],
          ["H", "tree", "three"],
          ["E", "win", "wine"],
          ["S", "pear", "spear"],
          ["E", "lash", "leash"],
        ],
        [
          ["V", "noel", "novel"],
          ["Y", "ear", "year"],
          ["I", "bat", "bait"],
          ["N", "pi", "pin"],
          ["G", "lobe", "globe"],
        ],
        [
          ["P", "lace", "place"],
          ["L", "pier", "plier"],
          ["A", "stem", "steam"],
          ["N", "bar", "barn"],
          ["S", "pike", "spike"],
        ],
        [
          ["F", "arm", "farm"],
          ["O", "pen", "open"],
          ["R", "book", "brook"],
          ["G", "pi", "pig"],
          ["E", "rat", "rate"],
        ],
        [
          ["B", "one", "bone"],
          ["A", "lunch", "launch"],
          ["R", "steam", "stream"],
          ["O", "bar", "boar"],
          ["N", "sail", "snail"],
        ],
        [
          ["C", "rook", "crook"],
          ["R", "pie", "pier"],
          ["E", "spar", "spear"],
          ["S", "pot", "post"],
          ["T", "seed", "steed"],
        ],
        [
          ["A", "trot", "tarot"],
          ["M", "lab", "lamb"],
          ["O", "range", "orange"],
          ["N", "lace", "lance"],
          ["G", "ear", "gear"],
        ],
        [
          ["H", "arbor", "harbor"],
          ["E", "pi", "pie"],
          ["W", "eight", "weight"],
          ["A", "bed", "bead"],
          ["M", "cob", "comb"],
        ],
        [
          ["B", "ear", "bear"],
          ["L", "cog", "clog"],
          ["E", "can", "cane"],
          ["S", "harp", "sharp"],
          ["T", "horn", "thorn"],
        ],
      ];
      say("Some of these are quite tricky.");
      show(<ArtPuzzleView sol={sol} />);
      confirmSol("Reveal full solution.");
      show(
        <p style={{ fontFamily: "monospace" }}>
          these
          <br />
          vying
          <br />
          plans
          <br />
          forge
          <br />
          baron
          <br />
          crest
          <br />
          among
          <br />
          hewam
          <br />
          blest
        </p>
      );
      //say("“these vying plans forge baron crest among hewam blest”");
      solved("Mark this message as obtained.", "roughDraftArt");
    },
  }),
  new Todo({
    goal: "roughDraft46",
    condition: "roughDraftMoraJai",
    priority: HIGH,
    title: "🧩 Mount Holly Rough Draft: “Through Lantern Light”",
    sequence: () => {
      say("Act on the message found in the Mora Jai boxes.");
      confirm("Recall the message.");
      const lines = [
        "Through lantern light in sketches cast,",
        "a tint of truth to find our path,",
        "a hue of wisdom to turn us right,",
        "a shade of rain to pass the light.",
        "Through lantern light in shadows past,",
        "we seek what's left of the lies we cast.",
      ];
      show(
        <p>
          {lines.map((l, i) => (
            <React.Fragment key={i}>
              {l}
              <br />
            </React.Fragment>
          ))}
        </p>
      );
      confirm();
      say("This is about colors.");
      confirm();
      say("Choose a line.");
      lines.push("all of them");
      const line = askOptionIdx(lines);
      if (line === undefined) return;
      switch (line + 1) {
        case 1:
          say("This just describes the Mount Holly Rough Draft.");
          return;
        case 2:
          say("“A tint of truth” refers to a color.");
          confirm();
          say("It's blue (since blue memos are always true).");
          return;
        case 3:
          say("“A hue of wisdom” refers to a color.");
          confirm();
          say("Remember the sigils?");
          confirm();
          say("It's orange (the color of the Academic Realm of Corarica).");
          return;
        case 4:
          say("“A shade of rain” refers to a color.");
          confirm();
          say("Remember the sigils?");
          confirm();
          say("It's purple (the color of the rainy Realm of Eraja).");
          return;
        case 5:
          say("You can ignore this line for this puzzle.");
          return;
        case 6:
          say("“Lies” refers to a color.");
          confirm();
          say("It's red (since red memos are lies).");
          return;
        case 7:
          say("Continue only if you exhausted the line-specific hints.");
          confirmReveal("Continue.");
          show(
            <div>
              <p>To summarise</p>
              <ul>
                <li>Blue: find our path.</li>
                <li>Orange: turn us right.</li>
                <li>Purple: pass the light.</li>
                <li>Red: seek what's left of it.</li>
              </ul>
            </div>
          );
          confirm("Next hint.");
          say(
            "These are directions. They describe where to start and when to turn."
          );
          confirmReveal("Continue to reveal the full solution.");
          say(
            "Begin at the blue lantern at rank 1. Start walking into the pantry. For each room you enter, leave it through the other door. Under each red lantern, turn left. Under each orange lantern, turn right. Under each purple lantern, go straight. You will encounter a moon door behind the furnace. Open it."
          );
          solved(
            "Mark Room 46 of the Rough Draft as discovered.",
            "roughDraft46"
          );
          return;
      }
    },
  }),
  new Todo({
    goal: "roughDraftGallery",
    condition: ["roughDraftMoonDoor", "roughDraft46", "roughDraftArt"],
    title: "🧩 Mount Holly Rough Draft: The Gallery",
    sequence: () => {
      say(
        "There are solutions to the Gallery in the Mount Holly Rough Draft (even though you cannot enter them anywhere)."
      );
      confirm();
      say(
        "This puzzle involves the 45 letters from the art pairs, the true path and the three non-true paths."
      );
      confirm();
      say(
        "While some of the 45 letters are important, the meaning of the message they spell is irrelevant."
      );
      confirm();
      say("The words you seek have lengths 5,6,7,8.");
      confirm();
      say(
        "Recall that “a hidden hue” mentions “a sum of eighteen”. What does that mean?"
      );
      confirm();
      say("The true path passes through 8 rooms.");
      confirm("Reveal 8 letter word.");
      say("The art pairs along the true path spell “SWANSONG”.");
      confirm();
      say(
        "The non-true paths spell “MPTYE” (red), “MORTHE” (orange) and “LEFOSNE” (purple). That's nonsense. Or is it?"
      );
      confirm("Next thin.");
      say("Those are anagrams of “EMPTY”, “MOTHER” and “ONESELF”.");
      say(
        "As an ultimate flourish, the four solution words together with a fifth word of length 4 yield another final solution word."
      );
      confirm("Hint for that.");
      say(
        "The word of length four is found in the Gallery itself. Arrange the five words in order of increasing length."
      );
      confirmSol();
      show(
        <div>
          <p>The letters on display in the gallery spell “MOON”. We get:</p>
          <ul>
            <li>
              <span style={{ color: "blue", fontWeight: "bold" }}>M</span>oon
            </li>
            <li>
              <span style={{ color: "blue", fontWeight: "bold" }}>E</span>mpty
            </li>
            <li>
              <span style={{ color: "blue", fontWeight: "bold" }}>M</span>other
            </li>
            <li>
              <span style={{ color: "blue", fontWeight: "bold" }}>O</span>neself
            </li>
            <li>
              <span style={{ color: "blue", fontWeight: "bold" }}>S</span>
              wansong
            </li>
          </ul>
        </div>
      );
      solved("Mark the Gallery puzzle as solved.", "roughDraftGallery");
    },
  }),
];

Todos.sort((a, b) => b.priority - a.priority);
