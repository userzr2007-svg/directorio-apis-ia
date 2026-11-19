import copy
import json
import os
import tempfile
import unittest
from unittest.mock import patch

import actualizar
import validar_datos


class RespuestaFalsa:
    def __init__(self, contenido):
        self.contenido = contenido

    def read(self):
        return json.dumps(self.contenido).encode('utf-8')

    def __enter__(self):
        return self

    def __exit__(self, *_argumentos):
        return False


def modelo(nombre, **cambios):
    datos = {
        'nombre': nombre,
        'nombre_display': nombre.replace('-', ' ').title(),
        'descripcion': 'Modelo de prueba para las pruebas automatizadas.',
        'tipo_acceso': 'gratis',
        'limite_peticiones_minuto': 20,
        'limite_tokens_minuto': None,
        'limite_peticiones_dia': 50,
        'limite_tokens_dia': None,
        'contexto_tokens': 128000,
        'modalidades': ['texto'],
        'documentacion': 'https://example.com/docs',
        'notas': None,
        'licencia': None,
        'parametros': None,
    }
    datos.update(cambios)
    return datos


def proveedor(proveedor_id, nombre, modelos, **cambios):
    datos = {
        'id': proveedor_id,
        'nombre': nombre,
        'sitio_web': 'https://example.com',
        'documentacion': 'https://example.com/docs',
        'notas': None,
        'verificado': '2026-11-18',
        'actualizacion': 'manual',
        'modelos': modelos,
    }
    datos.update(cambios)
    return datos


def datos_base(modelos_openrouter=None, modelos_google=None):
    return {
        'version': 2,
        'ultima_actualizacion': '2026-11-18T00:00:00Z',
        'ultimo_intento': '2026-11-18T00:00:00Z',
        'estado': 'parcial',
        'detalle_estado': 'Datos de prueba.',
        'historial': [],
        'proveedores': [
            proveedor('openrouter', 'OpenRouter', modelos_openrouter or [modelo('modelo-1')]),
            proveedor(
                'google',
                'Google AI Studio (Gemini)',
                modelos_google or [modelo('gemini-x', contexto_tokens=128000)],
                actualizacion='mixta',
            ),
        ],
    }


class PruebasValidacion(unittest.TestCase):
    def test_datos_validos(self):
        errores, _ = validar_datos.validar_datos(datos_base())
        self.assertEqual(errores, [])

    def test_detecta_modelos_duplicados(self):
        datos = datos_base(modelos_openrouter=[modelo('repetido'), modelo('repetido')])
        errores, _ = validar_datos.validar_datos(datos)
        self.assertTrue(any('duplicado' in error for error in errores))

    def test_detecta_url_invalida(self):
        datos = datos_base(modelos_openrouter=[modelo('modelo-1', documentacion='no-es-una-url')])
        errores, _ = validar_datos.validar_datos(datos)
        self.assertTrue(any('documentacion' in error for error in errores))

    def test_detecta_limite_negativo(self):
        datos = datos_base(modelos_openrouter=[modelo('modelo-1', limite_peticiones_minuto=-1)])
        errores, _ = validar_datos.validar_datos(datos)
        self.assertTrue(any('limite_peticiones_minuto' in error for error in errores))

    def test_detecta_modalidad_desconocida(self):
        datos = datos_base(modelos_openrouter=[modelo('modelo-1', modalidades=['texto', 'holograma'])])
        errores, _ = validar_datos.validar_datos(datos)
        self.assertTrue(any('modalidades' in error for error in errores))


class PruebasUtilidades(unittest.TestCase):
    def test_precio_cero(self):
        self.assertTrue(actualizar.precio_cero('0'))
        self.assertTrue(actualizar.precio_cero('0.000000'))
        self.assertFalse(actualizar.precio_cero('0.000001'))
        self.assertFalse(actualizar.precio_cero(None))

    def test_nombre_legible(self):
        self.assertEqual(actualizar.nombre_legible('Proveedor: Modelo (free)', 'x'), 'Modelo')
        self.assertEqual(actualizar.nombre_legible(None, 'proveedor/modelo'), 'proveedor/modelo')

    def test_historial_se_recorta(self):
        datos = {'historial': []}
        actualizar.agregar_historial(datos, '2026-11-18T00:00:00Z', 'parcial', 'Detalle', True, maximo=3)
        for indice in range(5):
            actualizar.agregar_historial(
                datos,
                f'2026-11-{19 + indice}T00:00:00Z',
                'parcial',
                f'Detalle {indice}',
                True,
                maximo=3,
            )
        self.assertEqual(len(datos['historial']), 3)
        self.assertEqual(datos['historial'][0]['detalle'], 'Detalle 4')

    def test_historial_no_duplica_si_no_hay_cambios(self):
        datos = {'historial': [{'fecha': '2026-11-18T00:00:00Z', 'estado': 'parcial', 'detalle': 'Igual'}]}
        actualizar.agregar_historial(datos, '2026-11-19T00:00:00Z', 'parcial', 'Igual', False)
        self.assertEqual(len(datos['historial']), 1)


class PruebasOpenRouter(unittest.TestCase):
    def _catalogo(self, modelos):
        return {
            'data': [
                {
                    'id': modelo_id,
                    'name': modelo_id,
                    'context_length': 64000,
                    'pricing': {'prompt': '0', 'completion': '0'},
                    'architecture': {'input_modalities': ['text', 'image']},
                }
                for modelo_id in modelos
            ]
        }

    def test_agrega_modelos_nuevos(self):
        datos = datos_base(modelos_openrouter=[modelo('modelo-1')])
        with patch.object(actualizar.urllib.request, 'urlopen', return_value=RespuestaFalsa(self._catalogo(['modelo-1', 'modelo-2', 'modelo-3']))):
            resultado, exito, detalle = actualizar.actualizar_openrouter(datos, hoy='2026-11-18')

        self.assertTrue(exito)
        self.assertIn('2 añadidos', detalle)
        self.assertEqual(len(resultado['proveedores'][0]['modelos']), 3)
        self.assertEqual(resultado['proveedores'][0]['modelos'][1]['modalidades'], ['texto', 'imagen'])

    def test_retira_modelos_que_ya_no_son_gratis(self):
        datos = datos_base(modelos_openrouter=[modelo(f'modelo-{indice}') for indice in range(5)])
        with patch.object(actualizar.urllib.request, 'urlopen', return_value=RespuestaFalsa(self._catalogo(['modelo-0', 'modelo-1', 'modelo-2']))):
            resultado, exito, detalle = actualizar.actualizar_openrouter(datos, hoy='2026-11-18')

        self.assertTrue(exito)
        self.assertIn('2 retirados', detalle)
        self.assertEqual(len(resultado['proveedores'][0]['modelos']), 3)

    def test_protege_una_caida_anomala(self):
        datos = datos_base(modelos_openrouter=[modelo(f'modelo-{indice}') for indice in range(10)])
        with patch.object(actualizar.urllib.request, 'urlopen', return_value=RespuestaFalsa(self._catalogo(['modelo-0', 'modelo-1', 'modelo-2']))):
            resultado, exito, detalle = actualizar.actualizar_openrouter(datos, hoy='2026-11-18')

        self.assertFalse(exito)
        self.assertIn('se conservan los datos', detalle)
        self.assertEqual(len(resultado['proveedores'][0]['modelos']), 10)

    def test_falla_si_el_catalogo_es_muy_pequeno(self):
        datos = datos_base(modelos_openrouter=[modelo('modelo-1')])
        with patch.object(actualizar.urllib.request, 'urlopen', return_value=RespuestaFalsa(self._catalogo(['modelo-1', 'modelo-2']))):
            resultado, exito, detalle = actualizar.actualizar_openrouter(datos, hoy='2026-11-18')

        self.assertFalse(exito)
        self.assertIn('solo devolvió 2', detalle)
        self.assertEqual(len(resultado['proveedores'][0]['modelos']), 1)


class PruebasGoogle(unittest.TestCase):
    def test_sin_api_key_se_omite(self):
        with patch.object(actualizar, 'API_KEY', ''):
            resultado, estado, detalle = actualizar.actualizar_google(datos_base(), hoy='2026-11-18')

        self.assertEqual(estado, 'omitido')
        self.assertIn('sin API key', detalle)

    def test_actualiza_metadatos(self):
        respuesta = {
            'models': [
                {
                    'name': 'models/gemini-x',
                    'displayName': 'Gemini X Renombrado',
                    'inputTokenLimit': 999999,
                    'supportedGenerationMethods': ['generateContent'],
                }
            ]
        }
        datos = datos_base()
        with patch.object(actualizar, 'API_KEY', 'clave-de-prueba'):
            with patch.object(actualizar.urllib.request, 'urlopen', return_value=RespuestaFalsa(respuesta)):
                resultado, estado, detalle = actualizar.actualizar_google(datos, hoy='2026-11-18')

        self.assertEqual(estado, 'ok')
        self.assertIn('1 modelos actualizados', detalle)
        modelo_google = resultado['proveedores'][1]['modelos'][0]
        self.assertEqual(modelo_google['nombre_display'], 'Gemini X Renombrado')
        self.assertEqual(modelo_google['contexto_tokens'], 999999)
        self.assertEqual(resultado['proveedores'][1]['verificado'], '2026-11-18')


class PruebasGuardado(unittest.TestCase):
    def test_guardar_y_leer(self):
        datos = datos_base()
        with tempfile.TemporaryDirectory() as carpeta:
            ruta = os.path.join(carpeta, 'proveedores.js')
            actualizar.guardar(datos, ruta)
            with open(ruta, encoding='utf-8') as archivo:
                contenido = archivo.read()
            self.assertTrue(contenido.startswith(validar_datos.PREFIJO))
            self.assertEqual(validar_datos.leer_datos(ruta)['proveedores'][0]['id'], 'openrouter')

    def test_no_escribe_datos_invalidos(self):
        datos = datos_base(modelos_openrouter=[modelo('repetido'), modelo('repetido')])
        with tempfile.TemporaryDirectory() as carpeta:
            ruta = os.path.join(carpeta, 'proveedores.js')
            with self.assertRaises(ValueError):
                actualizar.guardar(datos, ruta)
            self.assertFalse(os.path.exists(ruta))


class PruebasMain(unittest.TestCase):
    def test_dry_run_no_escribe(self):
        datos = datos_base()
        with patch.object(actualizar, 'cargar', return_value=copy.deepcopy(datos)):
            with patch.object(actualizar, 'actualizar_openrouter', return_value=(datos, True, 'OpenRouter: ok.')):
                with patch.object(actualizar, 'actualizar_google', return_value=(datos, 'omitido', 'Google: sin API key.')):
                    with patch.object(actualizar, 'guardar') as guardar:
                        codigo = actualizar.main(['--dry-run'])

        self.assertEqual(codigo, 0)
        guardar.assert_not_called()
        self.assertEqual(datos['estado'], 'parcial')
        self.assertEqual(datos['historial'][0]['estado'], 'parcial')


if __name__ == '__main__':
    unittest.main()
