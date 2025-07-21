// Hitori puzzle definitions, must be of the form: WxH:<entries>
// where W is puzzle width, H is height, and entries include the
// number value (or * for blackened, for completed puzzle #0).
// digit values greater than 9 use capitalized hex notation, i.e
// A for 10, B for 11, etc.
const cannedPuzzles = [
  // example completed one
  "7x7:*145763.1*3*2*5.346215*.*61*427.57*13*2.2*76*31.*25*64*",
  // Nikoli sample puzzle
  "7x7:1145763.1333255.3462156.5617427.5741342.2276631.2256647",
  // from godzilla book
  "8x8:43424473.51842364.56547287.42243117.32268115.75361726.37353663.14675832",
  // hardest one
  "17x17:C566F13DGBBCE8974.GH66587AEBB99F33D.DD1F4E6463GAA7899.DDH787C25AEG65F99." +
        "B4E93H3C92F7D6G85.31CA26E9889F7HG14.22BBH9937EA8DCGF6.5F2CABH1114BG6D73." +
        "F758CAG11H853D2E4.E9DDC4A1H42F3976G.BCE4HFG975AD32168.4AAGDDB5C667FEE22." +
        "1AAEDD86BGF4B3H22.88G113FA2CB3HB55E.63957GEB2F3EH4CAA.9G33752FDDH1C1BAA." +
        "9B33655GD7CHEA24F",
];
let puzzleChoice = 2;
let puzzleCount = cannedPuzzles.length;
const demoPuzzles = [1,2];
