/* ==========================================================
   phrases-clauses.js — lógica de la actividad

   Flujo:
     1. Se sortean 10 oraciones de las 30 (priorizando las que no salieron antes).
     2. Cada oración aparece en un cuadro de texto ya escrito. La persona
        agrega corchetes a mano o con los botones de la barra:
        seleccionar palabras + tocar una etiqueta  ->  [ETIQUETA palabras]
     3. "Ver respuestas" bloquea los cuadros y muestra, debajo de cada uno,
        la oración con los corchetes correctos (anidados y coloreados)
        y su clasificación. No se compara con lo escrito: la comparación
        la hace quien practica.

   Datos usados (cargados antes en el HTML):
     SENTENCES  (../data/sentences.js)  texto, tipo y subtipo de cada oración
     ANALYSIS   (../data/analysis.js)   oración con corchetes y nota opcional
   ========================================================== */

/* ---------- Configuración ---------- */

const CANTIDAD = 10;                          // oraciones por set
const CLAVE_VISTAS = "phrasesClauses.vistas"; // clave de localStorage (propia de esta actividad)

// Etiquetas que aparecen como botones en la barra
const ETIQUETAS = ["NP", "VP", "PP", "AdvP", "AdjP", "IND", "SUB"];

// Textos para mostrar la clasificación de la oración (misma que la otra actividad)
const NOMBRES_TIPO = {
  "simple": "Simple",
  "compound": "Compound",
  "complex": "Complex",
  "compound-complex": "Compound-complex"
};
const NOMBRES_SUBTIPO = {
  "adverbial": "adverbial clause",
  "noun": "noun clause",
  "defining": "relative clause (defining)",
  "non-defining": "relative clause (non-defining)"
};

// Ejemplo de la ayuda (oración del handout "Types of Phrases")
const EJEMPLO = "[IND [NP The crazy old lady [PP in [NP the park]]] feeds [NP the pigeons] [NP every day]].";

/* ---------- Referencias al HTML ---------- */

const lista = document.getElementById("lista");
const barra = document.getElementById("barra");
const btnRespuestas = document.getElementById("btn-respuestas");
const btnNuevo = document.getElementById("btn-nuevo");

// Set actual: arreglo de objetos { oracion, tarjeta, area, historial, estado }
let setActual = [];

// Cuadro de texto en el que se escribió por última vez (la barra actúa sobre este)
let areaActiva = null;

/* ---------- Utilidades de sorteo (mismo criterio que la otra actividad) ---------- */

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

// Elige CANTIDAD oraciones que tengan respuesta cargada, priorizando las no vistas
function sortearSet() {
  // Solo entran oraciones que tienen clave en ANALYSIS
  const disponibles = SENTENCES.filter(function (s) { return ANALYSIS[s.id]; });

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

/* ---------- Lectura de corchetes (parser) ---------- */

/*
  Convierte un texto con corchetes en un árbol.
    "[IND [NP The grass] was wet]"
  da:
    raiz.hijos = [ { etiqueta:"IND", hijos:[ {etiqueta:"NP", hijos:[{texto:"The grass"}]},
                                            {texto:" was wet"} ] } ]
  Devuelve también cuántos corchetes quedaron sin cerrar y cuántos "]" sobran,
  para avisar mientras se escribe.
*/
function parsear(texto) {
  const raiz = { hijos: [] };
  const pila = [raiz];       // pila de grupos abiertos; el último es el actual
  let buffer = "";           // texto suelto acumulado
  let sobran = 0;            // "]" sin su "[" correspondiente
  let i = 0;

  // Pasa el texto acumulado al grupo actual como un nodo de texto
  function volcar() {
    if (buffer) {
      pila[pila.length - 1].hijos.push({ texto: buffer });
      buffer = "";
    }
  }

  while (i < texto.length) {
    const c = texto[i];

    if (c === "[") {
      volcar();
      // La etiqueta son las letras que siguen al "["
      let j = i + 1;
      let etiqueta = "";
      while (j < texto.length && /[A-Za-z]/.test(texto[j])) {
        etiqueta += texto[j];
        j++;
      }
      const nodo = { etiqueta: etiqueta, hijos: [] };
      pila[pila.length - 1].hijos.push(nodo);
      pila.push(nodo);   // desde acá, lo que siga queda dentro de este grupo
      i = j;
      if (texto[i] === " ") i++;  // se descarta el espacio que separa etiqueta y texto
      continue;
    }

    if (c === "]") {
      volcar();
      if (pila.length > 1) {
        pila.pop();      // se cierra el grupo actual
      } else {
        sobran++;        // había un "]" sin abrir
      }
      i++;
      continue;
    }

    buffer += c;
    i++;
  }
  volcar();

  return { raiz: raiz, sinCerrar: pila.length - 1, sobran: sobran };
}

/* ---------- Dibujo del árbol ---------- */

// Convierte los hijos de un nodo en elementos del DOM (recursivo)
function dibujarHijos(nodo, contenedor) {
  nodo.hijos.forEach(function (hijo) {
    if (hijo.texto !== undefined) {
      contenedor.appendChild(document.createTextNode(hijo.texto));
      return;
    }

    // Grupo: <span class="grupo g-NP"> [ ...hijos... ] <sub>NP</sub> </span>
    const grupo = document.createElement("span");
    grupo.className = "grupo g-" + hijo.etiqueta;

    const abre = document.createElement("span");
    abre.className = "corchete";
    abre.textContent = "[";

    const cierra = document.createElement("span");
    cierra.className = "corchete";
    cierra.textContent = "]";

    const etq = document.createElement("sub");
    etq.className = "etq";
    etq.textContent = hijo.etiqueta;

    grupo.appendChild(abre);
    dibujarHijos(hijo, grupo);   // los grupos anidados se dibujan dentro de este
    grupo.appendChild(cierra);
    grupo.appendChild(etq);
    contenedor.appendChild(grupo);
  });
}

// Dibuja un texto con corchetes dentro del elemento indicado
function dibujarEn(elemento, textoConCorchetes) {
  elemento.innerHTML = "";
  dibujarHijos(parsear(textoConCorchetes).raiz, elemento);
}

/* ---------- Barra de herramientas ---------- */

// Guarda el valor actual para poder deshacer el último cambio hecho con la barra
function guardarHistorial(item) {
  item.historial.push(item.area.value);
}

// Rodea la selección con [ETIQUETA ...]. Sin selección, inserta [ETIQUETA ] y deja el cursor adentro.
function envolver(etiqueta) {
  const item = itemActivo();
  if (!item) return;
  const ta = item.area;
  guardarHistorial(item);

  let inicio = ta.selectionStart;
  let fin = ta.selectionEnd;

  // Se recortan espacios en los bordes de la selección para no dejar "[NP  the grass ]"
  while (inicio < fin && ta.value[inicio] === " ") inicio++;
  while (fin > inicio && ta.value[fin - 1] === " ") fin--;

  const antes = ta.value.slice(0, inicio);
  const seleccion = ta.value.slice(inicio, fin);
  const despues = ta.value.slice(fin);

  const abre = "[" + etiqueta + " ";
  ta.value = antes + abre + seleccion + "]" + despues;

  // Cursor: si había selección, después del "]"; si no, entre la etiqueta y el "]"
  const cursor = seleccion
    ? inicio + abre.length + seleccion.length + 1
    : inicio + abre.length;
  ta.focus();
  ta.setSelectionRange(cursor, cursor);
  actualizarEstado(item);
}

// Inserta un corchete suelto en el cursor ("[" al inicio de la selección, "]" al final)
function insertarCorchete(caracter) {
  const item = itemActivo();
  if (!item) return;
  const ta = item.area;
  guardarHistorial(item);

  const posicion = caracter === "[" ? ta.selectionStart : ta.selectionEnd;
  ta.value = ta.value.slice(0, posicion) + caracter + ta.value.slice(posicion);
  ta.focus();
  ta.setSelectionRange(posicion + 1, posicion + 1);
  actualizarEstado(item);
}

// Vuelve al valor anterior a la última acción de la barra
function deshacer() {
  const item = itemActivo();
  if (!item || item.historial.length === 0) return;
  item.area.value = item.historial.pop();
  item.area.focus();
  actualizarEstado(item);
}

// Deja el cuadro como al principio: la oración sola, sin corchetes
function reiniciar() {
  const item = itemActivo();
  if (!item) return;
  guardarHistorial(item);
  item.area.value = item.oracion.text;
  item.area.focus();
  actualizarEstado(item);
}

// Item (oración) correspondiente al cuadro activo
function itemActivo() {
  return setActual.find(function (it) { return it.area === areaActiva; }) || null;
}

// Crea un botón de la barra. "accion" se ejecuta al tocarlo.
function crearBoton(texto, accion, etiqueta) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.textContent = texto;
  if (etiqueta) {
    // Las clases g-XX y data-etiqueta le dan el color de esa etiqueta
    boton.classList.add("g-" + etiqueta);
    boton.dataset.etiqueta = etiqueta;
  } else {
    boton.classList.add("neutro");
  }
  // En escritorio, evita que el botón le quite el foco al cuadro de texto
  boton.addEventListener("mousedown", function (e) { e.preventDefault(); });
  boton.addEventListener("click", accion);
  return boton;
}

function armarBarra() {
  ETIQUETAS.forEach(function (etiqueta) {
    barra.appendChild(crearBoton(etiqueta, function () { envolver(etiqueta); }, etiqueta));
  });
  barra.appendChild(crearBoton("[", function () { insertarCorchete("["); }));
  barra.appendChild(crearBoton("]", function () { insertarCorchete("]"); }));
  barra.appendChild(crearBoton("Deshacer", deshacer));
  barra.appendChild(crearBoton("Reiniciar", reiniciar));
}

/* ---------- Tarjetas de oraciones ---------- */

// Muestra si los corchetes están balanceados (solo sintaxis, no dice si el análisis es correcto)
function actualizarEstado(item) {
  const r = parsear(item.area.value);
  if (r.sinCerrar === 0 && r.sobran === 0) {
    item.estado.textContent = "Corchetes balanceados.";
    item.estado.classList.remove("alerta");
  } else {
    const partes = [];
    if (r.sinCerrar > 0) partes.push("faltan cerrar " + r.sinCerrar);
    if (r.sobran > 0) partes.push("sobran " + r.sobran + " “]”");
    item.estado.textContent = "Corchetes: " + partes.join(" y ") + ".";
    item.estado.classList.add("alerta");
  }
}

function crearTarjeta(oracion, numero) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "item";

  const titulo = document.createElement("p");
  titulo.className = "num";
  titulo.textContent = "Oración " + numero;

  // El cuadro empieza con la oración escrita: solo hay que insertar corchetes
  const area = document.createElement("textarea");
  area.className = "analisis";
  area.rows = 3;
  area.value = oracion.text;
  area.spellcheck = false;          // evita los subrayados rojos del corrector
  area.setAttribute("aria-label", "Oración " + numero + " con corchetes");

  const estado = document.createElement("p");
  estado.className = "estado";

  tarjeta.appendChild(titulo);
  tarjeta.appendChild(area);
  tarjeta.appendChild(estado);

  const item = { oracion: oracion, tarjeta: tarjeta, area: area, estado: estado, historial: [] };

  // Se recuerda cuál es el cuadro activo y se actualiza el aviso al escribir
  area.addEventListener("focus", function () { areaActiva = area; });
  area.addEventListener("input", function () { actualizarEstado(item); });

  actualizarEstado(item);
  return item;
}

/* ---------- Respuestas ---------- */

function verRespuestas() {
  setActual.forEach(function (item) {
    const o = item.oracion;
    const clave = ANALYSIS[o.id];

    const bloque = document.createElement("div");
    bloque.className = "respuesta";

    const rotulo = document.createElement("p");
    rotulo.className = "rotulo";
    rotulo.textContent = "Respuesta";

    // La oración con corchetes correctos, anidados y coloreados
    const arbol = document.createElement("p");
    arbol.className = "arbol";
    dibujarEn(arbol, clave.key);

    // Clasificación de la oración (la misma de la otra actividad)
    let clasificacion = NOMBRES_TIPO[o.type];
    if (o.type === "complex") clasificacion += " — " + NOMBRES_SUBTIPO[o.sub];
    const clasif = document.createElement("p");
    clasif.className = "clasif";
    clasif.innerHTML = "<strong>Tipo:</strong> ";
    clasif.appendChild(document.createTextNode(clasificacion));

    bloque.appendChild(rotulo);
    bloque.appendChild(arbol);
    bloque.appendChild(clasif);

    // Nota opcional del análisis (casos discutibles)
    if (clave.note) {
      const nota = document.createElement("p");
      nota.className = "nota";
      nota.textContent = clave.note;
      bloque.appendChild(nota);
    }

    item.tarjeta.appendChild(bloque);
    item.area.disabled = true;      // se bloquea para que no cambie lo escrito
  });

  btnRespuestas.disabled = true;    // evita mostrar dos veces las mismas respuestas
}

/* ---------- Set nuevo e inicio ---------- */

function nuevoSet() {
  lista.innerHTML = "";
  btnRespuestas.disabled = false;
  areaActiva = null;

  setActual = sortearSet().map(function (oracion, i) {
    const item = crearTarjeta(oracion, i + 1);
    lista.appendChild(item.tarjeta);
    return item;
  });

  // Por defecto la barra actúa sobre la primera oración
  if (setActual.length > 0) areaActiva = setActual[0].area;
  window.scrollTo({ top: 0 });
}

armarBarra();
dibujarEn(document.getElementById("ejemplo"), EJEMPLO);
btnRespuestas.addEventListener("click", verRespuestas);
btnNuevo.addEventListener("click", nuevoSet);
nuevoSet();
