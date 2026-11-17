import json
import os
from datetime import datetime, timezone
import urllib.request

RUTA_JS = os.path.join(os.path.dirname(__file__), '..', 'data', 'proveedores.js')
PREFIJO = 'window.DIRECTORIO_DATOS = '
API_KEY = os.environ.get('GOOGLE_API_KEY')


def cargar():
    """Lee el archivo proveedores.js y extrae el objeto JSON que contiene."""
    with open(RUTA_JS, 'r', encoding='utf-8') as f:
        contenido = f.read()

    inicio = contenido.find('{')
    fin = contenido.rfind('}')
    if inicio == -1 or fin == -1:
        raise ValueError('El archivo de datos no tiene el formato esperado.')

    return json.loads(contenido[inicio:fin + 1])


def guardar(datos):
    """Vuelve a escribir el archivo proveedores.js con el objeto actualizado."""
    with open(RUTA_JS, 'w', encoding='utf-8') as f:
        f.write(PREFIJO + json.dumps(datos, ensure_ascii=False, indent=2) + ';\n')


def intentar_actualizar_google(datos):
    """Consulta la API de Google y actualiza metadatos de los modelos ya conocidos.

    Devuelve (datos, hubo_cambios, estado).
    No agrega ni elimina modelos automáticamente: los modelos nuevos se informan
    para revisarlos a mano y decidir si son gratuitos.
    """
    if not API_KEY:
        print('No hay GOOGLE_API_KEY configurada. Se conservan los datos actuales.')
        return datos, False, 'sin_api_key_datos_conservados'

    url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + API_KEY
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=30) as resp:
            respuesta = json.loads(resp.read().decode())
    except Exception as e:
        print(f'Error consultando Google: {e}')
        return datos, False, 'error_actualizacion_datos_conservados'

    modelos_api = {}
    for m in respuesta.get('models', []):
        metodos = m.get('supportedGenerationMethods', [])
        if 'generateContent' not in metodos:
            continue
        nombre = m.get('name', '').replace('models/', '')
        if nombre:
            modelos_api[nombre] = m

    proveedor = next((p for p in datos.get('proveedores', []) if p.get('id') == 'google'), None)
    if not proveedor:
        print('No se encontro el proveedor Google en los datos.')
        return datos, False, 'error_actualizacion_datos_conservados'

    cambios = False
    for modelo in proveedor.get('modelos', []):
        api = modelos_api.get(modelo.get('nombre'))
        if not api:
            continue

        display = api.get('displayName')
        if display and modelo.get('nombre_display') != display:
            modelo['nombre_display'] = display
            cambios = True

        contexto = api.get('inputTokenLimit')
        if contexto and modelo.get('contexto_tokens') != contexto:
            modelo['contexto_tokens'] = contexto
            cambios = True

    existentes = {m.get('nombre') for m in proveedor.get('modelos', [])}
    nuevos = sorted(set(modelos_api) - existentes)
    if nuevos:
        print('Modelos nuevos detectados (revisar si son gratuitos): ' + ', '.join(nuevos))

    print('Se consulto la API de Google correctamente.')
    return datos, cambios, 'exitoso'


def main():
    datos = cargar()
    ahora = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

    datos, cambio, estado = intentar_actualizar_google(datos)
    datos['ultima_actualizacion'] = ahora
    datos['estado'] = estado

    guardar(datos)

    if cambio:
        print('Datos actualizados automaticamente.')
    else:
        print('No hubo cambios en los modelos. Fecha de intento registrada y datos conservados.')


if __name__ == '__main__':
    main()
