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

const ETIQUETAS_ACTUALIZACION = {
  automatica: '🔄 Actualización automática',
  mixta: '🔄 API + revisión manual',
  manual: '📝 Revisión manual'
};

const ICONOS_MODALIDAD = {
  texto: '📝',
  imagen: '🖼️',
  audio: '🎙️',
  video: '🎬',
  pdf: '📄',
  archivos: '📎'
};

const MAX_COMPARACION = 3;
const CLAVE_TEMA = 'directorio:tema';
const CLAVE_FAVORITOS = 'directorio:favoritos';

let proveedores = [];
let datosDirectorio = null;
let filtroAcceso = 'todos';
let filtroProveedor = 'todos';
let busqueda = '';
let favoritos = cargarFavoritos();
let comparacion = new Set();

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

function formatearFechaCorta(iso) {
  if (!iso) return '-';
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(iso + 'T12:00:00') : new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
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

function etiquetaAcceso(tipo) {
  return ETIQUETAS_ACCESO[tipo] || ETIQUETAS_ACCESO.gratis;
}

function claveModelo(proveedor, modelo) {
  return proveedor.id + '::' + modelo.nombre;
}

function buscarPorClave(clave) {
  const separador = clave.indexOf('::');
  if (separador === -1) return null;
  const proveedorId = clave.slice(0, separador);
  const nombre = clave.slice(separador + 2);
  const proveedor = proveedores.find((item) => item.id === proveedorId);
  const modelo = proveedor && proveedor.modelos.find((item) => item.nombre === nombre);
  return proveedor && modelo ? { proveedor, modelo, clave } : null;
}

function cargarFavoritos() {
  try {
    const guardados = JSON.parse(localStorage.getItem(CLAVE_FAVORITOS) || '[]');
    return new Set(Array.isArray(guardados) ? guardados.filter((item) => typeof item === 'string') : []);
  } catch (error) {
    return new Set();
  }
}

function guardarFavoritos() {
  try {
    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify([...favoritos]));
  } catch (error) {
    // El almacenamiento local puede estar bloqueado; la página sigue funcionando.
  }
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
    modelo.tipo_acceso,
    modelo.licencia,
    modelo.parametros
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

  datosDirectorio = datos;
  proveedores = datos.proveedores;

  const totalModelos = proveedores.reduce((total, proveedor) => total + proveedor.modelos.length, 0);
  $('fecha').textContent = formatearFecha(datos.ultima_actualizacion);
  $('estado').textContent = etiquetaEstado(datos.estado);
  $('total').textContent = `${proveedores.length} proveedores · ${totalModelos} modelos`;

  if (datos.detalle_estado) {
    $('detalle-estado').textContent = datos.detalle_estado;
    $('detalle-estado').classList.remove('oculta');
  }

  if (datos.ultimo_intento) {
    $('chip-fecha').title =
      'Última actualización correcta: ' + formatearFecha(datos.ultima_actualizacion) +
      ' · Último intento: ' + formatearFecha(datos.ultimo_intento);
  }

  $('chip-estado').classList.remove('chip-ok', 'chip-aviso');
  $('chip-estado').classList.add(datos.estado === 'exitoso' ? 'chip-ok' : 'chip-aviso');

  const selector = $('filtro-proveedor');
  proveedores.forEach((proveedor) => {
    const opcion = document.createElement('option');
    opcion.value = proveedor.id;
    opcion.textContent = proveedor.nombre;
    selector.appendChild(opcion);
  });

  leerEstadoURL();
  $('buscador').value = busqueda;
  $('limpiar-busqueda').classList.toggle('oculta', !busqueda);
  selector.value = filtroProveedor;

  renderizarHistorial(datos.historial);
  actualizarBotonTema();
  renderizar();
}

function leerEstadoURL() {
  const parametros = new URLSearchParams(window.location.search);
  busqueda = parametros.get('q') || '';

  const acceso = parametros.get('acceso');
  filtroAcceso = ['gratis', 'autoalojable', 'favoritos'].includes(acceso) ? acceso : 'todos';

  const proveedor = parametros.get('proveedor');
  filtroProveedor = proveedores.some((item) => item.id === proveedor) ? proveedor : 'todos';
}

function actualizarURL() {
  const parametros = new URLSearchParams();
  if (busqueda.trim()) parametros.set('q', busqueda.trim());
  if (filtroAcceso !== 'todos') parametros.set('acceso', filtroAcceso);
  if (filtroProveedor !== 'todos') parametros.set('proveedor', filtroProveedor);

  const url = window.location.pathname + (parametros.toString() ? '?' + parametros.toString() : '') + window.location.hash;
  try {
    window.history.replaceState(null, '', url);
  } catch (error) {
    // En file:// algunos navegadores no permiten cambiar la URL.
  }
}

function renderizar() {
  const termino = normalizar(busqueda.trim());
  const contenedor = $('proveedores');
  const secciones = [];
  const cuentas = { todos: 0, gratis: 0, autoalojable: 0, favoritos: 0 };
  let visibles = 0;
  let elegibles = 0;

  proveedores.forEach((proveedor) => {
    if (filtroProveedor !== 'todos' && proveedor.id !== filtroProveedor) return;

    const modelosBusqueda = proveedor.modelos.filter((modelo) => coincideModelo(modelo, proveedor, termino));

    modelosBusqueda.forEach((modelo) => {
      cuentas.todos += 1;
      if ((modelo.tipo_acceso || 'gratis') === 'gratis') cuentas.gratis += 1;
      if ((modelo.tipo_acceso || 'gratis') === 'autoalojable') cuentas.autoalojable += 1;
      if (favoritos.has(claveModelo(proveedor, modelo))) cuentas.favoritos += 1;
    });

    const modelos = modelosBusqueda.filter((modelo) => {
      if (filtroAcceso === 'todos') return true;
      if (filtroAcceso === 'favoritos') return favoritos.has(claveModelo(proveedor, modelo));
      return (modelo.tipo_acceso || 'gratis') === filtroAcceso;
    });

    elegibles += modelosBusqueda.length;
    if (!modelos.length) return;

    visibles += modelos.length;
    secciones.push(renderProveedor(proveedor, modelos));
  });

  Object.entries(cuentas).forEach(([cuenta, valor]) => {
    document.querySelectorAll('[data-cuenta="' + cuenta + '"]').forEach((elemento) => {
      elemento.textContent = valor;
    });
  });

  contenedor.innerHTML = secciones.join('');

  const sinResultados = $('sin-resultados');
  sinResultados.classList.toggle('oculta', visibles > 0);

  if (!visibles) {
    if (filtroAcceso === 'favoritos' && favoritos.size === 0) {
      $('sin-resultados-texto').textContent =
        'Todavía no has marcado favoritos. Pulsa la estrella de una tarjeta para guardarla aquí.';
    } else if (busqueda.trim()) {
      $('sin-resultados-texto').textContent = 'No hay resultados para “' + busqueda.trim() + '”.';
    } else {
      $('sin-resultados-texto').textContent =
        'No se encontraron modelos con esos filtros. Prueba con otra búsqueda o cambia el tipo de acceso.';
    }
    $('conteo').textContent = 'Sin resultados';
  } else if (visibles === elegibles) {
    $('conteo').textContent =
      `${visibles} ${visibles === 1 ? 'modelo' : 'modelos'} en ` +
      `${secciones.length} ${secciones.length === 1 ? 'proveedor' : 'proveedores'}`;
  } else {
    $('conteo').textContent = `Mostrando ${visibles} de ${elegibles} modelos`;
  }

  actualizarControles();
}

function actualizarControles() {
  document.querySelectorAll('#filtros-acceso .chip').forEach((chip) => {
    const activo = chip.dataset.acceso === filtroAcceso;
    chip.classList.toggle('activo', activo);
    chip.setAttribute('aria-pressed', String(activo));
  });

  const hayFiltros = Boolean(busqueda.trim()) || filtroAcceso !== 'todos' || filtroProveedor !== 'todos';
  $('limpiar-filtros').classList.toggle('oculta', !hayFiltros);
  $('limpiar-busqueda').classList.toggle('oculta', !busqueda);

  actualizarBarraComparar();
  actualizarURL();
}

function renderProveedor(proveedor, modelos) {
  const nota = proveedor.notas
    ? `<p class="proveedor-nota">${escapar(proveedor.notas)}</p>`
    : '';

  const metadatos = [];
  if (proveedor.actualizacion) {
    metadatos.push(ETIQUETAS_ACTUALIZACION[proveedor.actualizacion] || proveedor.actualizacion);
  }
  if (proveedor.verificado) {
    metadatos.push('✔ Verificado ' + formatearFechaCorta(proveedor.verificado));
  }

  const meta = metadatos.length
    ? `<p class="proveedor-meta">${metadatos.map((dato) => `<span>${escapar(dato)}</span>`).join('')}</p>`
    : '';

  return `
    <section class="proveedor" aria-labelledby="proveedor-${escapar(proveedor.id)}">
      <div class="proveedor-cabecera">
        <div class="proveedor-info">
          <h2 id="proveedor-${escapar(proveedor.id)}">
            ${escapar(proveedor.nombre)}
            <span class="contador">${modelos.length} ${modelos.length === 1 ? 'modelo' : 'modelos'}</span>
          </h2>
          ${meta}
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
  const acceso = etiquetaAcceso(modelo.tipo_acceso);
  const clave = claveModelo(proveedor, modelo);
  const favorito = favoritos.has(clave);
  const enComparacion = comparacion.has(clave);

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

  const ficha = [];
  if (modelo.licencia) {
    ficha.push(`<span class="ficha-item" title="Licencia">📜 ${escapar(modelo.licencia)}</span>`);
  }
  if (modelo.parametros) {
    ficha.push(`<span class="ficha-item" title="Parámetros">🧮 ${escapar(modelo.parametros)}</span>`);
  }

  const nota = modelo.notas
    ? `<p class="modelo-nota">ℹ️ ${escapar(modelo.notas)}</p>`
    : '';

  const extra = modelo.limite_extra
    ? `<p class="limite-extra">⏱️ ${escapar(modelo.limite_extra)}</p>`
    : '';

  const documentacion = modelo.documentacion || proveedor.documentacion;
  const cuerpoReporte = [
    'Proveedor: ' + proveedor.nombre,
    'Modelo: ' + modelo.nombre,
    'Tipo de acceso: ' + modelo.tipo_acceso,
    'Documentación: ' + documentacion,
    '',
    'Describe qué dato es incorrecto y, si puedes, incluye el enlace oficial:'
  ].join('\n');
  const reportar =
    'https://github.com/userzr2007-svg/directorio-apis-ia/issues/new?title=' +
    encodeURIComponent('Dato incorrecto: ' + modelo.nombre) +
    '&body=' + encodeURIComponent(cuerpoReporte);

  return `
    <article class="tarjeta-modelo${enComparacion ? ' en-comparacion' : ''}" data-clave="${escapar(clave)}">
      <div class="modelo-top">
        <div class="modelo-nombre">
          <h3>${escapar(modelo.nombre_display || modelo.nombre)}</h3>
          <button class="nombre-api" type="button" data-copiar="${escapar(modelo.nombre)}" title="Copiar el nombre exacto del modelo">
            <span class="sr-only">Copiar </span>
            <code>${escapar(modelo.nombre)}</code>
            <span class="copiar-icono" aria-hidden="true">⧉</span>
          </button>
        </div>
        <div class="modelo-acciones-top">
          <span class="badge badge-${acceso.clase}">${acceso.icono} ${acceso.texto}</span>
          <button class="boton-favorito${favorito ? ' activo' : ''}" type="button" data-favorito="${escapar(clave)}" aria-pressed="${favorito}" aria-label="${favorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}" title="${favorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}">${favorito ? '★' : '☆'}</button>
        </div>
      </div>

      <p class="modelo-descripcion">${escapar(modelo.descripcion)}</p>

      ${modalidades ? `<div class="modalidades">${modalidades}</div>` : ''}
      ${ficha.length ? `<div class="modelo-ficha">${ficha.join('')}</div>` : ''}
      ${limites}
      ${extra}
      ${nota}

      <div class="modelo-acciones">
        <a class="modelo-docs" href="${escapar(documentacion)}" target="_blank" rel="noopener">Documentación oficial ↗</a>
        <div class="acciones-secundarias">
          <button class="accion-enlace${enComparacion ? ' activo' : ''}" type="button" data-comparar="${escapar(clave)}" aria-pressed="${enComparacion}">${enComparacion ? '✓ En comparación' : '⇄ Comparar'}</button>
          <a class="accion-enlace" href="${escapar(reportar)}" target="_blank" rel="noopener">⚑ Reportar</a>
        </div>
      </div>
    </article>
  `;
}

function renderizarHistorial(historial) {
  const entradas = Array.isArray(historial) ? historial.slice(0, 12) : [];
  if (!entradas.length) {
    $('historial').classList.add('oculta');
    return;
  }

  $('historial').classList.remove('oculta');
  $('lista-historial').innerHTML = entradas.map((entrada) => `
    <li>
      <div class="historial-cabecera">
        <time datetime="${escapar(entrada.fecha)}">${escapar(formatearFecha(entrada.fecha))}</time>
        <span class="historial-estado">${escapar(etiquetaEstado(entrada.estado))}</span>
      </div>
      <p>${escapar(entrada.detalle)}</p>
    </li>
  `).join('');
}

function anunciar(mensaje) {
  const aviso = $('aviso-copia');
  aviso.textContent = mensaje;
  window.clearTimeout(anunciar.temporizador);
  anunciar.temporizador = window.setTimeout(() => {
    aviso.textContent = '';
  }, 2500);
}

async function copiarTexto(texto) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch (error) {
      // Se intenta el método clásico.
    }
  }

  const area = document.createElement('textarea');
  area.value = texto;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.top = '-1000px';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();

  let copiado = false;
  try {
    copiado = document.execCommand('copy');
  } catch (error) {
    copiado = false;
  }
  document.body.removeChild(area);
  return copiado;
}

function limpiarFiltros() {
  busqueda = '';
  filtroAcceso = 'todos';
  filtroProveedor = 'todos';
  $('buscador').value = '';
  $('filtro-proveedor').value = 'todos';
  $('limpiar-busqueda').classList.add('oculta');
  renderizar();
  $('buscador').focus();
}

function alternarFavorito(clave) {
  if (favoritos.has(clave)) {
    favoritos.delete(clave);
    anunciar('Modelo quitado de favoritos.');
  } else {
    favoritos.add(clave);
    anunciar('Modelo añadido a favoritos.');
  }
  guardarFavoritos();
  renderizar();
}

function alternarComparacion(clave) {
  if (comparacion.has(clave)) {
    comparacion.delete(clave);
  } else if (comparacion.size >= MAX_COMPARACION) {
    anunciar('Puedes comparar hasta ' + MAX_COMPARACION + ' modelos a la vez.');
    return;
  } else {
    comparacion.add(clave);
  }

  actualizarBarraComparar();
  actualizarBotonesComparacion();
}

function actualizarBotonesComparacion() {
  document.querySelectorAll('[data-comparar]').forEach((boton) => {
    const activo = comparacion.has(boton.dataset.comparar);
    boton.classList.toggle('activo', activo);
    boton.setAttribute('aria-pressed', String(activo));
    boton.textContent = activo ? '✓ En comparación' : '⇄ Comparar';
  });

  document.querySelectorAll('.tarjeta-modelo[data-clave]').forEach((tarjeta) => {
    tarjeta.classList.toggle('en-comparacion', comparacion.has(tarjeta.dataset.clave));
  });
}

function actualizarBarraComparar() {
  const total = comparacion.size;
  const barra = $('barra-comparar');
  barra.classList.toggle('oculta', total === 0);
  document.body.classList.toggle('con-comparador', total > 0);

  $('comparar-texto').textContent = total === 0
    ? ''
    : `${total} ${total === 1 ? 'modelo seleccionado' : 'modelos seleccionados'}`;

  const boton = $('abrir-comparacion');
  boton.disabled = total < 2;
  boton.title = total < 2 ? 'Selecciona al menos 2 modelos' : 'Comparar los modelos seleccionados';
}

function valorCelda(valor, formatear = false) {
  if (valor === null || valor === undefined || valor === '') return '—';
  return escapar(formatear ? formatearCantidad(valor) : valor);
}

function tablaComparacion(seleccionados) {
  const filas = [
    ['Proveedor', (item) => escapar(item.proveedor.nombre)],
    ['Nombre API', (item) => `<code>${escapar(item.modelo.nombre)}</code>`],
    ['Acceso', (item) => {
      const acceso = etiquetaAcceso(item.modelo.tipo_acceso);
      return `<span class="badge badge-${acceso.clase}">${acceso.icono} ${acceso.texto}</span>`;
    }],
    ['RPM', (item) => valorCelda(item.modelo.limite_peticiones_minuto, true)],
    ['TPM', (item) => valorCelda(item.modelo.limite_tokens_minuto, true)],
    ['RPD', (item) => valorCelda(item.modelo.limite_peticiones_dia, true)],
    ['TPD', (item) => valorCelda(item.modelo.limite_tokens_dia, true)],
    ['Contexto', (item) => valorCelda(item.modelo.contexto_tokens, true)],
    ['Modalidades', (item) => valorCelda((item.modelo.modalidades || []).join(', '))],
    ['Licencia', (item) => valorCelda(item.modelo.licencia)],
    ['Parámetros', (item) => valorCelda(item.modelo.parametros)],
    ['Límite extra', (item) => valorCelda(item.modelo.limite_extra)],
    ['Verificado', (item) => valorCelda(formatearFechaCorta(item.proveedor.verificado))],
    ['Documentación', (item) => `<a href="${escapar(item.modelo.documentacion || item.proveedor.documentacion)}" target="_blank" rel="noopener">Abrir ↗</a>`]
  ];

  const cabeceras = seleccionados
    .map((item) => `<th scope="col">${escapar(item.modelo.nombre_display || item.modelo.nombre)}</th>`)
    .join('');

  const cuerpo = filas.map(([etiqueta, valor]) => `
    <tr>
      <th scope="row">${etiqueta}</th>
      ${seleccionados.map((item) => `<td>${valor(item)}</td>`).join('')}
    </tr>
  `).join('');

  return `
    <table class="tabla-comparar">
      <thead>
        <tr>
          <th scope="col">Característica</th>
          ${cabeceras}
        </tr>
      </thead>
      <tbody>${cuerpo}</tbody>
    </table>
  `;
}

function abrirComparacion() {
  const seleccionados = [...comparacion].map(buscarPorClave).filter(Boolean);
  if (seleccionados.length < 2) return;

  comparacion = new Set(seleccionados.map((item) => item.clave));
  $('tabla-comparar').innerHTML = tablaComparacion(seleccionados);

  const dialogo = $('dialogo-comparar');
  if (typeof dialogo.showModal === 'function') {
    dialogo.showModal();
  } else {
    dialogo.setAttribute('open', '');
  }
}

function limpiarComparacion() {
  comparacion.clear();
  actualizarBarraComparar();
  actualizarBotonesComparacion();
  const dialogo = $('dialogo-comparar');
  if (dialogo.open) dialogo.close();
}

function temaActual() {
  return document.documentElement.dataset.tema === 'oscuro' ? 'oscuro' : 'claro';
}

function aplicarTema(tema, persistir = true) {
  if (tema === 'oscuro') {
    document.documentElement.dataset.tema = 'oscuro';
  } else {
    delete document.documentElement.dataset.tema;
  }

  if (persistir) {
    try {
      localStorage.setItem(CLAVE_TEMA, tema);
    } catch (error) {
      // Sin persistencia, el cambio de tema sigue funcionando en esta visita.
    }
  }

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = tema === 'oscuro' ? '#0b1020' : '#4f46e5';

  actualizarBotonTema();
}

function actualizarBotonTema() {
  const boton = $('boton-tema');
  const oscuro = temaActual() === 'oscuro';
  boton.textContent = oscuro ? '☀️' : '🌙';
  boton.setAttribute('aria-label', oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
  boton.title = oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
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
  renderizar();
});

$('filtro-proveedor').addEventListener('change', (evento) => {
  filtroProveedor = evento.target.value;
  renderizar();
});

$('limpiar-filtros').addEventListener('click', limpiarFiltros);
$('limpiar-filtros-vacio').addEventListener('click', limpiarFiltros);

$('boton-tema').addEventListener('click', () => {
  aplicarTema(temaActual() === 'oscuro' ? 'claro' : 'oscuro');
});

$('abrir-comparacion').addEventListener('click', abrirComparacion);
$('limpiar-comparacion').addEventListener('click', limpiarComparacion);
$('cerrar-comparacion').addEventListener('click', () => {
  const dialogo = $('dialogo-comparar');
  if (dialogo.open) dialogo.close();
});

$('dialogo-comparar').addEventListener('click', (evento) => {
  const dialogo = $('dialogo-comparar');
  if (evento.target === dialogo && dialogo.open) dialogo.close();
});

document.addEventListener('click', async (evento) => {
  const favorito = evento.target.closest('[data-favorito]');
  if (favorito) {
    alternarFavorito(favorito.dataset.favorito);
    return;
  }

  const comparar = evento.target.closest('[data-comparar]');
  if (comparar) {
    alternarComparacion(comparar.dataset.comparar);
    return;
  }

  const boton = evento.target.closest('.nombre-api');
  if (!boton) return;

  const icono = boton.querySelector('.copiar-icono');
  const copiado = await copiarTexto(boton.dataset.copiar);

  if (!copiado) {
    anunciar('No se pudo copiar automáticamente. Selecciona el nombre y cópialo a mano.');
    return;
  }

  boton.classList.add('copiado');
  if (icono) icono.textContent = '✓';
  anunciar('Nombre del modelo copiado.');
  window.setTimeout(() => {
    boton.classList.remove('copiado');
    if (icono) icono.textContent = '⧉';
  }, 1500);
});

const botonArriba = $('volver-arriba');
window.addEventListener('scroll', () => {
  botonArriba.classList.toggle('visible', window.scrollY > 600);
}, { passive: true });

botonArriba.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('popstate', () => {
  leerEstadoURL();
  $('buscador').value = busqueda;
  $('filtro-proveedor').value = filtroProveedor;
  renderizar();
});

cargarDatos();
