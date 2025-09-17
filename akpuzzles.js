// Akari puzzle definitions, must be of the form: WxH:<entries>
// where W is puzzle width, H is height, and entries define
// the black squares with or without digits at the beginning.
// The value 0-4 is for numbered cells, and * is for a black
// square without a number. a-z define from 1-26 white cells in
// between black cells, or '-' for one space. The first one also
// includes bulb positions (@) that defines a solution.
let cannedPuzzles = [
  // example completed one
  "7x7:*a@c*.a@4@b1.b@2b@.@*b@1a.a@a*c.0b@*b.*d@1",
  // demos
  "7x7:*e*.b4c1.c2c.a*c1a.c*c.0c*b.*e1",
  "7x7:a*b*b.b4d.*c*a0.c0c.2a*c1.d1b.b*b*a",                                                // 7 6
  "10x10:d1e.a4c**a0a.b**d1a.d*b2b.a*d3b*.*b*d1a.b2b*d.a3d*3b.a*a1*c2a.e*d",
  // D1
  "10x10:10b1a*b1.d2a2b1.c1c*b.a2a*a*a*a*.a*c1c*.*c*c*a.*a1a2a*a1a.b*c*c.2b*a0d.*b2a1b2*",  // 18 18 Marugoto 1
  "10x10:f1c.b4g.f*a*a.*a**2a*c.f*c.c*f.c*a**0a2.a3a*f.g2b.c*f",                            // 13  7 Marugoto 2
  "10x10:g0**.a*2*f.e*a*b.a1**a*a1b.e3a*b.b1a3e.b*a*a*1*a.b1a*e.f**2a.**1g",                //       Godillza 2
  "10x10:h*a.1f1b.c4a2d.a1f1a.b*c3c.c1c4b.a*f*a.d1a*c.b*f1.a3h",                            //  6 12 Marugoto 3
  "10x10:e*c*.a2h.c*c2b.b1c*c.d0d3.*d*d.c*c2b.b4c*c.h*a.*c1e",                              // 10  8 Marugoto 4
  "10x10:h*a.3c*2d.b1d*b.d*e.a*d0a2a.a*a3d*a.e*d.b*d*b.d*1c1.a2h",                          // 11  9 Marugoto 5
  "10x10:d2**c.a1*b*c*.a*1e1*.c1e*.d**a4b.b*a**d.*e1c.*2e1*a.*c*b*2a.c0**d",                // 21 11 Marugoto 6
  "10x10:c*f.a4b3c2a.c*c1b.i*.a2b2b*a*.*a*b*b*a.1i.b*c*c.a1c2b2a.f3c",                      // 11 11 Marugoto 7
  "10x10:*e*b1.c*2e.a4e1b.e*d.*b0d*a.a*d0b1.d2e.b2e1a.e*1c.*b*e2",                          // 10 12 Marugoto 8
  "10x10:*b*b3c.a4a1a*b*a.c*c*b.d1c*a.*1*c*c.c*c**2.a1c2d.b*c1c.a2b*a*a*a.c*b1b1",          // 18 12 Marugoto 9
  "10x10:f*c.a*1a1a1a2a.f*a2a.***2a**c.c*d2a.a4d1c.c*1a**2*.a*a*f.a1a*a3a*2a.c*f",          // 18 14 Marugoto 10
  "10x10:*c1e.b*c3a*a.f*c.b11d*a.*d*a*b.b2a0d1.a*d1*b.c*f.a4a*c1b.e1c2",                    // 12 12 Marugoto 11
  "10x10:e3d.b*d*b.a0*a**a**a.d2e.*a*c**b.b1*c*a2.e2d.a22a1*a*1a.b*d0b.d*e",                // 17 11 Marugoto 12
  "10x10:f*c.c2c0*a.a3*g.e1d.**c0a0b.b4a*c*2.d1e.g*1a.a**c2c.c1f",                          // 10 12 Marugoto 13
  "10x10:1e*c.*a*a*c0a.d**a*b.a*0*e1.e*3a1a.a1a*0e.1e*1*a.b*a**d.a4c*a*a*.c1e*",            // 20 12 Marugoto 14
  "10x10:***e0a.1c**1c.*a*c*c.b1c0a*0.b***e.e2*1b.2*a1c*b.c*c0a*.c01*c*.a1e0**",            // 21 15 Marugoto 15
  // D2
  "10x10:j.a*a3b*a3a.b4d3b.a*a*b2a*a.j.j.a0a0b*a*a.b0d1b.a*a*b*a*a.j",                      // 11  9 Marugoto 16
  "10x10:1c*d2.f*c.b*1b*c.b*2c1*a.1c2e.e1c0.a*1c**b.c2b**b.c*f.0d2c*",                      // 13 13 Marugoto 17
  "10x10:d1b*b.a*f1a.b2b*d.c4b1c.a1c*c3.*c2c*a.c*b*c.d*b2b.a2f2a.b1b*d",                    // 10 12 Marugoto 18
  "10x10:i2.c1d2a.b*d2b.a2d2c.d0e.e2d.c*d1a.b4d2b.a*d1c.0i",                                //  3 13 Marugoto 19
  "10x10:**b1d*.1d0b*a.b**f.b*2f.2d1b1a.a*b1d*.f*2b.f**b.a0b2d*.*d2b**",                    // 16 12 Marugoto 20
  "10x10:j.f*a*a.d2b1b.b4b*d.a2a4d*a.a0d0a*a.d*b2b.b2b1d.a2a1f.j",                          //  6 12 Marugoto 21
  "17x17:f1d**b1a.c1d*1b*d.1d*1b*f1.b*2b*f2b*.0b*f*b*1b.*f*b*1e.d2b*1e*b.a2b**e3e." +
        "a*1e1e*2a.e1e**b0a.b*e**b1d.e11b*f*.b**b2f1b2.1b*f*b**b.*f*b*1d1.d1b02d0c." +
        "a1b**d1f",                                                                         // 39 36 2020 17
  // D3
  "10x10:*e*b0.a3a*2c*a.f*c.*a*b1b1a.c1d1a.a*d*c.a*b1b2a1.c*f.a4c**a1a.*b1e*",              // 15 13 2020 13
  "10x10:0a*g.d2c*a.d1b*b.a01f2.f*c.c*f.*f0*a.b0b1d.a2c1d.g*a1",                            //  8 12 2020 14
  "10x10:j.a1*a*1*a*1.j.c*1a1a*a.1a0g.g*a*.a*a0a*1c.j.*0a**0a*0a.j",                        // 14 12 2020 15
  "10x10:a0f*a.d11d.10d*2b.b*1d*1.f10b.b1*f.1*d11b.b*0d**.d**d.a1f1a",                      // 11 17 2020 16
  "10x18:j.b1d0b.a1d*c.b2a4b*a*.c*d2a.j.a*b***c.1i.a1a0c1b.b*c1a1a.i1.c**3b*a.j." +
        "a*d*c.1a*b*a2b.c4d3a.b3d*b.j",                                                     //       Godzilla 13
  "17x17:e1***1g.***c1*1d*c.**e2e**b.*b*a*g**3a.d2e1*1d.c4a*b*b**d.b2i*a*b.a1*d*a1d**a." +
        "1**b*e2b***.a1*d0a1d00a.b1a*i*b.d**b1b1a*c.d***e*d.a2**g2a1b1.b1*e2e**.c*d**1c**1." +
        "g1***1e",                                                                          // 57 33 2020 18
  "17x17:*g1g1.c2a*e*a0c.b0c*c2c1b.a1e1a*e2a.h1h.a*c2e*c*a.b*c1c2c2b.c2c*a*c1c.1c*c*c3c*." +
        "c*c2a1c*c.b*c2c1c2b.a1c1e1c*a.h*h.a*e*a2e*a.b2c*c1c1b.c0a3e2a*c.*g*g1",            // 26 35 2020 19 elegant
  "17x17:b*1b1b1d1b.e2g0c.1c*b0b0a*c*.a3f1g*.b2b*c*a*b*b.d*g1b1a.b1c22b*e0.1c1e1c1b." +
        "c1d*d1c.b1c*e0c*.1e1b1*c*b.a1b*g*d.b*b1a1c*b2b.1g2f1a.1c*a*b1b*c0.c1g2e." +
        "b1d*b3b*0b",                                                                       // 25 44 2020 20
  "31x45:a1d*c0f2c1d3d.e0b1b1j1b4e.d1c1c1f0d2d1*.b1e1f12b*k.a2l1d2a1e1b1.1k1k1c2b." +
        "a1d2d2f1d2a2e.b2b1a2d2d*a1b1c1d.d1c1g1c1g*b.b2f2e2f*c1b1a.a1h2c1h1a1d1." +
        "1d*1f1g2b2f.d1b2d2d1b2g1b.c2d2b3d1b1k.1i3l0c2b*.c1d1i0g2d.d1b1g*i1e." +
        "*d*2e1a1e2a2a3e1.a1h1b2c1b2b2d0b.b1f1b*a2a*d1i.c2d1i*h2b2.d2b2j1g1d.i1k1i." +
        "d1g*j2b2d.1b2h1i3d2c.i*d*a2a2b3f0b.b*d1b1b*c3b1h1a.2e*a1a1e*a1e1*d2.e1i1g2b0d." +
        "d2g*i*d1c.0b2c1l1i*.k*b2d1b1d1c.b2g0b1d2d2b1d.f1b*g3f2*d1.1d1a3h2c2h1a." +
        "a1b0c2f1e1f*b.b2g2c2g1c4d.d1c1b2a2d2d2a2b1b.e1a2d1f*d1d3a.b*c1k2k2." +
        "3b0e*a0d2l1a.k*b22f0e1b.11d1d2f*c1c1d.e2b*j1b1b1e.d2d1c1f1c*d2a",                  // 36 216 2020 27
];

let puzzleChoice = 1;
let puzzleCount = cannedPuzzles.length;

const demoPuzzles = [1,2,31];

const demoText = [
 ["<p>In this demo we will walk through the steps of solving this puzzle. " +
    "Press the 'next' button to walk through the solving steps, or the " +
    "'back' button to return to the previous step.</p>" +
    "<p>At the beginning of a solve, there are no errors, but there are " +
    "many unsolved digits and un-illuminated cells which we need to satisfy " +
    "by placing the bulbs.  For our first time through we can " +
    "turn on Assist Mode 2 to see any errors that we might generate in the " +
    "process of the solve.</p>",
  "For our first pass we can satisfy the easy ones (the 4 on this board), " +
    "and mark certain no-bulb squares with a dot to indicate its condition, " +
    "i.e. those that must be illuminated elsewhere.",
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
   [],
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
