
// Akari puzzle definitions, must be of the form: WxH:<entries>
// where W is puzzle width, H is height, and entries define
// the black squares with or without digits at the beginning.
// The value 0-4 is for numbered cells, and * is for a black
// square without a number. a-z define from 1-26 white cells in
// between black cells, or '-' for one space. The first one also
// includes bulb positions (@) that defines a solution.
let cannedPuzzles = [
  // example completed one
  "7x7:4a3a3a3.a2c4a.3b3b3.g.2b8a4a.d1a3.a1a4a1a",
  // demos
  "7x7:4a3a3a3.a2c4a.3b3b3.g.2b8a4a.d1a3.a1a4a1a",
];

let puzzleChoice = 1;
let puzzleCount = cannedPuzzles.length;

const demoPuzzles = [1,2];

const demoText = [
 ["<p>In this demo we will walk through the steps of solving this puzzle. " +
    "Press the 'next' button to walk through the solving steps, or the " +
    "'back' button to return to the previous step.</p>" +
    "<p>At the beginning of a solve, there are no errors, but there are " +
    "many unsolved digits and un-illuminated cells which we need to satisfy " +
    "by placing the bulbs.  For our first pass we can satisfy the easy " +
    "ones (the 4 on this board), and mark certain no-bulb squares with " +
    "a dot to indicate its condition, i.e. those that must be illuminated " +
    "elsewhere.</p>",
  "Already with these additions, we can see more cells that are clearly " +
    "either bulbs or need to be dotted. The '1' in the upper right can " +
    "only be satisfied with a bulb below it, given that its other " +
    "neighboring white cell is already illuminated. Putting a bulb on " +
    "that side would violate the rule of two bulbs 'seeing' each other. " +
    "Meanwhile, the '2' digit in the center has already been satisfied, " +
    "and its neighbors should be dotted.",
  "Now the lower right '1' can be completed with a bulb to its left, and " +
    "then the '1' above it can be solved as well.",
  "Now all of the digits are solved, the remaining unlit squares must be " +
     "solved without the assistance of the number restrictions. Of the 5 " +
     "remaining cells, two are dotted, so the other 3 cells are candidates " +
     "for bulbs. In the second to bottom row, there is only one undotted " +
     "option to illuminate those cells. The same is true in the leftmost " +
     "column.",
  "Now only one cell is left un-illuminated, and there is no violation to " +
     "place a bulb there.",
  "Congratulations! The puzzle is solved!"],
 ["<p>In this demo we will walk more quickly through the steps of solving " +
    "this seemingly easy puzzle. It is recommended to go through demo 1 " +
    "first. Press the 'next' button to walk through the solving steps, " +
    "or the 'back' button to return to the previous step. You can also " +
    "use the undo button to move backwards individual steps, or continue " +
    "playing forward if you wish.</p>" +
    "<p>The first thing to do is to turn on the assist mode to let us know " +
    "We can use the same methods from demo 1 to complete the '4' digit, " +
    "then dot the '0' digits. Completing the '4' also allows us to finish " +
    "the '2' below it.</p>",
  "Now already we can see two cells that have one possibility for their " +
    "illumination. The upper left cell is isolated, not dotted, and thus " +
    "must contain a bulb. Meanwhile the dotted cell between the '0' and " +
    "the '1' on the right column has only one possible illuminator, the " +
    "cell directly to its left.",
  "Now the upper right cell is isolated and must contain a bulb, and the " +
    "'1' cell in the right column must be satisfied with a bulb below it.",
  "The last remaining digit, the '1', could be satisfied with a bulb " +
    "above or below it. However, the square above has no other option to " +
    "be illuminated. This plus a final bulb placement complete the board.",
  "Congratulations! The puzzle is solved!"],
 ["<p>In this demo we will walk more quickly through the steps of solving " +
    "a tougher puzzle. It is recommended to go through demo 1 first. Press " +
    "the 'next' button to walk through the solving steps, or the 'back' button " +
    "to return to the previous step. You can also use the undo button to move " +
    "backwards individual steps, or continue playing forward if you wish.</p>" +
    "<p>The first thing to do is to turn on the assist mode to let us know " +
    "which rooms still need completion. There are a total of 3 numbered " +
    "squares that can be completed right off the bat, including both '4's " +
    "and one of the '3's. We can also dot the cells surrounding the '0' " +
    "squares.</p>",
  "Now we can employ a new observation given the state of the board at this " +
    "stage. All of the digit cells in the top 5 rows except one have one " +
    "more option available than their digit number. Looking at the '2' digit " +
    "near the right column in the fifth row, for example, there are three " +
    "choices for bulb locations. This means that at least one bulb will be " +
    "at or below the '2', which in turn means that the cell SE of the '2' " +
    "will be guaranteed to be illuminated. We can 'dot' this cell to indicate " +
    "that no bulb can be placed here. This might seem insignificant now, but " +
    "this form of reasoning can eventually force the solution in other cell " +
    "areas. See if you can rationalize all of the 5 dots placed in the next step.",
  "Another interesting observation that we can make involves the three '1' " +
    "cells in the middle right section in the shape of '^'. The leftmost " +
    "of them must have a bulb in the N or E direction. Either one of these " +
    "would satisfy the '1' to the NE. Thus we can dot the other two for that " +
    "cell, they could never have a bulb. Meanwhile, unrelated, we can also " +
    "complete the '3' cell in the lower right.",
  "Now, with the benefit of the completed '3' below, the '1' in the right " +
    "column can be completed. And with the benefit of the previous dotting, " +
    "the other ones next to it can be completed as well.",
  "Now looking across the board, only one bulb can be placed based upon  " +
    "digit count. The '2' near the upper right has only two options for " +
    "bulb placement remaining, so they can both hold a bulb.",
  "Now we can see several cells that are not under the rules of any digits, " +
    "but can only be satisfied in one horizontal or vertical direction. " +
    "For instance the dotted cell in the '^' cluster of '1' cells can only " +
    "be illuminated by one unlit cell, the white cell above the '2' " +
    "below it. At the same time we can dot the cell to left of that '2', " +
    "and now it can only be satisfied with a bulb on the bottom row directly " +
    "below it. Similarly, we can see the white cell to the right of the " +
    "three black squares on the 7th row; it can not be illuminated by any " +
    "neighbor, and thus must have a bulb itself. Similarly, the dotted " +
    "cell below the upper right '0' can only be illuminated with a bulb " +
    "to the right against the right column wall. Likewise, the dotted " +
    "cell to the left of that same '0' can only be illuminated above. " +
    "Ditto the dotted cell below the left-center '0' digit has only one " +
    "possible illuminator.",
  "These bulb placements now allow us to use the digit rule to solve the '3' " +
    "in the bottom left, and the '1' in the upper left, which then in turn " +
    "allow us to complete several others.",
  "Now we can see two cells that have only one option for where a bulb " +
    "could be placed to illuminate them. The first is the dotted cell next " +
    "to the '2' in the NW corner. The second is the white cell to the left " +
    "of the 3-across black cells in the upper middle area.",
  "That allows us to solve the upper '1' on the leftmost column.",
  "Finally, there is only one placement - of two bulbs - that can solve the " +
    "final four white cells.",
  "Congratulations! The puzzle is solved!"]];

const demoMoves = [
  [[],
   ["@02","@11","@13","@22",".40",".51"],
   ["@26",".33",".24"],
   ["@65","@34"],
   ["@53","@30"],
   ["@41"]],
  [[],
   ["@02","@11","@13","@22",".16",".25",".36",".23",".32",".34",".43","@30","@50"],
   ["@00","@35"],
   ["@06","@56"],
   ["@44","@63"]],
  [[],
   ["@24","@33","@35","@44","@A5","@B6","@C5","@F2","@E3","@F4","@G3",".07",".16",".18",".27",".73",".82",".84",".93"],
   [".01",".41",".59",".D8",".H1"],
   [".77",".88","@E8","@F9","@G8"],
   ["@99",".97","@86"],
   ["@38","@58"],
   ["@D7",".E6","@H6","@67","@29","@06","@94"],
   ["@G1","@11",".20",".31","@D0","@42"],
   ["@30","@63"],
   ["@71",".91"],
   ["@B1","@D2"]]];
