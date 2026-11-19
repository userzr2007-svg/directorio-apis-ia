# Directorio de APIs de IA Gratuitas

Aplicación web estática que muestra modelos de IA con **API gratuita** o **pesos abiertos autoalojables**, agrupados por proveedor, con sus límites, capacidades y enlaces a la documentación oficial.

**Página en vivo:** https://userzr2007-svg.github.io/directorio-apis-ia/

## Proveedores incluidos

| Proveedor | Acceso | Actualización |
| --- | --- | --- |
| Google AI Studio (Gemini) | Nivel gratuito con límites | Metadatos vía API si existe `GOOGLE_API_KEY` |
| OpenRouter | Modelos `:free` con límite diario | Automática desde su catálogo público |
| Groq | Nivel gratuito con límites | Datos curados (revisión manual) |
| Mistral AI | Moderación gratis vía API; resto autoalojable | Datos curados (revisión manual) |

## Funciones de la página

- Buscador global por modelo, proveedor, descripción o capacidad.
- Filtros por tipo de acceso (gratis / autoalojable) y por proveedor.
- Tarjetas responsive con límites RPM, TPM, RPD, TPD y contexto.
- Copia del nombre exacto del modelo con un clic.
- Fecha de última actualización correcta, último intento y estado del proceso.
- Si una fuente falla, se conservan los datos anteriores y se indica en el estado.

## Ver la página localmente

Abre `index.html` con doble clic. No necesitas servidor ni instalar nada.

Para probar la actualización de datos:

```bash
python scripts/actualizar.py
```

El script modifica `data/proveedores.js`. En Windows también funciona sin dependencias externas.

## Estructura

- `index.html`: estructura de la página.
- `style.css`: estilos y diseño responsive.
- `app.js`: búsqueda, filtros y renderizado de tarjetas.
- `data/proveedores.js`: datos de proveedores y modelos.
- `scripts/actualizar.py`: actualización automática de datos.
- `.github/workflows/actualizar.yml`: tarea diaria de GitHub Actions.

## Agregar un proveedor o un modelo

Edita `data/proveedores.js` y añade un objeto dentro de `proveedores`, o un modelo dentro de `modelos`, con la misma estructura. No hace falta tocar el HTML ni el JavaScript.

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
  "modalidades": ["texto", "imagen"],
  "documentacion": "https://...",
  "notas": "Opcional."
}
```

## Actualización diaria

El workflow `.github/workflows/actualizar.yml` se ejecuta todos los días a las **06:00 UTC** y también puede lanzarse a mano desde la pestaña **Actions**.

- **OpenRouter** se consulta siempre y se sincroniza automáticamente: añade modelos `:free` nuevos y retira los que dejaron de ser gratuitos.
- **Google** actualiza nombres y contexto si existe el secreto `GOOGLE_API_KEY`. Los modelos nuevos no se añaden solos porque hay que comprobar si son gratuitos.
- **Groq y Mistral** se mantienen curados manualmente porque sus límites no se exponen por API.

### Estados posibles

- `exitoso`: todas las fuentes consultadas respondieron bien.
- `parcial`: al menos una fuente se actualizó; otra falló o se omitió (por ejemplo, sin API key de Google).
- `error_actualizacion_datos_conservados`: no se pudo actualizar ninguna fuente; se conservan los datos y la fecha anterior.

## Configurar la API key de Google (opcional)

1. Entra en https://aistudio.google.com/api-keys y crea una clave.
2. En GitHub, abre **Settings → Secrets and variables → Actions**.
3. Crea un secreto llamado `GOOGLE_API_KEY` y pega la clave.
4. Ejecuta el workflow desde **Actions → Actualizar datos de APIs IA → Run workflow**.

Sin la clave, la página sigue funcionando y OpenRouter se actualiza igualmente; el estado aparecerá como **parcial**.

## Publicar gratis con GitHub Pages

1. Sube el proyecto a un repositorio de GitHub.
2. Ve a **Settings → Pages**.
3. Selecciona la rama principal y la carpeta `/ (root)`.
4. Guarda y espera la URL pública.

## Aviso

Los límites gratuitos cambian con frecuencia y se aplican por proyecto u organización. Los datos son de referencia: verifica siempre la documentación oficial antes de usar un modelo en producción.
