// Heyawake puzzle definitions, must be of the form:
// WxH:<digit-descriptors>:<room-descriptors>
// where W is puzzle width, H is height. digit descriptors are '-' for
// blank values, 1-9A-Z for digit values 1-35, or a-z for 1-26 consecutive
// blank tiles. room descriptors are 4-character descriptors
// that include, in order, xywh where x,y describes the starting location
// and w,h describes the room's width and height. Values greater than 9
// should use a-z to represent 10-35. For instance a 3-wide 2-high room
// at coordinate location 12,3 should be designated as 'c332'.
//
// special case for the 0th entry, which shows a completed puzzle. for this
// one we have special characters A-J to indicate 0-9 digits that are set
// to black, and K-T for 0-9 digits set to white
const cannedPuzzles = [
  // example completed one
  "8x8:____C_M*.N*M*__*_.*___*___._*___C__.__*_*__*._*___*K_.___*____.C_*___*K:" +
      "0041.4023.6022.0123.2124.6223.4313.5313.0423.2522.6522.4622.0731.3711.6711.7711",
  "8x8:d2a2a.3a2e.h.e2b.h.f0a.h.2f0:0041.4023.6022.0123.2124.6223.4313.5313.0423.2522.6522.4622.0731.3711.6711.7711",
];
let puzzleChoice = 1;
let puzzleCount = cannedPuzzles.length;
const demoPuzzles = [1,2];
