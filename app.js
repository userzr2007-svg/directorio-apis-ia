const ETIQUETAS_ESTADO = {
  exitoso: '✅ Actualización exitosa',
  parcial: '⚠️ Actualización parcial: datos conservados',
  sin_api_key_datos_conservados: '⚠️ Sin API key: datos conservados',
  error_actualizacion_datos_conservados: '⚠️ Error de actualización: datos conservados',
  datos_iniciales: '📦 Datos iniciales'
};

const ETIQUETAS_ACCESO = {
  gratis: { texto: 'Gratis', clase: 'gratis', icono: '✅' },
  autoalojable: { texto: 'Autoalojable', clase: 'autoalojable', icono: '🧩' },
  pago: { texto: 'Pago', clase: 'pago', icono: '💳' }
};

const ICONOS_MODALIDAD = {
  texto: '📝',
  imagen: '🖼️',
  audio: '🎙️',
  video: '🎬',
  pdf: '📄',
  archivos: '📎'
};

let proveedores = [];
let filtroAcceso = 'todos';
let filtroProveedor = 'todos';
let busqueda = '';

const $ = (id) => document.getElementById(id);

function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function escapar(texto) {
  return String(texto ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatearFecha(iso) {
  if (!iso) return '-';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatearCantidad(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return String(valor);
  if (numero >= 1000000) {
    return (numero / 1000000).toLocaleString('es-ES', { maximumFractionDigits: 2 }) + 'M';
  }
  if (numero >= 1000) {
    return (numero / 1000).toLocaleString('es-ES', { maximumFractionDigits: 1 }) + 'K';
  }
  return numero.toLocaleString('es-ES');
}

function etiquetaEstado(estado) {
  return ETIQUETAS_ESTADO[estado] || estado || '-';
}

function coincideModelo(modelo, proveedor, termino) {
  if (!termino) return true;
  const campos = [
    proveedor.nombre,
    modelo.nombre,
    modelo.nombre_display,
    modelo.descripcion,
    modelo.notas,
    (modelo.modalidades || []).join(' '),
    modelo.tipo_acceso
  ];
  return normalizar(campos.join(' ')).includes(termino);
}

function cargarDatos() {
  const datos = window.DIRECTORIO_DATOS;

  if (!datos || !Array.isArray(datos.proveedores)) {
    $('proveedores').innerHTML =
      '<p class="sin-resultados">No se pudieron cargar los datos. Revisa que exista <code>data/proveedores.js</code>.</p>';
    return;
  }

  proveedores = datos.proveedores;

  $('fecha').textContent = formatearFecha(datos.ultima_actualizacion);
  $('estado').textContent = etiquetaEstado(datos.estado);

  if (datos.detalle_estado) {
    $('detalle-estado').textContent = datos.detalle_estado;
    $('detalle-estado').classList.remove('oculta');
  }

  if (datos.ultimo_intento) {
    $('chip-fecha').title = 'Último intento de actualización: ' + formatearFecha(datos.ultimo_intento);
  }

  $('chip-estado').classList.add(datos.estado === 'exitoso' ? 'chip-ok' : 'chip-aviso');

  const selector = $('filtro-proveedor');
  proveedores.forEach((proveedor) => {
    const opcion = document.createElement('option');
    opcion.value = proveedor.id;
    opcion.textContent = proveedor.nombre;
    selector.appendChild(opcion);
  });

  renderizar();
}

function renderizar() {
  const termino = normalizar(busqueda.trim());
  const contenedor = $('proveedores');
  const secciones = [];
  let visibles = 0;
  let elegibles = 0;

  proveedores.forEach((proveedor) => {
    const coincideProveedor = filtroProveedor === 'todos' || proveedor.id === filtroProveedor;
    if (!coincideProveedor) return;

    const base = proveedor.modelos.filter((modelo) => {
      const acceso = modelo.tipo_acceso || 'gratis';
      return filtroAcceso === 'todos' || acceso === filtroAcceso;
    });

    elegibles += base.length;

    const modelos = base.filter((modelo) => coincideModelo(modelo, proveedor, termino));
    if (!modelos.length) return;

    visibles += modelos.length;
    secciones.push(renderProveedor(proveedor, modelos));
  });

  contenedor.innerHTML = secciones.join('');
  $('sin-resultados').classList.toggle('oculta', visibles > 0);

  if (!visibles) {
    $('conteo').textContent = 'Sin resultados';
  } else if (visibles === elegibles) {
    $('conteo').textContent = `${visibles} ${visibles === 1 ? 'modelo' : 'modelos'} en ${secciones.length} ${secciones.length === 1 ? 'proveedor' : 'proveedores'}`;
  } else {
    $('conteo').textContent = `Mostrando ${visibles} de ${elegibles} modelos`;
  }
}

function renderProveedor(proveedor, modelos) {
  const nota = proveedor.notas
    ? `<p class="proveedor-nota">${escapar(proveedor.notas)}</p>`
    : '';

  return `
    <section class="proveedor" aria-labelledby="proveedor-${escapar(proveedor.id)}">
      <div class="proveedor-cabecera">
        <div class="proveedor-info">
          <h2 id="proveedor-${escapar(proveedor.id)}">
            ${escapar(proveedor.nombre)}
            <span class="contador">${modelos.length} ${modelos.length === 1 ? 'modelo' : 'modelos'}</span>
          </h2>
          ${nota}
        </div>
        <div class="proveedor-enlaces">
          <a href="${escapar(proveedor.sitio_web)}" target="_blank" rel="noopener">Sitio web ↗</a>
          <a href="${escapar(proveedor.documentacion)}" target="_blank" rel="noopener">Documentación ↗</a>
        </div>
      </div>
      <div class="grid-modelos">
        ${modelos.map((modelo) => renderModelo(modelo, proveedor)).join('')}
      </div>
    </section>
  `;
}

function renderModelo(modelo, proveedor) {
  const acceso = ETIQUETAS_ACCESO[modelo.tipo_acceso] || ETIQUETAS_ACCESO.gratis;

  const stats = [];
  const agregarStat = (etiqueta, valor) => {
    if (valor === null || valor === undefined || valor === '') return;
    const exacto = Number.isFinite(Number(valor))
      ? new Intl.NumberFormat('es-ES').format(Number(valor))
      : valor;
    stats.push(`
      <div class="stat" title="${escapar(etiqueta + ': ' + exacto)}">
        <dt>${escapar(etiqueta)}</dt>
        <dd>${escapar(formatearCantidad(valor))}</dd>
      </div>
    `);
  };

  agregarStat('RPM', modelo.limite_peticiones_minuto);
  agregarStat('TPM', modelo.limite_tokens_minuto);
  agregarStat('RPD', modelo.limite_peticiones_dia);
  agregarStat('TPD', modelo.limite_tokens_dia);
  agregarStat('Contexto', modelo.contexto_tokens);

  const limites = stats.length
    ? `<dl class="limites">${stats.join('')}</dl>`
    : '<p class="limites-vacio">Límites de peticiones no publicados.</p>';

  const modalidades = (modelo.modalidades || [])
    .map((modalidad) => {
      const icono = ICONOS_MODALIDAD[normalizar(modalidad)] || '•';
      return `<span class="modalidad">${icono} ${escapar(modalidad)}</span>`;
    })
    .join('');

  const nota = modelo.notas
    ? `<p class="modelo-nota">ℹ️ ${escapar(modelo.notas)}</p>`
    : '';

  const extra = modelo.limite_extra
    ? `<p class="limite-extra">⏱️ ${escapar(modelo.limite_extra)}</p>`
    : '';

  const documentacion = modelo.documentacion || proveedor.documentacion;

  return `
    <article class="tarjeta-modelo">
      <div class="modelo-top">
        <div class="modelo-nombre">
          <h3>${escapar(modelo.nombre_display || modelo.nombre)}</h3>
          <button class="nombre-api" type="button" data-copiar="${escapar(modelo.nombre)}" title="Copiar el nombre exacto del modelo">
            <code>${escapar(modelo.nombre)}</code>
            <span class="copiar-icono" aria-hidden="true">⧉</span>
          </button>
        </div>
        <span class="badge badge-${acceso.clase}">${acceso.icono} ${acceso.texto}</span>
      </div>

      <p class="modelo-descripcion">${escapar(modelo.descripcion)}</p>

      ${modalidades ? `<div class="modalidades">${modalidades}</div>` : ''}
      ${limites}
      ${extra}
      ${nota}

      <a class="modelo-docs" href="${escapar(documentacion)}" target="_blank" rel="noopener">Documentación oficial ↗</a>
    </article>
  `;
}

$('buscador').addEventListener('input', (evento) => {
  busqueda = evento.target.value;
  $('limpiar-busqueda').classList.toggle('oculta', !busqueda);
  renderizar();
});

$('limpiar-busqueda').addEventListener('click', () => {
  busqueda = '';
  $('buscador').value = '';
  $('limpiar-busqueda').classList.add('oculta');
  $('buscador').focus();
  renderizar();
});

$('filtros-acceso').addEventListener('click', (evento) => {
  const chip = evento.target.closest('.chip');
  if (!chip) return;

  filtroAcceso = chip.dataset.acceso;
  document.querySelectorAll('#filtros-acceso .chip').forEach((boton) => {
    boton.classList.toggle('activo', boton === chip);
  });
  renderizar();
});

$('filtro-proveedor').addEventListener('change', (evento) => {
  filtroProveedor = evento.target.value;
  renderizar();
});

document.addEventListener('click', async (evento) => {
  const boton = evento.target.closest('.nombre-api');
  if (!boton) return;

  const icono = boton.querySelector('.copiar-icono');

  try {
    await navigator.clipboard.writeText(boton.dataset.copiar);
    boton.classList.add('copiado');
    if (icono) icono.textContent = '✓';
    setTimeout(() => {
      boton.classList.remove('copiado');
      if (icono) icono.textContent = '⧉';
    }, 1500);
  } catch (error) {
    // Si el navegador bloquea el portapapeles, no interrumpimos la navegación.
  }
});

cargarDatos();
