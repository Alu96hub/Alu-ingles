/* ==========================================================
   sentence-types.js — lógica de la actividad

   Flujo:
     1. Se sortean 10 oraciones del banco (SENTENCES, en el archivo de datos).
        Se priorizan las que NO salieron en sets anteriores (localStorage),
        para que no se repitan hasta haber visto todas.
     2. Se dibuja cada oración con un selector de tipo. Si se elige "complex"
        aparece un segundo selector para el tipo de cláusula dependiente.
     3. "Corregir" marca cada tarjeta (verde/rojo), muestra la respuesta
        correcta en las erróneas y calcula el puntaje.
     4. "Nuevo set de 10" vuelve a sortear.
   ========================================================== */

/* ---------- Configuración ---------- */

const CANTIDAD = 10;                      // cuántas oraciones se muestran por set
const CLAVE_VISTAS = "sentenceTypes.vistas"; // clave de localStorage

// Opciones del primer selector: [valor, texto visible]
const TIPOS = [
  ["simple", "Simple"],
  ["compound", "Compound"],
  ["complex", "Complex"],
  ["compound-complex", "Compound-complex"]
];

// Opciones del segundo selector (solo para "complex")
const SUBTIPOS = [
  ["adverbial", "Adverbial clause"],
  ["noun", "Noun clause"],
  ["defining", "Relative clause (defining)"],
  ["non-defining", "Relative clause (non-defining)"]
];

/* ---------- Referencias al HTML ---------- */

const lista = document.getElementById("lista");
const btnCorregir = document.getElementById("btn-corregir");
const btnNuevo = document.getElementById("btn-nuevo");
const puntaje = document.getElementById("puntaje");
const aviso = document.getElementById("aviso");

// Set actual: arreglo de objetos { oracion, tarjeta, selTipo, selSub }
let setActual = [];

/* ---------- Utilidades ---------- */

// Baraja un arreglo con Fisher-Yates (devuelve una copia, no modifica el original).
// Es más justo que ordenar con Math.random() - 0.5, que sesga el resultado.
function barajar(arreglo) {
  const copia = arreglo.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // índice al azar entre 0 e i
    [copia[i], copia[j]] = [copia[j], copia[i]];   // intercambio
  }
  return copia;
}

// Lee de localStorage los ids ya vistos. Si falla (modo privado, datos rotos), devuelve [].
function leerVistas() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_VISTAS));
    return Array.isArray(guardado) ? guardado : [];
  } catch (error) {
    return [];
  }
}

// Guarda los ids vistos. Si falla, la actividad sigue funcionando (solo se pierde la memoria).
function guardarVistas(ids) {
  try {
    localStorage.setItem(CLAVE_VISTAS, JSON.stringify(ids));
  } catch (error) {
    /* sin almacenamiento: se ignora */
  }
}

// Texto legible de un tipo/subtipo a partir de su valor interno
function etiqueta(opciones, valor) {
  const par = opciones.find(function (o) { return o[0] === valor; });
  return par ? par[1] : valor;
}

// Arma un <select> con una opción inicial vacía y las opciones dadas
function crearSelect(opciones, textoInicial) {
  const select = document.createElement("select");
  const vacia = document.createElement("option");
  vacia.value = "";
  vacia.textContent = textoInicial;
  select.appendChild(vacia);
  opciones.forEach(function (o) {
    const opcion = document.createElement("option");
    opcion.value = o[0];
    opcion.textContent = o[1];
    select.appendChild(opcion);
  });
  return select;
}

/* ---------- Sorteo ---------- */

// Elige CANTIDAD oraciones, priorizando las no vistas.
function sortearSet() {
  let vistas = leerVistas();

  // Oraciones que todavía no salieron
  let pendientes = SENTENCES.filter(function (s) { return !vistas.includes(s.id); });

  // Si quedan menos de CANTIDAD sin ver, se reinicia la memoria y se vuelve a empezar
  if (pendientes.length < CANTIDAD) {
    vistas = [];
    pendientes = SENTENCES.slice();
  }

  const elegidas = barajar(pendientes).slice(0, CANTIDAD);

  // Se recuerdan las elegidas para el próximo set
  guardarVistas(vistas.concat(elegidas.map(function (s) { return s.id; })));
  return elegidas;
}

/* ---------- Dibujo ---------- */

// Crea la tarjeta de una oración y devuelve las referencias que se usarán al corregir
function crearTarjeta(oracion, numero) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "item";

  const texto = document.createElement("p");
  texto.className = "oracion";
  texto.innerHTML = '<span class="num">' + numero + ".</span>";
  texto.appendChild(document.createTextNode(oracion.text)); // textContent seguro, sin interpretar HTML

  const selectores = document.createElement("div");
  selectores.className = "selectores";

  const selTipo = crearSelect(TIPOS, "Sentence type…");
  const selSub = crearSelect(SUBTIPOS, "Dependent clause…");
  selSub.classList.add("oculto"); // solo se ve si el tipo es "complex"

  // Mostrar/ocultar el segundo selector según el tipo elegido
  selTipo.addEventListener("change", function () {
    if (selTipo.value === "complex") {
      selSub.classList.remove("oculto");
    } else {
      selSub.classList.add("oculto");
      selSub.value = ""; // se limpia para no arrastrar una elección vieja
    }
  });

  selectores.appendChild(selTipo);
  selectores.appendChild(selSub);
  tarjeta.appendChild(texto);
  tarjeta.appendChild(selectores);

  return { oracion: oracion, tarjeta: tarjeta, selTipo: selTipo, selSub: selSub };
}

// Dibuja un set nuevo desde cero
function nuevoSet() {
  lista.innerHTML = "";
  puntaje.textContent = "";
  aviso.textContent = "";
  btnCorregir.disabled = false;

  setActual = sortearSet().map(function (oracion, i) {
    const item = crearTarjeta(oracion, i + 1);
    lista.appendChild(item.tarjeta);
    return item;
  });

  window.scrollTo({ top: 0 });
}

/* ---------- Corrección ---------- */

function corregir() {
  let aciertos = 0;
  let sinResponder = 0;

  setActual.forEach(function (item) {
    const o = item.oracion;
    const tipoElegido = item.selTipo.value;
    const subElegido = item.selSub.value;

    // Una respuesta es correcta si el tipo coincide y, cuando es "complex",
    // también coincide el tipo de cláusula dependiente
    const tipoOk = tipoElegido === o.type;
    const subOk = o.type !== "complex" || subElegido === o.sub;
    const correcta = tipoOk && subOk;

    if (!tipoElegido) sinResponder++;
    if (correcta) aciertos++;

    // Texto de la respuesta correcta, para mostrarla si falló
    let respuesta = etiqueta(TIPOS, o.type);
    if (o.type === "complex") respuesta += " — " + etiqueta(SUBTIPOS, o.sub);

    // Mensaje debajo de la tarjeta
    const mensaje = document.createElement("p");
    mensaje.className = "resultado";
    if (correcta) {
      mensaje.textContent = "Correcto: " + respuesta + ".";
    } else if (!tipoElegido) {
      mensaje.textContent = "Sin responder. Respuesta: " + respuesta + ".";
    } else {
      mensaje.textContent = "Respuesta correcta: " + respuesta + ".";
    }

    item.tarjeta.classList.add(correcta ? "correcto" : "incorrecto");
    item.tarjeta.appendChild(mensaje);

    // Se bloquean los selectores para no cambiar la respuesta después de corregir
    item.selTipo.disabled = true;
    item.selSub.disabled = true;
  });

  puntaje.textContent = aciertos + " / " + setActual.length;
  if (sinResponder > 0) {
    aviso.textContent = sinResponder + " sin responder (cuentan como incorrectas).";
  }
  btnCorregir.disabled = true; // evita corregir dos veces el mismo set
}

/* ---------- Eventos e inicio ---------- */

btnCorregir.addEventListener("click", corregir);
btnNuevo.addEventListener("click", nuevoSet);

nuevoSet(); // al abrir la página ya aparece un set
