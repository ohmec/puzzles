// Slitherlink puzzle definitions, must be of the form: WxH:<entries>
// where W is puzzle width, H is height, and entries define
// the initial or current values. 0-3 are digit values, a-z
// define from 1-26 spaces in between digits, and '-' is one space.
let cannedPuzzles = [
  // solved #1
  "6x6:a32a32.03b0a.d23.21d.a3b21.10a02a:5c.22.5c.9a.fb.06:14.e8.84.60.84.72",
  // simple ones
  "6x6:a32a32.03b0a.d23.21d.a3b21.10a02a",                              // vol3 example
  "7x7:a20a33a.1b1b1.a30a13a.c3c.a23a21a.3b1b3.a21a23a",                // box2014 example
  "7x7:10a0b2a3b203g10a0a30g230b2a2b3a20",                              // vol3 example
  "7x7:1b2a13.0a2d.b3a30a.3b2b1.a31a2b.d2a3.02a3b3",
  // D1s
  "10x10:1b2a23333.0b2a2d.2b3a3d.2b0a12132.2011f.f0132.30321a2b1.d1a2b3." +
        "d0a3b2.01023a0b0",                                             // vol3 #1
  "10x10:a23d02a.2b2a23b1.0b32a2b2.a12d33a.a2b22a0b.b3a21b1a.a02d33a." +
        "1b2a20b2.1b22a3b1.a20d23a",                                    // vol3 #2
  "10x10:a33a33b3a.3b0b3a1a.3b3b2a3a.a12a01b0a.c3b3a33.13a3b3c.a3b23a23a." +
        "a1a2b1b3.a3a3b0b1.a2b23a13a",                                  // vol3 #3
  "10x10:33a201d.a2e213.b3b03b3.0b23e.2e32a3.2a30e2.e03b1.3b02b2b.302e2a." +
        "d233a20",                                                      // vol3 #4
  "10x10:2233b1b1.c0b2b1.2323b1020.c2231c.2212b3c.c2b2111.c1312c.3220b2113." +
        "2b2b3c.0b2b2010",                                              // vol3 #5
  "10x10:b3d33a.a30a3b0b.d30d.33f21.a1a01a2b3.3b3a33a2a.22f30.d32d." +
        "b2b3a33a.a20d1b",                                              // box2014 #1
  // D2s
  "10x10:a33a13a31a.1b0b1b3.2b3b2b2.3b1b0b3.j.j.3b3b3b3.1b2b3b3." +
        "1b3b2b1.a20a13a20a",                                           // box2014 #2
  "10x10:a02b20c.b2c1b3.d33b03.03c1d.2a10c0b.b3c12a1.d0c23.30b22d." +
        "3b0c3b.c11b32a",                                               // box2014 #3
  "10x10:a3b32b2a.0h2.2c30c0.a2a2b2a2a.b1d3a2.2a1d1b.a2a2b2a3a.3c32c3." +
        "1h2.a1b20b2a",                                                 // box2014 #4
  "10x10:a0b02a11a.3b3e1.1a3b3a1b.d2c3a.2a1c3b1.3b3c0a2.a0c3d.b3a3b1a2." +
        "2e2b0.a20a33b3a",                                              // box2014 #5
  "10x18:c3b2c.31b33b32.b3d0b.b3d3b.11b11b22.c3b0c.c3b1c.21b13b30." +
        "b0d2b.b2d2b.23b11b32.c3b3c.c3b3c.31b23b33.b3d0b.b3d3b." +
        "30b33b23.c2b2c",                                               // vol3 #42 "fun"
  "10x18:d3a21a3.a32c32a3a03a0e.f10a1.3a1a2a22a0.i2.03a33a13b.12a12d3." +
        "f31a2.1a23f.2d23a11.b33a23a20.1i.1a20a3a3a3.2a32f.e1a31a." +
        "1a11c22a.2a12a2d",                                             // vol3 #46
  "10x18:11b02b13.33b23b13.b2d3b.c1b1c.22f33.01b32b02.c3b1c.b0d2b." +
        "31b31b21.13b13b02.b2d2b.c2b2c.10b23b11.32f11.c2b3c.b2d1b." +
        "12b32b21.21b11b31",                                            // vol3 #47
  "10x18:22b32b13.33b11b32.b22b20b.b01b31b.23b22b31.31b23b23.b31b12b." +
        "b23b13b.22b23b32.03b10b22.b03b12b.b22b31b.12b30b03.31b22b23." +
        "b12b21b.b32b32b.22b23b21.13b02b33",                            // vol3 #48
  // D3s
  "25x15:b2a3a3a0f2f1a1.33b2a2b3322e331a1a0.c2c3e3c2d3b.103e3312b3a2b020a23." +
        "e3f2a3a3a3c1b.122e211a2a2a2a2a1a1a2.c2c3d1c2a3a1a2b." +
        "20b2a3b231a123b1a3b23.b3a2a3a3c1d3c3c.2a3a3a1a1a1a3a232e113." +
        "b2c1a2a2a0f0e.32a132b1a2b2202e102.b3d3c3e3c3c." +
        "3a2a233e2303b1a3b30.3a2f1f2a1a3a2b",                           // box2014 #6
  "25x15:c32b102b1b011b10c.22a30a2c2c1c1a21a13.03f2a1a2a0a3f31.e1a2a3b0b3a1a3e." +
        "b23b1k3b33b.b10b3b3a0a0a2b1b20b.1e0k2e2.1b311b0a0a3a3a0b331b2." +
        "3e1k2e0.b11b1b3a0a3a3b3b10b.b21b1k1b32b.e0a0a1b1b3a3a0e." +
        "23f1a2a2a2a0f32.30a21a3c2c0c2a11a10.c20b010b0b202b11c",        // box2014 #7
  "25x15:d1b2i1b3d.a22b03c20102c12b31a.a23e3g3e12a.a10a1a2d3a3d1a3a10a." +
        "a21b2b211a3a103b1b11a.d3a3k1a3d.2j1a3j2.0a113b110e133b020a0." +
        "1j3a1j1.d3a3k3a3d.a12b0b133a3a220b2b23a.a32a3a3d1a3d1a3a20a." +
        "a03e1g0e31a.a32b31c31302c02b11a.d3b3i3b3d",                    // box2014 #8
  // D4s
  "31x45:333a1c22c02a32c33c1a010.d1a0a33a2c2c0a02a3a0d.2a31b3d2a3c0a3d1b13a3" +
        "0d2b123c133c221b0d3.a33a0b3d3e3d0b2a12a.d2a1b3a0a12a20a1a2b1a3d" +
        "2a33b3a22a3g1a31a1b01a1.0d0e2a01a22a1e3d3.2a2a3b3a12b3c1b31a1b1a2a2" +
        "b2a1a13d1b3b3d03a3a3b.33g12b0c3b30g23.c021a31b3a11a13a1b31a303c" +
        "a23c3d0g1d2c03a.d2c32c33a13c32c1d.3a201a1a03a12e21a31a1a011a3" +
        "2a2c1g010g2c2a2.2c020a31a32a1a1a01a31a123c3.b2f2a22a010a33a2f0b" +
        "13b2a32a2a21e22a3a22a2b23.c32a32f3a1f12a23c.30g23a1b2b0a13g12" +
        "a3a2112a2c2a2a2a1c2a1230a3a.a2a2b3a0a23b3a3b21a2a1b2a0a" +
        "a1a0321a2c2a2a2a3c1a2110a1a.23g33a3b3b0a03g33.c31a32f3a3f22a32c" +
        "31b2a22a3a22e22a0a11a0b23.b0f2a22a212a12a2f1b.2c101a11a13a0a0a02a22a231c3" +
        "2a1c2g333g2c2a3.0a221a2a12a22e32a02a2a232a3.d3c10c23a22c11c1d.a31c1d3g3d3c33a" +
        "c331a12b3a33a33a2b12a230c.31g33b2c2b11g33.b1a1a33d3b0b0d23a1a2b" +
        "3a3a3b1a31b1c2b03a3b2a3a0.2d0e3a02a33a3e3d1.0a32b3a22a1g3a31a1b21a0" +
        "d3a3b0a3a10a33a2a3b3a3d.a21a1b0d0e3d0b3a32a.2d0b121c323c211b3d3" +
        "1a32b1d1a2c0a3d2b11a1.d3a3a30a3c2c0a03a2a3d.022a3c23c02a32c32c0a311",  // big book page 80
];
let puzzleChoice = 2;
let puzzleCount = cannedPuzzles.length;

// which puzzles have demos
const demoPuzzles =  [1,7];
// which puzzles are at which level [D1,D2,D3,D4]
const puzzleLevels = [1,11,19,22];

const demoText = [
 ["<p>In this demo we will walk through the steps of solving this puzzle. " +
    "Press the 'next' button to walk through the solving steps, or the " +
    "'back' button to return to the previous step.</p>" +
    "<p>At the beginning of a solve, there are no errors, but there are " +
    "many incomplete numbers which we need to solve by placing walls or " +
    "borders around those cells. For our first time through we can turn " +
    "on Assist Mode 2 to see any errors that we might generate in the " +
    "process of the solve, and to visualize the groups better.</p>",
  "<p>Just by turning on assist mode 2 we see that the four '0' digit rooms " +
    "are satisfied already. But let's learn about other 'easy' starting " +
    "points for Slitherlink.</p><p>In a Slitherlink board, all of the " +
    "cells have multiple ways to be solved except for '0' cells. However, " +
    "when in combination, two numbered cells can affect each other in a " +
    "way that makes them constrained to just one, or at least, a smaller " +
    "number of solutions.</p><p>One such pairing is a '0' directly adjacent " +
    "with a '3'. In these instances, we know that all three of the other " +
    "walls around the '3' must be set. In addition, its walls must move " +
    "away from that '0' at the shared vertices. We can set these now for " +
    "the three such pairs on this board.",
  "Already we can see how much progress can be made with this one " +
    "application. Now let's take advantage of the 'x' feature of the player " +
    "and mark all those walls on completed digits so that we can visualize " +
    "their potential solutions better.",
  "The primary thing to remember in this puzzle is that you must make " +
    "one complete loop around the board. Thus every vertex that has one " +
    "line segment going into it needs another to match up with it. That " +
    "other segment must move to a legal location. Looking at two in " +
    "particular at this stage, first, the one dangling end on the '3' " +
    "in the upper left, in order to complete the third segment around " +
    "the '3' it must connect to the right. Next, looking at the '2' on " +
    "the left edge, its dangling segment has nowhere to go but to the " +
    "the left. Once that is placed, it still needs a second wall so it " +
    "must then move down. That then can 'seek out' its connection to the " +
    "rest of the loop with one more step down, its only option at this " +
    "point.",
  "We can pause in border building again and do some more 'X'ing of walls. " +
    "In this case, taking advantage of the rule that one vertex can only " +
    "have two connections - that is, the loop can not intersect with " +
    "itself - we can 'X' out other walls where a vertex already has its " +
    "two connections. As you improve in your solving, you will need to " +
    "use the X technique less often, but it can be helpful when starting.",
  "Now looking at the current  segment ends, we can use the previous " +
    "mindset to search for legal directions the ends can move. Starting " +
    "at the top, the one next to the unsolved '2' must clearly move " +
    "first to the east, then down, completing that '2'. Then, the one " +
    "on the right wall can only move downwards - for one segment now " +
    "at least. Finally, the one near the bottom must avoid the '0' and " +
    "move at least one segment northward.",
  "Now we can make another digit pairing observation, again with a '0' " +
    "and a '3', this time when arrayed diagonally adjacent. In these " +
    "instances it is always the case that the vertex where they meet " +
    "<b>must</b> have two segments. If not, there is no way for the " +
    "three segments around the '3' to avoid the '0'. We can set those " +
    "two in this case, and in all 0/3 diagonal instances in the future",
  "More small progress can be made on the right side, completing the '3' " +
    "and moving downwards. Meanwhile, we can place the only possible " +
    "solution for the other wall around the unsolved '2' in the upper " +
    "right, giving us an indication of where the loop must eventually " +
    "travel.",
  "Now, finding a destination for the dangling segment around that '2', " +
    "we can first connect up the upper segment. It has nowhere it can " +
    "go except to the west one, then down two to eonnect to the growing " +
    "loop. The other segment is thus constrained to move down at least " +
    "one cell.",
  "We are close, but the path isn't instantly obvious yet. Let's focus " +
    "on the '2' on the lower border, since it already has one 'X' on " +
    "one side. We could consider the lower wall to also be 'X' since " +
    "a segment there would have nowhere else to go. Thus the answer " +
    "must be two walls on the NE vertex.",
  "With that drawn, the solution for the '2' should be clear. Then, " +
    "there is only one place the dangling segment on the lower edge " +
    "can go, and that is left and then up.",
  "Congratulations! The puzzle is solved!"],
 ["<p>In this demo we will walk more quickly through the steps of solving " +
    "a tougher puzzle, using some of the more advanced techniques that were " +
    "not needed in the first one. It is recommended to go through demo 1 " +
    "first. Press the 'next' button to walk through the solving steps, or " +
    "the 'back' button to return to the previous step. You can also use the " +
    "undo button to move backwards individual steps, or continue playing " +
    "forward if you wish.</p>" +
    "<p>Let's start by 'X'ing around the '0' cells, and then we'll " +
    "introduce two new number pair solving methods.",
  "We could at this point apply several adjacent-3-0 or diagonal-3-0 " +
    "solutions, but let's focus on three new ones. First is an adjacent " +
    "'3'-'3' method similar to '3'-'0'. In this case we can't complete " +
    "all three edges, but we can always conclude that the walls between " +
    "the '3's must always be drawn (else a 2x1 loop would form). In addition " +
    "it can be proven that the same direction wall must be drawn outside the " +
    "'3' cells as well. How all these walls are connected into the loop can " +
    "not yet be algorithmically determined. We can draw 21 such walls at " +
    "this stage.",
  "Another similar algorithm would be for '3'-'3' diagonal pairs. In this " +
    "case we can determine that their adjoining single vertex can not " +
    "have 4 line segments, nor even 2. It must have zero, and thus the " +
    "outer walls in that pairing must be set. Again, how those are connected " +
    "is not yet determinstic, though in some cases this pairs with previously " +
    "set walls to complete a cell.",
  "Now we can apply the '3'-'0' methods (both adjancent and diagonal) to " +
    "apply several more walls.",
  "At this stage there are many segments on the board. We can apply the " +
    "'nowhere else to go' line of solving to connect many of those segments, " +
    "though one must be careful to analyze all possibilities and not make " +
    "incorrect assumptions. You can toggle back and forth on the 'prev' and " +
    "'next' buttons to see if you agree with the segment additions.",
  "Let's take a moment to apply more 'X's to make the next moves more " +
    "obvious. We can apply the two types before: ones where a number is " +
    "already satisfied, like the '1' in the upper right; and ones where " +
    "there are already two segments on a vertex.",
  "We could do lots of 'nowhere else to do' moves at this stage, but let's " +
    "add one final method, built upon the ones already learned. The thing " +
    "here is to observe that we've effectively 'zeroed' out several '1' " +
    "cells, and thus we can use the '3'/'0' trick on them. One horizontal " +
    "example is in the upper right, and another is in the lower left. A " +
    "diagonal version is in the lower left between the '3' and the " +
    "'zeroed' '1' cell. We can thus apply the same tricks as if those were " +
    "'0' cells. Note we can't do the same trick with the '3' above the '1' " +
    "in the left corner since the existing edge nullifies this method.",
  "When a board is this segmented, it might be helpful to visualize the " +
    "loop that is forming. The puzzle player has a feature to help with " +
    "this, by allowing the user to gray out cells that are determined " +
    "to be inside the loop. This isn't required for a solution, but can " +
    "help picture the solution required in some instances. We can't " +
    "determine all of the cells that will be inside the loop, but many on " +
    "the edge can be colored at this stage.",
  "There are now many places where we can make 'nowhere else to go' progress " +
    "on the board, including at the top center, top left, and bottom right. " +
    "In addition, we can complete some numbers like the '2' in the lower " +
    "left section.",
  "We can be patient and do some 'X'ing and cell coloring at this stage, " +
    "to help with the final connections.",
  "There are still several areas of uncertainty, but also many line " +
    "segments that we can make progress on. The incomplete '1' near " +
    "the center top has only one option for its one wall, as does the " +
    "'2' next to it. Many of the vertices around the two '3' cells in " +
    "the left side of the board have options, but the NE-most one is " +
    "constrained to connect down. Once that is in place, the other " +
    "wall around the '3' can be placed. The '2' at the bottom of the " +
    "board is constrained and so its southern segment must connect to " +
    "the left. And finally the segment next to the completed '3' in " +
    "the bottom right of the board has only one direction to go.",
  "Getting closer, but still many options. Does the '3' against the " +
    "right wall connect upwards, or to the left? Both could work given " +
    "the local constraints, so we can't solve it just yet. Tackling the " +
    "ones we can solve, let's start on the left wall. There are two " +
    "legal directions the dangling segment could go, but only the " +
    "downward direction will satisfy the '1'. The incomplete '3' on " +
    "the second to bottom row can only be satisfied in one direction " +
    "of the sweep and continue to connect inwards. With these pieces " +
    "placed we are getting nearer to completion.",
  "The two incomplete '2's near the center can now be completed. The " +
    "lower of the two has no other options, which then constrains " +
    "the upper '2'.",
  "This completion in that region allows us to move to the right and " +
    "finish off the '3' next to it. Then the '2' to the right of it " +
    "can be completed, and then the '1' diagonally adjacent.",
  "Now at long last the '3's on the right wall can be determined. " +
    "In this way you can see that certain numbers like these two " +
    "must wait until all of the rest of the board is completed " +
    "before their constraints are clear.",
  "Congratulations! The puzzle is solved!"]];

const demoMoves = [
 [[],
  [],
  ["E00","N11","E11","S11","E20","S03","W04","N04","E04","S05","S40",
   "W41","N41","E41","S42"],
  ["n10","w10","s10","w14","s14","e14","w31","n31","e31","w53","n53",
   "e53"],
  ["N01","N30","W30","W40"],
  ["w02","s02","n22","w22","s32"],
  ["N02","E02","E15","E42"],
  ["N25","W25"],
  ["N35","E35","W24"],
  ["N23","W23","W33","E33"],
  ["N54","E54"],
  ["W44","S55","E55","E45"]],
 [[],
  ["n13","s13","e13","w13","n34","s34","w34","e34","n38","w38","s38",
   "e38","n86","s86","w86","e86"],
  ["W01","W02","W03","W04","W05","W06","S00","S10","S20","S33","S43",
   "S53","S36","S46","S56","E47","E48","E49","S41","S51","S61"],
  ["N01","W10","N05","E16","S16","E56","W65","S65","N68","W68","E79",
   "S79"],
  ["N22","W23","S23","E23","N24","S27","W28","N28","E28","S29","N47",
   "S48","N49","N95","E95"],
  ["E20","S02","N03","S04","E29","E19","E59","E43","W53"],
  ["n18","w18","e18","n27","w27","w56","n67","w67","w89","s89","e89",
   "n31","w31","n32","e32","e42","s42","n62","e62","n54","w54","w71",
   "s71","e71","n74","e74"],
  ["S07","W08","N08","E08","S09","N80","W81","S81","E81","N82","N98",
   "E98"],
  ["101","103","105","108","110","111","112","113","114","115","117",
   "118","119","121","123","127","129","146","147","149","157","158",
   "159","167","179","130","131"],
  ["E15","W25","E21","E31","S32","W30","W46","S98","S97","S96","W95",
   "S94","S91"],
  ["w26","126","125","s31","141","e41","142","143","152","S90","W90",
   "W80","180","190","191","192","S92","w92","n92","182","194","184",
   "185","186","196","197","198","n97","e35","s35","w94","n94"],
  ["S25","S26","E51","W61","161","S62","162","S93","193","E87","187"],
  ["W40","S40","140","W83","S83","E83","w73","s73"],
  ["N73","E73","N64","163","164","174","175"],
  ["E65","166","S67","E76","176","S77"],
  ["W69","E69","W79"]]];
