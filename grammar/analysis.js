/* ==========================================================
   analysis.js — respuestas correctas del ejercicio de frases y cláusulas

   Cada entrada usa el mismo id que la oración en sentences.js:
     key  : la oración con corchetes. Formato:  [ETIQUETA texto]
            Los corchetes pueden ir anidados: [NP the park [PP in [NP the city]]]
     note : (opcional) aclaración que se muestra junto a la respuesta.

   ETIQUETAS usadas
     NP   noun phrase            VP   verb phrase (solo el grupo verbal)
     PP   prepositional phrase   AdvP adverb phrase
     AdjP adjective phrase
     IND  cláusula independiente (incluye las cláusulas dependientes que lleva adentro)
     SUB  cláusula dependiente (finita o no finita)

   CRITERIOS (para poder corregirlos si tu profesor usa otros)
     1. Solo se marcan grupos de 2 o más palabras (I, wet, quickly: sin corchetes).
        Las cláusulas IND y SUB se marcan siempre.
     2. Las etiquetas indican la FORMA, no la función: un PP que hace de adverbio sigue siendo PP.
     3. VP es solo el grupo verbal (will never know), no todo el predicado.
     4. Una PP que modifica a un sustantivo va DENTRO del NP; una PP que modifica al verbo
        va al costado, a nivel de la cláusula.
     5. Los elementos coordinados se marcan como una sola unidad (Horace or Morris).
     6. Las cláusulas no finitas (-ing, to + verbo) se marcan SUB, igual que en la
        clasificación de la actividad anterior (Longman: non-finite dependent clauses).
   ========================================================== */

const ANALYSIS = {
  1: {
    key: "[IND [NP The grass] was wet], and [IND [NP the earth] smelled [PP of springtime]]."
  },
  2: {
    key: "[IND There is [NP love enough] [PP in [NP this world]] [PP for everybody], [SUB if people [VP will just look]]]."
  },
  3: {
    key: "[IND We boarded [NP our train] [PP with [NP feelings [PP of [NP unbounded relief]]]]]."
  },
  4: {
    key: "[IND [NP The drought] [VP had lasted] now [PP for [NP ten million years]]], and [IND [NP the reign [PP of [NP the terrible lizards]]] [VP had long since ended]]."
  },
  5: {
    key: "[IND [SUB Whenever I look [PP at [NP a mountain]]], I expect [SUB it [VP to turn] [PP into [NP a volcano]]]].",
    note: "to turn into a volcano es una cláusula no finita (to-infinitive) y se marca SUB."
  },
  6: {
    key: "[IND [NP Every year] [NP thousands [PP of salmon]] swim [PP up [NP the stream [PP near [NP my house]]]]], yet [IND I [VP have scarcely ever seen] one].",
    note: "near my house podría modificar a swim en vez de a the stream; acá se lo une al sustantivo más cercano."
  },
  7: {
    key: "[IND [NP The dog] hid [PP in [NP the bedroom]] and whimpered [SUB while Chris played [NP his violin]]].",
    note: "Hay un solo sujeto con dos verbos (hid y whimpered): es una sola cláusula independiente."
  },
  8: {
    key: "[IND [SUB When I was [NP a child]], I [VP would place] [NP the covers] [PP over [NP my head]] [SUB before I went [PP to sleep]]]."
  },
  9: {
    key: "[IND He was [AdjP exceedingly poor], [SUB wearing [NP only a ragged shirt and trousers]]].",
    note: "wearing… es una cláusula -ing no finita (SUB). En la gramática escolar tradicional sería solo una frase participial."
  },
  10: {
    key: "[IND [NP The birds] jumped [PP onto [NP their perches]]], [IND [NP the animals] [VP settled down] [PP in [NP the straw]]], and [IND [NP the whole farm] was asleep [PP in [NP a moment]]]."
  },
  11: {
    key: "[IND [SUB Although Kevin was ill], he went [PP to school]]."
  },
  12: {
    key: "[IND [NP The maths teacher] said [SUB we [VP could use] [NP the calculator] [PP in [NP the exam]]]] but [IND I [VP didn’t need] it]."
  },
  13: {
    key: "[IND [PP At school], teachers celebrated [NP their day]] and [IND parents thanked them [PP for [NP their great job]]]."
  },
  14: {
    key: "[IND [PP Before dinner], [NP Paul and Alan] played [NP video games] [PP in [NP the living room]]]."
  },
  15: {
    key: "[IND I’ll cook dinner [SUB if you do [NP the dishes]]]."
  },
  16: {
    key: "[IND [NP Lady Gaga] is [NP a great artist]] but [IND Madonna is [NP the best]]."
  },
  17: {
    key: "[IND [NP Another student] suggested [SUB doing [NP the test] online], [SUB which [VP was not] [NP a good idea]]].",
    note: "doing the test online es una cláusula -ing no finita. which se refiere a toda la idea anterior."
  },
  18: {
    key: "[IND [NP Ms Adams, [SUB who is [NP the most patient teacher [PP in [NP the world]]]]], taught me subtractions].",
    note: "La cláusula relativa va dentro del NP porque modifica a Ms Adams."
  },
  19: {
    key: "[IND [NP Guests [SUB who want [SUB to have [NP internet access] [PP in [NP their rooms]]]]] [VP will be charged] [NP an extra fee [PP of [NP $10 [PP per night]]]]].",
    note: "Hay una SUB dentro de otra SUB: to have… es una cláusula no finita dentro de la relativa who want…"
  },
  20: {
    key: "[IND They [VP will never know] [SUB what I’ve told him]]."
  },
  21: {
    key: "[IND I made [NP an airplane] [PP out of stone]]."
  },
  22: {
    key: "[IND I put [NP a piece [PP of cantaloupe]] [PP underneath [NP the microscope]]]."
  },
  23: {
    key: "[IND [SUB While fishing [PP in [NP the blue lagoon]]], I caught [NP a lovely silver fish]].",
    note: "While fishing… es una cláusula adverbial no finita (SUB)."
  },
  24: {
    key: "[IND [NP My voice] was [AdjP raspy, rough, and cracked]]."
  },
  25: {
    key: "[IND I opened [NP my eyes] and [VP looked up] [PP at [NP the rain]]], and [IND it dripped [PP in [NP my head]] and flowed [PP into [NP my brain]]]."
  },
  26: {
    key: "[IND I’m going [PP to [NP Camp Wonderful]] [PP beside [NP Lake Paradise]] [PP across from [NP Blissful Mountain]] [PP in [NP the Valley [PP of [NP the Nice]]]]].",
    note: "Los PP en cadena podrían leerse como modificadores del sustantivo anterior. Acá se los toma como complementos del verbo."
  },
  27: {
    key: "[IND [SUB If I had [NP a brontosaurus]], I [VP would name] him [NP Horace or Morris]]."
  },
  28: {
    key: "[IND I [VP am writing] [NP these poems] [PP from [PP inside [NP a lion]]]], and [IND it’s [AdjP rather dark] [PP in here]]."
  },
  29: {
    key: "[IND [NP A piece [PP of sky]] [VP broke off] and fell [PP through [NP the crack [PP in [NP the ceiling]]]] [PP right into [NP my soup]]]."
  },
  30: {
    key: "[IND [NP The traffic light] simply [VP would not turn] green], so [IND [NP the people] stopped [SUB to wait] [SUB as [NP the traffic] rolled and [NP the wind] blew cold]], and [IND [NP the hour] grew [AdjP dark and late]]."
  }
};
