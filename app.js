let proveedores = [];

function cargarDatos() {
  const datos = window.DIRECTORIO_DATOS;

  if (!datos || !datos.proveedores) {
    document.getElementById('meta').innerHTML =
      '<strong>Error:</strong> No se pudieron cargar los datos. Revisa que exista data/proveedores.js';
    return;
  }

  proveedores = datos.proveedores;
  document.getElementById('fecha').textContent = datos.ultima_actualizacion || '-';
  document.getElementById('estado').textContent = datos.estado || '-';

  renderizarProveedores();
}

function renderizarProveedores() {
  const contenedor = document.getElementById('proveedores');
  contenedor.innerHTML = '';

  proveedores.forEach(p => {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta-proveedor';
    tarjeta.innerHTML = `
      <h3>${p.nombre}</h3>
      <p>${p.modelos.length} modelo(s) gratuito(s)</p>
      <a href="${p.sitio_web}" target="_blank" rel="noopener">Sitio web</a>
    `;
    tarjeta.onclick = () => mostrarDetalle(p);
    contenedor.appendChild(tarjeta);
  });
}

function mostrarDetalle(p) {
  document.getElementById('titulo-proveedor').textContent = p.nombre;
  document.getElementById('desc-proveedor').innerHTML =
    'Documentación oficial: <a href="' + (p.documentacion || '#') + '" target="_blank" rel="noopener">Ver docs del proveedor</a>';

  const cuerpo = document.getElementById('cuerpo-modelos');
  cuerpo.innerHTML = '';

  p.modelos.forEach(m => {
    const tr = document.createElement('tr');

    const modales = m.modalidades ? m.modalidades.join(', ') : '-';

    const limites = [];
    if (m.limite_peticiones_minuto) limites.push(m.limite_peticiones_minuto + ' req/min');
    if (m.limite_peticiones_dia) limites.push(m.limite_peticiones_dia + ' req/día');
    if (m.limite_tokens_dia) limites.push(m.limite_tokens_dia + ' tokens/día');

    const contexto = m.contexto_tokens
      ? new Intl.NumberFormat('es-ES').format(m.contexto_tokens) + ' tokens'
      : '-';

    tr.innerHTML = `
      <td>
        <strong>${m.nombre_display || m.nombre}</strong><br>
        <small>${m.nombre}</small>
      </td>
      <td>${m.descripcion}</td>
      <td>${contexto}</td>
      <td>${limites.length ? limites.join('<br>') : 'Consultar docs'}</td>
      <td>${modales}</td>
      <td><a href="${m.documentacion}" target="_blank" rel="noopener">Ver docs</a></td>
    `;
    cuerpo.appendChild(tr);
  });

  document.getElementById('proveedores').classList.add('oculta');
  document.getElementById('detalle').classList.remove('oculta');
}

document.getElementById('btn-volver').onclick = () => {
  document.getElementById('detalle').classList.add('oculta');
  document.getElementById('proveedores').classList.remove('oculta');
};

cargarDatos();
