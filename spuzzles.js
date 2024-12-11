
// Slitherlink puzzle definitions, must be of the form: WxH:<entries>
// where W is puzzle width, H is height, and entries define
// the initial or current values. 0-3 are digit values, a-z
// define from 1-26 spaces in between digits, and '-' is one space.
let cannedPuzzles = [
  // dummy
  "1x1:4",
  // from vol3 examples
  "6x6:a32a3203b0ad2321da3b2110a02a",
  "7x7:10a0b2a3b203g10a0a30g230b2a2b3a20",
  // easy example
  "7x7:1b2a13.0a2d.b3a30a.3b2b1.a31a2b.d2a3.02a3b3",
  // from vol3 1-5
  "10x10:1b2a23333.0b2a2d.2b3a3d.2b0a12132.2011f.f0132.30321a2b1.d1a2b3.d0a3b2.01023a0b0",
  "10x10:a23d02a.2b2a23b1.0b32a2b2.a12d33a.a2b22a0b.b3a21b1a.a02d33a.1b2a20b2.1b22a3b1.a20d23a",
  "10x10:a33a33b3a.3b0b3a1a.3b3b2a3a.a12a01b0a.c3b3a33.13a3b3c.a3b23a23a.a1a2b1b3.a3a3b0b1.a2b23a13a",
  "10x10:33a201d.a2e213.b3b03b3.0b23e.2e32a3.2a30e2.e03b1.3b02b2b.302e2a.d233a20",
  "10x10:2233b1b1.c0b2b1.2323b1020.c2231c.2212b3c.c2b2111.c1312c.3220b2113.2b2b3c.0b2b2010",
  // from vol3 46-
  "10x18:d3a21a3.a32c32a3a03a0e.f10a1.3a1a2a22a0.i2.03a33a13b.12a12d3.f31a2" +
        "1a23f.2d23a11.b33a23a20.1i.1a20a3a3a3.2a32f.e1a31a.1a11c22a.2a12a2d",
  "10x18:11b02b13.33b23b13.b2d3b.c1b1c.22f33.01b32b02.c3b1c.b0d2b.31b31b21" +
        "13b13b02.b2d2b.c2b2c.10b23b11.32f11.c2b3c.b2d1b.12b32b21.21b11b31",
  "10x18:22b32b13.33b11b32.b22b20b.b01b31b.23b22b31.31b23b23.b31b12b.b23b13b.22b23b32" +
        "03b10b22.b03b12b.b22b31b.12b30b03.31b22b23.b12b21b.b32b32b.22b23b21.13b02b33",
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
