// Hitori puzzle definitions, must be of the form: WxH:<entries>
// where W is puzzle width, H is height, and entries include the
// number value (or * for blackened, for completed puzzle #0).
// digit values greater than 9 use capitalized hex notation, i.e
// A for 10, B for 11, etc.
const cannedPuzzles = [
  // example completed one
  "7x7:*145763.1*3*2*5.346215*.*61*427.57*13*2.2*76*31.*25*64*",
  // D1
  // Nikoli sample puzzle
  "7x7:1145763.1333255.3462156.5617427.5741342.2276631.2256647",
  // from godzilla book
  "8x8:43424473.51842364.56547287.42243117.32268115.75361726.37353663.14675832",  // Godzilla 105
  "8x8:71855246.26181317.24648575.28333714.61427852.12373638.41762583.87111463",  // box2014 1
  "8x8:53111825.63527614.81578234.13745468.34267772.42638157.27352285.76888345",  // Godzilla 107
  "8x8:11325785.22483715.34376255.75642141.47815364.56841632.63184576.15238878",  // Godzilla 108
  "8x8:33616542.33147652.56242321.12345678.17538264.65721438.44463115.75824113",  // box2014 2
  "8x8:63425781.36351432.73581864.22261345.45713222.58312647.25814713.87636154",  // Godzilla 110
  "8x8:32132426.18662873.81265754.35811125.53447237.48728356.25176641.58457234",  // Godzilla 111
  "8x8:15722364.35122784.44858116.44865112.73846823.86271543.58576633.61473257",  // box2014 3
  "8x8:56584741.71112233.65728314.32816467.17473582.64858123.83631572.48764215",  // Godzilla 116
  // D2
  "8x8:12434567.42228131.34525618.53722241.85461273.21183854.31656472.61387821",  // box2014 4
  "8x8:77113525.53214746.66512413.68432227.82651473.11146852.42357565.75428381",  // box2014 5
  "12x12:5B5312A986A7.311147B6A7C8.5754AB219826.992C3C671287.9968314A7573." +
        "463474142454.1885AC62739B.288955CB316A.BC42557B5941.A476C3945812." +
        "73C12A35CB98.61A6C45782B9",                                              // Godzilla 117
  "12x12:1A8425879634.12657A342739.4CCC7692B382.96B28981B455.97538AA21646." +
        "8421A72A4523.2A975316897A.235A9488621A.594312783846.5537A8195A21." +
        "6844A5235194.367981542368",                                              // Godzilla 118
  "12x12:B2255997A633.523BBC9974C1.A5CB183992B6.2348AC519967.CC822514B977." +
        "9C82213A275B.7A59C6681B44.B12766288A44.1476624588AC.A96677CC3885." +
        "466A97725B88.36AA3B142C98",                                              // Godzilla 119
  "12x12:32C8A2657844.111214A99B76.82A545C99615.94963732CAA8.77B1C9156AA3." +
        "775182649396.483C6653A9B2.263C71B82449.65235A8B49C5.637B8147252A." +
        "A5672841813B.1B7A1C765854",                                              // Godzilla 122
  // D3
  "8x8:37461288.46214388.74146452.12888623.54643421.21367825.65572141.87752134",  // box2014 #6
  "12x12:B245C2215637.A197986B3A6B.841A359B64AC.798A76C7BC23.4B7521CA2B18." +
        "123456789ABC.CBA987654321.3864821B59C4.8CA23486C755.75B9A9314187." +
        "29C1BA248C76.66277A48154A",                                              // Godzilla 123
  "12x12:86343C892B55.CB826A943755.7468AB2A5369.95C7B2374288.4C3B93185672." +
        "5B9272628C4C.A73986CB5423.65A2C5B47239.A94C4543A896.386B5978C9AB." +
        "42BA381C65B7.B7778A5662C2",                                              // Godzilla 124
  "12x12:8B179CB562AA.A916873724CC.111BA2894876.596143C3A912.8CB389A21A4B." +
        "24A614648593.7A425B5C3869.B35C681843C7.782A95261C36.3681C14B6795." +
        "1348A67192B4.C39521BA5658",                                              // Godzilla 125
  "12x12:369B12C72823.153948CAB57C.39A82434C656.57833692741B.8A5C36871B32." +
        "247C99A54381.91175B1382A7.C82A835C6B19.9B41A778A263.6C6541B5398A." +
        "33A4651B5142.636B8A299794",                                              // Godzilla 126
  "12x12:9115A7631248.3B42A7215B85.4837259B4A61.6384921135AB.853A64829177." +
        "B9A368547412.A99B61482635.146273BAAA58.B618BA452739.5AB14979632A." +
        "232419A7B568.127638368594",                                              // Godzilla 127
  "17x17:A29G938C65618D7E8.48E9D85A28B638C61.6E639CAD71758B429.511147E7DA38C6B92." +
        "6D6C2221898E547F5.GA28E74333C9691AD.375D31A98C44426B6.184AB6C8FA29D5553." +
        "737B5D7E425FA1689.26F7C638E716B8D94.7C7E89624BA37581A.F53815DAC84726E7B." +
        "89A18B7684827CA37.D6G9A7F718E94926C.61628F745E9D736C6.96C5FA25B7D81A36E." +
        "AB9F7E635D9CAG847",                                                      // box2014 #7
  "17x17:143C291D6567A8AEB.E53575G5D6B1FC824.1C362D19548E7FAGB.6F924A87B7D5ECG31." +
        "126DAB1CA98563646.A1D4C474FBE59B238.316B222A7D89454CE.915GB84826F6C6D3A." +
        "3A6H9C51929854579.5787G7C23EA4D1FB9.4D618E528C8F37BA9.89A9D3B2G17431C6F." +
        "DB2AEF56481C3G797.C3735393EFG4BD162.262E111F4A5B59585.B818FGA3C34222E6D." +
        "7E2F666B1G138A95C",                                                      // box2014 #8
  // D4
  "17x17:C566F13DGBBCE8974.GH66587AEBB99F33D.DD1F4E6463GAA7899.DDH787C25AEG65F99." +
        "B4E93H3C92F7D6G85.31CA26E9889F7HG14.22BBH9937EA8DCGF6.5F2CABH1114BG6D73." +
        "F758CAG11H853D2E4.E9DDC4A1H42F3976G.BCE4HFG975AD32168.4AAGDDB5C667FEE22." +
        "1AAEDD86BGF4B3H22.88G113FA2CB3HB55E.63957GEB2F3EH4CAA.9G33752FDDH1C1BAA." +
        "9B33655GD7CHEA24F",                                                      // Godzilla 128
];

let puzzleChoice = 2;
let puzzleCount = cannedPuzzles.length;

// which puzzles have demos
const demoPuzzles  = [1,2];
// which puzzles are at which level [D1,D2,D3,D4]
const puzzleLevels = [1,12,17,25];

const demoText = [
 ["<p>In this demo we will walk through the steps of solving this puzzle. " +
    "Press the 'next' button to walk through the solving steps, or the " +
    "'back' button to return to the previous step.</p>" +
    "<p>The first thing to do is to search out 'illegal' combinations of " +
    "digits in a row or column which would violate rule #1. This can be " +
    "done manually, or with Assist Mode 2 (if enabled). Once these are " +
    "identified, you must figure out which of the 2 or more digits must " +
    "be 'disabled' to satisfy the rule.</p>",
  "Easy ones to knock out are triplets in a row, since clearly only the " +
    "middle one can remain in that scenario in order for there not to be " +
    "two black cells adjacent, which would violate rule #2. The middle '3' " +
    "digit in the second row must remain enabled, and the other two must " +
    "be disabled.",
  "Now that these are disabled, it is clear which of the '1' digits are to " +
    "remain in the upper left, in order to avoid rule 2's adjacent black cells.",
  "Now we can invoke rule #3, the 'river rule' and notice that the '4' " +
    "digit in the top row must not be disabled, else it would 'strand' the " +
    "'1' to its left. Similarly, among the four '2' digits in the bottom left, " +
    "only one arrangement keeps the bottom left '2' from being stranded. " +
    "The other digits of the same number in that row or column must thus " +
    "be disabled.",
  "Similarly we can choose the correct arrangement of the '6' digits in the " +
    "bottom two rows to avoid stranding the digits to the left. Ditto the '5' " +
    "digits in the leftmost column.",
  "Again we must choose the '4' in the second-to-rightmost column that doesn't " +
    "strand the 6 on the bottom row.",
  "Now looking at the '7' digits in contention, we can't disable the one in the " +
    "middle of the rightmost column, else the southeast corner is stranded. " +
    "The other two must be disabled.",
  "The final step is to recognize that disabling the '6' in third leftmost " +
    "column would strand the west side. Once the other is disabled, it is clear " +
    "what to do with the '5' digits, and the puzzle is solved.",
  "Congratulations! The puzzle is solved!"],
 ["<p>In this demo we will walk more quickly through the steps of solving " +
    "this tougher puzzle. It is recommended to go through demo 1 first. " +
    "Press the 'next' button to walk through the solving steps, or the " +
    "'back' button to return to the previous step.</p>" +
    "<p>The first thing to do is to search out 'illegal' combinations of " +
    "digits in a row or column. This can be done with Assist Mode 2 (if " +
    "enabled) or by hand. Once these are identified, you must figure out " +
    "which of the duplicate digits must be 'disabled'.</p>",
  "A new scenario is shown on the first row, where four '4' digits are " +
    "located. Since two are adjacent, they can't both be invalid, so one " +
    "must stay, and the two leftmost are thus invalid. Afterwards we can " +
    "handle the adjacent digits in the usual manner to avoid violating " +
    "rule #2 about adjacent black cells.",
  "In the fourth column we see a triple of '4' digits, so we can disable " +
    "two of them, and then handle the digits that are adjacent to them in " +
    "the typical manner.",
  "Now we see three tiles that are blocking 'white streams' from flowing " +
    "so they must be allowed to be valid. Disable their numeric counterparts " +
    "in that row or column.",
  "The remaining quad of '1' digits are now easy to complete the puzzle.",
  "Congratulations! The puzzle is solved!"]];

const demoMoves = [
 [[],
  [],
  ["11","13"],
  ["00"],
  ["42","51","60"],
  ["54","63","30"],
  ["45"],
  ["33","66"],
  ["26","15"]],
 [[],
  [],
  ["00","02","20","07"],
  ["13","33","31","31","42","53","62","64","66"],
  ["05","27","60","55"],
  ["35","46"]]];

