# Directorio de APIs de IA Gratuitas

Aplicación web sencilla que muestra, por proveedor de IA, qué modelos se pueden usar gratis mediante API.

## Ver la página localmente

Abre `index.html` en tu navegador (doble clic). No necesitas servidor ni instalar nada.

## Estructura

- `index.html`: estructura de la página.
- `style.css`: estilos (diseño limpio y responsive).
- `app.js`: lee los datos y pinta proveedores y modelos.
- `data/proveedores.js`: datos de proveedores y modelos.
- `scripts/actualizar.py`: intenta actualizar los datos una vez al día.
- `.github/workflows/actualizar.yml`: tarea programada de GitHub Actions.

## Agregar un proveedor

Edita `data/proveedores.js` y añade un objeto dentro de `proveedores` con la misma estructura.
No hace falta tocar el HTML ni el JavaScript.

## Publicar gratis con GitHub Pages

1. Sube este proyecto a un repositorio de GitHub.
2. Ve a Settings > Pages.
3. Selecciona la rama principal y la carpeta `/ (root)`.
4. Guarda y espera la URL pública.

## Actualización diaria

El workflow `.github/workflows/actualizar.yml` se ejecuta todos los días a las 06:00 UTC.
Si consigues una API key de Google AI Studio, agrégala como secreto `GOOGLE_API_KEY`
en Settings > Secrets and variables > Actions. Sin esa clave, los datos se conservan.
