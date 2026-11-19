import argparse
import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone

from validar_datos import PREFIJO, RUTA_JS, cargar_datos, validar_datos

API_KEY = os.environ.get('GOOGLE_API_KEY', '').strip()

URL_OPENROUTER = 'https://openrouter.ai/api/v1/models'
URL_GOOGLE = 'https://generativelanguage.googleapis.com/v1beta/models'

# Si el catálogo gratuito de OpenRouter cae más de este porcentaje de golpe,
# se considera una anomalía y no se borran modelos.
UMBRAL_CAIDA_OPENROUTER = 0.40
MINIMO_MODELOS_OPENROUTER = 3
MAX_HISTORIAL = 30

# Modelos que OpenRouter lista con precio 0 pero cobran por otro concepto.
MODELOS_EXCLUIDOS_OPENROUTER = {
    'google/lyria-3-pro-preview',
    'google/lyria-3-clip-preview',
}

MAPA_MODALIDADES = {
    'text': 'texto',
    'image': 'imagen',
    'audio': 'audio',
    'video': 'video',
    'file': 'archivos',
    'pdf': 'pdf',
}

DESCRIPCION_NUEVO_OPENROUTER = (
    'Modelo gratuito de {nombre} disponible a través de OpenRouter. '
    'Consulta su documentación para ver capacidades y límites.'
)

NOTA_NUEVO_OPENROUTER = (
    'Añadido automáticamente. Límite gratuito de OpenRouter: 20 peticiones/minuto '
    'y 50/día (1.000/día con $10 o más en créditos).'
)


def cargar():
    """Lee y valida proveedores.js."""
    return cargar_datos(RUTA_JS)


def guardar(datos, ruta=RUTA_JS):
    """Valida y escribe de forma atómica para no dejar un archivo a medias."""
    errores, _ = validar_datos(datos, ruta)
    if errores:
        raise ValueError('Datos inválidos:\n- ' + '\n- '.join(errores))

    contenido = PREFIJO + json.dumps(datos, ensure_ascii=False, indent=2) + ';\n'
    temporal = ruta + '.tmp'
    with open(temporal, 'w', encoding='utf-8', newline='\n') as archivo:
        archivo.write(contenido)
        archivo.flush()
        os.fsync(archivo.fileno())
    os.replace(temporal, ruta)


def resumen_error(error):
    """Convierte un error en una frase corta y sin saltos de línea."""
    return ' '.join(str(error).split())[:180]


def buscar_proveedor(datos, proveedor_id):
    return next((p for p in datos.get('proveedores', []) if p.get('id') == proveedor_id), None)


def precio_cero(valor):
    try:
        return float(valor) == 0
    except (TypeError, ValueError):
        return False


def nombre_legible(nombre, modelo_id):
    texto = (nombre or modelo_id).replace(' (free)', '').strip()
    if ': ' in texto:
        texto = texto.split(': ', 1)[1].strip()
    return texto or modelo_id


def modalidades_desde_api(modelo_api):
    arquitectura = modelo_api.get('architecture') or {}
    entradas = arquitectura.get('input_modalities') or []
    return [MAPA_MODALIDADES[m] for m in entradas if m in MAPA_MODALIDADES]


def _hoy():
    return datetime.now(timezone.utc).strftime('%Y-%m-%d')


def _huella_datos(datos):
    """Huella de los datos que no cambian solo por ejecutar el proceso."""
    return json.dumps(datos.get('proveedores', []), ensure_ascii=False, sort_keys=True)


def agregar_historial(datos, ahora, estado, detalle, cambios, maximo=MAX_HISTORIAL):
    historial = datos.get('historial')
    if not isinstance(historial, list):
        historial = []

    if not cambios and historial:
        datos['historial'] = historial[:maximo]
        return

    entrada = {
        'fecha': ahora,
        'estado': estado,
        'detalle': detalle,
    }
    datos['historial'] = [entrada] + historial[:maximo - 1]


def actualizar_openrouter(datos, hoy=None):
    """Consulta OpenRouter y sincroniza los modelos con precio 0.

    Devuelve (datos, exito, detalle).
    """
    hoy = hoy or _hoy()

    try:
        peticion = urllib.request.Request(
            URL_OPENROUTER,
            headers={'User-Agent': 'directorio-apis-ia/2.0'},
        )
        with urllib.request.urlopen(peticion, timeout=30) as respuesta:
            catalogo = json.loads(respuesta.read().decode('utf-8'))
    except Exception as error:
        return datos, False, f'OpenRouter: error al consultar el catálogo ({resumen_error(error)}); datos conservados.'

    gratuitos = []
    for modelo in catalogo.get('data', []):
        precios = modelo.get('pricing') or {}
        if not precio_cero(precios.get('prompt')) or not precio_cero(precios.get('completion')):
            continue
        if modelo.get('id') in MODELOS_EXCLUIDOS_OPENROUTER:
            continue
        gratuitos.append(modelo)

    if len(gratuitos) < MINIMO_MODELOS_OPENROUTER:
        return (
            datos,
            False,
            f'OpenRouter: el catálogo solo devolvió {len(gratuitos)} modelos gratuitos; '
            'datos conservados.',
        )

    proveedor = buscar_proveedor(datos, 'openrouter')
    if not proveedor:
        return datos, False, 'OpenRouter: no se encontró el proveedor en los datos; datos conservados.'

    previos = proveedor.get('modelos', [])
    if previos and len(gratuitos) < len(previos) * (1 - UMBRAL_CAIDA_OPENROUTER):
        caida = round((1 - len(gratuitos) / len(previos)) * 100)
        return (
            datos,
            False,
            f'OpenRouter: el catálogo pasó de {len(previos)} a {len(gratuitos)} modelos gratuitos '
            f'({caida}% de caída); se conservan los datos para evitar borrados accidentales.',
        )

    existentes = {m.get('nombre'): m for m in previos}
    vistos = set()
    agregados = 0
    actualizados = 0

    for modelo_api in gratuitos:
        modelo_id = modelo_api.get('id')
        if not modelo_id:
            continue
        vistos.add(modelo_id)

        contexto = modelo_api.get('context_length')
        modalidades = modalidades_desde_api(modelo_api)

        if modelo_id in existentes:
            modelo = existentes[modelo_id]
            cambios = False

            if contexto and modelo.get('contexto_tokens') != contexto:
                modelo['contexto_tokens'] = contexto
                cambios = True

            if modalidades and modelo.get('modalidades') != modalidades:
                modelo['modalidades'] = modalidades
                cambios = True

            if cambios:
                actualizados += 1
            continue

        nombre = nombre_legible(modelo_api.get('name'), modelo_id)
        proveedor.setdefault('modelos', []).append({
            'nombre': modelo_id,
            'nombre_display': nombre,
            'descripcion': DESCRIPCION_NUEVO_OPENROUTER.format(nombre=nombre),
            'tipo_acceso': 'gratis',
            'limite_peticiones_minuto': 20,
            'limite_tokens_minuto': None,
            'limite_peticiones_dia': 50,
            'limite_tokens_dia': None,
            'contexto_tokens': contexto,
            'modalidades': modalidades or ['texto'],
            'documentacion': f'https://openrouter.ai/{modelo_id}',
            'notas': NOTA_NUEVO_OPENROUTER,
            'licencia': None,
            'parametros': None,
            'origen': 'automatico',
        })
        agregados += 1

    retirados = [m for m in proveedor.get('modelos', []) if m.get('nombre') not in vistos]
    if retirados:
        proveedor['modelos'] = [m for m in proveedor.get('modelos', []) if m.get('nombre') in vistos]

    proveedor['verificado'] = hoy
    proveedor['actualizacion'] = 'automatica'

    detalle = (
        f'OpenRouter: {len(gratuitos)} modelos gratuitos verificados'
        f' ({agregados} añadidos, {len(retirados)} retirados, {actualizados} actualizados).'
    )
    return datos, True, detalle


def actualizar_google(datos, hoy=None):
    """Actualiza metadatos de los modelos de Google ya curados.

    Devuelve (datos, estado, detalle), donde estado es 'ok', 'omitido' o 'error'.
    No agrega ni elimina modelos: los nuevos se informan para revisarlos a mano.
    """
    hoy = hoy or _hoy()

    if not API_KEY:
        return datos, 'omitido', 'Google: sin API key (GOOGLE_API_KEY); datos conservados.'

    modelos_api = {}
    pagina = None

    try:
        while True:
            parametros = {'key': API_KEY}
            if pagina:
                parametros['pageToken'] = pagina
            url = URL_GOOGLE + '?' + urllib.parse.urlencode(parametros)

            peticion = urllib.request.Request(
                url,
                headers={'User-Agent': 'directorio-apis-ia/2.0'},
            )
            with urllib.request.urlopen(peticion, timeout=30) as respuesta:
                cuerpo = json.loads(respuesta.read().decode('utf-8'))

            for modelo in cuerpo.get('models', []):
                if 'generateContent' not in (modelo.get('supportedGenerationMethods') or []):
                    continue
                nombre = (modelo.get('name') or '').replace('models/', '')
                if nombre:
                    modelos_api[nombre] = modelo

            pagina = cuerpo.get('nextPageToken')
            if not pagina:
                break
    except Exception as error:
        return datos, 'error', f'Google: error al consultar la API ({resumen_error(error)}); datos conservados.'

    proveedor = buscar_proveedor(datos, 'google')
    if not proveedor:
        return datos, 'error', 'Google: no se encontró el proveedor en los datos; datos conservados.'

    actualizados = 0
    for modelo in proveedor.get('modelos', []):
        api = modelos_api.get(modelo.get('nombre'))
        if not api:
            continue

        cambios = False
        display = api.get('displayName')
        if display and modelo.get('nombre_display') != display:
            modelo['nombre_display'] = display
            cambios = True

        contexto = api.get('inputTokenLimit')
        if contexto and modelo.get('contexto_tokens') != contexto:
            modelo['contexto_tokens'] = contexto
            cambios = True

        if cambios:
            actualizados += 1

    existentes = {m.get('nombre') for m in proveedor.get('modelos', [])}
    nuevos = sorted(set(modelos_api) - existentes)

    proveedor['verificado'] = hoy
    proveedor['actualizacion'] = 'mixta'

    detalle = f'Google: API consultada correctamente ({actualizados} modelos actualizados).'
    if nuevos:
        detalle += f' {len(nuevos)} modelos nuevos detectados; revísalos antes de añadirlos.'

    return datos, 'ok', detalle


def main(argv=None):
    parser = argparse.ArgumentParser(description='Actualiza data/proveedores.js.')
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Consulta las fuentes y muestra el resultado sin escribir el archivo.',
    )
    args = parser.parse_args(argv)

    datos = cargar()
    ahora = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    hoy = ahora[:10]

    estado_anterior = datos.get('estado')
    detalle_anterior = datos.get('detalle_estado')
    huella_anterior = _huella_datos(datos)

    detalles = []
    exitos = 0
    fallos = 0
    omitidos = 0

    datos, exito_openrouter, detalle_openrouter = actualizar_openrouter(datos, hoy=hoy)
    detalles.append(detalle_openrouter)
    if exito_openrouter:
        exitos += 1
    else:
        fallos += 1

    datos, estado_google, detalle_google = actualizar_google(datos, hoy=hoy)
    detalles.append(detalle_google)
    if estado_google == 'ok':
        exitos += 1
    elif estado_google == 'error':
        fallos += 1
    else:
        omitidos += 1

    if exitos == 0:
        estado = 'error_actualizacion_datos_conservados'
    elif fallos == 0 and omitidos == 0:
        estado = 'exitoso'
    else:
        estado = 'parcial'

    if exitos > 0:
        datos['ultima_actualizacion'] = ahora

    detalle_estado = ' '.join(detalles)
    datos['ultimo_intento'] = ahora
    datos['estado'] = estado
    datos['detalle_estado'] = detalle_estado

    cambios = (
        _huella_datos(datos) != huella_anterior
        or estado != estado_anterior
        or detalle_estado != detalle_anterior
    )
    agregar_historial(datos, ahora, estado, detalle_estado, cambios)

    if args.dry_run:
        errores, advertencias = validar_datos(datos, RUTA_JS)
        for advertencia in advertencias:
            print('AVISO: ' + advertencia)
        for error in errores:
            print('ERROR: ' + error, file=sys.stderr)
        if errores:
            return 1
        print('Dry run: no se escribió el archivo.')
    else:
        try:
            guardar(datos)
        except ValueError as error:
            print(f'ERROR: {error}', file=sys.stderr)
            return 1

    for detalle in detalles:
        print(detalle)
    print('Estado final: ' + estado)
    if cambios:
        print('Historial actualizado.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
