window.DIRECTORIO_DATOS = {
  "ultima_actualizacion": "2026-11-17T08:38:16Z",
  "estado": "sin_api_key_datos_conservados",
  "proveedores": [
    {
      "id": "google",
      "nombre": "Google AI Studio (Gemini)",
      "sitio_web": "https://aistudio.google.com/",
      "documentacion": "https://ai.google.dev/",
      "modelos": [
        {
          "nombre": "gemini-1.5-flash",
          "nombre_display": "Gemini 1.5 Flash",
          "descripcion": "Modelo rápido y eficiente para tareas de alto volumen: respuestas rápidas, resumen, clasificación y chat general.",
          "limite_peticiones_minuto": 15,
          "limite_peticiones_dia": 1500,
          "limite_tokens_dia": null,
          "contexto_tokens": 1048576,
          "modalidades": [
            "texto",
            "imagen"
          ],
          "documentacion": "https://ai.google.dev/models/gemini#gemini-1.5-flash"
        },
        {
          "nombre": "gemini-1.5-pro",
          "nombre_display": "Gemini 1.5 Pro",
          "descripcion": "Modelo más capaz para razonamiento complejo, código, análisis de documentos largos y tareas avanzadas.",
          "limite_peticiones_minuto": 5,
          "limite_peticiones_dia": 1000,
          "limite_tokens_dia": null,
          "contexto_tokens": 2097152,
          "modalidades": [
            "texto",
            "imagen"
          ],
          "documentacion": "https://ai.google.dev/models/gemini#gemini-1.5-pro"
        }
      ]
    }
  ]
};
