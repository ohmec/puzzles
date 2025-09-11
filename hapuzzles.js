// Heyawake puzzle definitions, must be of the form:
// WxH:<room-descriptors>
// where W is puzzle width, H is height. Room descriptors are 5-character
// descriptors that include, in order, xywhd where x,y describes the
// starting location, w,h describes the room's width and height, and 'd'
// is the digit within the room (or '-' for none). Values greater than 9
// should use a-z to represent 10-35. For instance a 3-wide 2-high room
// with a requirement of 2 black squares at coordinate location 12,3 should
// be designated as 'c3322'.
//
// special case for the 0th entry, which includes a hexadecimal descriptor
// of the black (1) / white (0) starting points for a solved puzzle.
const cannedPuzzles = [
  // example completed one
  "8x8:0014-.04322.06222.10323.12422.2632-.3431-.35312.4032-.5222-.56220." +
      "6422-.70132.7311-.7611-.77110:09.52.88.44.29.44.10.a2",
  "8x8:0014-.04322.06222.10323.12422.2632-.3431-.35312.4032-.5222-.56220." +
      "6422-.70132.7311-.7611-.77110",
  // D1 
  "10x10:0031-.01330.04312.0531-.06321.0832-.30333.33332.36320.38323." +
        "60244.64241.6832-.80232.8322-.85132.95131.9812-",                // 2014 #1
  "10x10:0041-.01132.0421-.05333.08222.1113-.21221.2322-.28220.35433." +
        "4012-.4242-.4441-.48221.50522.6822-.7513-.82233.8523-.8822-",    // 2014 #2
  "10x10:0021-.01110.02141.06111.0711-.08120.11110.12320.14323.16320." +
        "18323.20221.4032-.42323.44432.4723-.67233.70310.7111-.72221." +
        "81111.8412-.86111.87130.91121.93121.9512-.97132",                // 2024 #1
  "10x10:00312.01243.0543-.08222.2152-.23220.28423.30412.43221.4522-." +
        "4721-.6317-.70243.7422-.7622-.78221.901A2",                      // 2024 #3
  "10x10:00252.05254.20323.2226-.2812-.3812-.4211-.43332.4611-.4732-." +
        "49312.50333.56412.73130.77332.80222.8224-.9611-",                // 2024 #5
  "10x10:00222.0213-.05132.0811-.09A1-.12222.1423-.17222.20221.3232-." +
        "34323.36232.4011-.41111.50220.56132.6227-.70221.82211.8323-." +
        "86233.9012-",                                                    // marugoto #1
  "10x10:00222.0223-.0523-.08222.20320.2251-.23150.2832-.3344-.37511." +
        "5032-.5832-.72153.80220.8223-.8523-.88222",                      // marugoto #2
  "10x10:0012-.02111.03232.06131.0911-.1021-.11222.16111.17211.1822-." +
        "2313-.2641-.30131.33132.37322.39111.4041-.41312.42321.44222." +
        "4931-.64111.65321.67412.6811-.7122-.73222.78322.80111.90131." +
        "9313-.96111",                                                    // marugoto #3
  "10x10:0013-.03130.06321.08222.10221.12111.13233.2241-.2812-.3012-." +
        "33310.3422-.36323.3831-.39312.4022-.54220.6014-.66220.6822-." +
        "7012-.72130.7511-.80220.8223-.8522-.87222.8921-",                // marugoto #4
  // D2
  "10x10:00312.01322.03253.08222.2315-.28310.2931-.30376.3741-.58222." +
        "60243.6423-.77332.8021-.81232.84233",                            // 2014 #3
  "10x10:00221.02222.0421-.05233.0821-.0921-.20322.2222-.2421-.25412." +
        "2632-.2822-.4212-.4441-.4812-.50121.52322.5612-.5832-.60221." +
        "6521-.66222.8021-.81211.82232.8521-.86221.88222",                // 2014 #4
  "10x10:00120.0221-.03131.06120.0812-.10222.1311-.14131.1732-.19111." +
        "22422.24434.2921-.3012-.4032-.47230.62243.6612-.6822-.70221." +
        "76322.8214-.88222.9011-.91152",                                  // 2014 #5
  "10x10:00222.0221-.0321-.0421-.05220.07131.17221.19311.2041-.21334." +
        "2413-.3422-.36132.4614-.51534.54523.56512.57332.6021-.8011-." +
        "87231.90110",                                                    // 2014 #6
  "10x10:00132.03343.07220.09513.10232.27322.30232.3324-.50232.53244." +
        "57333.70230.73322.75321.87232.90132",                            // 2024 #7
  "17x17:00132.0314-.07222.09243.0D232.0G21-.10332.13322.15222.2711-." +
        "28252.2D323.2F22-.35132.40233.431A3.4F222.532A7.5D12-.60333." +
        "6D243.73322.7532-.7733-.7A312.7B52-.8D434.8G11-.9023-.9G312." +
        "A3132.A6152.B0423.B2623.B4432.B7141.C714-.CB22-.CD52-.CF22-." +
        "D714-.E722-.E932-.EB323.EF312.EG31-.F0222.F413-.G412-.G6132",    // 2024 #18
  "10x10:00222.0232-.0432-.06132.0941-.1623-.20220.32174.4024-.44323." +
        "4624-.60141.6612-.68323.70312.7133-.7412-.76322.8421-.8521-." +
        "9812-",                                                          // marugoto
  "10x10:00222.0211-.03221.05322.07132.1211-.1723-.20422.22222.2421-." +
        "3512-.37222.3951-.4261-.43243.5732-.60323.6341-.6443-.8711-." +
        "88222.9012-.9711-",                                              // marugoto
  "10x10:00222.0223-.0512-.0722-.09312.1511-.16111.2012-.22312.2344-." +
        "27222.3021-.31210.3911-.4711-.4812-.5022-.5221-.5711-.5812-." +
        "6324-.6711-.68321.7022-.72311.77211.83233.8611-.90121.9613-." +
        "99111",                                                          // marugoto
  "10x10:00312.01322.0314-.07333.1322-.15222.3013-.3353-.36333.39613." +
        "40333.6622-.68410.70131.80222.82232.8523-.99111",                // marugoto
  "10x10:00222.0213-.05412.06140.12233.16322.1832-.2012-.3031-.3133-." +
        "3411-.4422-.46332.49312.60323.6232-.64412.6511-.75231.78121." +
        "88221.9014-.95132",                                              // marugoto
  "10x10:00222.0223-.05233.08322.2022-.22321.24312.2533-.3822-.40220." +
        "5213-.55335.5812-.60221.6223-.6822-.8023-.8322-.8521-.8622-." +
        "8822-",                                                          // marugoto
  "17x17:00222.0222-.0413-.0773-.0A232.0D233.0G612.14335.20322.2232-." +
        "2A32-.2C344.4413-.5013-.53243.5A22-.5C232.5F21-.6013-.6G11-." +
        "7037-.77330.7A37-.A0255.A5120.A773-.AA334.AD421.AF12-.B5424." +
        "BF423.C0354.DA420.DC11-.EC323.EE31-.F0242.F4222.F621-.FF222",    // 2018
  // D3
  "10x10:00222.02221.0433-.07322.09312.20343.34233.3723-.50511.51333." +
        "5423-.57312.5812-.6822-.74333.81233.8723-",                      // 2024 #13
  "10x10:00132.0324-.0721-.08222.1013-.2032-.22222.2413-.2723-.34132." +
        "42263.48412.49611.50323.6221-.6324-.6721-.80232.8323-.86232",    // 2024 #15 "excellent"
  "17x17:00412.0113-.04132.0741-.08421.0A434.0D132.0G11-.11333.1413-." +
        "1D14-.2413-.2D21-.2E43-.3413-.40220.42253.47253.4C220.60344." +
        "64220.66432.69334.6C253.8411-.8521-.8C13-.8F423.90422.92334." +
        "99264.A5445.B933-.BC233.C2232.CF12-.D012-.DC11-.DD322.DF321." +
        "E0264.E631-.E7321.E923-.EC210.G013-.G3110.G412-.G911-.GA130." +
        "GD142",                                                          // 2024 #20 "excellent"
  "17x17:00230.0311-.04110.05110.0611-.07241.0B11-.0C21-.0D421.0F12-." +
        "13131.1611-.1B110.1F12-.2022-.2271-.23332.2621-.27231.2A232." +
        "2F323.40110.4111-.46110.4723-.4A11-.4B12-.4D11-.4E41-.5011-." +
        "51111.53221.55321.5A11-.5B333.5F32-.6012-.6722-.69221.7042-." +
        "7332-.8522-.8721-.8843-.8B43-.8E23-.92211.A311-.A4321.A612-." +
        "AE110.AF221.B0321.B2322.B6221.BE11-.C822-.CA342.CE311.CF422." +
        "D421-.D5432.E011-.E1130.E8323.F0221.F2233.FA23-.FD11-.FE110." +
        "GD111.GE131",                                                    // 2024 #24
  "10x10:00132.0352-.05233.0831-.09311.1022-.12412.2523-.3022-.3822-." +
        "4523-.5015-.58220.6022-.6241-.63221.6513-.7532-.7731-.7822-." +
        "80222.8322-.9812-",                                              // marugoto
  "10x10:00311.0132-.03332.0632-.0812-.1811-.1911-.28323.3032-.3214-." +
        "3622-.42321.4421-.4541-.5634-.6032-.6411-.72230.8523-.88222." +
        "90153",                                                          // marugoto
  "10x10:00712.0141-.02163.08412.09812.12333.1533-.41612.42232.45222." +
        "4742-.6223-.6522-.70312.8222-.84221.86142.9614-",                // marugoto
  "10x10:00222.02433.05233.0821-.0921-.2012-.25232.2822-.30422.42335." +
        "4525-.65322.67312.6832-.7022-.7213-.8223-.9012-.9515-",          // marugoto
  "10x10:00222.0223-.05231.08222.20333.2322-.25221.27231.43434.4643-." +
        "49612.50323.5251-.8022-.83233.86232",                            // 2018
  "10x10:00511.01222.03264.0921-.21321.23412.2432-.26242.46331.49312." +
        "50132.54222.6024-.74322.76142.8021-.81232.86242",                // 2018
  "17x17:00513.0141-.0231-.0321-.0411-.05423.0722-.0922-.0B142.0F222." +
        "1421-.1B333.1E51-.2311-.27241.2F423.3213-.4114-.4524-.4921-." +
        "4A22-.4C222.5015-.60355.6515-.6A322.6C333.6F322.75322.77335." +
        "90323.92332.9A274.A5151.B5220.B7211.B8142.BC13-.BF12-.C0230." +
        "C332-.C824-.CC23-.CF120.D5332.DF41-.DG312.E0111.E112-.E8333." +
        "EB323.ED322.F0121.F212-.F4211.G012-.G2121.G5131.GG11-",          // 2018
  // D4
  "10x10:0011-.01180.0911-.10810.11222.1324-.1722-.19610.3142-.33440." +
        "3742-.7122-.7324-.7723-.9011-.91160.97131",                      // 2018
  "17x17:00334.03311.04330.07132.0A33-.0D310.0E232.1733-.2E333.30332." +
        "33333.3611-.3A11-.3B334.46153.56332.5912-.5E333.60310.61333." +
        "64513.6521-.69332.6C513.6D21-.8533-.88111.8D331.8G311.90130." +
        "9321-.98332.9B21-.A0332.B3333.B612-.BB334.BE331.C6153.D0333." +
        "D611-.D733-.DA11-.E3312.E4332.EA334.ED332.EG311.G0131.G7131",    // 2018
  "31x45:0022-.02153.07152.0C43-.0F312.0G21-.0H220.0J17-.0Q222.0S21-." +
        "0T222.12332.1533-.18310.19333.1J232.1M142.2012-.2G93-.2M422." +
        "2O44-.2S22-.2U412.3032-.3F31-.3J33-.4213-.4531-.46142.4A140." +
        "4E511.4S220.52335.5624-.5A44-.60322.6F513.6J335.6M345.6Q42-." +
        "6S232.7523-.78323.8222-.84211.8S23-.9032-.9513-.9A230.9D22-." +
        "9J44-.9N331.A2421.A444-.A812-.AQ33-.AT323.B8335.BB322.BD23-." +
        "BG13-.C0322.CG132.CN312.CO32-.DD53-.DG51-.DH23-.DK220.DM21-." +
        "DQ32-.DS33-.E233-.E5183.F0322.F531-.F673-.F9344.FH321.FJ53-." +
        "FM240.GQ33-.GT323.H213-.HM44-.I0333.I3335.I9335.IC33-.IF312." +
        "IG23-.JQ232.JT42-.KG12-.KI142.L025-.L5613.L922-.LB23-.LE44-." +
        "LI41-.LJ1A-.M643-.MJ345.MN335.MQ333.N022-.N221-.N342-.N931-." +
        "NA22-.NC22-.NT22-.P0232.PA153.PF51-.PG32-.PI311.PJ44-.PN23-." +
        "PQ153.Q614-.QA230.QD222.QQ22-.QS232.R0142.R415-.R941-.RN231." +
        "S022-.S2412.S344-.S732-.SA25-.SG23-.SQ33-.ST222.TJ17-.U022-." +
        "UA233.UD130.UG23-.UJ321.UL12-.UN132.UT322.V7130.VD132.VL23-." +
        "VO52-.VQ233.W0233.W323-.W651-.W733-.WA51-.WB44-.WF321.WH322." +
        "XJ420.XL335.XQ151.Y042-.Y2244.YQ210.YR44-.Z7233.ZF142.a221-." +
        "a323-.aB25-.aG132.aL435.aO233.b6152.bG431.bJ42-.c0132.c312-." +
        "c542-.c7335.cA33-.cD335.cO332.cR312.cS13-.d033-.d3323.dS230." +
        "eL33-.f722-.f9243.fD23-.fG222.fI23-.fO27-.g0232.g331-.g413-." +
        "h422-.h6230.h9222.hB22-.hD222.hF230.hI22-.hK21-.hL233.hO253." +
        "hT222.i0132",                                                    // 2018
];
let puzzleChoice = 16;
let puzzleCount = cannedPuzzles.length;
const demoPuzzles = [1,4];

const demoText = [
 ["<p>In this demo we will walk through the steps of solving this puzzle. " +
    "Press the 'next' button to walk through the solving steps, or the " +
    "'back' button to return to the previous step.</p>" +
    "<p>At the beginning of a solve, there are no errors, but there are " +
    "many incomplete rooms. For our first time through we can " +
    "turn on Assist Mode 2 to see any errors that we might generate in the " +
    "process of the solve.</p>",
  "In Heyawake, it is always easiest to complete two types of rooms. The first " +
    "is a room with a digit greater than zero where there is only possible " +
    "solution (two examples are single-cell rooms with a '1' digit within, " +
    "or a 1x3 or 3x1 room with a '2' digit within). There are two of the " +
    "'2'-digit variety on this board. Secondly, we can clear out all rooms " +
    "with a '0' digit inside, since they can not have any black cells.",
  "Always in Heyawake the next step after setting any cell black is to " +
    "set all neighboring cells white so as to not violate rule 2 of the " +
    "puzzle involving adjoining black cells. We will do that now and for " +
    "all subsequent black cells.",
  "<p>Now let's look at two interesting edge cases that are similar to the " +
    "minimum-sized room approach. First, the '2' digit room in the upper " +
    "right of the puzzle: there are only two legal arrangements of " +
    "two black squares in a 2x2 room, effectively a diagonal in one of two " +
    "directions. Considering rule 4 about not isolating the 'river of " +
    "white cells', you can quickly determine that only the diagonal " +
    "pointing into the center of the puzzle board is legal.</p><p>" +
    "Similarly, let's look at the '3' digit room near the upper left. " +
    "This also has only two possible arrangements of the three black " +
    "squares, and only one of them is legal so as to not violate rule 4. " +
    "We can paint these squares black and their surrounding squares white.",
  "OK now we can begin to take advantage of the other cells that could " +
    "otherwise be potentially violating rule 4 about the continuous river " +
    "of white cells. Several cells that are currently white on the edges " +
    "of the board would be isolated if their neighbors were painted black. " +
    "One example is the '3' cell below the upper left gray square. If the " +
    "upper left square were painted black, the one below would be isolated, " +
    "and thus the upper left must be set to white. Similarly there are 7 more " +
    "cells that must be white to avoid isolation of their neighbors. We must " +
    "be careful to not make any false assumptions in this process, rivers " +
    "can flow in multiple directions, so do not clear too many squares.",
  "Once these cells are determined, the '2' digit room in the upper " +
    "portion of the board is reduced to a 'minimalist state', i.e. there " +
    "is only one arrangement of black squares to complete it.",
  "Now we can begin to see some potential trouble with rule 3, the one that " + 
    "requires that no string of white cells can pass through three consecutive " +
    "rooms. Looking at the right-most column, we can see that the blank " +
    "cell in the 5th row must be set to black, else it will violate the " +
    "border rule. Once that is set (and its adjacent cells cleared) it is " +
    "clear that the cell near the bottom right corner must also be set to " +
    "avoid another rule 3 violation.",
  "Another rule 3 violation is nearing in the 5th row from the top on the " +
    "right side. We can set that cell to black to avoid violation.",
  "At this time the 4x2 room in the upper half has three potential spots  " +
    "remaining for its 2 black squares. Clearly one of them would isolate " +
    "a white cell and thus violate rule 4. The other two can be set.",
  "There is a large 'river' of white squares potentially blocked above a " +
    "blank square in the 6th row 4th column. It must be set to white.",
  "Now there are two black cells that must be set to keep from violating " +
    "the three-room rule. Once those two are set, and their neighbors cleared, " +
    "the puzzle is complete.",
  "Congratulations! The puzzle is solved!"],
 ["<p>In this demo we will walk more quickly through the steps of solving " +
    "this puzzle. It is recommended to go through demo 1 first. Press the " +
    "'next' button to walk through the solving steps, or the 'back' button " +
    "to return to the previous step. You can also use the undo button to move " +
    "backwards individual steps, or continue playing forward if you wish.</p>" +
    "<p>The first thing to do is to turn on the assist mode to let us know " +
    "which rooms still need completion. Then there are several 'minimalistic' " +
    "rooms (those with only one choice of black cell arrangements), and zero " +
    "rooms that we can solve immediately, setting neighbors of black cells " +
    "to white in the process.</p>",
  "Now we can see two 3-rooms that have only one possible arrangement that " +
    "doesn't isolate their white cells, and a 1-cell in the bottom row that " +
    "only have one remaining cell to set black. Once that is set its " +
    "neighbor to the right can be completed as well.",
  "We can see some white cells at risk of being isolated, so their neighbors " +
    "need to be set to white to keep the river flowing.",
  "Now we can see several potential rule 3 violations pending, requiring the " +
    "edges of the consecutive squares to be set to black to avoid violating " +
    "the three consecutive rooms of white squares rule.",
  "The two remaining 3-rooms are now deterministic, and can be set.",
  "Back again to preventing rule 4 violations, certain cells can be set to " +
    "white to not block their neighbors.",
  "Two cells must be set to black to avoid violating rule 3",
  "Either of the final two undetermined squares could be used to keep the " +
    "left column from being a long string of which cells, however setting " +
    "the upper one to black would isolate the corner from the rest of the " +
    "white stream.",
  "Congratulations! The puzzle is solved!"]];

const demoMoves = [
 [[],
  [],
  ["B35","B55","B70","B72","W56","W57","W66","W67","W77"],
  ["W25","W34","W36","W45","W54","W65","W60","W71","W62","W73"],
  ["B07","B16","B11","B20","B31","W06","W15","W17","W26","W01","W10","W12","W21","W30","W32","W41"],
  ["W00","W02","W05","W27","W22","W40","W61"],
  ["B04","B24","W03","W14","W23"],
  ["B47","W37","W46","B76","W75"],
  ["B44","W43"],
  ["B13","W33","B42","W52"],
  ["W53"],
  ["B51","B63","W50","W64","W74"],[]],
 [[],
  ["W01","W08","W09","W11","W16","W17","W26","W27","W36","W37","W70",
   "W80","W90","W87","W88","W89","W12","W13","W22","W23","W32","W33",
   "B06","W05","W07","W16","B81","W71","W82","W91","B86","W76","W85",
   "W96","B97","B99","W98"],
  ["B18","B29","B38","W19","W28","W39","W48","B92","W93","B94","W84",
   "W95","B67","B78","B69","W57","W66","W68","W59","W77","W79"],
  ["W49","W58","W83"],
  ["B10","B14","B47","B72","B75","W00","W20","W04","W15","W24","W62",
   "W46","W73","W65","W74","B02","W03","B21","W31","B43","W42","W44",
   "W53"],
  ["B25","B34","W35","B52","B63","W51","W64"],
  ["W30","W57","W54","W56","W61"],
  ["B55","W45","B41","W40"],
  ["B60","W50"]]];
