
// Akari puzzle definitions, must be of the form: WxH:<entries>
// where W is puzzle width, H is height, and entries define
// the black squares with or without digits at the beginning.
// The value 0-4 is for numbered cells, and * is for a black
// square without a number. a-z define from 1-26 white cells in
// between black cells, or '-' for one space. The first one also
// includes bulb positions (@) that defines a solution.
let cannedPuzzles = [
  // example completed one
  "7x7:4=3_3=3.#2=b4|.3_a3a#3.c#b#.2=a8=4a.c#1_3.a1_4_1a",
  // demos
  "7x7:4a3a3a3.a2c4a.3b3b3.g.2b8a4a.d1a3.a1a4a1a",
  // D1
  "9x9:3c1a3a3.b2b3c.3c2a2b.e4b6.3a4a8b3a.a1a3a2c.3a3a2b1a.c4a5b3.3a5a3b2a",          // Godzilla #53
  "9x9:2a5a6b2a.a1d1a2.3a2b1a2a.a4b8a4b.3g3.b3a3b2a.a2a1b3a3.1a3d2a.a3b4a3a2",        // Godzilla #54
  "9x9:4b4a5b3.a2b3a1b.2h.a2a1a4c.4a4a3a2a3.c2a8a4a.h2.b2a1b2a.3b2a4b2",              // Godzilla #55
  "9x9:a3d3a3.1a2a4b1a.a4a4a1b4.d4b3a.3b3b2b.a1f3.6a2a2a3b.c2c2a.3a2b2b3",            // Godzilla #56
  "9x9:a2a3b6a2.b2a3d.a1g.b1c3a3.4c8b3a.e1c.3a3a2d.g1a.b3b4b4",                       // Marugoto #1
  "9x9:4b6b2a2.i.3a2a2c6.c3b2b.b5a4c4.f2b.2a8a4c3.c1b2b.b4e3",                        // Marugoto #2
  "9x9:a3b5b1a.1b2a2b3.i.2c2a2a6.a3a8a4a1a.5a2a4c5.i.4b4a2b3.a1b4b1a",                // Marugoto #3
  "9x9:3c1a3a3.b2b3c.3c2a2b.e4b6.3a4a8b3a.a1a3a2c.3a3a2b1a.c4a5b3.3a5a3b2a",          // Marugoto #4
  "9x9:4a3b3a1a.a3b4a1a3.4h.b3a3a4a6.a1a1a2a2a.5a8a5a3b.h3.1a2a4b4a.a1a2b3a3",        // Marugoto #5
  "9x9:a1b4b3a.3b4d1.d2a1b.a3a8a3a4a.2c1c3.a4a3a3a4a.b1a3d.1d3b4.a4b4b1a",            // Marugoto #6
  "9x9:2a5a6b2a.a1d1a2.3a2b1a2a.a4b8a4b.3g3.b3a3b2a.a2a1b3a3.1a3d2a.a3b4a3a2",        // Marugoto #7
  "9x9:3a3a2c1.a3d3b.b2b1c.4b2b8a4.a2e2a.4a5b1b2.c1b3b.b3b2a3a.2c2a3a3",              // Marugoto #8
  "9x9:4a2b1b3.a2b3a3b.5a4b1c.h3.b5a4a5b.1h.c1b3a4.b2a3b2a.1b3b2a3",                  // Marugoto #9
  // D2
  "9x9:1a2a3a4a3.a2a4a4a2a.1c2d.a5a4a2b3.b3a8b3a.3b1d3.b1b3a3a.a2b2d.4b4a3b3",        // Godzilla #57
  "9x9:a2b3a4a4.3a4b2a2a.a2a5b4b.5a4d3a.c2a3c.a2d2a4.b3b3a2a.a4a3b2a2.3a2a2b2a",      // Godzilla #58
  "9x9:1a1a4a3a2.a3a2a2a3a.2g3.a2b3b3a.3b4a3b6.a3b4b3a.2g3.a4a2a1a2a.3a2a3a3a3",      // Godzilla #61
  "9x9:2a3a4a3a2.a2a2a2a1a.b1a3d.2d1b2.a3b8b4a.4b4d2.d3a2b.a1a4a1a1a.1a1a2a3a2",      // Godzilla #63
  "9x9:3a4a3a2a2.a2c3a3a.2a1e2.a3b2a1b.4a2b2a1a.a1b2a5a4.b2b3c.3c1a2b.a2a3a3b3",      // Godzilla #64
  "9x9:2b4b5a4.b3b4a2a.f1b.1a2a3c4.a4a3a3a3a.2c4a5a4.b1f.a2a2b3b.3a5b4b3",            // Marugoto #10
  "9x9:4a3a3b3a.a1a3b3a2.4a2a2b2a.a1a1e.2a5a8a4a4.e2a2a.a3b3a2a6.1a2b2a1a.a4b4a2a3",  // Marugoto #11
  "9x9:2b5b4a2.a1e1a.d1a3b.a4a8a2a3a.3a1a3a3a3.a2a2a2a6a.b2a2d.a2e3a.4a3b1b2",        // Marugoto #12
  "9x9:3a1a1a3a3.a2a1e.b2a7a4b.3d2b5.a2b4a3b.h3.3a2a3a4b.a2a3a3b4.2a3d2a",            // Marugoto #13
  "9x9:1a3b3b3.a2g.2a3a1a2a6.a4a1a3a3a.b1a2c4.3d3a6a.a4b6a1a3.e1a2a.3a3a5a5a3",       // Marugoto #14
  // D3
  "9x16:a3a2a5a2a.2a3a2a2a2.e3c.a2b1a1b.4a4b4b4.a3b1a1b.2a2b5c.a4a4b2a4.d2d." +
       "3b5a3a2a.b1e3.d4b2a.3a3c2a4.a1a2e.1a2a3a3b.a2c2b3",                           // Godzilla #65
  "9x16:a2a2a3a3a.2a2a4a1a2.e2a3a.a3b5a3a5.5a3b2a3a.a2f2.b3a4b3a.a3a1e." +
       "2a1a4a3a2.a4a2e.3a1a2b3a.a5a2b3a3.3a3b1c.a2a2c3a.2a3a2a3a2.a2a6a3a2a",        // Godzilla #66
  "9x16:2a3b2b2.a1b2d.2e1a3.b4a8b2a.2b1b2a4.e1c.1a1a4b2a.a3a2d2.2d3a3a." +     
       "a5b5a2a4.c1e.3a2b2b3.a2b3a1b.4a4e3.d2b1a.3b4b2a3.",                           // Godzilla #67
  "13x22:1a2b2b3a2a2.i1a2a.3b3b3a3a1b.a3c1f2.b3c4b1c.3g2b4a.b5b2f3.i2a3a." +   
        "3a4a1a1a1a1a5.e3c4c.a3a3c1d3.2d2c4a1a.c5c2e.2a1a3a3a3a5a4.a4a2i." +
        "3f3b4b.a4b3g2.3b3b3c2b.g4c2a.b1a1a2b3b4.a1a1i.2a2a3b3b2a3",                  // Godzilla #69
  "9x9:3b3b4a2.a2c1c.b1a4a2b.3d2b3.a2b5b1a.4b2a2b2.b1a3b2a.a1c2b1.2a3d3a",            // Marugoto #15
  "9x9:4b4b4a4.b1a1d.2b1d3.d2a2b.4a4b3b4.a4b4b2a.2a1c2a2.a2e1a.2a4a3a4a2",            // Marugoto #16
  "21x35:a1a3b4a2a2a4b3a2b2.3c2b1e4b6a2b.b4c3a2c3d2a2a.a2a4a5a3b2b4a2d2." +
        "3a2a2a4a3c2c2d.a4a3a3a2b5b4a4a3a1a.3c4f4b3a3a2b.a2a2b3a4a3a2b5a4b5." +
        "4a2b4a1a3a7b2a1a1b.a2a3b5a4d1a3a3b4.3c4f2i.a2a2b4b5b5a3a3a4a4." +
        "e5b3a4f2a2a.4a3a5i1a2a2a3.a3a2a3a3a4b6b3a3a4a.3a2a3a2a2a4b2b4a3a3." +
        "a2a3e4k.4a4a2c2a3a5a3b5b3.a1a3b3b6c2b3d.1a3b3a3b1g2a2.a3a4b2b4b6b2a4c." +
        "2g2b2b2a2a3a2.a2a6a4a6d2b1a4c.5a4a4a2a2b4b8a3a1a2.a1a4a2a7b4b4a2a5a3a." +
        "b4e2b3b4c2b.3c6b7a3c2a2a1b3.a3a2o2a.3a5a5a3b3a4b5b2b3.e2a3e1d4b." +
        "3b2b3b2d2b2a3a.b2b3a3c5a5b5a5a3.4c1a3a3a3a2a2b1a4a.a3a5a5a3a2a3a4b2a1a2." +
        "4a4a4a4a3a3a3a4b4a4a",
];

let puzzleChoice = 1;
let puzzleCount = cannedPuzzles.length;

// which puzzles have demos
const demoPuzzles  = [1,17];
// which puzzles are at which level [D1,D2,D3,D4]
const puzzleLevels = [1,15,31,99];

const demoText = [
 ["<p>In this demo we will walk through the steps of solving this puzzle. " +
    "Press the 'next' button to walk through the solving steps, or the " +
    "'back' button to return to the previous step.</p>" +
    "<p>At the beginning of a solve, there are no errors, but there are " +
    "many incomplete digits. For our first time through we can " +
    "turn on Assist Mode 2 to see any errors that we might generate in the " +
    "process of the solve, and to see the digits as they are completed.</p>",
  "<p>To start in Hashiwokakero, we want to look for circles that are " +
    "constrained right off the bat. These are typically high digit " +
    "numbers and circles on the edges. First let's look at one that " +
    "is not solvable to understand the constraints search. The '2' in " +
    "the first column needs two bridges. They could both go north, or " +
    "they could both go east, or there could be one bridge in each " +
    "direction. We can't progress on it yet.</p><p>There are two easily " +
    "solved digits though, the '8' circle in the middle ('8's always " +
    "require 2 bridges in each direction), and the '4' in the upper left, " +
    "since it only has two directions it can go. Both require two bridges.</p",
  "Now quickly we can see many other digits that are solvable, either due " +
    "to restrictions based upon their numbers, or simply by the fact that " +
    "they are not allowed to add bridges that cross other ones. In the " +
    "latter category, consider the '2' in the upper left. With the bridge " +
    "south of it, there is only one direction it can connect - to the east. " +
    "Similarly the '1' in the lower left. There are others, but let's " +
    "start with those two.",
  "There are other solvable digits, but let's make a quick observation " +
     "about the '3' in the upper right. We don't (yet) know which of its " +
     "two neighbors will get the double bridge, but we can at least put " +
     "down one in each direction since we know to tally to '3' there must " +
     "be two in one direction and one in the other. This sort of inference " +
     "method can be important in more challenging puzzles.",
  "Since this is an easy puzzle to start with, we can already see most " +
     "of the remaining digits are solvable at this stage. The leftmost '3' " +
     "in the top row is completed with a bridge to the right, which means " +
     "the neighboring '3' requires to bridges to its right. The '4' in the " +
     "upper right can only connect downwards. The '1' on the second to " +
     "bottom row only has a right neighbor, which cuts off the unsolved " +
     "'1' on the bottom row, so it must go west.",
  "Now only four '3' digits are unsolved. The two on the right column can " +
     "only be solved with a double bridge. And the last two both require " +
     "one more bridge each. This completes the puzzle with one continuous " +
     "connected path of bridges.",
  "Congratulations! The puzzle is solved!"],
 ["<p>In this demo we will walk more quickly through the steps of solving " +
    "a tougher puzzle. It is recommended to go through demo 1 first. Press " +
    "the 'next' button to walk through the solving steps, or the 'back' button " +
    "to return to the previous step. You can also use the undo button to move " +
    "backwards individual steps, or continue playing forward if you wish.</p>" +
    "<p>On the initial board there is only one obvious complete solve - the " +
    "'6' on the right column - and another - the '4' in the lower left - " +
    "that upon closer inspection is also solvable. In addition, there are " +
    "several in some corners where we can begin to place a single bridge " +
    "in two directions when the value is one less than the bridge options.</p>",
  "Now we make a new observation in the upper left corner. There are two '1' " +
    "digit circles next to each other. They can not connect to each other, " +
    "else they would have no way to connect to the rest of the final bridge " +
    "path. Thus they must connect to their opposite neighbors. Also, given " +
    "the previous assigned bridges, we can infer at least one in each " +
    "direction for the top row '3', as well as a few other similar " +
    "conclusions given the new bridges.",
  "At this point with our present methods, we can only definitively add " +
    "three more bridges. The upper '3' in the right column can only add " +
    "a bridge to the north. Similarly the '3' in the bottom can be solves, " +
    "as one of its neighbors is already completed. Finally the '1' near the " +
    "bottom row only has one direction available.",
  "We can actually complete the triad of incomplete circles in the upper " +
    "right, even though it appears the '2' has two options. The '3' SE of " +
    "it, however, must send at least one bridge to the right, which blocks " +
    "off the '2's south option. Thus it must be completed to the east. " +
    "Adding that bridge completes the NE '3', which means the SE '3' must " +
    "have a double-bridge to the west.",
  "At this point there are several bridges that are easy to complete. " +
    "Finishing them off will help us with those that are still " +
    "undetermined.",
  "The key to the puzzle now lies on the '4' just left of center with only " +
    "one bridge to the east, needing three more bridges. It has open " +
    "neighbors in each direction, but the ones to the south and east are " +
    "both completed. The '2' to the north only needs one more bridge, " +
    "which means the final two must connect to the '3' to the west.",
  "Now all of the remaining circles are constricted enough that the solution " +
    "completing them should fall out easily. Finding the critical cell like " +
    "the '4' in the previous step is often the key to a more difficult puzzle",
  "Congratulations! The puzzle is solved!"]];

const demoMoves = [
  [[],
   [],
   ["N43","N43","W43","W43","S43","S43","E43","E43","E00","E00","S00","S00"],
   ["E11","E11","E61"],
   ["W06","S06"],
   ["E02","E04","S15","S15","E54","W65"],
   ["S26","S26","E20"]],
  [[],
   ["N48","N48","W48","W48","S48","S48","N71","N71","E71","E71","N80","E80",
    "W88","N88","E11","S11","S17","W17"],
   ["S00","E02","S04","E04","E06","S20","W57","S57"],
   ["N28","W88","E75"],
   ["W37","E15","W37"],
   ["E04","W45","W57","W86"],
   ["N43","W43","W43"],
   ["S11","S60","E82","E51","S54"]]];
