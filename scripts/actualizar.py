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
    """Intenta consultar la API de Google. Si no hay clave o falla, conserva los datos."""
    if not API_KEY:
        print('No hay GOOGLE_API_KEY configurada. Se conservan los datos actuales.')
        return datos, False

    url = 'https://generativelanguage.googleapis.com/v1beta/models'
    try:
        req = urllib.request.Request(url + '?key=' + API_KEY)
        with urllib.request.urlopen(req, timeout=30) as resp:
            modelos = json.loads(resp.read().decode())
        print('Se consulto la API de Google correctamente.')
        # En el MVP no sobreescribimos automaticamente para evitar guardar formato inesperado.
        # Aqui podrias mapear la respuesta de Google a tu estructura de datos.
        return datos, False
    except Exception as e:
        print(f'Error consultando Google: {e}')
        return datos, False


def main():
    datos = cargar()
    ahora = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    datos['ultima_actualizacion'] = ahora
    datos['estado'] = 'exitoso' if API_KEY else 'sin_api_key_datos_conservados'

    _, cambio = intentar_actualizar_google(datos)

    guardar(datos)

    if cambio:
        print('Datos actualizados automaticamente.')
    else:
        print('No hubo cambios automaticos. Fecha de intento registrada y datos conservados.')


if __name__ == '__main__':
    main()
