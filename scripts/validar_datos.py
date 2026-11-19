"""Validación del archivo de datos del directorio.

Se usa desde el actualizador, desde las pruebas y desde GitHub Actions.
Si los datos no cumplen el esquema, el actualizador no escribe nada.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.parse
from datetime import datetime

RUTA_JS = os.path.join(os.path.dirname(__file__), '..', 'data', 'proveedores.js')
PREFIJO = 'window.DIRECTORIO_DATOS = '

ESTADOS = {
    'exitoso',
    'parcial',
    'sin_api_key_datos_conservados',
    'error_actualizacion_datos_conservados',
    'datos_iniciales',
}

TIPOS_ACCESO = {'gratis', 'autoalojable', 'pago'}
TIPOS_ACTUALIZACION = {'automatica', 'mixta', 'manual'}
MODALIDADES = {'texto', 'imagen', 'audio', 'video', 'pdf', 'archivos'}
CAMPOS_NUMERICOS = (
    'limite_peticiones_minuto',
    'limite_tokens_minuto',
    'limite_peticiones_dia',
    'limite_tokens_dia',
    'contexto_tokens',
)
ID_PROVEEDOR = re.compile(r'^[a-z0-9][a-z0-9-]*$')


def _es_fecha(valor: object) -> bool:
    if not isinstance(valor, str) or not valor:
        return False
    try:
        datetime.fromisoformat(valor.replace('Z', '+00:00'))
        return True
    except ValueError:
        return False


def _es_url(valor: object) -> bool:
    if not isinstance(valor, str) or not valor:
        return False
    partes = urllib.parse.urlparse(valor)
    return partes.scheme in {'http', 'https'} and bool(partes.netloc)


def _es_numero_no_negativo(valor: object) -> bool:
    return type(valor) in (int, float) and valor >= 0


def extraer_json(contenido: str) -> dict:
    """Extrae el objeto JSON que sigue al prefijo de proveedores.js."""
    inicio = contenido.find('{')
    fin = contenido.rfind('}')
    if inicio == -1 or fin == -1 or fin <= inicio:
        raise ValueError('El archivo de datos no tiene el formato esperado.')
    return json.loads(contenido[inicio:fin + 1])


def leer_datos(ruta: str = RUTA_JS) -> dict:
    with open(ruta, 'r', encoding='utf-8') as archivo:
        return extraer_json(archivo.read())


def validar_datos(datos: object, origen: str = 'datos') -> tuple[list[str], list[str]]:
    """Devuelve (errores, advertencias). No lanza excepciones."""
    errores: list[str] = []
    advertencias: list[str] = []

    def err(mensaje: str) -> None:
        errores.append(f'{origen}: {mensaje}')

    def adv(mensaje: str) -> None:
        advertencias.append(f'{origen}: {mensaje}')

    if not isinstance(datos, dict):
        return [f'{origen}: la raíz debe ser un objeto JSON.'], []

    if 'version' in datos and not isinstance(datos['version'], int):
        err('"version" debe ser un número entero.')

    if not _es_fecha(datos.get('ultima_actualizacion')):
        err('"ultima_actualizacion" falta o no es una fecha ISO válida.')

    if 'ultimo_intento' in datos and not _es_fecha(datos['ultimo_intento']):
        err('"ultimo_intento" no es una fecha ISO válida.')

    estado = datos.get('estado')
    if estado not in ESTADOS:
        err(f'"estado" debe ser uno de: {", ".join(sorted(ESTADOS))}.')

    if 'detalle_estado' in datos and not isinstance(datos['detalle_estado'], str):
        err('"detalle_estado" debe ser texto.')

    proveedores = datos.get('proveedores')
    if not isinstance(proveedores, list) or not proveedores:
        return errores + [f'{origen}: "proveedores" debe ser una lista con al menos un elemento.'], advertencias

    ids: set[str] = set()
    total_modelos = 0

    for indice, proveedor in enumerate(proveedores):
        base = f'proveedores[{indice}]'
        if not isinstance(proveedor, dict):
            err(f'{base} debe ser un objeto.')
            continue

        prov_id = proveedor.get('id')
        if not isinstance(prov_id, str) or not ID_PROVEEDOR.match(prov_id):
            err(f'{base}.id debe usar minúsculas, números y guiones.')
        elif prov_id in ids:
            err(f'{base}.id duplicado: "{prov_id}".')
        else:
            ids.add(prov_id)

        for campo in ('nombre', 'sitio_web', 'documentacion'):
            valor = proveedor.get(campo)
            if not isinstance(valor, str) or not valor.strip():
                err(f'{base}.{campo} es obligatorio.')

        for campo in ('sitio_web', 'documentacion'):
            if not _es_url(proveedor.get(campo)):
                err(f'{base}.{campo} debe ser una URL http(s) válida.')

        if 'notas' in proveedor and proveedor['notas'] is not None and not isinstance(proveedor['notas'], str):
            err(f'{base}.notas debe ser texto o null.')

        if 'verificado' in proveedor and not _es_fecha(proveedor['verificado']):
            err(f'{base}.verificado debe ser una fecha ISO válida.')

        actualizacion = proveedor.get('actualizacion')
        if actualizacion is not None and actualizacion not in TIPOS_ACTUALIZACION:
            err(f'{base}.actualizacion debe ser uno de: {", ".join(sorted(TIPOS_ACTUALIZACION))}.')

        modelos = proveedor.get('modelos')
        if not isinstance(modelos, list) or not modelos:
            err(f'{base}.modelos debe ser una lista con al menos un modelo.')
            continue

        nombres: set[str] = set()

        for indice_modelo, modelo in enumerate(modelos):
            ruta_modelo = f'{base}.modelos[{indice_modelo}]'
            if not isinstance(modelo, dict):
                err(f'{ruta_modelo} debe ser un objeto.')
                continue

            total_modelos += 1
            nombre = modelo.get('nombre')
            if not isinstance(nombre, str) or not nombre.strip():
                err(f'{ruta_modelo}.nombre es obligatorio.')
            elif any(caracter.isspace() for caracter in nombre):
                err(f'{ruta_modelo}.nombre no debe contener espacios: "{nombre}".')
            elif nombre in nombres:
                err(f'{ruta_modelo}.nombre duplicado en el proveedor: "{nombre}".')
            else:
                nombres.add(nombre)

            for campo in ('nombre_display', 'descripcion'):
                if not isinstance(modelo.get(campo), str) or not modelo[campo].strip():
                    err(f'{ruta_modelo}.{campo} es obligatorio.')

            if modelo.get('tipo_acceso') not in TIPOS_ACCESO:
                err(f'{ruta_modelo}.tipo_acceso debe ser uno de: {", ".join(sorted(TIPOS_ACCESO))}.')

            if not _es_url(modelo.get('documentacion')):
                err(f'{ruta_modelo}.documentacion debe ser una URL http(s) válida.')

            modalidades = modelo.get('modalidades')
            if not isinstance(modalidades, list) or not modalidades:
                err(f'{ruta_modelo}.modalidades debe ser una lista no vacía.')
            else:
                normalizadas = [str(modalidad).strip().lower() for modalidad in modalidades]
                desconocidas = sorted(set(normalizadas) - MODALIDADES)
                if desconocidas:
                    err(f'{ruta_modelo}.modalidades contiene valores no admitidos: {", ".join(desconocidas)}.')
                if len(normalizadas) != len(set(normalizadas)):
                    adv(f'{ruta_modelo}.modalidades contiene duplicados.')
                if 'PDF' in modalidades:
                    adv(f'{ruta_modelo}.modalidades usa "PDF" en mayúsculas; se recomienda "pdf".')

            for campo in CAMPOS_NUMERICOS:
                if campo not in modelo:
                    continue
                valor = modelo[campo]
                if valor is None:
                    continue
                if not _es_numero_no_negativo(valor):
                    err(f'{ruta_modelo}.{campo} debe ser un número no negativo o null.')
                elif campo == 'contexto_tokens' and valor == 0:
                    err(f'{ruta_modelo}.contexto_tokens no puede ser 0.')

            for campo in ('licencia', 'parametros', 'limite_extra', 'origen', 'notas'):
                valor = modelo.get(campo)
                if valor is not None and not isinstance(valor, str):
                    err(f'{ruta_modelo}.{campo} debe ser texto o null.')

    if total_modelos == 0:
        err('No hay modelos en el archivo de datos.')

    historial = datos.get('historial')
    if historial is not None:
        if not isinstance(historial, list):
            err('"historial" debe ser una lista.')
        else:
            if len(historial) > 50:
                adv('"historial" tiene más de 50 entradas; conviene recortarlo.')
            for indice, entrada in enumerate(historial):
                base = f'historial[{indice}]'
                if not isinstance(entrada, dict):
                    err(f'{base} debe ser un objeto.')
                    continue
                if not _es_fecha(entrada.get('fecha')):
                    err(f'{base}.fecha no es una fecha ISO válida.')
                if entrada.get('estado') not in ESTADOS:
                    err(f'{base}.estado no es válido.')
                if not isinstance(entrada.get('detalle'), str):
                    err(f'{base}.detalle debe ser texto.')

    return errores, advertencias


def cargar_datos(ruta: str = RUTA_JS) -> dict:
    """Lee y valida; lanza ValueError si hay errores."""
    datos = leer_datos(ruta)
    errores, _ = validar_datos(datos, ruta)
    if errores:
        raise ValueError('Datos inválidos:\n- ' + '\n- '.join(errores))
    return datos


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description='Valida data/proveedores.js.')
    parser.add_argument('--ruta', default=RUTA_JS, help='Ruta del archivo de datos.')
    parser.add_argument('--quiet', action='store_true', help='Solo muestra errores.')
    args = parser.parse_args(argv)

    try:
        datos = leer_datos(args.ruta)
    except Exception as error:
        print(f'ERROR: no se pudo leer el archivo: {error}', file=sys.stderr)
        return 1

    errores, advertencias = validar_datos(datos, args.ruta)
    for advertencia in advertencias:
        if not args.quiet:
            print(f'AVISO: {advertencia}')
    for error in errores:
        print(f'ERROR: {error}', file=sys.stderr)

    if errores:
        print(f'\n{len(errores)} error(es). No se debe publicar este archivo.', file=sys.stderr)
        return 1

    proveedores = len(datos.get('proveedores', []))
    modelos = sum(len(proveedor.get('modelos', [])) for proveedor in datos['proveedores'])
    if not args.quiet:
        print(f'OK: {proveedores} proveedores y {modelos} modelos validados.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
