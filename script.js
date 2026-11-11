let escritosArray = [];
let escritoActualId = null;

// 1. Cargar datos del archivo escritos.json mediante fetch
async function inicializarEscritos() {
  try {
    const respuesta = await fetch('escritos.json');
    escritosArray = await respuesta.json();
    
    actualizarMarcadoresSidebar();

    // Carga inicial del primer escrito o del especificado en la ruta
    if (escritosArray.length > 0) {
      cargarTexto(escritosArray[0].id);
    }
  } catch (error) {
    console.error("Error al cargar los escritos desde escritos.json:", error);
  }
}

// 2. Control del índice desplegable
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.classList.toggle("collapsed");
  }
}

// 3. Cargar escrito en pantalla por ID
function cargarTexto(id) {
  const escrito = escritosArray.find(item => item.id === id);
  if (!escrito) return;

  escritoActualId = id;

  const tituloElem = document.getElementById('titulo-escrito');
  const fechaElem = document.getElementById('fecha-escrito');
  const cuerpoElem = document.getElementById('cuerpo-escrito');

  if (tituloElem) tituloElem.innerText = escrito.titulo;
  if (fechaElem) fechaElem.innerText = escrito.fecha || "";
  if (cuerpoElem) cuerpoElem.innerHTML = escrito.contenido;

  renderizarControlesLectura(id);
  actualizarBotonesNavegacion(id);

  // Marcar botón activo en la lista del índice
  const botones = document.querySelectorAll('.sidebar button');
  botones.forEach(btn => btn.classList.remove('activo'));
  
  const botonSeleccionado = document.getElementById(`btn-${id}`);
  if (botonSeleccionado) botonSeleccionado.classList.add('activo');

  // En móviles, contraer el panel al elegir un cuento
  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById("sidebar");
    if (sidebar && !sidebar.classList.contains("collapsed")) {
      sidebar.classList.add("collapsed");
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 4. Marcar como leído en localStorage
function esLeido(id) {
  const leidos = JSON.parse(localStorage.getItem("escritos_leidos") || "[]");
  return leidos.includes(id);
}

function toggleLeido(id) {
  let leidos = JSON.parse(localStorage.getItem("escritos_leidos") || "[]");
  if (leidos.includes(id)) {
    leidos = leidos.filter(item => item !== id);
  } else {
    leidos.push(id);
  }
  localStorage.setItem("escritos_leidos", JSON.stringify(leidos));
  
  renderizarControlesLectura(id);
  actualizarMarcadoresSidebar();
}

function renderizarControlesLectura(id) {
  let contenedor = document.getElementById("controles-lectura");
  const articulo = document.getElementById("escrito-contenedor");
  const cuerpo = document.getElementById("cuerpo-escrito");

  if (!contenedor && articulo && cuerpo) {
    contenedor = document.createElement("div");
    contenedor.id = "controles-lectura";
    articulo.insertBefore(contenedor, cuerpo);
  }

  if (contenedor) {
    const leido = esLeido(id);
    contenedor.innerHTML = `
      <label class="checkbox-leido">
        <input type="checkbox" ${leido ? "checked" : ""} onchange="toggleLeido('${id}')">
        <span>${leido ? "✓ Marcado como leído" : "Marcar como leído"}</span>
      </label>
    `;
  }
}

function actualizarMarcadoresSidebar() {
  const leidos = JSON.parse(localStorage.getItem("escritos_leidos") || "[]");
  document.querySelectorAll('.sidebar button').forEach(btn => {
    const id = btn.id.replace('btn-', '');
    if (leidos.includes(id)) {
      btn.classList.add("leido");
    } else {
      btn.classList.remove("leido");
    }
  });
}

// 5. Navegación secuencial exacta por índice del Array
function actualizarBotonesNavegacion(id) {
  const index = escritosArray.findIndex(item => item.id === id);

  let nav = document.getElementById("navegacion-escritos");
  const articulo = document.getElementById("escrito-contenedor");

  if (!nav && articulo) {
    nav = document.createElement("nav");
    nav.id = "navegacion-escritos";
    articulo.appendChild(nav);
  }

  if (nav) {
    const anteriorItem = index > 0 ? escritosArray[index - 1] : null;
    const siguienteItem = (index >= 0 && index < escritosArray.length - 1) ? escritosArray[index + 1] : null;

    nav.innerHTML = `
      <button ${!anteriorItem ? "disabled" : ""} onclick="cargarTexto('${anteriorItem ? anteriorItem.id : ''}')" class="btn-nav">
        ← Anterior
      </button>
      <button ${!siguienteItem ? "disabled" : ""} onclick="cargarTexto('${siguienteItem ? siguienteItem.id : ''}')" class="btn-nav">
        Siguiente →
      </button>
    `;
  }
}

document.addEventListener('DOMContentLoaded', inicializarEscritos);