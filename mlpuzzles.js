// Midloop puzzle definitions, must be of the form: WxH:<entries>
// where W is puzzle width, H is height, and entries define
// the circles (* for mid-cell, or >V<^ for on the wall in that
// direction); a-z define from 1-26 spaces
// in between circles. The first one has some solution path information.
// The path information defines the solution, FJL7 for turns,
// and _| for straight edges
let cannedPuzzles = [
  // example completed one
  "5x5:>d.Va*b.d*.b**a.e:F7aF7.|L_J|.|aF7|.L7|||.aLJLJ",                              // 6  2020 demo solved
  // demos
  "5x5:>d.Va*b.d*.b**a.e",                                                            // 6  2020 demo
  "7x7:>d*a.bVd.*c*b.a>a>Va*.b>^c.b^<>b.a>c*a",                                       // 16 marugoto demo
  // D1
  "6x6:Va*aVa.>VVa>V.a>a*b.f.*>VaV*.>^b>a",                                           // 18 2020 #1
  "6x6:a*Va*a.*a>c.b*aVV.b>c.Vb>Va.a>b>a",                                            // 14 2020 #2
  "6x6:aVa*b.>b*b.>e.a**c.>b*b.a*b*a",                                                // 11 2020 #3
  "6x6:>aV*b.Vc*a.b*a>a.aVc*.d*a.a*d",                                                // 11 2020 #4
  "10x10:b*c*a>a.*a*f*.j.Va*bV*a*a.dVa>a>V.Vb*a>^a>a.>Vb>^a*b.cV^Va*b.*d>cV.a>e>b",   // 34 2020 #5
  "10x10:b*c*c.*b*e*.f*c.e*b*a.a*b*b*b.*d**a*a.d*e.d*d*.*a*d**a.a*c*d",               // 24 2020 #6
  "10x10:a*a>b*c.bVaVd*.*e*aVa.j.b*b**a*a.b*e*a.j.Vc*b>a*.b*b*d.a*d*c",               // 23 2020 #7
  // D2
  "10x10:>b>a>d.a*aVdVV.e*d.*g*a.h*a.b>c>b*.f*a>a.a*a*a*a*>a.*i.a*e*b",               // 24 2020 #8
  "10x10:c>d>a.eV*c.d*a*Vb.b**a>d.VhV.aVb>a>c.j.d**bVa.j.c*c*b",                      // 20 2020 #9
  "10x10:d>e.a>V>Va>aVa.f^>b.j.b*a*b*a*.g*b.eVa*b.bVa*b>b.d*b^b.e*d",                 // 22 2020 #10
  "10x10:d*a>c.aVc*b*a.>a*aV>a>b.^b>b*c.b>^b>aVa.b>b>^b*.aVb>^d.b*a^b>b.d*a>^b.g>b",  // 31 2020 #11
  "10x10:f*c.aV<b*aVb.a>VaVc*a.aV<*c>b.V>dV*aV.j.a*b>b>b.bVV>b>b.b>d*b.d>e",          // 28 2020 #12
  "10x10:b*Vc>b.f*bV.*V>dVVa.b>a>b>b.g>b.j.a*>aVaVc.*bVcVaV.b>d>b.b*d>b",             // 26 2020 #13
  "10x10:e*d.VVc*d.j.a>d*a**.j.b>g.VVa*a*a*b.h*a.b*d*b.b*d*b",                        // 19 2020 #14
  "10x10:aVh.VaVc*c.d>c*a.d*e.b>c*bV.e*d.a>a*a*a*b.aVVa*a*c.a>e>b.d*b^*a",            // 24 2020 #15
  "10x10:a>e>b.a>Va*e.hVa.*Vc*d.c>b>c.c^*VbVa.fVVaV.a*a*aVa>Va.f>c.a*h",              // 25 2020 #16
  // D3
  "10x10:a*f*a.Vb**b*Va.b>cVc.b*g.d*aVc.a>e**a.aV**b>a>V.d*e.VbVbVV*a.a>h",           // 28 2020 #17
  "10x10:e*d.a**c*c.*b*e*.e*d.a>e*b.e*b*a.c*f.a*bVe.j.>d*b>a",                        // 18 2020 #18
  "10x10:d>e.VVaVaVaVb.d*a*c.d*cVa.a*aVaVaVb.iV.j.*c*e.b>aVVc*.b*d*b",                // 23 2020 #19
  "10x10:d*e.b>b>d.V>eV*V.a^b*Vb>a.h>a.a*d*c.bV*b*bV.a*bVcVa.*aVbVd.d>e",             // 26 2020 #20
  "10x10:>b*c*aV.d**b>a.e>b*a.*b>c*b.a*a^f.d*c>a.d*dV.b*c*c.j.c*a>b*a",               // 23 marugoto #6
  "17x17:a>Vb*a>d>d.b>VbVbVa*c*a.*b>Vh>c.c*f*a>^Vb.c>c*cV^<c.a*b>Vg^<b." +
        "b*b>b>e*b.d*a*eVcV.d*cVVa>e.a*dVc>^a>Vb.e>c>^aVa>b.c*>^d*b*c." +
        "**a>^b***a*a>c.d*g>^a*a.h*b>^d.a**b*bVa>^a*b*.a>a>f^>c*a",                   // 87 marugoto #7
  // D4
  "17x17:bVVVVVVVVVVVVVb.a*m*a.h*eV>a.b*aVaVaVVaVe.c>a>a>a>a>c*a.a*g*g." +
        "a>Va>bVaV>a*>a*a.d>a>d*e.**e>e*b*.a>k>a*a.b**aV**i.a>e>b*b*>b." +
        "a*bVa*b*a*a>c.nVb.a*aVaVaVbVa*b>a.a*c>a>a>cVbV.h*h",                         // 83 2020 #21
  "17x17:f*j.c>VeVb>c.*b^b*bVb>d.a*c*gVa*a.a*Vc*b>g.c>d*e>aV.aVb>dVaVa*a>a." +
        "a>a>aV<b>VaV*a*a.c*eV>b>c.a>e*VeVb.*a*VaVc>aVVcV.>h>a>a*c." +
        "dVb*bVb>Vb.e*aVf>Va.a*f*>b*Va>a.c*c>f*b.a>c>e*e",                            // 78 marugoto #8
];
let puzzleChoice = 1;
let puzzleCount = cannedPuzzles.length;
const demoPuzzles = [1,2,11];

const demoText = [
 ["<p>In this demo we will walk through the steps of solving this puzzle. " +
    "Press the 'next' button to walk through the solving steps, or the " +
    "'back' button to return to the previous step.</p>" +
    "<p>At the beginning of a solve, there are no errors, but all the " +
    "circles are unsolved. We need to satisfy them by beginning to connect " +
    "the path through the circles. Then we must craft a path through all " +
    "remaining circles that makes a complete loop. For our first " +
    "time through we can turn on Assist Mode 2 to see any errors that we " +
    "might generate in the process of the solve, as well as get an " +
    "indicator as to when the circles have been satisfied.</p>",
  "For Mid-loop, there are many easy starting steps where right off the bat " +
    "there are paths that can be drawn. Let's start with the circles on " +
    "walls, where there is no option in which direction they must go. " +
    "We can begin to draw the line through those circles.",
  "Next we can make two observations about circles in the middle of " +
    "the cell. Those that are on the edge of the board must have a path " +
    "that goes in the direction of the wall, else it can't connect to " +
    "other path segments. And whereever two or more are next to each other, " +
    "the path must go perpindicular to the dots, since any segment that " +
    "went through two dots would by definition not be able to satisfy both " +
    "dots' requirement to have turns on each side after equal distances.",
  "Now we can turn our attention to the circle in the upper left cell. It " +
     "already is forced to turn on its left side, and since path lengths " +
     "must be equal on both ends, it must turn to its right as well. " +
     "Both must turn downwards since there is no room above.",
  "Now that the north segment is defined for the circle on the left wall " +
     "we can complete the turn on the south segment, since it must be of " +
     "the same length.",
  "Now looking at the circle on the right wall, its south segment has nowhere " +
     "left to go but down one and then left. This determines the length of " +
     "its northern segment as well, which must turn left after two cells as " +
     "well",
  "The unsolved circle in the lower left must turn its upper segment (left) " +
    "in order to keep balanced segment lengths. This in turn sets the path " +
    "length of its lower segment which must in turn go to the left",
  "The sole remaining unsolved circle must have a path horizontally through " +
    "it. Doing so sets its length on both sides, since the left side gets " +
    "connected.",
  "Now it is clear how to connect the final two unconnected segments, " +
    "completing the puzzle",
  "Congratulations! The puzzle is solved!"],
 ["<p>In this demo we will walk more quickly through the steps of solving " +
    "this puzzle. It is recommended to go through demo 1 first. Press the " +
    "'next' button to walk through the solving steps, or the 'back' button " +
    "to return to the previous step. You can also use the undo button to move " +
    "backwards individual steps, or continue playing forward if you wish.</p>" +
    "<p>The first thing to do is to turn on the assist mode to let us know " +
    "which rooms still need completion. Then let's start with the easy wall " +
    "circles that have only one choice for path direction. Similarly the three " +
    "circles on the edge of the board. This gets us a quick start.</p>",
  "Many of the segments drawn are already forced to turn in one particular " +
    "direction. We can mark those turns now.",
  "A few circles such as the one on the left wall can also be completed given " +
    "the existant segments. This includes the one on the bottom row near " +
    "the lower right where both ends must turn up since the right side is " +
    "constrained by the wall.",
  "We can see that the one remaining circle with no path must have a " +
    "horizontal one. Also, the dangling path in the middle of the bottom " +
    "row can only go left, which sets the length before the turn on the other " +
    "side of the circle. In addition the incomplete circle in the lower right " +
    "can add its turn on the right side upwards, else it would make a loop with " +
    "itself.",
  "Now at least two segments have no choice as to where to go, including the " +
    "dangling one in the lower left, as well as the one in the lower right",
  "It should be clear now there is only one solution left for each of the " +
    "remaining paths to complete the board.",
  "Congratulations! The puzzle is solved!"],
 ["<p>In this demo we will walk more quickly through the steps of solving " +
    "a tougher puzzle. It is recommended to go through demo 1 first. Press the " +
    "'next' button to walk through the solving steps, or the 'back' button " +
    "to return to the previous step. You can also use the undo button to move " +
    "backwards individual steps, or continue playing forward if you wish.</p>" +
    "<p>The first thing to do is to turn on the assist mode to let us know " +
    "which rooms still need completion. Then let's start with the easy wall " +
    "circles that have only one choice for path direction. Similarly the two " +
    "center-cell circles on the edge of the board are constrained, as are " +
    "any two center-cell circles next to each other.</p>",
  "At this stage it is tempting to make some nearby connections, but we must " +
    "be sure they are confirmed. For instance, the two neighboring wall-circles " +
    "on the 6th row to the top must both turn immediately else they will " +
    "connect, which couldn't be allowed. But which direction to turn is not " +
    "yet known. The most obvious next steps are drawing a vertical line through " +
    "the one remaining untouched circle, due to its neighboring constraints. In " +
    "addition, the circle in the upper right is constrained to turn down one " +
    "both segments due to its placement. Finally, the one center-cell circle on " +
    "the second row must turn up on its right segment to remain balanced with " +
    "the left",
  "This opens up several other areas of progress. Let's focus first on the " +
    "upper right circle. Both legs have nowhere to go but down until they " +
    "reach a potential segment target. This brings the right leg in contact " +
    "with a circle, constraining the length of its other segment too. Similarly, " +
    "the dangling segment on the top row has nowhere to go but left to connect " +
    "with another circle.",
  "This in turn constrains several other segments, including most of the bottom " +
    "section of the puzzle.",
  "Now focusing on the last remaining center-cell circle in the upper part of " +
    "the board, its upper segment is forced to turn left, which means its lower " +
    "one must turn too, to the right. This forces the segment on the second to " +
    "last column to move down one more to search for a partner segment.",
  "At this time there aren't a lot of obvious moves, but we can focus on one " +
    "circle in particular to key us to the next stage. Looking at the one " +
    "remaining wall circle on the right side of the board, it is clear it must " +
    "turn immediately on both left and right segments. But up or down? Using " +
    "deduction we can answer for both sides. If both turned down, then it would " +
    "force a mini-loop with the segments below it. If both turned up, then the " +
    "two segments below it would not each have room to escape to another waiting " +
    "segment. Thus one must turn up and one down. But if the right one turned " +
    "down, the left segment below would not have room to escape. Thus the correct " +
    "answer must be down to the left, and up to the right.",
  "Solving that critical circle now opens up the rest. The segment on the lower " +
    "right can now only connect upwards. This means the one in the third to last " +
    "column must move all the way to the left to escape, connecting with the " +
    "segment there, which then constrains those two circles' segments.",
  "Now we have two segments on the second row which must connect downwards, since " +
    "they can't connect to each other. Once they move down, they must continue " +
    "until they connect, in the left-column case constraining another circle path.",
  "The last remaining circle appears to be imbalanced, with a long segment below " +
    "it and a short one above. But there is room to fit both with a half-cell " +
    "segment length.",
  "Congratulations! The puzzle is solved!"]];

const demoMoves = [
 [[],
  [],
  ["E00","S10"],
  ["S24","S14","S32","S22","S33","S23"],
  ["S00","N11"],
  ["N30","W31"],
  ["N44","E43","S04","E03"],
  ["E22","E41"],
  ["W12","W13"],
  ["N13","E12","N41"]],
 [[],
  ["E00","S12","E31","S34","E33","N43","E42","N52","W53","E54","E61","W05",
   "W06","N20","N30","N36","N46","W65","W66"],
  ["N10","N11","N14","N16","S22","W45","N63"],
  ["N40","W41","S02","W03","N64","S56"],
  ["W24","W25","E60","S50","W63","S63","S45"],
  ["W51","S41","S56","S46"],
  ["S16","S15","E14","S13","S03","S21","S11"]],
 [[],
  ["E03","E08","S15","S27","E35","S40","S49","S51","E54","E56","S78","W93",
   "W94","W97","W98","S32","S22","S33","S23","S74","S64","S75","S65","W16",
   "W17","W26","W27"],
  ["S24","S14","N18","N19","S07"],
  ["S28","S18","S39","S29","S19","S09","N59","N69","N79","N89","N99","E98",
   "W05","W06","W07","E02","E01","E00","N10"],
  ["E95","S85","S84","S82","N64","N65","E77","E87","E86"],
  ["E13","W35","E36","N48"],
  ["N66","N76","E86","S76","S47","S67","W68"],
  ["N58","N68","E46","E45","E44","E43","E22","E41"],
  ["E12","E11","N21","N31","N41","N20","N30","N40","N50","N60","N70","N80",
   "N90","W91"],
  ["W52","W62","W53","N63","N73","N83","E82","N72","E71","W83","S71","W72","S81"]]];
