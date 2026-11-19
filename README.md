# Directorio de APIs de IA Gratuitas

Aplicación web estática que muestra modelos de IA con **API gratuita** o **pesos abiertos autoalojables**, agrupados por proveedor, con sus límites, contexto, licencia, capacidades y enlaces a la documentación oficial.

**Página en vivo:** https://userzr2007-svg.github.io/directorio-apis-ia/

## Proveedores incluidos

| Proveedor | Acceso | Actualización |
| --- | --- | --- |
| Google AI Studio (Gemini) | Nivel gratuito con límites | Metadatos vía API si existe `GOOGLE_API_KEY` |
| OpenRouter | Modelos `:free` con límite diario | Automática desde su catálogo público |
| Groq | Nivel gratuito con límites | Datos curados (revisión manual) |
| Mistral AI | Moderación gratis vía API; resto autoalojable | Datos curados (revisión manual) |
| Cerebras | Free Trial con límites por modelo | Datos curados (revisión manual) |
| Cloudflare Workers AI | Cupo gratuito de Neuronas | Datos curados (revisión manual) |
| Cohere | Claves trial gratuitas con cuota mensual | Datos curados (revisión manual) |

Actualmente el directorio reúne **7 proveedores y 52 modelos**.

## Funciones de la página

- Buscador global por modelo, proveedor, descripción, licencia o capacidad; ignora acentos.
- Filtros por tipo de acceso (gratis / autoalojable / favoritos) y por proveedor, con contadores en cada filtro.
- Tarjetas responsive con límites RPM, TPM, RPD, TPD, contexto, modalidades, licencia y parámetros.
- Tema claro u oscuro con preferencia guardada y detección del tema del sistema.
- Favoritos guardados en el navegador y filtro para ver solo los modelos marcados.
- Comparador de hasta 3 modelos con tabla de 14 características.
- Copia del nombre exacto del modelo con un clic y aviso accesible si el portapapeles no está disponible.
- Estado compartible en la URL (`?q=`, `?acceso=`, `?proveedor=`), compatible con atrás/adelante.
- Fecha de última actualización correcta, último intento, estado del proceso e historial de cambios.
- Enlace **⚑ Reportar** en cada tarjeta que abre una incidencia con los datos del modelo ya rellenados.
- Si una fuente falla, se conservan los datos anteriores y se indica en el estado.

## Ver la página localmente

Abre `index.html` con doble clic. No necesitas servidor ni instalar nada.

Para servirla con un servidor local:

```bash
python -m http.server 8765 --bind 127.0.0.1
```

y visita `http://127.0.0.1:8765/`.

## Estructura

- `index.html`: estructura de la página, metadatos sociales y favicon.
- `style.css`: estilos, tema oscuro y diseño responsive.
- `app.js`: búsqueda, filtros, favoritos, comparador, tema, historial y estado de la URL.
- `favicon.svg`: icono del sitio.
- `data/proveedores.js`: datos de proveedores y modelos.
- `scripts/validar_datos.py`: validación del esquema, URL, fechas, límites y duplicados.
- `scripts/actualizar.py`: actualización automática con guardado atómico e historial.
- `scripts/test_actualizar.py`: pruebas del actualizador y de la validación.
- `scripts/verificar_enlaces.py`: revisión de los enlaces de documentación.
- `.github/workflows/actualizar.yml`: tarea diaria de datos.
- `.github/workflows/verificar-enlaces.yml`: revisión semanal de enlaces.

## Formato de los datos

`data/proveedores.js` contiene `window.DIRECTORIO_DATOS` con el esquema v2:

```js
{
  "version": 2,
  "ultima_actualizacion": "2026-11-19T02:22:57Z",
  "ultimo_intento": "2026-11-19T02:22:57Z",
  "estado": "parcial",
  "detalle_estado": "OpenRouter: ... Google: ...",
  "historial": [
    { "fecha": "...", "estado": "parcial", "detalle": "..." }
  ],
  "proveedores": [
    {
      "id": "google",
      "nombre": "Google AI Studio (Gemini)",
      "sitio_web": "https://aistudio.google.com/",
      "documentacion": "https://ai.google.dev/gemini-api/docs",
      "notas": "Texto opcional.",
      "verificado": "2026-11-19",
      "actualizacion": "mixta",
      "modelos": []
    }
  ]
}
```

Campos de un modelo:

```js
{
  "nombre": "nombre-exacto-del-modelo",
  "nombre_display": "Nombre visible",
  "descripcion": "Descripción breve en español.",
  "tipo_acceso": "gratis", // gratis | autoalojable | pago
  "limite_peticiones_minuto": 20,
  "limite_tokens_minuto": null,
  "limite_peticiones_dia": 50,
  "limite_tokens_dia": null,
  "contexto_tokens": 128000,
  "modalidades": ["texto", "imagen"], // texto | imagen | audio | video | pdf | archivos
  "documentacion": "https://...",
  "notas": "Opcional.",
  "limite_extra": "Opcional: cuota mensual u otra restricción.",
  "licencia": "Apache 2.0",
  "parametros": "120B (5,1B activos)"
}
```

`verificado` (fecha ISO) y `actualizacion` (`automatica`, `mixta` o `manual`) son campos del proveedor.

## Agregar un proveedor o un modelo

Edita `data/proveedores.js` y añade un objeto dentro de `proveedores`, o un modelo dentro de `modelos`, con la misma estructura. No hace falta tocar el HTML ni el JavaScript.

Antes de publicar, valida el archivo:

```bash
python scripts/validar_datos.py
```

La validación comprueba el esquema, las URLs, las fechas ISO, los límites numéricos, las modalidades admitidas, los identificadores y nombres duplicados y el historial.

## Actualización diaria

El workflow `.github/workflows/actualizar.yml` se ejecuta todos los días a las **06:00 UTC** y también puede lanzarse a mano desde la pestaña **Actions**.

Antes de actualizar, el workflow valida los datos y ejecuta las pruebas. Después vuelve a validar, y solo entonces confirma y publica los cambios.

- **OpenRouter** se consulta siempre y se sincroniza automáticamente: añade modelos `:free` nuevos, actualiza contexto y modalidades, y retira los que dejaron de ser gratuitos.
- **Google** actualiza nombres y contexto si existe el secreto `GOOGLE_API_KEY`. Los modelos nuevos no se añaden solos porque hay que comprobar si son gratuitos.
- **Groq, Mistral, Cerebras, Cloudflare y Cohere** se mantienen curados manualmente porque sus límites no se exponen por API o requieren revisión.

### Protecciones del actualizador

- Valida los datos antes de escribir y guarda con escritura atómica: nunca deja un archivo a medias.
- Si el catálogo gratuito de OpenRouter cae más de un 40 % de golpe, conserva los datos para evitar borrados accidentales.
- Si OpenRouter devuelve menos de 3 modelos gratuitos, considera la respuesta anómala y no modifica nada.
- Mantiene un historial de las últimas 30 ejecuciones con cambios y la fecha del último intento.
- Si una fuente falla, conserva los datos y la fecha de la última actualización correcta.

### Estados posibles

- `exitoso`: todas las fuentes consultadas respondieron bien.
- `parcial`: al menos una fuente se actualizó; otra falló o se omitió (por ejemplo, sin API key de Google).
- `error_actualizacion_datos_conservados`: no se pudo actualizar ninguna fuente; se conservan los datos y la fecha anterior.

## Comandos útiles

```bash
# Validar los datos
python scripts/validar_datos.py

# Ejecutar las pruebas del actualizador
python -m unittest discover -s scripts -p "test_*.py" -v

# Consultar las fuentes sin escribir el archivo
python scripts/actualizar.py --dry-run

# Actualizar los datos
python scripts/actualizar.py

# Comprobar todos los enlaces de documentación
python scripts/verificar_enlaces.py
```

`verificar_enlaces.py` solo considera rotos los `404`/`410` y los fallos de red. Los `401`, `403`, `405`, `429` y los fallos de confianza TLS se tratan como enlaces protegidos, no como enlaces caídos.

## Configurar la API key de Google (opcional)

1. Entra en https://aistudio.google.com/api-keys y crea una clave.
2. En GitHub, abre **Settings → Secrets and variables → Actions**.
3. Crea un secreto llamado `GOOGLE_API_KEY` y pega la clave.
4. Ejecuta el workflow desde **Actions → Actualizar datos de APIs IA → Run workflow**.

Sin la clave, la página sigue funcionando y OpenRouter se actualiza igualmente; el estado aparecerá como **parcial**.

## Verificación semanal de enlaces

El workflow `.github/workflows/verificar-enlaces.yml` revisa los enlaces todos los lunes a las **07:00 UTC**. Si encuentra enlaces rotos o errores de red, publica el resumen en la ejecución y abre o actualiza una incidencia titulada «Enlaces de documentación con problemas».

También puedes lanzarlo a mano desde **Actions → Verificar enlaces de documentación → Run workflow**.

## Publicar gratis con GitHub Pages

1. Sube el proyecto a un repositorio de GitHub.
2. Ve a **Settings → Pages**.
3. Selecciona la rama principal y la carpeta `/ (root)`.
4. Guarda y espera la URL pública.

## Aviso

Los límites gratuitos cambian con frecuencia y se aplican por proyecto u organización. Los datos son de referencia: verifica siempre la documentación oficial antes de usar un modelo en producción.
