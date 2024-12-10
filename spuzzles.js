
// Slitherlink puzzle definitions, must be of the form: WxH:<entries>
// where W is puzzle width, H is height, and entries define
// the initial or current values. 0-3 are digit values, a-z
// define from 1-26 spaces in between digits, and '-' is one space.
let cannedPuzzles = [
  // dummy
  "1x1:4",
  // from original js
  "7x7:1b2a13.0a2d.b3a30a.3b2b1.a31a2b.d2a3.02a3b3",
  // from big book pages 80-
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
        "1a32b1d1a2c0a3d2b11a1.d3a3a30a3c2c0a03a2a3d.022a3c23c02a32c32c0a311",
];
let puzzleChoice = 2;
let puzzleCount = cannedPuzzles.length;
