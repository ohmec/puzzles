// LITS puzzle definitions, must be of the form:
// WxH:<wall-descriptors-rows>:<wall-descriptors-cols>
// where W is puzzle width, H is height.  wall descriptors are hex
// representations of 4 consecutive wall values, 1 for true (wall
// is present), 0 for false, gathered into hex values. the ends
// of rows and columns are dropped off the hex, not wrapped into
// the next hex. for instance a grid of 6x6 would have 5 walls in
// each direction, and thus hex values could be (00000) 00 to (11111) F8.
const cannedPuzzles = [
  // example completed one
  "7x7:60.98.b0.cc.b0.a0.04:20.e4.54.ac.74.a4.90:ee.ba.96.7a.56.62.3e",
  // demo
  "7x7:60.98.b0.cc.b0.a0.04:20.e4.54.ac.74.a4.90",        // Genius demo
  // D1
  "10x10:260.558.aa8.6d8.a68.598.760.998.f68.100:" +
        "448.7e8.930.6c8.a58.da8.2d0.d68.298.860",        // 2014 Box #1
  "10x10:120.ad8.988.6d0.538.6c8.f30.298.dc8.220:" +
        "928.b50.928.e90.968.a90.5c8.d28.6d8.920",        // 2014 Box #2
  "10x10:120.ab8.598.a48.898.a48.4b8.c48.360.888:" +
        "490.fe8.9b8.fe8.5f0.a98.be0.7b8.858.200",        // godzilla 139
  // D2
  "10x10:288.d70.308.e18.110.4e8.fb0.888.a20.580:" +
        "6c0.998.eb0.9d8.730.f98.b58.7a8.968.498",        // 2014 Box #3
  "10x10:240.fb8.158.c48.9c8.718.468.9a8.ef0.188:" +
        "908.6b0.b48.798.960.cd0.aa8.6d0.818.420",        // 2014 Box #4
  "10x10:980.6c8.a98.5c8.c68.b50.6e8.9c0.e78.120:" +
        "520.a48.5b0.b38.1c8.498.b50.aa8.cf0.128",        // 2014 Box #5
  "10x18:040.a18.560.948.0a0.908.a28.a78.940.7e0." +
        "a38.a88.840.d30.b48.b28.6b0.268:" +
        "61210.bad50.da9c8.dfa90.de6b0." +
        "ceba8.bd7e0.dab80.99d58.62820",                  // godzilla 142
  // D3
  "10x10:890.728.8b0.1a8.e50.de8.d28.d58.6c8.120:" +
        "300.d10.908.590.e68.5b0.458.9b0.690.908",        // 2014 Box #6
  "17x17:0846.2539.654f.9632.9555.6659.dccb.2a32." +
        "526e.285d.d3a3.3519.db2b.3f73.8d9d.58eb.105c:" +
        "844c.aa32.c5d9.aea5.8d72.8aa9.a4b3.9b47." +
        "ab49.ad6e.5624.a6d7.6b68.a854.5153.94a4.2201",   // 2014 Box #7
  "17x17:a500.722c.ad51.4324.8625.c1ea.6694.9aab." +
        "d656.a4eb.58c1.a746.3059.286d.bc5a.51ee.0911:" +
        "2463.d335.2cd7.6eb1.acdd.cfb2.b4e6.5d56." +
        "c966.c885.a529.c6ee.a771.6aba.ed2d.ea79.b184",   // 2014 Box #8
  // D4
  "31x45:51449224.acbbecdc.99658ea4.929ab1d4.4d6a9e70." +
        "a2d8f198.6be28968.e65caa64.99b32ad4.7a72d918." +
        "57338acc.a87fb2c8.8cab4d44.736b19ac.1f9bdd54." +
        "6b565a6c.b599b554.cca21ea8.e3430b58.ea0005a4." +
        "990003d4.660001a4.9c3c51d4.6e3ca394.b62f03a4." +
        "6e0c0590.9e00093c.de8014b8.7e402b54.f50a3498." +
        "ab209b74.55a82514.aa15c454.7a64bca8.834fd418." +
        "9ee5ea94.ea4dc6b4.aa17fbec.9db35c98.e95ae76c." +
        "a5e54a94.ba2af4d4.19854b08.ed2ac4f4.31472188:" +
        "248e0528909.9eb71ed7f26.915ac530695.5da67ae3b7a." +
        "dd2be50e615.77746c8395a.bc5ba624a71.b5b8d82bcbd." +
        "dad5602daca.255aa01e9b6.d4a5c00eaaf.bb15448bdd6." +
        "65a4c18a5a6.b6a3c44529f.5790c304c58.acc3a288a96." +
        "8d94c30942d.aa53430e852.669d450f599.9aacc611a65." +
        "ae71802b68d.355460559b3.cd5b30ef66f.be8aca716a3." +
        "a2d5411d656.9f29aaede75.f4d554fb69a.8ddbed8db79." +
        "645e32c4c97.aab1d2bca66.19446249111",
];
let puzzleChoice = 2;
let puzzleCount = cannedPuzzles.length;

// which puzzles have demos
const demoPuzzles  = [1,2];
// which puzzles are at which level [D1,D2,D3,D4]
const puzzleLevels = [1,5,9,12];

const demoText = [
 ["<p>In this demo we will walk through the steps of solving this puzzle. " +
    "Press the 'next' button to walk through the solving steps, or the " +
    "'back' button to return to the previous step.</p>" +
    "<p>At the beginning of a solve, there are no errors, but there are " +
    "many incomplete rooms (polyominos). For our first time through we can " +
    "turn on Assist Mode 2 to see any errors that we might generate in the " +
    "process of the solve.</p>",
  "Easy LITS rooms are ones of 4 cells, indicating that there is only one " +
    "possible solution. We have one on this board, we can color that in first.",
  "Now we can apply the 4th rule about not allowing 2x2 collections of dark " +
    "cells. Whenever we see that potential, i.e. when three of the four cells " +
    "of a square are already shaded, we can turn the 4th one white.",
  "Now that that white cell is placed, the room that contains it is easy " +
    "to complete, since only four other cells remain. After creating that 'S' " +
    "room, we can turn two affected cells white",
  "With the placed 'S' and the two white cells next to it, two more rooms " +
    "are constrained to one solution. They each trigger the placement of " +
    "more white cells, including one in the 6th cell of the 'T' room that " +
    "was stranded.",
  "Two more rooms are now constrained to one shape, an 'L' in the lower " + 
    "left region, and a 'T' in the upper right.",
  "Now using only the shape rule and the 2x2 rule, we can't make any more " +
    "progress on the two remaining rooms. But looking at the large 'L' " +
    "shaped room in the bottom left, it could only feasibly hold an 'L' " +
    "shape on an 'I' shape. But you can see that placing an 'I' in the " +
    "left column would violate the 2x2 rule. As would any 'L' that sits " +
    "on the left column. Even a horizontal 'I' wouldn't work in the " +
    "corner, and indeed could only work in its most extreme right position. " +
    "The rest of the cells must be white.",
  "The final room has space for each of the possible LITS shapes. However, " +
    "only one of them doesn't violate the 2x2 rule. The is an 'L' shape " +
    "along the right wall",
  "Congratulations! The puzzle is solved!"],
 ["<p>In this demo we will walk more quickly through the steps of solving " +
    "this larger puzzle. It is recommended to go through demo 1 first. Press " +
    "the 'next' button to walk through the solving steps, or the 'back' button " +
    "to return to the previous step. You can also use the undo button to move " +
    "backwards individual steps, or continue playing forward if you wish.</p>" +
    "<p>The first thing to do is to turn on the assist mode to let us know " +
    "which rooms still need completion. Then we can fill in the two rooms that " +
    "have only four cells, and are thus already constrained. Afterwards we can " +
    "set the corners to white where otherwise a 2x2 block of dark cells might " +
    "form.</p>",
  "The rooms with the white cells are now constrained to a particular shape, " +
    "and can be completed, including putting the other cells to white, as " +
    "as constrained corners.",
  "Three more rooms are constrained, they can be filled in accordingly",
  "Four more rooms are now constrained, they can be filled in accordingly",
  "A cascade of three rooms can now fall into place, first the 'S' in " +
    "the middle right section, which then constrains the 'T' below it, " +
    "which then constrains the 'S' below and to the left of it.",
  "Finally, we have one room to complete. It has room for either an 'I' on " +
    "its side, or an 'L' in the corner. But we can invoke the 'river rule' " +
    "and recognize that the 'L' in the corner would be isolated from the " +
    "other dark cells. Thus only an 'I' that connects to the others can " +
    "satisfy this final room",
  "Congratulations! The puzzle is solved!"]];

const demoMoves = [
 [[],
  [],
  ["B00","B01","B10","B20"],
  ["W11"],
  ["B02","B12","B13","B23","W03","W22"],
  ["B04","B05","B06","B14","W15","B32","B33","B34","B43","W21","W42",
   "W44","W24"],
  ["B25","B16","B26","B36","W35","B31","B41","B51","B52"],
  ["B62","B63","B64","B65","W30","W40","W50","W60","W61","W53"],
  ["B45","B46","B56","B66","W44","W54","W55"]],
 [[],
  ["B23","B24","B14","B15","W13","W25","B60","B61","B70","B80","W71"],
  ["B06","B16","B17","B26","W35","W07","W27","B72","B63","B73","B83",
   "W81","W62","W82","B12","B21","B22","B32","W03","W04","W05","W11",
   "W31","W33"],
  ["B00","B01","B02","B10","B08","B09","B18","B28","W19","W36","W37",
   "W46","B41","B42","B52","B53","W51","W43"],
  ["B20","B30","B40","B50","B29","B39","B49","B59","B34","B44","B45",
   "B54","B90","B91","B92","B93","W64","W55","W38"],
  ["B48","B47","B57","B56","W58","W65","W74","B67","B68","B69","B78",
   "W77","W79","W66","B76","B75","B85","B84","W87","W88","W86","W94"],
  ["B95","B96","B97","B98","W99","W89"]]];
