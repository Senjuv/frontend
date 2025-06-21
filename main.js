const apiBase = 'https://backend-gomitas.onrender.com';

// Mostrar y ocultar secciones
const btnTienda = document.getElementById('btn-tienda');
const btnEntrega = document.getElementById('btn-entrega');
const btnCotizacion = document.getElementById('btn-cotizacion');
const btnFinanzas = document.getElementById('btn-finanzas');

const seccionTienda = document.getElementById('seccion-tienda');
const seccionEntrega = document.getElementById('seccion-entrega');
const seccionCotizacion = document.getElementById('seccion-cotizacion');
const seccionFinanzas = document.getElementById('seccion-finanzas');

btnTienda.addEventListener('click', () => {
  seccionTienda.classList.remove('hidden');
  seccionEntrega.classList.add('hidden');
  seccionCotizacion.classList.add('hidden');
  seccionFinanzas.classList.add('hidden');
});

btnEntrega.addEventListener('click', () => {
  seccionTienda.classList.add('hidden');
  seccionEntrega.classList.remove('hidden');
  seccionCotizacion.classList.add('hidden');
  seccionFinanzas.classList.add('hidden');
  cargarTiendasEnSelect();
  cargarEntregas();
});

btnCotizacion.addEventListener('click', () => {
  seccionTienda.classList.add('hidden');
  seccionEntrega.classList.add('hidden');
  seccionCotizacion.classList.remove('hidden');
  seccionFinanzas.classList.add('hidden');
});

btnFinanzas.addEventListener('click', () => {
  seccionTienda.classList.add('hidden');
  seccionEntrega.classList.add('hidden');
  seccionCotizacion.classList.add('hidden');
  seccionFinanzas.classList.remove('hidden');
  cargarFinanzas();
});

async function cargarFinanzas() {
  const res = await fetch(apiBase + '/finanzas');
  const data = await res.json();

  // Actualiza inputs de finanzas
  document.getElementById('dinero-actual-finanzas').value = data.dinero_actual || 0;
  document.getElementById('dinero-esperado-finanzas').value = data.dinero_esperado || 0;

  const resultado = document.getElementById('resultado-finanzas');
  resultado.innerHTML = `
    <p><strong>Dinero actual:</strong> $${parseFloat(data.dinero_actual).toFixed(2)}</p>
    <p><strong>Dinero esperado:</strong> $${parseFloat(data.dinero_esperado).toFixed(2)}</p>
  `;
  resultado.classList.remove('hidden');
}

// Listado y registro de tiendas
async function cargarTiendas() {
  const res = await fetch(apiBase + '/tiendas');
  const tiendas = await res.json();
  const lista = document.getElementById('lista-tiendas');
  lista.innerHTML = '';
  tiendas.forEach(tienda => {
    const li = document.createElement('li');
    li.className = "bg-gray-50 border border-gray-200 rounded p-3";
    li.textContent = `${tienda.nombre} - ${tienda.direccion}`;
    lista.appendChild(li);
  });
}

document.getElementById('form-tienda').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const direccion = document.getElementById('direccion').value;

  await fetch(apiBase + '/tiendas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, direccion }),
  });

  document.getElementById('form-tienda').reset();
  cargarTiendas();
});

async function cargarTiendasEnSelect() {
  const res = await fetch(apiBase + '/tiendas');
  const tiendas = await res.json();
  const select = document.getElementById('tienda-id');
  select.innerHTML = '<option value="">Selecciona una tienda</option>';
  tiendas.forEach(t => {
    const option = document.createElement('option');
    option.value = t.id;
    option.textContent = t.nombre;
    select.appendChild(option);
  });
}

// Registrar entrega
document.getElementById('form-entrega').addEventListener('submit', async (e) => {
  e.preventDefault();
  const tiendaId = document.getElementById('tienda-id').value;
  const cantidad = document.getElementById('cantidad').value;

  await fetch(`${apiBase}/tiendas/${tiendaId}/entregas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tienda_id: tiendaId, cantidad_bolsas: cantidad }),
  });

  document.getElementById('form-entrega').reset();
  cargarEntregas();
});

async function cargarEntregas() {
  const res = await fetch(apiBase + '/entregas');
  const entregas = await res.json();
  const lista = document.getElementById('lista-entregas');
  lista.innerHTML = '';
  entregas.forEach(e => {
    const li = document.createElement('li');
    li.className = "bg-green-50 border border-green-200 rounded p-3";
    li.textContent = `Tienda ID: ${e.tienda_id} | Cantidad: ${e.cantidad_bolsas} | Fecha: ${new Date(e.fecha).toLocaleDateString()}`;
    lista.appendChild(li);
  });
}

// Cotización y finanzas juntas
document.getElementById('form-cotizacion').addEventListener('submit', async (e) => {
  e.preventDefault();
  const cantidadBolsas = parseInt(document.getElementById('cantidad-bolsas').value, 10);
  const dineroActual = parseFloat(document.getElementById('dinero-actual-cotizacion').value);

  if (isNaN(cantidadBolsas) || cantidadBolsas < 1 || isNaN(dineroActual)) return;

  const costoPorKilo = 106;
  const bolsasPorKilo = 25;
  const precioPorBolsa = 10;

  const kilos = cantidadBolsas / bolsasPorKilo;
  const costoTotal = kilos * costoPorKilo;
  const ingresoEsperado = cantidadBolsas * precioPorBolsa;
  const ganancia = ingresoEsperado - costoTotal;

  const resultado = document.getElementById('resultado-cotizacion');
  resultado.innerHTML = `
    <p><strong>Cantidad de bolsas:</strong> ${cantidadBolsas}</p>
    <p><strong>Kilos necesarios:</strong> ${kilos.toFixed(2)}</p>
    <p><strong>Costo total de producción:</strong> $${costoTotal.toFixed(2)}</p>
    <p><strong>Ingreso esperado:</strong> $${ingresoEsperado.toFixed(2)}</p>
    <p><strong>Ganancia esperada:</strong> $${ganancia.toFixed(2)}</p>
  `;
  resultado.classList.remove('hidden');

  await fetch(apiBase + '/cotizaciones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cantidad_bolsas: cantidadBolsas,
      dinero_actual: dineroActual
    }),
  });

  // Actualiza finanzas con dinero actual y esperado
  await fetch(apiBase + '/finanzas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dinero_actual: dineroActual,
      dinero_esperado: ingresoEsperado
    }),
  });
});

// Formulario finanzas guardar
document.getElementById('form-finanzas').addEventListener('submit', async (e) => {
  e.preventDefault();
  const dineroActual = parseFloat(document.getElementById('dinero-actual-finanzas').value);
  const dineroEsperado = parseFloat(document.getElementById('dinero-esperado-finanzas').value);

  if (isNaN(dineroActual) || isNaN(dineroEsperado)) return;

  await fetch(apiBase + '/finanzas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dinero_actual: dineroActual,
      dinero_esperado: dineroEsperado
    }),
  });

  cargarFinanzas();
});

// Inicial
cargarTiendas();
