/* ==========================================================
   word-classes.js — lógica de la actividad

   Flujo:
     1. Se sortean 5 de las 30 oraciones (priorizando las que no salieron antes).
     2. Cada palabra es un botón. Al tocarla se abre un panel inferior con niveles:
          nivel 1: la clase (Noun, Pronoun, Verb…)
          nivel 2: el subtipo (para Noun: tipo + concrete/abstract + countable/uncountable)
        Al completar una palabra, el panel pasa solo a la siguiente.
     3. "Corregir" marca cada palabra (✓ / ✗), da el puntaje y, debajo de cada oración,
        lista las palabras erróneas con tu respuesta y la correcta, más las notas.

   Datos usados (cargados antes en el HTML):
     SENTENCES     (../data/sentences.js)      las 30 oraciones
     WORD_CLASSES  (word-classes-data.js)      palabras de cada oración con su clase
   ========================================================== */

/* ---------- Configuración ---------- */

const CANTIDAD = 5;                        // oraciones por set
const CLAVE_VISTAS = "wordClasses.vistas"; // clave de localStorage (propia de esta actividad)

// Clases: [id, nombre completo]. El orden es el del panel.
const CLASES = [
  ["noun", "Noun"], ["pron", "Pronoun"], ["verb", "Verb"], ["adj", "Adjective"],
  ["adv", "Adverb"], ["prep", "Preposition"], ["conj", "Conjunction"],
  ["inter", "Interjection"], ["det", "Determiner"], ["oth", "Other"]
];

// Etiqueta corta que se muestra debajo de cada palabra
const ETIQUETA_CORTA = {
  noun: "Noun", pron: "Pron.", verb: "Verb", adj: "Adj.", adv: "Adv.",
  prep: "Prep.", conj: "Conj.", inter: "Interj.", det: "Det.", oth: "Other"
};

// Subtipos de cada clase: [id, nombre, ejemplos]. Noun y Interjection se tratan aparte.
const SUBTIPOS = {
  pron: [
    ["personal", "Personal", "I, you, he, she, it, we, they"],
    ["object", "Object", "me, him, her, us, them"],
    ["possessive", "Possessive", "mine, yours, hers, ours"],
    ["reflexive", "Reflexive", "myself, themselves"],
    ["demonstrative", "Demonstrative", "this, that, these"],
    ["relative", "Relative", "who, which, that, what"],
    ["indefinite", "Indefinite", "everybody, someone, one"]
  ],
  verb: [
    ["action", "Action", "run, eat, think"],
    ["linking", "Linking", "be, seem, become, feel"],
    ["auxiliary", "Auxiliary", "do, have, be"],
    ["modal", "Modal", "can, must, will, would"]
  ],
  adj: [
    ["descriptive", "Descriptive", "happy, blue, tall"],
    ["comparative", "Comparative / Superlative", "bigger, the biggest"]
  ],
  adv: [
    ["manner", "Manner", "quickly, well"],
    ["time", "Time", "now, yesterday, soon"],
    ["place", "Place", "here, there, outside"],
    ["frequency", "Frequency", "always, never"],
    ["degree", "Degree", "very, too, quite"],
    ["negation", "Negation", "not, n’t"]
  ],
  prep: [
    ["place", "Place", "in, on, at, under"],
    ["time", "Time", "before, after, during"],
    ["direction", "Direction", "to, into, through"],
    ["other", "Other", "of, with, for, per"]
  ],
  conj: [
    ["coordinating", "Coordinating", "and, but, or, so, yet"],
    ["subordinating", "Subordinating", "if, when, while, because"],
    ["correlative", "Correlative", "either… or, both… and"]
  ],
  det: [
    ["article", "Article", "a, an, the"],
    ["demonstrative", "Demonstrative", "this, that, these, those"],
    ["possessive", "Possessive", "my, your, his, their"],
    ["quantifier", "Quantifier", "some, many, few, enough"],
    ["numeral", "Numeral", "one, ten, $10"],
    ["distributive", "Distributive", "each, every, either"],
    ["other", "Other", "another, other"]
  ],
  oth: [
    ["infinitive", "Infinitive “to”", "to turn, to wait"],
    ["existential", "Existential “there”", "There is…"]
  ]
};

// Ejes del sustantivo
const EJES_SUSTANTIVO = {
  sub: [["common", "Common"], ["proper", "Proper"], ["collective", "Collective"]],
  concreteness: [["concrete", "Concrete"], ["abstract", "Abstract"]],
  conteo: [["countable", "Countable"], ["uncountable", "Uncountable"]]
};

/* ---------- Referencias al HTML ---------- */

const lista = document.getElementById("lista");
const puntaje = document.getElementById("puntaje");
const btnCorregir = document.getElementById("btn-corregir");
const btnNuevo = document.getElementById("btn-nuevo");

const panel = document.getElementById("panel");
const panelPalabra = document.getElementById("p-palabra");
const panelCuerpo = document.getElementById("p-cuerpo");

/* ---------- Estado ---------- */

let frases = [];        // una por oración: { oracion, palabras: [...] }
let palabras = [];      // todas las palabras del set, en orden de lectura
let actual = -1;        // índice de la palabra seleccionada (-1 = ninguna)
let forzarClases = false; // true cuando se vuelve al nivel 1 para cambiar la clase
let corregido = false;  // true después de corregir

/* ---------- Utilidades de sorteo (mismo criterio que las otras actividades) ---------- */

// Baraja con Fisher-Yates (devuelve una copia)
function barajar(arreglo) {
  const copia = arreglo.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Ids vistos, guardados en el navegador. Si falla el almacenamiento, devuelve [].
function leerVistas() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_VISTAS));
    return Array.isArray(guardado) ? guardado : [];
  } catch (error) {
    return [];
  }
}

function guardarVistas(ids) {
  try {
    localStorage.setItem(CLAVE_VISTAS, JSON.stringify(ids));
  } catch (error) {
    /* sin almacenamiento: la actividad sigue funcionando */
  }
}

// Elige CANTIDAD oraciones que tengan respuestas cargadas, priorizando las no vistas
function sortearSet() {
  const disponibles = SENTENCES.filter(function (s) { return WORD_CLASSES[s.id]; });

  let vistas = leerVistas();
  let pendientes = disponibles.filter(function (s) { return !vistas.includes(s.id); });

  // Si quedan menos de CANTIDAD sin ver, se reinicia la memoria
  if (pendientes.length < CANTIDAD) {
    vistas = [];
    pendientes = disponibles.slice();
  }

  const elegidas = barajar(pendientes).slice(0, CANTIDAD);
  guardarVistas(vistas.concat(elegidas.map(function (s) { return s.id; })));
  return elegidas;
}

/* ---------- Utilidades de respuestas ---------- */

// Separa la puntuación final de una palabra: "wet," -> { nucleo: "wet", cola: "," }
function separar(texto) {
  const m = texto.match(/^(.*?)([,.;:!?)”"]*)$/);
  return { nucleo: m[1], cola: m[2] };
}

// ¿La respuesta tiene todo lo necesario para esa clase?
function estaCompleta(r) {
  if (!r.clase) return false;
  if (r.clase === "noun") {
    if (!r.sub) return false;
    // Un sustantivo común necesita además los dos ejes; propio y colectivo no
    return r.sub !== "common" || (!!r.concreteness && !!r.conteo);
  }
  if (r.clase === "inter") return true;  // la interjección no tiene subtipo
  return !!r.sub;
}

// Compara la respuesta de la persona con la clave de la palabra
function esCorrecta(p) {
  const r = p.resp;
  const k = p.token;
  if (r.clase !== k.clase) return false;
  if (k.clase === "inter") return true;
  if (r.sub !== k.sub) return false;
  if (k.clase === "noun" && k.sub === "common") {
    return r.concreteness === k.concreteness && r.conteo === k.conteo;
  }
  return true;
}

// Texto legible de una respuesta o de una clave: "Noun · common · concrete · uncountable"
function describir(x) {
  if (!x.clase) return "sin responder";
  const partes = [nombreClase(x.clase)];
  if (x.sub) partes.push(x.sub);
  if (x.concreteness) partes.push(x.concreteness);
  if (x.conteo) partes.push(x.conteo);
  return partes.join(" · ");
}

function nombreClase(id) {
  const par = CLASES.find(function (c) { return c[0] === id; });
  return par ? par[1] : id;
}

/* ---------- Dibujo de las oraciones ---------- */

// Actualiza el color y la etiqueta de una palabra según su respuesta
function actualizarPalabra(p) {
  CLASES.forEach(function (c) { p.boton.classList.remove("c-" + c[0]); });
  const r = p.resp;
  if (!r.clase) {
    p.etq.textContent = "";
    return;
  }
  p.boton.classList.add("c-" + r.clase);
  // Los puntos suspensivos avisan que falta elegir el subtipo
  p.etq.textContent = ETIQUETA_CORTA[r.clase] + (estaCompleta(r) ? "" : "…");
}

// Crea la tarjeta de una oración con un botón por cada palabra
function crearTarjeta(oracion, numero) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "item";

  const titulo = document.createElement("p");
  titulo.className = "num";
  titulo.textContent = "Oración " + numero;

  const frase = document.createElement("p");
  frase.className = "frase";

  const tokens = WORD_CLASSES[oracion.id];
  const palabrasDeFrase = [];

  tokens.forEach(function (token, i) {
    const partes = separar(token.palabra);

    // Las contracciones (’ll, n’t…) se pegan a la palabra anterior; el resto va con espacio
    const pegado = /^’/.test(token.palabra) || token.palabra === "n’t";
    if (i > 0 && !pegado) frase.appendChild(document.createTextNode(" "));

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "pal";

    const texto = document.createElement("span");
    texto.textContent = partes.nucleo;
    const etq = document.createElement("span");
    etq.className = "etq";
    boton.appendChild(texto);
    boton.appendChild(etq);
    frase.appendChild(boton);

    // La puntuación va fuera del botón: no forma parte de lo que se clasifica
    if (partes.cola) frase.appendChild(document.createTextNode(partes.cola));

    const p = { token: token, nucleo: partes.nucleo, resp: {}, boton: boton, etq: etq, ok: false };
    palabrasDeFrase.push(p);
    palabras.push(p);

    const indice = palabras.length - 1;
    boton.addEventListener("click", function () {
      if (!corregido) seleccionar(indice);
    });
  });

  tarjeta.appendChild(titulo);
  tarjeta.appendChild(frase);

  return { oracion: oracion, tarjeta: tarjeta, palabras: palabrasDeFrase };
}

function nuevoSet() {
  lista.innerHTML = "";
  puntaje.textContent = "";
  btnCorregir.disabled = false;
  corregido = false;
  frases = [];
  palabras = [];
  cerrarPanel();

  sortearSet().forEach(function (oracion, i) {
    const f = crearTarjeta(oracion, i + 1);
    frases.push(f);
    lista.appendChild(f.tarjeta);
  });

  window.scrollTo({ top: 0 });
}

/* ---------- Panel inferior ---------- */

// Selecciona una palabra y abre el panel
function seleccionar(indice) {
  if (actual >= 0 && palabras[actual]) palabras[actual].boton.classList.remove("activa");
  actual = indice;
  forzarClases = false;
  palabras[actual].boton.classList.add("activa");
  panel.hidden = false;
  dibujarPanel();
  mantenerVisible(palabras[actual].boton);
}

function cerrarPanel() {
  if (actual >= 0 && palabras[actual]) palabras[actual].boton.classList.remove("activa");
  actual = -1;
  panel.hidden = true;
}

// Pasa a la palabra anterior (-1) o siguiente (+1). Después de la última, cierra el panel.
function avanzar(delta) {
  const destino = actual + delta;
  if (destino < 0) return;
  if (destino >= palabras.length) {
    cerrarPanel();
    return;
  }
  seleccionar(destino);
}

// Si el panel tapa la palabra, se desplaza la página para que quede a la vista
function mantenerVisible(elemento) {
  const caja = elemento.getBoundingClientRect();
  const limiteInferior = window.innerHeight - panel.offsetHeight - 12;
  if (caja.bottom > limiteInferior || caja.top < 8) {
    const destino = window.scrollY + caja.top - window.innerHeight * 0.15;
    window.scrollTo({ top: Math.max(0, destino), behavior: "smooth" });
  }
}

// Crea un botón del panel. "color" (id de clase) le da el color de esa clase.
function crearBotonPanel(texto, ejemplo, elegido, accion, color) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.textContent = texto;
  if (color) boton.classList.add("c-" + color);
  if (elegido) boton.classList.add("elegido");
  if (ejemplo) {
    const chico = document.createElement("small");
    chico.textContent = ejemplo;
    boton.appendChild(chico);
  }
  boton.addEventListener("click", accion);
  return boton;
}

// Agrega al panel un título de grupo y una rejilla de botones
function agregarGrupo(titulo, botones, claseColor) {
  if (titulo) {
    const t = document.createElement("p");
    t.className = "grupo-titulo";
    t.textContent = titulo;
    panelCuerpo.appendChild(t);
  }
  const rejilla = document.createElement("div");
  rejilla.className = "rejilla" + (claseColor ? " c-" + claseColor : "");
  botones.forEach(function (b) { rejilla.appendChild(b); });
  panelCuerpo.appendChild(rejilla);
}

// Redibuja el panel según la palabra seleccionada y su nivel
function dibujarPanel() {
  if (actual < 0) return;
  const p = palabras[actual];
  const r = p.resp;

  // Cabecera: la palabra y cuántas van
  panelPalabra.textContent = p.nucleo + " ";
  const contador = document.createElement("span");
  contador.className = "contador";
  contador.textContent = "(" + (actual + 1) + "/" + palabras.length + ")";
  panelPalabra.appendChild(contador);

  panelCuerpo.innerHTML = "";

  // ----- Nivel 1: elegir la clase -----
  if (!r.clase || forzarClases) {
    agregarGrupo("Clase de palabra", CLASES.map(function (c) {
      return crearBotonPanel(c[1], "", r.clase === c[0], function () { elegirClase(c[0]); }, c[0]);
    }));
    return;
  }

  // ----- Nivel 2: subtipo -----
  // Fila superior: volver al nivel 1 y clase elegida
  const nivel = document.createElement("div");
  nivel.className = "nivel c-" + r.clase;
  const volver = document.createElement("button");
  volver.type = "button";
  volver.textContent = "‹ Clases";
  volver.addEventListener("click", function () { forzarClases = true; dibujarPanel(); });
  const actualClase = document.createElement("span");
  actualClase.className = "clase-actual";
  actualClase.textContent = nombreClase(r.clase);
  nivel.appendChild(volver);
  nivel.appendChild(actualClase);
  panelCuerpo.appendChild(nivel);

  if (r.clase === "noun") {
    // Sustantivo: tipo y, si es común, los dos ejes
    agregarGrupo("Tipo", EJES_SUSTANTIVO.sub.map(function (o) {
      return crearBotonPanel(o[1], "", r.sub === o[0], function () { elegirSub(o[0]); });
    }), "noun");

    if (r.sub === "common") {
      agregarGrupo("¿Concrete o abstract?", EJES_SUSTANTIVO.concreteness.map(function (o) {
        return crearBotonPanel(o[1], "", r.concreteness === o[0], function () { elegirEje("concreteness", o[0]); });
      }), "noun");
      agregarGrupo("¿Countable o uncountable?", EJES_SUSTANTIVO.conteo.map(function (o) {
        return crearBotonPanel(o[1], "", r.conteo === o[0], function () { elegirEje("conteo", o[0]); });
      }), "noun");
    }
  } else if (SUBTIPOS[r.clase]) {
    // Resto de las clases: una sola lista de subtipos con ejemplos
    agregarGrupo("Tipo", SUBTIPOS[r.clase].map(function (o) {
      return crearBotonPanel(o[1], o[2], r.sub === o[0], function () { elegirSub(o[0]); });
    }), r.clase);
  }
}

/* ---------- Elecciones en el panel ---------- */

// Después de cada cambio: se actualiza la palabra y, si se acaba de completar, se pasa a la siguiente
function alCambiar(p, estabaCompleta) {
  actualizarPalabra(p);
  if (estaCompleta(p.resp) && !estabaCompleta) {
    avanzar(1);
  } else {
    dibujarPanel();
  }
}

function elegirClase(id) {
  const p = palabras[actual];
  const estabaCompleta = estaCompleta(p.resp);
  // Cambiar de clase borra lo elegido antes (subtipo y ejes)
  if (p.resp.clase !== id) p.resp = { clase: id };
  forzarClases = false;
  alCambiar(p, estabaCompleta);
}

function elegirSub(valor) {
  const p = palabras[actual];
  const estabaCompleta = estaCompleta(p.resp);
  p.resp.sub = valor;
  // Los ejes solo corresponden a los sustantivos comunes
  if (p.resp.clase === "noun" && valor !== "common") {
    delete p.resp.concreteness;
    delete p.resp.conteo;
  }
  alCambiar(p, estabaCompleta);
}

function elegirEje(eje, valor) {
  const p = palabras[actual];
  const estabaCompleta = estaCompleta(p.resp);
  p.resp[eje] = valor;
  alCambiar(p, estabaCompleta);
}

function quitarRespuesta() {
  if (actual < 0) return;
  const p = palabras[actual];
  p.resp = {};
  forzarClases = false;
  actualizarPalabra(p);
  dibujarPanel();
}

/* ---------- Corrección ---------- */

function corregir() {
  corregido = true;
  cerrarPanel();

  // 1) Marcar cada palabra
  palabras.forEach(function (p) {
    p.ok = esCorrecta(p);
    p.boton.classList.add(p.ok ? "ok" : "mal");
    p.etq.textContent = (p.ok ? "✓ " : "✗ ") + (p.resp.clase ? ETIQUETA_CORTA[p.resp.clase] : "—");
  });

  // 2) Informe debajo de cada oración
  let totalAciertos = 0;
  frases.forEach(function (f) {
    const malas = f.palabras.filter(function (p) { return !p.ok; });
    const aciertos = f.palabras.length - malas.length;
    totalAciertos += aciertos;

    const informe = document.createElement("div");
    informe.className = "informe";

    const resumen = document.createElement("p");
    resumen.className = "aciertos";
    resumen.textContent = "Aciertos: " + aciertos + " / " + f.palabras.length;
    informe.appendChild(resumen);

    // Palabras erróneas: tu respuesta y la correcta
    if (malas.length > 0) {
      const ul = document.createElement("ul");
      malas.forEach(function (p) {
        const li = document.createElement("li");
        const palabra = document.createElement("strong");
        palabra.textContent = p.nucleo;
        li.appendChild(palabra);
        li.appendChild(document.createTextNode(": tu respuesta → " + describir(p.resp) + "; correcta → "));
        const correcta = document.createElement("span");
        correcta.className = "mala";
        correcta.textContent = describir(p.token);
        li.appendChild(correcta);
        ul.appendChild(li);
      });
      informe.appendChild(ul);
    }

    // Notas de los casos discutibles (se muestran todas, estén bien o mal)
    f.palabras.forEach(function (p) {
      if (!p.token.nota) return;
      const nota = document.createElement("p");
      nota.className = "nota";
      nota.textContent = p.nucleo + ": " + p.token.nota;
      informe.appendChild(nota);
    });

    f.tarjeta.appendChild(informe);
  });

  puntaje.textContent = totalAciertos + " / " + palabras.length + " palabras";
  btnCorregir.disabled = true;
}

/* ---------- Eventos e inicio ---------- */

document.getElementById("p-ant").addEventListener("click", function () { avanzar(-1); });
document.getElementById("p-sig").addEventListener("click", function () { avanzar(1); });
document.getElementById("p-cerrar").addEventListener("click", cerrarPanel);
document.getElementById("p-quitar").addEventListener("click", quitarRespuesta);
btnCorregir.addEventListener("click", corregir);
btnNuevo.addEventListener("click", nuevoSet);

nuevoSet(); // al abrir la página ya aparece un set
