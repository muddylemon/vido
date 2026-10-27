// Shared text and timing metadata. Drawing functions stay with their leaves.
(function(root) {
  const data = {
  "specs": {
    "L0_SPEC": {
      "t0": 0,
      "t1": 11,
      "textAt": 3.6,
      "revealEnd": 7.4,
      "verseY": 418,
      "dropCap": true,
      "verse": "Which was shewn him in a locked room in San Francisco, and again at the gates of Rome; that all might hear of it, and none be let in.",
      "rubric": "\"It's a pretty good marketing shtick if you want everybody to hear about something, not to let anybody in the room.\""
    },
    "L1_SPEC": {
      "t0": 11,
      "t1": 26,
      "revealEnd": 20.2,
      "head": "The First Leaf · Of the Four Quadrants",
      "verse": "^1And I saw the age to come divided as a field, into four parts. ^2In the first, unjust war. In the second, just war. In the third, a just peace. ^3And in the fourth was peace, and it was unjust; and the riders slept in their saddles. ^4And a voice said: Put odds on it. Are we not trending towards the fourth quadrant?",
      "rubric": "\"We're all scared to death that we're sleepwalking into Armageddon.\""
    },
    "L2_SPEC": {
      "t0": 26,
      "t1": 40,
      "revealEnd": 34.5,
      "head": "The Second Leaf · Of the Restrainer",
      "verse": "^1And I saw one that restraineth; and his name in the Greek is Katechon, because of course it is. ^2He stood in the breach with a mask upon his face and a clipboard in his hand, and held back a torrent; and the torrent was the future. ^3And behind him the people slept under a banner; and the banner said, PEACE AND SAFETY.",
      "rubric": "\"If you're too troubled, will we always end up with very unjust peace?\""
    },
    "L3_SPEC": {
      "t0": 40,
      "t1": 64,
      "revealEnd": 43.4,
      "head": "The Third Leaf · Of the Seven Trumpets",
      "verse": "^1And seven angels sounded seven trumpets; and it was told me, Even a Mozart cannot make a trumpet forget to sound like a trumpet. ^2And at each trumpet a face was shewn me, and I asked: Is it he?",
      "litany": [
        {
          "at": 44,
          "line": "i. A man with two faces, who would give his soul for a prize of peace.",
          "rubric": "\"a Dr. Jekyll and Mr. Hyde-type character\""
        },
        {
          "at": 46.7,
          "line": "ii. The shadow of a girl with a sign; a type, and not the thing itself.",
          "rubric": "\"I don't want to flatter her too much.\""
        },
        {
          "at": 49.4,
          "line": "iii. A black pill.",
          "rubric": "\"more depressed and more Luddite than Greta\""
        },
        {
          "at": 52.1,
          "line": "iv. A face, crossed out; for it was not popular.",
          "rubric": "\"the Antichrist is popular.\""
        },
        {
          "at": 54.8,
          "line": "v. Two crossed keys; and the voice said, He could have been.",
          "rubric": "\"could have been\""
        },
        {
          "at": 57.5,
          "line": "vi. A triple crown fused to a dome of state, and upon it a red star.",
          "rubric": "\"a woke American pope\""
        },
        {
          "at": 60.2,
          "line": "vii. And at the seventh trumpet no face was shewn me, but a machinery.",
          "rubric": null
        }
      ]
    },
    "L4_SPEC": {
      "t0": 64,
      "t1": 80,
      "revealEnd": 74,
      "head": "The Fourth Leaf · Of the Beast that is a Machinery",
      "verse": "^1And I beheld a beast that was not a man, but a machinery; built not overnight, but relatively quickly, under cover of peace and safety. ^2It was made of tax treaties and sanctions and the surveillance of money, and it was full of eyes before and behind; ^3that no man might hide his money. ^4And there was a switch.",
      "rubric": "\"There's a feeling it could be activated at the flip of a switch.\""
    },
    "L5_SPEC": {
      "t0": 80,
      "t1": 90,
      "revealEnd": 86,
      "head": "The Fifth Leaf · Of the Age of the Beast",
      "verse": "^1And it was told me, the Antichrist must make his mark quickly; more quickly than the Christ, who died at thirty-three and some months. ^2And I said, But we are a gerontocracy. ^3And the voice said: Then sixty-six is the new thirty-three.",
      "rubric": "\"in our gerontocracy, 66 is the new 33.\""
    },
    "L6_SPEC": {
      "t0": 90,
      "t1": 103,
      "revealEnd": 98,
      "head": "The Sixth Leaf · Of the Wink",
      "verse": "^1And I saw a pope lay down his crown and go into a quiet room, and say nothing; and I understood that his silence was a trumpet, and his resignation was a wink. ^2For had he spoken one peep of it, it would have dominated everything. ^3And he left breadcrumbs; and I got down on my knees, and gathered them.",
      "rubric": "\"these apocalyptic paroxysms make Benedict sound like a fire-and-brimstone Southern Baptist.\""
    },
    "L7_SPEC": {
      "t0": 103,
      "t1": 122,
      "revealEnd": 113,
      "head": "The Seventh Leaf · Here is Wisdom",
      "verse": "^1And when the trumpets were done, the seer went up to the seat of judgment, as every seer hath done, and divided the world. ^2And the saved were few, and were in the room; and the damned were many, and were outside the door. ^3And he lifted a glass to see the face of the Antichrist; and the glass shewed him a face, and upon its forehead a number; and the number was his own."
    },
    "COLO_SPEC": {
      "t0": 122,
      "t1": 130,
      "textAt": 122.8,
      "revealEnd": 126.5,
      "verseY": 300,
      "dropCap": false,
      "noFrame": true,
      "verse": "Set from four lectures leaked to The Verge, given at San Francisco and Rome, MMXXV–MMXXVI; and from \"The Pope and the Antichrist,\" First Things, July MMXXVI. After David Gibson.",
      "rubric": "\"Apocalyptic images are like a torrent of water that overflows the banks, and it is difficult to keep them in bounds.\" — Ratzinger, quoting another professor; quoted by Thiel."
    }
  },
  "titleCues": [
    [
      0.9,
      2.3,
      "THE APOCALYPSE OF PETER (Thiel)"
    ],
    [
      2.3,
      3.55,
      "A Woodcut in Seven Leaves"
    ]
  ],
  "wisdomCues": [
    [
      118.2,
      119.6,
      "HERE IS WISDOM"
    ],
    [
      119.6,
      121.7,
      "HERE IS WISDOM\nRev. XIII. 18"
    ]
  ],
  "wisdomReadingEnd": 118.15
};
  if (typeof module !== 'undefined') module.exports = data; else root.VIDO_APOCALYPSE = data;
})(globalThis);
