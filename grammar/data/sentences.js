/* ==========================================================
   sentence-types-data.js — banco de oraciones de la actividad

   Cada oración tiene:
     id   : número único (se usa para recordar cuáles ya salieron)
     text : la oración, sin comillas
     type : "simple" | "compound" | "complex" | "compound-complex"
     sub  : solo si type es "complex". Uno de:
            "adverbial" | "noun" | "defining" | "non-defining"
            (en las demás, null)

   Para agregar oraciones: sumar un objeto nuevo con un id que no se repita.
   ========================================================== */

const SENTENCES = [
  { id: 1,  text: "The grass was wet, and the earth smelled of springtime.", type: "compound", sub: null },
  { id: 2,  text: "There is love enough in this world for everybody, if people will just look.", type: "complex", sub: "adverbial" },
  { id: 3,  text: "We boarded our train with feelings of unbounded relief.", type: "simple", sub: null },
  { id: 4,  text: "The drought had lasted now for ten million years, and the reign of the terrible lizards had long since ended.", type: "compound", sub: null },
  { id: 5,  text: "Whenever I look at a mountain, I expect it to turn into a volcano.", type: "complex", sub: "adverbial" },
  { id: 6,  text: "Every year thousands of salmon swim up the stream near my house, yet I have scarcely ever seen one.", type: "compound", sub: null },
  { id: 7,  text: "The dog hid in the bedroom and whimpered while Chris played his violin.", type: "complex", sub: "adverbial" },
  { id: 8,  text: "When I was a child, I would place the covers over my head before I went to sleep.", type: "complex", sub: "adverbial" },
  { id: 9,  text: "He was exceedingly poor, wearing only a ragged shirt and trousers.", type: "complex", sub: "non-defining" },
  { id: 10, text: "The birds jumped onto their perches, the animals settled down in the straw, and the whole farm was asleep in a moment.", type: "compound", sub: null },
  { id: 11, text: "Although Kevin was ill, he went to school.", type: "complex", sub: "adverbial" },
  { id: 12, text: "The maths teacher said we could use the calculator in the exam but I didn’t need it.", type: "compound-complex", sub: null },
  { id: 13, text: "At school, teachers celebrated their day and parents thanked them for their great job.", type: "compound", sub: null },
  { id: 14, text: "Before dinner, Paul and Alan played video games in the living room.", type: "simple", sub: null },
  { id: 15, text: "I’ll cook dinner if you do the dishes.", type: "complex", sub: "adverbial" },
  { id: 16, text: "Lady Gaga is a great artist but Madonna is the best.", type: "compound", sub: null },
  { id: 17, text: "Another student suggested doing the test online, which was not a good idea.", type: "complex", sub: "non-defining" },
  { id: 18, text: "Ms Adams, who is the most patient teacher in the world, taught me subtractions.", type: "complex", sub: "non-defining" },
  { id: 19, text: "Guests who want to have internet access in their rooms will be charged an extra fee of $10 per night.", type: "complex", sub: "defining" },
  { id: 20, text: "They will never know what I’ve told him.", type: "complex", sub: "noun" },
  { id: 21, text: "I made an airplane out of stone.", type: "simple", sub: null },
  { id: 22, text: "I put a piece of cantaloupe underneath the microscope.", type: "simple", sub: null },
  { id: 23, text: "While fishing in the blue lagoon, I caught a lovely silver fish.", type: "complex", sub: "adverbial" },
  { id: 24, text: "My voice was raspy, rough, and cracked.", type: "simple", sub: null },
  { id: 25, text: "I opened my eyes and looked up at the rain, and it dripped in my head and flowed into my brain.", type: "compound", sub: null },
  { id: 26, text: "I’m going to Camp Wonderful beside Lake Paradise across from Blissful Mountain in the Valley of the Nice.", type: "simple", sub: null },
  { id: 27, text: "If I had a brontosaurus, I would name him Horace or Morris.", type: "complex", sub: "adverbial" },
  { id: 28, text: "I am writing these poems from inside a lion, and it’s rather dark in here.", type: "compound", sub: null },
  { id: 29, text: "A piece of sky broke off and fell through the crack in the ceiling right into my soup.", type: "simple", sub: null },
  { id: 30, text: "The traffic light simply would not turn green, so the people stopped to wait as the traffic rolled and the wind blew cold, and the hour grew dark and late.", type: "compound-complex", sub: null }
];
