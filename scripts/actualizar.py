import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timezone

RUTA_JS = os.path.join(os.path.dirname(__file__), '..', 'data', 'proveedores.js')
PREFIJO = 'window.DIRECTORIO_DATOS = '
API_KEY = os.environ.get('GOOGLE_API_KEY')

URL_OPENROUTER = 'https://openrouter.ai/api/v1/models'
URL_GOOGLE = 'https://generativelanguage.googleapis.com/v1beta/models'

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
    """Lee proveedores.js y extrae el objeto JSON que contiene."""
    with open(RUTA_JS, 'r', encoding='utf-8') as f:
        contenido = f.read()

    inicio = contenido.find('{')
    fin = contenido.rfind('}')
    if inicio == -1 or fin == -1:
        raise ValueError('El archivo de datos no tiene el formato esperado.')

    return json.loads(contenido[inicio:fin + 1])


def guardar(datos):
    """Vuelve a escribir proveedores.js con el objeto actualizado."""
    with open(RUTA_JS, 'w', encoding='utf-8') as f:
        f.write(PREFIJO + json.dumps(datos, ensure_ascii=False, indent=2) + ';\n')


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


def actualizar_openrouter(datos):
    """Consulta OpenRouter y sincroniza los modelos con precio 0.

    Devuelve (datos, exito, detalle).
    """
    try:
        peticion = urllib.request.Request(
            URL_OPENROUTER,
            headers={'User-Agent': 'directorio-apis-ia/1.0'},
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

    if not gratuitos:
        return datos, False, 'OpenRouter: el catálogo no devolvió modelos gratuitos; datos conservados.'

    proveedor = buscar_proveedor(datos, 'openrouter')
    if not proveedor:
        return datos, False, 'OpenRouter: no se encontró el proveedor en los datos; datos conservados.'

    existentes = {m.get('nombre'): m for m in proveedor.get('modelos', [])}
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
            'modalidades': modalidades,
            'documentacion': f'https://openrouter.ai/{modelo_id}',
            'notas': NOTA_NUEVO_OPENROUTER,
            'origen': 'automatico',
        })
        agregados += 1

    retirados = [m for m in proveedor.get('modelos', []) if m.get('nombre') not in vistos]
    if retirados:
        proveedor['modelos'] = [m for m in proveedor.get('modelos', []) if m.get('nombre') in vistos]

    detalle = (
        f'OpenRouter: {len(gratuitos)} modelos gratuitos verificados'
        f' ({agregados} añadidos, {len(retirados)} retirados, {actualizados} actualizados).'
    )
    return datos, True, detalle


def actualizar_google(datos):
    """Actualiza metadatos de los modelos de Google ya curados.

    Devuelve (datos, estado, detalle), donde estado es 'ok', 'omitido' o 'error'.
    No agrega ni elimina modelos: los nuevos se informan para revisarlos a mano.
    """
    if not API_KEY:
        return datos, 'omitido', 'Google: sin API key (GOOGLE_API_KEY); datos conservados.'

    modelos_api = {}
    pagina = None

    try:
        while True:
            url = URL_GOOGLE + '?key=' + API_KEY
            if pagina:
                url += '&pageToken=' + urllib.parse.quote(pagina)

            peticion = urllib.request.Request(
                url,
                headers={'User-Agent': 'directorio-apis-ia/1.0'},
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

    detalle = f'Google: API consultada correctamente ({actualizados} modelos actualizados).'
    if nuevos:
        detalle += f' {len(nuevos)} modelos nuevos detectados; revísalos antes de añadirlos.'

    return datos, 'ok', detalle


def main():
    datos = cargar()
    ahora = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

    detalles = []
    exitos = 0
    fallos = 0
    omitidos = 0

    datos, exito_openrouter, detalle_openrouter = actualizar_openrouter(datos)
    detalles.append(detalle_openrouter)
    if exito_openrouter:
        exitos += 1
    else:
        fallos += 1

    datos, estado_google, detalle_google = actualizar_google(datos)
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

    datos['ultimo_intento'] = ahora
    datos['estado'] = estado
    datos['detalle_estado'] = ' '.join(detalles)

    guardar(datos)

    for detalle in detalles:
        print(detalle)
    print('Estado final: ' + estado)


if __name__ == '__main__':
    main()
