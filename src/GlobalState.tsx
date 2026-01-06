type Var = keyof HierarchicalGlobalState;
type BoolVar = {
  [K in Var]: HierarchicalGlobalState[K] extends Trit ? K : never;
}[Var];
type CollectionVar = {
  [K in Var]: HierarchicalGlobalState[K] extends Trit ? never : K;
}[Var];

export type StateVar =
  | BoolVar
  | {
      [K in CollectionVar]: `${K}.${keyof HierarchicalGlobalState[K] &
        (string | number)}`;
    }[CollectionVar];

export type GlobalState = {
  [Key in StateVar]: Trit;
};
export type Antecedence = [StateVar, StateVar];
export type Alias = [StateVar, StateVar];
function REQs(befores: StateVar[], after: StateVar) {
  befores.forEach(
    (before) => before != after && REQUIREMENTS.push([before, after])
  );
}
function requiredByAll(before: StateVar, afters: StateVar[]) {
  afters.forEach(
    (after) => before != after && REQUIREMENTS.push([before, after])
  );
}
function REQ(requirement: StateVar, requiredFor: StateVar) {
  REQUIREMENTS.push([requirement, requiredFor]);
}
function ALIAS(alias: StateVar, groundTruth: StateVar) {
  ALIASES.push([alias, groundTruth]);
}

const ToolList = [
  "Burning Glass",
  "Detector Shovel",
  "Dowsing Rod",
  "Electromagnet",
  "Jack Hammer",
  "Lucky Purse",
  "Pick Sound Amplifier",
  "Power Hammer",
] as const;
export type Tool = (typeof ToolList)[number];
export const tools: StateVar[] = ToolList.map(
  (tool) => `tools.${tool}` as const
);

const PowerHammerLocationList = [
  "Greenhouse",
  "Weight Room",
  "Secret Garden",
  "The Precipice",
  "Sealed Entrance",
  "Freezer",
  "Tunnel",
] as const;
export type PowerHammerLocation = (typeof PowerHammerLocationList)[number];
export const powerHammerLocations: StateVar[] = PowerHammerLocationList.map(
  (loc) => `powerHammer.${loc}` as const
);

const FireLocationList = [
  "Tunnel (Torches)",
  "Tunnel (Candles)",
  "Chapel 🐷",
  "Freezer",
  "Tomb",
  "Trading Post (🧨)",
  "Abandoned Mine (Torch Chamber)", // Torch Room
  "Orchard (Sun Dial)",
] as const;
export type FireLocation = (typeof FireLocationList)[number];
export const fireLocations: StateVar[] = FireLocationList.map(
  (loc) => `fire.${loc}` as const
);

const PermanentAdditionList = [
  "Orchard",
  "Gem Cavern",
  "Blackbridge Grotto",
  "West Path",
  "Satellite Dish",
  "Blue Tents",
] as const;
export type PermanentAddition = (typeof PermanentAdditionList)[number];
export const permanentAdditions: StateVar[] = PermanentAdditionList.map(
  (PA) => `PA.${PA}` as const
);

export const CombinationLockList = [
  "Office",
  "Shelter",
  "Drawing Room",
  "Drafting Studio",
  "Boudoir",
  "Study",
  "Rotating Gear",
  "Orchard",
] as const;
export type CombinationLock = (typeof CombinationLockList)[number];
export const locksFound: StateVar[] = CombinationLockList.map(
  (lock) => `locksFound.${lock}` as const
);
export const locksOpened: StateVar[] = CombinationLockList.map(
  (lock) => `locksOpened.${lock}` as const
);

const StudioAdditionList = [
  "Dovecote",
  "The Kennel",
  "Clock Tower",
  "Classroom",
  "Solarium",
  "Dormitory",
  "Vestibule",
  "Casino",
] as const;

export type StudioAddition = (typeof StudioAdditionList)[number];
export const studioAdditions: StateVar[] = StudioAdditionList.map(
  (SA) => `rooms.${SA}` as const
);

const FoundFloorplanList = [
  "Planetarium",
  "Mechanarium",
  "Treasure Trove",
  "Throne Room",
  "Throne of the Blue Prince",
  "Tunnel",
  "Conservatory",
  "Lost & Found",
  "Closed Exhibit",
] as const;
export type FoundFloorplan = (typeof FoundFloorplanList)[number];
export const foundFloorplans: StateVar[] = FoundFloorplanList.map(
  (FF) => `rooms.${FF}` as const
);
export type Room = StudioAddition | FoundFloorplan;

const BookFromStockList = [
  "A Sightseer's Guide to Reddington",
  "Swim Bird",
  "The Fixed Stars",
  "The History of Orindia (2nd ed)",
  "EPCW Pump System User Manual",
  "Drafting Strategy Vol 3",
] as const;
export type BookFromStock = (typeof BookFromStockList)[number];
export const booksFromStock: StateVar[] = BookFromStockList.map(
  (book) => `books.${book}` as const
);
const BookFromShopList = [
  "The History of Orindia (1st ed)",
  "A New Clue",
  "The Curse of Black Bridge",
  "Realm and Rune",
  "Drafting Strategy Vol 4",
  "Drafting Strategy Vol 5",
] as const;
export type BookFromShop = (typeof BookFromShopList)[number];
export const booksFromShop: StateVar[] = BookFromShopList.map(
  (book) => `books.${book}` as const
);

const Documents = [
  "Electronic Mail",
  "Will of Herbert S Sinclair",
  "Her Ladyship's Diary",
  "Birth Certificate of Mary Epsen",
  "The Blue Prince Manuscript",
  "The Red Prince Manuscript",
  "A New Clue Manuscript",
  "A note containing “steady, deadly, heavy, ready”",
  "Security Camera Footage",
  "A note explaining how 86455 relates to 18",
  "A note with a 5 × 5 grid of words",
  "A hidden hue",
  "Baron Bafflers",
] as const;
export type Document = (typeof Documents)[number];
export const documents: StateVar[] = Documents.map(
  (doc) => `docs.${doc}` as const
);

const BlackbridgeKeys = [
  "Personnel Access (BabbA)",
  "Admin Access (MoorR, ThomK)",
  "Archive Access (LeeB)",
  "Archive Access (RibbJ, WithP)",
] as const;
export type BlackbridgeKey = (typeof BlackbridgeKeys)[number];
export const blackbridgeKeys: StateVar[] = BlackbridgeKeys.map(
  (k) => `blackbridgeKey.${k}` as const
);

const MicrochipLocations = [
  "Blackbridge Grotto",
  "West Path",
  "Entrance Hall",
] as const;
export type MicrochipLocation = (typeof MicrochipLocations)[number];
export const microchipLocations: StateVar[] = MicrochipLocations.map(
  (k) => `microchip.${k}` as const
);

export type Book = BookFromShop | BookFromStock;

export type Eight = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export const EightList: Eight[] = [1, 2, 3, 4, 5, 6, 7, 8];

export const Realms = [
  "Orinda Aries",
  "Fenn Aries",
  "Arch Aries",
  "Eraja",
  "Corarica",
  "Mora Jai",
  "Verra",
  "Nuance",
] as const;
export type Realm = (typeof Realms)[number];

export function RealmIcon(R: Realm) {
  const fileName = `realms/${R}.svg`;
  return (
    <img
      key={R}
      src={fileName}
      className="inline-icon"
      height="1lh"
      width="auto"
      vertical-align="middle"
    />
  );
}

export const sanctumKeys: StateVar[] = EightList.map(
  (num) => `sanctumKeys.${num}` as const
);

export const sanctumDoors: StateVar[] = Realms.map(
  (realm) => `sanctumDoors.${realm}` as const
);

export const sanctumSigils: StateVar[] = Realms.map(
  (realm) => `sanctumSigils.${realm}` as const
);

export const TrophyList = [
  "Full House Trophy",
  "Explorer's Trophy",
  "Bullseye Trophy",
  "A Logical Trophy",
  "Trophy of Invention",
  "Trophy of Drafting",
  "Trophy of Sigils",
  "Trophy 8",
  "Inheritance Trophy",
  "Dare Bird Trophy",
  "Cursed Trophy",
  "Day One Trophy",
  "Trophy of Speed",
  "Trophy of Wealth",
  "Diploma Trophy",
  "Trophy of Trophies",
] as const;
export type Trophy = (typeof TrophyList)[number];
export const trophies: StateVar[] = TrophyList.map(
  (trophy) => `trophies.${trophy}` as const
);

export type BlueDoor = "Secret Passage" | "Tunnel";
export const blueDoors: StateVar[] = [
  "blueDoors.Secret Passage",
  "blueDoors.Tunnel",
];

export type Trit = true | false | undefined;

interface HierarchicalGlobalState {
  // Structured Vars:
  tools: { [key in Tool]: Trit };
  PA: { [key in PermanentAddition]: Trit };
  rooms: { [key in StudioAddition | FoundFloorplan]: Trit };
  books: { [key in BookFromShop | BookFromStock]: Trit };
  /*allStockBooks: Trit;
  allShopBooks: Trit;*/
  docs: { [key in Document]: Trit };
  sanctumKeys: { [key in Eight]: Trit };
  sanctumDoors: { [key in Realm]: Trit };
  sanctumSigils: { [key in Realm]: Trit };
  trophies: { [key in Trophy]: Trit };
  blueDoors: { [key in BlueDoor]: Trit };
  blackbridgeKey: { [key in BlackbridgeKey]: Trit };
  powerHammer: { [key in PowerHammerLocation]: Trit };
  hasFire: Trit;
  fire: { [key in FireLocation]: Trit };
  locksFound: { [key in CombinationLock]: Trit };
  locksOpened: { [key in CombinationLock]: Trit };
  // unstructured Vars
  R46: Trit;
  itCrown: Trit;
  itAriesKey: Trit;
  itScepter: Trit;
  itPaperCrown: Trit;
  microchip: { [key in MicrochipLocation]: Trit };
  itTorch: Trit;
  allMicrochips: Trit;
  curseMode: Trit; // found the stone
  artPuzzle: Trit;
  billiardPuzzle: Trit;
  chessPuzzle: Trit;
  bafflersPuzzle: Trit;
  basementClutterPuzzle: Trit; // implies gear side
  roughDraftMoonDoor: Trit;
  roughDraft46: Trit;
  roughDraftGallery: Trit;
  roughDraftArt: Trit;
  roughDraftMoraJai: Trit;
  litCandles: Trit;

  locAntechamber: Trit;
  locR46: Trit;
  locPrecipice: Trit;
  locAriesCourt: Trit;
  locCatacombs: Trit;
  locGearSide: Trit;
  locCartSide: Trit;
  locGearAndCartSide: Trit;
  locUnderpass: Trit;
  locBasement: Trit;
  locSafehouse: Trit; // requires basementclutterpuzzle
  locRoughDraft: Trit;
}

/* Dependencies between state variables */
export const REQUIREMENTS: Antecedence[] = [];
export const ALIASES: Alias[] = [];

// # logic for tools:
{
}
// # logic for PA:
{
  ALIAS("locksOpened.Orchard", "PA.Orchard");
  REQs(["allMicrochips", "fire.Orchard (Sun Dial)"], "PA.Satellite Dish");
  REQ("R46", "PA.Blue Tents");
}
// # logic for rooms:
{
  // no requirements:
  //  • Studio Additions have no requirements
  //  • "Planetarium",
  //  • "Conservatory",
  // "Mechanarium",
  REQ("locGearSide", "rooms.Mechanarium");
  // "Treasure Trove",
  ALIAS("locksOpened.Rotating Gear", "rooms.Treasure Trove");
  // "Throne Room",
  ALIAS("allMicrochips", "rooms.Throne Room");
  // "Throne of the Blue Prince",
  REQs(
    ["itScepter", "curseMode", "itCrown", "rooms.Throne Room"],
    "rooms.Throne of the Blue Prince"
  );
  // "Tunnel",
  ALIAS("fire.Tunnel (Torches)", "rooms.Tunnel"); // must be this way so saying no to tunnel does not pin the Fire Location Question
  // "Lost & Found",
  REQ("locBasement", "rooms.Lost & Found");
  // "Closed Exhibit",
  ALIAS("locksOpened.Study", "rooms.Closed Exhibit");
}
// # logic for allStudioAdditions & allFoundFloorplans:
{
  // just the ordinary throne room is required for the throphy!
  REQs(
    foundFloorplans.filter((r) => r != "rooms.Throne of the Blue Prince"),
    "trophies.Explorer's Trophy"
  );
  REQs(studioAdditions, "trophies.Explorer's Trophy");
}
// # logic for books:
// # logic for allStockBooks:
// # logic for allShopBooks:
/*{
  REQs(booksFromStock, "allStockBooks");
  REQs(booksFromShop, "allShopBooks");
}*/
// # logic for docs:
{
  // nothing:
  // • "Security Camera Footage",
  // • "Birth Certificate of Mary Epsen":

  // "The Blue Prince Manuscript",
  REQs(
    ["blueDoors.Tunnel", "rooms.Throne of the Blue Prince"],
    "docs.The Blue Prince Manuscript"
  );
  // "The Red Prince Manuscript",
  REQ("locCatacombs", "docs.The Red Prince Manuscript");
  // "A New Clue Manuscript",
  ALIAS("docs.A New Clue Manuscript", "docs.The Red Prince Manuscript");
  // "Her Ladyship's Diary",
  REQ("fire.Tomb", "docs.Her Ladyship's Diary");
  // "A note containing “steady, deadly, heavy, ready”",
  REQs(
    ["locAntechamber", "PA.West Path"],
    "docs.A note containing “steady, deadly, heavy, ready”"
  );
  REQ("PA.Satellite Dish", "docs.A note explaining how 86455 relates to 18");
  REQ("docs.Baron Bafflers", "bafflersPuzzle");
}
// # logic for sanctumKeys:
{
  // ... locked in a vault ...
  REQ("rooms.Clock Tower", "sanctumKeys.3");
  REQs(["locCartSide", "locGearSide"], "sanctumKeys.4");
  REQ("rooms.Throne Room", "sanctumKeys.5");
  REQ("locSafehouse", "sanctumKeys.6");
  // ... draft it late ...
  REQ("rooms.Mechanarium", "sanctumKeys.8");
}
// # logic for sanctumDoors:
// # logic for sanctumSigils:
// Sanctum Keys, Doors, Sigils
{
  // dependence between summary vars
  requiredByAll("locUnderpass", sanctumDoors);

  // each sigil requires door
  for (const realm of Realms) {
    REQ(`sanctumDoors.${realm}`, `sanctumSigils.${realm}`);
  }
}
// # logic for trophies:
{
  // no requirements:
  // • "Full House Trophy",
  // • "Bullseye Trophy",
  // • "A Logical Trophy",
  // • "Trophy of Drafting",
  // • "Trophy of Wealth",

  // "Explorer's Trophy",
  // (see floorplans)
  //"Trophy of Invention",
  REQs(tools, "trophies.Trophy of Invention");
  //"Trophy of Sigils",
  REQs(sanctumSigils, "trophies.Trophy of Sigils");
  REQs(sanctumKeys, "trophies.Trophy of Sigils");
  //"Trophy 8",
  REQ("R46", "trophies.Trophy 8");
  //"Inheritance Trophy",
  ALIAS("trophies.Inheritance Trophy", "R46");
  //"Dare Bird Trophy",
  REQ("R46", "trophies.Dare Bird Trophy");
  //"Cursed Trophy",
  REQ("curseMode", "trophies.Cursed Trophy");
  //"Day One Trophy",
  REQ("R46", "trophies.Day One Trophy");
  //"Trophy of Speed",
  REQ("R46", "trophies.Trophy of Speed");
  //"Diploma Trophy",
  REQs(["PA.West Path", "rooms.Classroom"], "trophies.Diploma Trophy");
  //"Trophy of Trophies",
  REQs(trophies, "trophies.Trophy of Trophies");
}
// # logic for blueDoors:
{
  // "blueDoors.Secret Passage",
  REQ("fire.Trading Post (🧨)", "blueDoors.Secret Passage");
  // "blueDoors.Tunnel",
  REQ("fire.Tunnel (Candles)", "blueDoors.Tunnel");
}
// # logic for blackbridgeKey:
{
  requiredByAll("PA.Blackbridge Grotto", blackbridgeKeys);
}
// # logic for PH:
{
  // need a hammer for hammering
  requiredByAll("tools.Power Hammer", powerHammerLocations);
  // no further requirements:
  // • "Greenhouse",
  // • "Weight Room",
  // • "Secret Garden",
  // • "Freezer",

  // "The Precipice",
  REQ("locPrecipice", "powerHammer.The Precipice");
  // "Sealed Entrance" hammered implies basement reached
  REQ("locBasement", "powerHammer.Sealed Entrance");
  // "Tunnel",
  REQ("PA.Satellite Dish", "powerHammer.Tunnel");
}
// # logic for hasFire
// # logic for fire:
{
  // lit candles imply that player knows about them
  requiredByAll("litCandles", [
    "fire.Tunnel (Candles)",
    "fire.Chapel 🐷",
    "fire.Abandoned Mine (Torch Chamber)",
    "fire.Tomb",
  ]);
  // torch implies fire and chess puzzle
  REQs(["hasFire", "chessPuzzle"], "itTorch");
  // need fire to fire things
  requiredByAll("hasFire", fireLocations);
  // Burning Glass implies hasFire.
  REQ("hasFire", "tools.Burning Glass");
  // "Tunnel",
  REQ("powerHammer.Tunnel", "fire.Tunnel (Candles)");
  //  "Tomb",
  REQ("PA.West Path", "fire.Tomb");
  //  "Trading Post",
  REQ("PA.West Path", "fire.Trading Post (🧨)");
  //  "Abandoned Mine"
  REQ("locCartSide", "fire.Abandoned Mine (Torch Chamber)");
  // lighting torch chamber implies reaching precipice
  REQ("locPrecipice", "fire.Abandoned Mine (Torch Chamber)");
  //  "Orchard",
  REQ("PA.Orchard", "fire.Orchard (Sun Dial)");
  // no requirements:
  // • "Chapel",
  // • "Freezer",
}
// # logic for locksFound:
// # logic for locksOpened:
{
  // can be found unconditionally
  // • "Office",
  // • "Drawing Room",
  // • "Drafting Studio",
  // • "Boudoir",
  // • "Study",
  // • "Orchard",
  //"Shelter",
  REQ("PA.West Path", "locksFound.Shelter");
  //"Rotating Gear",
  REQ("locUnderpass", "locksFound.Rotating Gear");
  // found before openened
  for (const lock of CombinationLockList) {
    REQUIREMENTS.push([`locksFound.${lock}`, `locksOpened.${lock}`]);
  }
}

// # logic for R46:
REQs(["locAntechamber", "locUnderpass"], "R46");
// # logic for itCrown
ALIAS("locR46", "itCrown");
REQ("sanctumKeys.1", "itCrown"); // key implied by the crown
// # logic for microchipA:
REQ("PA.West Path", "microchip.West Path");
// # logic for microchipB:
null;
// # logic for microchipC:
ALIAS("microchip.Blackbridge Grotto", "PA.Blackbridge Grotto"); // could also be alias, but user should never interact with itMicrochipC directly.
// # logic for allMicrochips:
REQs(microchipLocations, "rooms.Throne Room");
// # logic for foundUnderpass:
REQ("locGearAndCartSide", "locUnderpass");
// # logic for foundScepter:
REQs(["PA.West Path", "rooms.Treasure Trove", "itAriesKey"], "itScepter");
// # logic for ariesKey:
REQ("locAriesCourt", "itAriesKey");
// # logic for paperCrown:
REQ("rooms.Closed Exhibit", "itPaperCrown");
// # logic for curseMode:
REQs(["PA.West Path", "books.The Curse of Black Bridge", "R46"], "curseMode");
// # logic for artPuzzle:
// # logic for chessPuzzle:
REQ("locPrecipice", "chessPuzzle");
// # logic for realmsPuzzle:
REQ("locR46", "docs.Will of Herbert S Sinclair");
// # logic for locRoughDraft:
REQs(
  ["blueDoors.Secret Passage", "rooms.Throne of the Blue Prince"],
  "locRoughDraft"
);
// # logic for roughDraft46:
requiredByAll("locRoughDraft", [
  "roughDraftMoonDoor",
  "roughDraftArt",
  "roughDraftMoraJai",
  "roughDraft46",
  "roughDraftGallery",
]);
// # logic for basementClutterPuzzle:
REQ("locBasement", "basementClutterPuzzle");
// # logic for locAntechamber:
null;
// # logic for locR46:
REQ("R46", "locR46");
// # logic for locPrecipice:
null; // disjoint paths exist: antechamber & fountain & torchRoomFire | catacombs & orchard & cavern
// # logic for locAriesCourt:
REQ("chessPuzzle", "locAriesCourt");
// # logic for locCatacombs:
REQ("PA.West Path", "locCatacombs");
REQ("locCartSide", "locCatacombs"); // surely they will have interacted with Draxus, right?
// # logic for locGearSide:
null; // disjoint paths exist: powerhammer & basementclutter | westpath & boat
// # logic for locCartSide:
null; // disjoint paths exist: catacombs | antechamber & fountain
// # logic for locGearAndCartSide:
REQs(["locGearSide", "locCartSide"], "locGearAndCartSide");
// # logic for locUnderpass:
REQ("locGearAndCartSide", "locUnderpass");
// # logic for locBasement:
null; // disjoint paths exist: powerhammer | foundation & antechamber
// # logic for locSafehouse:
REQ("locGearAndCartSide", "locSafehouse");

export const displayNameMap = new Map<StateVar, string>([
  ["PA.West Path", "West Gate Path"],
  ["PA.Orchard", "Apple Orchard"],
  ["PA.Gem Cavern", "Gemstone Cavern"],
  ["docs.Electronic Mail", "Network Access (swansong)"],
  ["docs.Security Camera Footage", "Home Security Surveillance (swansonghss)"],
]);

// [automatically generated by IDE, do not modify by hand]:
const allUndefinedState: GlobalState = {
  /*allStockBooks: undefined,
  allShopBooks: undefined,*/
  hasFire: undefined,
  R46: undefined,
  itCrown: undefined,
  itAriesKey: undefined,
  itScepter: undefined,
  itPaperCrown: undefined,
  itTorch: undefined,
  allMicrochips: undefined,
  curseMode: undefined,
  artPuzzle: undefined,
  chessPuzzle: undefined,
  bafflersPuzzle: undefined,
  basementClutterPuzzle: undefined,
  roughDraftMoonDoor: undefined,
  roughDraft46: undefined,
  roughDraftGallery: undefined,
  roughDraftArt: undefined,
  roughDraftMoraJai: undefined,
  litCandles: undefined,
  locAntechamber: undefined,
  locR46: undefined,
  locPrecipice: undefined,
  locAriesCourt: undefined,
  locCatacombs: undefined,
  locGearSide: undefined,
  locCartSide: undefined,
  locGearAndCartSide: undefined,
  locUnderpass: undefined,
  locBasement: undefined,
  locSafehouse: undefined,
  locRoughDraft: undefined,
  "tools.Burning Glass": undefined,
  "tools.Detector Shovel": undefined,
  "tools.Dowsing Rod": undefined,
  "tools.Electromagnet": undefined,
  "tools.Jack Hammer": undefined,
  "tools.Lucky Purse": undefined,
  "tools.Pick Sound Amplifier": undefined,
  "tools.Power Hammer": undefined,
  "PA.Orchard": undefined,
  "PA.Gem Cavern": undefined,
  "PA.Blackbridge Grotto": undefined,
  "PA.West Path": undefined,
  "PA.Satellite Dish": undefined,
  "PA.Blue Tents": undefined,
  "rooms.Dovecote": undefined,
  "rooms.The Kennel": undefined,
  "rooms.Clock Tower": undefined,
  "rooms.Classroom": undefined,
  "rooms.Solarium": undefined,
  "rooms.Dormitory": undefined,
  "rooms.Vestibule": undefined,
  "rooms.Casino": undefined,
  "rooms.Planetarium": undefined,
  "rooms.Mechanarium": undefined,
  "rooms.Treasure Trove": undefined,
  "rooms.Throne Room": undefined,
  "rooms.Throne of the Blue Prince": undefined,
  "rooms.Tunnel": undefined,
  "rooms.Conservatory": undefined,
  "rooms.Lost & Found": undefined,
  "rooms.Closed Exhibit": undefined,
  "books.The History of Orindia (1st ed)": undefined,
  "books.A New Clue": undefined,
  "books.The Curse of Black Bridge": undefined,
  "books.Realm and Rune": undefined,
  "books.Drafting Strategy Vol 4": undefined,
  "books.Drafting Strategy Vol 5": undefined,
  "books.A Sightseer's Guide to Reddington": undefined,
  "books.Swim Bird": undefined,
  "books.The Fixed Stars": undefined,
  "books.The History of Orindia (2nd ed)": undefined,
  "books.EPCW Pump System User Manual": undefined,
  "books.Drafting Strategy Vol 3": undefined,
  "docs.Electronic Mail": undefined,
  "docs.Will of Herbert S Sinclair": undefined,
  "docs.Her Ladyship's Diary": undefined,
  "docs.Birth Certificate of Mary Epsen": undefined,
  "docs.The Blue Prince Manuscript": undefined,
  "docs.The Red Prince Manuscript": undefined,
  "docs.A New Clue Manuscript": undefined,
  "docs.A note containing “steady, deadly, heavy, ready”": undefined,
  "docs.Security Camera Footage": undefined,
  "docs.A note explaining how 86455 relates to 18": undefined,
  "docs.A note with a 5 × 5 grid of words": undefined,
  "docs.A hidden hue": undefined,
  "docs.Baron Bafflers": undefined,
  "sanctumKeys.8": undefined,
  "sanctumKeys.6": undefined,
  "sanctumKeys.1": undefined,
  "sanctumKeys.2": undefined,
  "sanctumKeys.3": undefined,
  "sanctumKeys.4": undefined,
  "sanctumKeys.5": undefined,
  "sanctumKeys.7": undefined,
  "sanctumDoors.Orinda Aries": undefined,
  "sanctumDoors.Fenn Aries": undefined,
  "sanctumDoors.Arch Aries": undefined,
  "sanctumDoors.Eraja": undefined,
  "sanctumDoors.Corarica": undefined,
  "sanctumDoors.Mora Jai": undefined,
  "sanctumDoors.Verra": undefined,
  "sanctumDoors.Nuance": undefined,
  "sanctumSigils.Orinda Aries": undefined,
  "sanctumSigils.Fenn Aries": undefined,
  "sanctumSigils.Arch Aries": undefined,
  "sanctumSigils.Eraja": undefined,
  "sanctumSigils.Corarica": undefined,
  "sanctumSigils.Mora Jai": undefined,
  "sanctumSigils.Verra": undefined,
  "sanctumSigils.Nuance": undefined,
  "trophies.Full House Trophy": undefined,
  "trophies.Explorer's Trophy": undefined,
  "trophies.Bullseye Trophy": undefined,
  "trophies.A Logical Trophy": undefined,
  "trophies.Trophy of Invention": undefined,
  "trophies.Trophy of Drafting": undefined,
  "trophies.Trophy of Sigils": undefined,
  "trophies.Trophy 8": undefined,
  "trophies.Inheritance Trophy": undefined,
  "trophies.Dare Bird Trophy": undefined,
  "trophies.Cursed Trophy": undefined,
  "trophies.Day One Trophy": undefined,
  "trophies.Trophy of Speed": undefined,
  "trophies.Trophy of Wealth": undefined,
  "trophies.Diploma Trophy": undefined,
  "trophies.Trophy of Trophies": undefined,
  "blueDoors.Tunnel": undefined,
  "blueDoors.Secret Passage": undefined,
  "powerHammer.Tunnel": undefined,
  "powerHammer.Greenhouse": undefined,
  "powerHammer.Weight Room": undefined,
  "powerHammer.Secret Garden": undefined,
  "powerHammer.The Precipice": undefined,
  "powerHammer.Sealed Entrance": undefined,
  "powerHammer.Freezer": undefined,
  "fire.Freezer": undefined,
  "fire.Tunnel (Torches)": undefined,
  "fire.Tunnel (Candles)": undefined,
  "fire.Chapel 🐷": undefined,
  "fire.Tomb": undefined,
  "fire.Trading Post (🧨)": undefined,
  "fire.Abandoned Mine (Torch Chamber)": undefined,
  "fire.Orchard (Sun Dial)": undefined,
  "locksFound.Orchard": undefined,
  "locksFound.Office": undefined,
  "locksFound.Shelter": undefined,
  "locksFound.Drawing Room": undefined,
  "locksFound.Drafting Studio": undefined,
  "locksFound.Boudoir": undefined,
  "locksFound.Study": undefined,
  "locksFound.Rotating Gear": undefined,
  "locksOpened.Orchard": undefined,
  "locksOpened.Office": undefined,
  "locksOpened.Shelter": undefined,
  "locksOpened.Drawing Room": undefined,
  "locksOpened.Drafting Studio": undefined,
  "locksOpened.Boudoir": undefined,
  "locksOpened.Study": undefined,
  "locksOpened.Rotating Gear": undefined,
  "blackbridgeKey.Personnel Access (BabbA)": undefined,
  "blackbridgeKey.Admin Access (MoorR, ThomK)": undefined,
  "blackbridgeKey.Archive Access (LeeB)": undefined,
  "blackbridgeKey.Archive Access (RibbJ, WithP)": undefined,
  "microchip.West Path": undefined,
  "microchip.Blackbridge Grotto": undefined,
  "microchip.Entrance Hall": undefined,
  billiardPuzzle: undefined,
};

const sortedStateVars: StateVar[] = (
  Object.keys(allUndefinedState) as StateVar[]
).sort();
export function freshGlobalState(): GlobalState {
  return { ...allUndefinedState };
}

export const numStateVars = sortedStateVars.length;

export function tritToString(t: Trit): string {
  switch (t) {
    case true:
      return "1";
    case false:
      return "0";
    case undefined:
      return "";
  }
}

// for compact save games
export function stateToString(s: GlobalState): string[] {
  return sortedStateVars.map((v) => tritToString(s[v]));
}

export function stringToTrit(s: string): Trit {
  switch (s) {
    case "1":
      return true;
    case "0":
      return false;
    default:
      return undefined;
  }
}
export function stateFromString(S: string[]): GlobalState {
  const s = freshGlobalState();
  S.map((s) => stringToTrit(s)).forEach((t, i) => (s[sortedStateVars[i]] = t));
  return s;
}
