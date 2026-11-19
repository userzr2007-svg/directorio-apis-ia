"""Comprueba los enlaces de documentación del directorio.

Uso:
    python scripts/verificar_enlaces.py
    python scripts/verificar_enlaces.py --json enlaces.json --salida enlaces_roto.txt

Solo considera rotos los 404/410 y los fallos de red. Los 401/403/405/429 se
tratan como protegidos: el servidor existe, pero bloquea comprobaciones automáticas.
"""

import argparse
import json
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

from validar_datos import RUTA_JS, cargar_datos

USER_AGENT = (
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36 '
    'directorio-apis-ia/2.0'
)
PROTEGIDOS = {401, 403, 405, 429}
ROTOS = {404, 410}


def resumen_error(error):
    return ' '.join(str(error).split())[:240]


def recolectar_enlaces(datos):
    enlaces = {}

    def agregar(url, etiqueta):
        if not url:
            return
        enlaces.setdefault(url, set()).add(etiqueta)

    for proveedor in datos.get('proveedores', []):
        agregar(proveedor.get('sitio_web'), proveedor.get('nombre', 'Proveedor') + ' (sitio web)')
        agregar(proveedor.get('documentacion'), proveedor.get('nombre', 'Proveedor') + ' (documentación)')
        for modelo in proveedor.get('modelos', []):
            agregar(
                modelo.get('documentacion') or proveedor.get('documentacion'),
                proveedor.get('nombre', 'Proveedor') + ' / ' + modelo.get('nombre', 'modelo'),
            )

    return enlaces


def solicitar(url, metodo, timeout):
    peticion = urllib.request.Request(
        url,
        headers={
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
        },
        method=metodo,
    )
    try:
        with urllib.request.urlopen(peticion, timeout=timeout) as respuesta:
            respuesta.read(1)
            return respuesta.status, None
    except urllib.error.HTTPError as error:
        return error.code, None
    except Exception as error:
        return None, resumen_error(error)


def comprobar(url, timeout):
    codigo, error = solicitar(url, 'HEAD', timeout)

    # Muchos servidores no implementan HEAD o bloquean al comprobador.
    if codigo is None or codigo in PROTEGIDOS or codigo in {405, 501}:
        codigo_get, error_get = solicitar(url, 'GET', timeout)
        if codigo_get is not None:
            codigo, error = codigo_get, None
        elif error is None:
            error = error_get

    if codigo is None:
        # Un fallo de confianza TLS no significa que la página no exista; suele
        # depender del almacén de certificados del entorno que ejecuta la revisión.
        if error and 'CERTIFICATE_VERIFY_FAILED' in error:
            estado = 'protegido'
        else:
            estado = 'error'
    elif 200 <= codigo < 400 or codigo in PROTEGIDOS:
        estado = 'ok' if 200 <= codigo < 400 else 'protegido'
    elif codigo in ROTOS:
        estado = 'roto'
    else:
        estado = 'error'

    return {
        'url': url,
        'estado': estado,
        'codigo': codigo,
        'error': error,
    }


def escribir_salida(ruta, problemas, revisados):
    lineas = [
        '# Enlaces de documentación con problemas',
        '',
        f'Revisión automática: {datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")}. '
        f'Enlaces comprobados: {revisados}.',
        '',
    ]
    for problema in problemas:
        codigo = problema['codigo'] if problema['codigo'] is not None else 'sin respuesta'
        etiquetas = ', '.join(sorted(problema['etiquetas']))
        lineas.append(f'- **{codigo}** {problema["url"]} — {etiquetas}')
        if problema.get('error'):
            lineas.append(f'  - {problema["error"]}')
    lineas.append('')
    with open(ruta, 'w', encoding='utf-8', newline='\n') as archivo:
        archivo.write('\n'.join(lineas))


def main(argv=None):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

    parser = argparse.ArgumentParser(description='Comprueba los enlaces de data/proveedores.js.')
    parser.add_argument('--ruta', default=RUTA_JS, help='Ruta del archivo de datos.')
    parser.add_argument('--timeout', type=float, default=20, help='Timeout por petición, en segundos.')
    parser.add_argument('--workers', type=int, default=8, help='Comprobaciones simultáneas.')
    parser.add_argument('--json', dest='json_salida', help='Escribe un resumen JSON en esta ruta.')
    parser.add_argument('--salida', help='Escribe los enlaces con problemas en Markdown.')
    args = parser.parse_args(argv)

    datos = cargar_datos(args.ruta)
    enlaces = recolectar_enlaces(datos)

    resultados = []
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as ejecutor:
        futuros = {
            ejecutor.submit(comprobar, url, args.timeout): (url, etiquetas)
            for url, etiquetas in enlaces.items()
        }
        for futuro in as_completed(futuros):
            url, etiquetas = futuros[futuro]
            resultado = futuro.result()
            resultado['etiquetas'] = sorted(etiquetas)
            resultados.append(resultado)

    resultados.sort(key=lambda item: (item['estado'] != 'roto', item['url']))
    problemas = [item for item in resultados if item['estado'] in {'roto', 'error'}]
    cuentas = {
        'total': len(resultados),
        'ok': sum(1 for item in resultados if item['estado'] == 'ok'),
        'protegidos': sum(1 for item in resultados if item['estado'] == 'protegido'),
        'problemas': len(problemas),
    }

    if args.salida:
        escribir_salida(args.salida, problemas, len(resultados))

    if args.json_salida:
        with open(args.json_salida, 'w', encoding='utf-8', newline='\n') as archivo:
            json.dump(
                {
                    'revisado_en': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
                    'cuentas': cuentas,
                    'problemas': problemas,
                },
                archivo,
                ensure_ascii=False,
                indent=2,
            )
            archivo.write('\n')

    print(
        f'Enlaces: {cuentas["total"]} comprobados, {cuentas["ok"]} correctos, '
        f'{cuentas["protegidos"]} protegidos, {cuentas["problemas"]} con problemas.'
    )
    for problema in problemas:
        codigo = problema['codigo'] if problema['codigo'] is not None else 'sin respuesta'
        print(f'- [{codigo}] {problema["url"]} ({", ".join(problema["etiquetas"])})')
        if problema.get('error'):
            print(f'  {problema["error"]}')

    return 1 if problemas else 0


if __name__ == '__main__':
    sys.exit(main())
