// Choco Banana puzzle definitions, must be of the form:
// WxH:<digit-descriptors> where W is puzzle width, H is height.
// Digit descriptors are '-' for blank values, 1-9A-Z for digit
// values 1-35, or a-z for 1-26 consecutive blank tiles.
//
// special case for the 0th entry, which includes a hexadecimal descriptor
// of the black (1) / white (0) starting points for a solved puzzle.
const cannedPuzzles = [
  // example completed one
  "5x5:e.d2.b6a2.a4c.1a1b:00.e8.e8.10.a0",
  "5x5:e.d2.b6a2.a4c.1a1b",
  // pencil 2024 easy ones
  "6x6:24d.2e.c6b.e4.3a3c.a1d",
  "6x6:1b2b.d2a.b4c.f.c3b.b7c",
  "6x6:3b4b.f.a1d.16b1a.e3.e2",
  "6x6:a5c3.c1b.b2c.2e.2a4a4a.b4c",
  "10x10:a1f13.b3c8c.22g4.j.f1c.4a8f3.j.a2a3b4c.a2g2.1d223a2",
  "10x10:1b23e.c5b8c.8e8c.j.j.j.8c9e.c9f.d2a6c.2a2b1d",
  "10x10:a4a4a4c1.1a1a6c4a.a3a4a6c4.h4a.i6.5a2a8e.a6a7f.j.e2a8b.f2c",
  "10x10:24b2d2.d4a1c.a2e3b.j.d23c1.d31d.j.j.f3a6a.82a1c1a1",
  "10x10:d3a22a1.b6e5a.j.2g7a.i4.j.b4a2b4a1.2i.a22e4a.c4f",
  "10x10:b3d25a.a2e2b.a2h.i2.4d4a1a2.1a9d91a.j.j.a64g.a18g",
  "10x10:a223f.4f2a3.j.d9b3a3.e8d.i2.9b6e2.c6b3b5.i6.3a3c6b6",
  "10x10:e3b73.a4f7a.h7a.h98.j.c6f.4a2g.b2b4d.22b2c1a.j",
  "10x10:61h.d6226b.g6b.b22f.g8b.a6h.e4d.f1c.j.23b5d6",           // two solutions?
  "10x10:f7c.h6a.3a6g.92e3b.a2h.h4a.6f3b.i3.c7e1.f4c",
  "10x10:1a4e22.3d31c.2f666.j.c7f.5a3g.h41.44c6b25.f2c.d4a2a22",  // easy + fun
  "10x10:2c4a1b3.3i.h5a.1b6a6d.j.j.a2g3.j.22b5c2a.99b1d1",
  "10x10:gBBB.88e999.j.j.a887bBc.c2f.c2a4d.a6e8b.66h.6i",
  "10x10:j.j.b9Cb27b.b92bC5b.j.j.j.b6CbC5b.b48b85b.j",
  "10x10:h6a.b6g.a714c1b.b3g.j.j.g5b.b1c713a.g4b.a6h",
  "10x10:h2a.b2g.a2c3d.g3b.c3d4a.h4a.3e65b.b2g.b2g.41d522a",
  "17x17:a1aAj4b.3a6hAd2.2n2a.6d8cBe4a.q.g331g.p5.c6a8k.2h55f.q." +
        "42bDf3e.b2n.6d6i7a.b6h4d6.b6b444i.a4a44c3f2a.f1b44c2a4",
];
let puzzleChoice = 2;
let puzzleCount = cannedPuzzles.length;
const demoPuzzles = [1,2];
