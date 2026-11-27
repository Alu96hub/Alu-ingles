/* ==========================================================
   word-classes-data.js — respuestas correctas de la actividad de clases de palabras

   Cada oración (mismo id que en sentences.js) es una lista de palabras en orden.
   La puntuación va pegada a la palabra, tal como en la oración ("wet,"); el script la
   separa solo. Las contracciones se dividen en dos palabras: I’ll = I + ’ll,
   didn’t = did + n’t (las partes ’xx y n’t se muestran pegadas a la anterior).

   Funciones auxiliares (cada una crea una palabra con su respuesta):
     det(palabra, subtipo, nota)    determiner
     pron(palabra, subtipo, nota)   pronoun
     verb(palabra, subtipo, nota)   verb
     adj(palabra, subtipo, nota)    adjective
     adv(palabra, subtipo, nota)    adverb
     prep(palabra, subtipo, nota)   preposition
     conj(palabra, subtipo, nota)   conjunction
     oth(palabra, subtipo, nota)    otros: "infinitive" (to) o "existential" (there)
     n(palabra, concreteness, conteo, nota)  sustantivo común
            concreteness: "concrete" | "abstract"   conteo: "countable" | "uncountable"
     pn(palabra, nota)              sustantivo propio
   "nota" es opcional: se muestra al corregir en los casos discutibles.

   CRITERIOS
     - Posesivos (my, their…) y demostrativos (this, these…) acompañando a un sustantivo = determiners.
     - Concrete = personas, animales, objetos, lugares, materiales; abstract = ideas, sentimientos,
       eventos y períodos de tiempo.
     - Todas las palabras de un nombre propio (Camp Wonderful) son proper noun.
     - Los verbos no finitos (doing, to wait) son verbos de acción.
   ========================================================== */

/* ---------- Funciones auxiliares ---------- */

// Crea una palabra con su clase, subtipo y nota
function palabraClase(palabra, clase, sub, nota) {
  return { palabra: palabra, clase: clase, sub: sub, nota: nota || "" };
}
function det(p, s, nota)  { return palabraClase(p, "det", s, nota); }
function pron(p, s, nota) { return palabraClase(p, "pron", s, nota); }
function verb(p, s, nota) { return palabraClase(p, "verb", s, nota); }
function adj(p, s, nota)  { return palabraClase(p, "adj", s, nota); }
function adv(p, s, nota)  { return palabraClase(p, "adv", s, nota); }
function prep(p, s, nota) { return palabraClase(p, "prep", s, nota); }
function conj(p, s, nota) { return palabraClase(p, "conj", s, nota); }
function oth(p, s, nota)  { return palabraClase(p, "oth", s, nota); }

// Sustantivo común: además del tipo (common) lleva dos ejes
function n(p, concreteness, conteo, nota) {
  const w = palabraClase(p, "noun", "common", nota);
  w.concreteness = concreteness;
  w.conteo = conteo;
  return w;
}
// Sustantivo propio: no lleva más ejes
function pn(p, nota) { return palabraClase(p, "noun", "proper", nota); }

/* ---------- Palabras de cada oración ---------- */

const WORD_CLASSES = {
  1: [
    det("The", "article"), n("grass", "concrete", "uncountable"), verb("was", "linking"),
    adj("wet,", "descriptive"), conj("and", "coordinating"), det("the", "article"),
    n("earth", "concrete", "uncountable"),
    verb("smelled", "action", "También podría leerse como linking (smell of = tener olor a)."),
    prep("of", "other"), n("springtime.", "abstract", "uncountable")
  ],
  2: [
    oth("There", "existential"),
    verb("is", "linking", "Es el be existencial: expresa existencia, no una acción."),
    n("love", "abstract", "uncountable"),
    det("enough", "quantifier", "Va después del sustantivo (love enough)."),
    prep("in", "place"), det("this", "demonstrative"), n("world", "concrete", "countable"),
    prep("for", "other"), pron("everybody,", "indefinite"), conj("if", "subordinating"),
    n("people", "concrete", "countable", "People es plural; algunas listas lo consideran un sustantivo colectivo."),
    verb("will", "modal"), adv("just", "degree"), verb("look.", "action")
  ],
  3: [
    pron("We", "personal"), verb("boarded", "action"), det("our", "possessive"),
    n("train", "concrete", "countable"), prep("with", "other"), n("feelings", "abstract", "countable"),
    prep("of", "other"), adj("unbounded", "descriptive"), n("relief.", "abstract", "uncountable")
  ],
  4: [
    det("The", "article"), n("drought", "abstract", "countable"), verb("had", "auxiliary"),
    verb("lasted", "action"), adv("now", "time"), prep("for", "time"),
    det("ten", "numeral"), det("million", "numeral"), n("years,", "abstract", "countable"),
    conj("and", "coordinating"), det("the", "article"), n("reign", "abstract", "countable"),
    prep("of", "other"), det("the", "article"), adj("terrible", "descriptive"),
    n("lizards", "concrete", "countable"), verb("had", "auxiliary"), adv("long", "time"),
    adv("since", "time"), verb("ended.", "action")
  ],
  5: [
    conj("Whenever", "subordinating"), pron("I", "personal"), verb("look", "action"),
    prep("at", "place"), det("a", "article"), n("mountain,", "concrete", "countable"),
    pron("I", "personal"), verb("expect", "action"),
    pron("it", "object", "It tiene la misma forma como sujeto y como objeto; acá es objeto de expect."),
    oth("to", "infinitive"),
    verb("turn", "action", "Turn into = convertirse en; también podría tomarse como linking."),
    prep("into", "direction"), det("a", "article"), n("volcano.", "concrete", "countable")
  ],
  6: [
    det("Every", "distributive"), n("year", "abstract", "countable"),
    n("thousands", "abstract", "countable", "Thousands funciona como sustantivo (thousands of…)."),
    prep("of", "other"), n("salmon", "concrete", "countable", "Plural igual al singular."),
    verb("swim", "action"), prep("up", "direction"), det("the", "article"),
    n("stream", "concrete", "countable"), prep("near", "place"), det("my", "possessive"),
    n("house,", "concrete", "countable"), conj("yet", "coordinating"), pron("I", "personal"),
    verb("have", "auxiliary"), adv("scarcely", "degree"), adv("ever", "frequency"),
    verb("seen", "action"), pron("one.", "indefinite", "One reemplaza a salmon (pronombre sustituto).")
  ],
  7: [
    det("The", "article"), n("dog", "concrete", "countable"), verb("hid", "action"),
    prep("in", "place"), det("the", "article"), n("bedroom", "concrete", "countable"),
    conj("and", "coordinating"), verb("whimpered", "action"), conj("while", "subordinating"),
    pn("Chris"), verb("played", "action"), det("his", "possessive"), n("violin.", "concrete", "countable")
  ],
  8: [
    conj("When", "subordinating"), pron("I", "personal"), verb("was", "linking"),
    det("a", "article"), n("child,", "concrete", "countable"), pron("I", "personal"),
    verb("would", "modal"), verb("place", "action"), det("the", "article"),
    n("covers", "concrete", "countable"), prep("over", "place"), det("my", "possessive"),
    n("head", "concrete", "countable"), conj("before", "subordinating"), pron("I", "personal"),
    verb("went", "action"), prep("to", "direction"),
    n("sleep.", "abstract", "uncountable", "En go to sleep, sleep funciona como sustantivo.")
  ],
  9: [
    pron("He", "personal"), verb("was", "linking"), adv("exceedingly", "degree"),
    adj("poor,", "descriptive"), verb("wearing", "action"),
    adv("only", "degree", "Only es un adverbio de foco; acá se lo agrupa en degree."),
    det("a", "article"), adj("ragged", "descriptive"), n("shirt", "concrete", "countable"),
    conj("and", "coordinating"), n("trousers.", "concrete", "countable")
  ],
  10: [
    det("The", "article"), n("birds", "concrete", "countable"), verb("jumped", "action"),
    prep("onto", "direction"), det("their", "possessive"), n("perches,", "concrete", "countable"),
    det("the", "article"), n("animals", "concrete", "countable"), verb("settled", "action"),
    adv("down", "place", "Partícula del phrasal verb settle down."), prep("in", "place"),
    det("the", "article"), n("straw,", "concrete", "uncountable"), conj("and", "coordinating"),
    det("the", "article"), adj("whole", "descriptive"), n("farm", "concrete", "countable"),
    verb("was", "linking"), adj("asleep", "descriptive"), prep("in", "time"),
    det("a", "article"), n("moment.", "abstract", "countable")
  ],
  11: [
    conj("Although", "subordinating"), pn("Kevin"), verb("was", "linking"), adj("ill,", "descriptive"),
    pron("he", "personal"), verb("went", "action"), prep("to", "direction"),
    n("school.", "concrete", "countable", "Uso institucional sin artículo (go to school).")
  ],
  12: [
    det("The", "article"), n("maths", "abstract", "uncountable"), n("teacher", "concrete", "countable"),
    verb("said", "action"), pron("we", "personal"), verb("could", "modal"), verb("use", "action"),
    det("the", "article"), n("calculator", "concrete", "countable"), prep("in", "place"),
    det("the", "article"), n("exam", "abstract", "countable"), conj("but", "coordinating"),
    pron("I", "personal"), verb("did", "auxiliary"), adv("n’t", "negation"),
    verb("need", "action"), pron("it.", "object")
  ],
  13: [
    prep("At", "place"), n("school,", "concrete", "countable", "Uso institucional sin artículo."),
    n("teachers", "concrete", "countable"), verb("celebrated", "action"), det("their", "possessive"),
    n("day", "abstract", "countable"), conj("and", "coordinating"), n("parents", "concrete", "countable"),
    verb("thanked", "action"), pron("them", "object"), prep("for", "other"), det("their", "possessive"),
    adj("great", "descriptive"), n("job.", "abstract", "countable")
  ],
  14: [
    prep("Before", "time"), n("dinner,", "concrete", "uncountable"), pn("Paul"),
    conj("and", "coordinating"), pn("Alan"), verb("played", "action"),
    n("video", "concrete", "countable", "Sustantivo que modifica a otro sustantivo (video games)."),
    n("games", "concrete", "countable"), prep("in", "place"), det("the", "article"),
    adj("living", "descriptive", "Participio con función de adjetivo (living room)."),
    n("room.", "concrete", "countable")
  ],
  15: [
    pron("I", "personal"), verb("’ll", "modal"), verb("cook", "action"),
    n("dinner", "concrete", "uncountable"), conj("if", "subordinating"), pron("you", "personal"),
    verb("do", "action", "Acá do es verbo principal (do the dishes), no auxiliar."),
    det("the", "article"), n("dishes.", "concrete", "countable")
  ],
  16: [
    pn("Lady"), pn("Gaga"), verb("is", "linking"), det("a", "article"), adj("great", "descriptive"),
    n("artist", "concrete", "countable"), conj("but", "coordinating"), pn("Madonna"),
    verb("is", "linking"), det("the", "article"),
    adj("best.", "comparative", "Superlativo usado como sustantivo (the best).")
  ],
  17: [
    det("Another", "other"), n("student", "concrete", "countable"), verb("suggested", "action"),
    verb("doing", "action"), det("the", "article"), n("test", "abstract", "countable"),
    adv("online,", "place", "También puede verse como manner."), pron("which", "relative"),
    verb("was", "linking"), adv("not", "negation"), det("a", "article"),
    adj("good", "descriptive"), n("idea.", "abstract", "countable")
  ],
  18: [
    pn("Ms"), pn("Adams,"), pron("who", "relative"), verb("is", "linking"), det("the", "article"),
    adv("most", "degree", "Forma el superlativo junto con patient."),
    adj("patient", "comparative"), n("teacher", "concrete", "countable"), prep("in", "place"),
    det("the", "article"), n("world,", "concrete", "countable"), verb("taught", "action"),
    pron("me", "object"), n("subtractions.", "abstract", "countable")
  ],
  19: [
    n("Guests", "concrete", "countable"), pron("who", "relative"), verb("want", "action"),
    oth("to", "infinitive"), verb("have", "action"), n("internet", "abstract", "uncountable"),
    n("access", "abstract", "uncountable"), prep("in", "place"), det("their", "possessive"),
    n("rooms", "concrete", "countable"), verb("will", "modal"), verb("be", "auxiliary"),
    verb("charged", "action"), det("an", "article"), adj("extra", "descriptive"),
    n("fee", "abstract", "countable"), prep("of", "other"), det("$10", "numeral"),
    prep("per", "other"), n("night.", "abstract", "countable")
  ],
  20: [
    pron("They", "personal"), verb("will", "modal"), adv("never", "frequency"), verb("know", "action"),
    pron("what", "relative", "What introduce una cláusula nominal (relativo sin antecedente)."),
    pron("I", "personal"), verb("’ve", "auxiliary"), verb("told", "action"), pron("him.", "object")
  ],
  21: [
    pron("I", "personal"), verb("made", "action"), det("an", "article"),
    n("airplane", "concrete", "countable"),
    prep("out", "other", "Out of es una preposición compuesta."), prep("of", "other"),
    n("stone.", "concrete", "uncountable")
  ],
  22: [
    pron("I", "personal"), verb("put", "action"), det("a", "article"), n("piece", "concrete", "countable"),
    prep("of", "other"), n("cantaloupe", "concrete", "uncountable"), prep("underneath", "place"),
    det("the", "article"), n("microscope.", "concrete", "countable")
  ],
  23: [
    conj("While", "subordinating"), verb("fishing", "action"), prep("in", "place"), det("the", "article"),
    adj("blue", "descriptive"), n("lagoon,", "concrete", "countable"), pron("I", "personal"),
    verb("caught", "action"), det("a", "article"), adj("lovely", "descriptive"),
    adj("silver", "descriptive"), n("fish.", "concrete", "countable")
  ],
  24: [
    det("My", "possessive"), n("voice", "concrete", "countable"), verb("was", "linking"),
    adj("raspy,", "descriptive"), adj("rough,", "descriptive"), conj("and", "coordinating"),
    adj("cracked.", "descriptive")
  ],
  25: [
    pron("I", "personal"), verb("opened", "action"), det("my", "possessive"),
    n("eyes", "concrete", "countable"), conj("and", "coordinating"), verb("looked", "action"),
    adv("up", "place", "Partícula del phrasal verb look up."), prep("at", "place"),
    det("the", "article"), n("rain,", "concrete", "uncountable"), conj("and", "coordinating"),
    pron("it", "personal"), verb("dripped", "action"), prep("in", "place"), det("my", "possessive"),
    n("head", "concrete", "countable"), conj("and", "coordinating"), verb("flowed", "action"),
    prep("into", "direction"), det("my", "possessive"), n("brain.", "concrete", "countable")
  ],
  26: [
    pron("I", "personal"), verb("’m", "auxiliary"), verb("going", "action"), prep("to", "direction"),
    pn("Camp", "Todas las palabras de un nombre propio (Camp Wonderful) son proper noun."),
    pn("Wonderful"), prep("beside", "place"), pn("Lake"), pn("Paradise"), prep("across", "place"),
    prep("from", "place"), pn("Blissful"), pn("Mountain"), prep("in", "place"), det("the", "article"),
    pn("Valley"), prep("of", "other"), det("the", "article"), pn("Nice.")
  ],
  27: [
    conj("If", "subordinating"), pron("I", "personal"), verb("had", "action"), det("a", "article"),
    n("brontosaurus,", "concrete", "countable"), pron("I", "personal"), verb("would", "modal"),
    verb("name", "action"), pron("him", "object"), pn("Horace"), conj("or", "coordinating"), pn("Morris.")
  ],
  28: [
    pron("I", "personal"), verb("am", "auxiliary"), verb("writing", "action"),
    det("these", "demonstrative"), n("poems", "concrete", "countable"), prep("from", "direction"),
    prep("inside", "place"), det("a", "article"), n("lion,", "concrete", "countable"),
    conj("and", "coordinating"), pron("it", "personal"), verb("’s", "linking"),
    adv("rather", "degree"), adj("dark", "descriptive"), prep("in", "place"), adv("here.", "place")
  ],
  29: [
    det("A", "article"), n("piece", "concrete", "countable"), prep("of", "other"),
    n("sky", "concrete", "uncountable"), verb("broke", "action"),
    adv("off", "place", "Partícula del phrasal verb break off."), conj("and", "coordinating"),
    verb("fell", "action"), prep("through", "direction"), det("the", "article"),
    n("crack", "concrete", "countable"), prep("in", "place"), det("the", "article"),
    n("ceiling", "concrete", "countable"), adv("right", "degree"), prep("into", "direction"),
    det("my", "possessive"), n("soup.", "concrete", "uncountable")
  ],
  30: [
    det("The", "article"), n("traffic", "concrete", "uncountable"), n("light", "concrete", "countable"),
    adv("simply", "degree", "Simply refuerza al verbo; también puede leerse como manner."),
    verb("would", "modal"), adv("not", "negation"),
    verb("turn", "linking", "Turn green = volverse verde."), adj("green,", "descriptive"),
    conj("so", "coordinating"), det("the", "article"), n("people", "concrete", "countable"),
    verb("stopped", "action"), oth("to", "infinitive"), verb("wait", "action"),
    conj("as", "subordinating"), det("the", "article"), n("traffic", "concrete", "uncountable"),
    verb("rolled", "action"), conj("and", "coordinating"), det("the", "article"),
    n("wind", "concrete", "uncountable"), verb("blew", "action"),
    adj("cold,", "descriptive", "Blew cold: cold también podría leerse como adverbio."),
    conj("and", "coordinating"), det("the", "article"), n("hour", "abstract", "countable"),
    verb("grew", "linking"), adj("dark", "descriptive"), conj("and", "coordinating"),
    adj("late.", "descriptive")
  ]
};
