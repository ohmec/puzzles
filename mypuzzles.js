// Yajilin puzzle definitions, must be of the form: WxH:<entries>
// where W is puzzle width, H is height, and entries define
// the initial or current values. 1-9 are digit values, a-z
// define from 1-26 spaces in between digits, A-Z are digit
// values 10-35, '-' is one space, and '*' is blackened.
let cannedPuzzles = [
  // example completed one
  "8x8:2b22c.f1a.11d1a.b2c1a.h.e1b.a2a2b11.a1a1d",
  // demos
  "8x8:2b22c.f1a.11d1a.b2c1a.h.e1b.a2a2b11.a1a1d",
];
let puzzleChoice = 1;
let puzzleCount = cannedPuzzles.length;
const demoPuzzles = [1,2];
