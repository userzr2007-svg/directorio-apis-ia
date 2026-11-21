window.DIRECTORIO_DATOS = {
  "ultima_actualizacion": "2026-11-21T06:48:01Z",
  "ultimo_intento": "2026-11-21T06:48:01Z",
  "estado": "parcial",
  "detalle_estado": "OpenRouter: 12 modelos gratuitos verificados (0 añadidos, 1 retirados, 0 actualizados). Google: sin API key (GOOGLE_API_KEY); datos conservados.",
  "proveedores": [
    {
      "id": "google",
      "nombre": "Google AI Studio (Gemini)",
      "sitio_web": "https://aistudio.google.com/",
      "documentacion": "https://ai.google.dev/gemini-api/docs",
      "notas": "El plan gratuito de Gemini API se aplica por proyecto. Los límites reales pueden variar y se consultan en AI Studio.",
      "modelos": [
        {
          "nombre": "gemini-4-hydrogen",
          "nombre_display": "Gemini 4 Hydrogen",
          "descripcion": "Modelo multimodal de nueva generación para razonamiento, código y análisis de contenido largo: texto, imagen, audio, vídeo y PDF.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 5,
          "limite_tokens_minuto": 250000,
          "limite_peticiones_dia": 20,
          "limite_tokens_dia": null,
          "contexto_tokens": 1048576,
          "modalidades": [
            "texto",
            "imagen",
            "audio",
            "video",
            "pdf"
          ],
          "documentacion": "https://ai.google.dev/gemini-api/docs/models",
          "notas": "Solo 20 peticiones al día: pensado para pruebas, no para producción.",
          "licencia": "Propietaria",
          "parametros": null
        },
        {
          "nombre": "gemini-3.8-flash",
          "nombre_display": "Gemini 3.8 Flash",
          "descripcion": "Modelo Flash rápido y multimodal, equilibrado para chat, resúmenes, extracción de datos y tareas con imágenes o audio.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 5,
          "limite_tokens_minuto": 250000,
          "limite_peticiones_dia": 20,
          "limite_tokens_dia": null,
          "contexto_tokens": 1048576,
          "modalidades": [
            "texto",
            "imagen",
            "audio",
            "video",
            "pdf"
          ],
          "documentacion": "https://ai.google.dev/gemini-api/docs/models",
          "notas": null,
          "licencia": "Propietaria",
          "parametros": null
        },
        {
          "nombre": "gemini-3.6-flash",
          "nombre_display": "Gemini 3.6 Flash",
          "descripcion": "Generación anterior de Flash: rápida y económica, adecuada para asistentes, clasificación y procesamiento por lotes pequeño.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 5,
          "limite_tokens_minuto": 250000,
          "limite_peticiones_dia": 20,
          "limite_tokens_dia": null,
          "contexto_tokens": 1048576,
          "modalidades": [
            "texto",
            "imagen",
            "audio",
            "video"
          ],
          "documentacion": "https://ai.google.dev/gemini-api/docs/models",
          "notas": null,
          "licencia": "Propietaria",
          "parametros": null
        },
        {
          "nombre": "gemini-3-flash-preview",
          "nombre_display": "Gemini 3 Flash Preview",
          "descripcion": "Vista previa de la familia Gemini 3 Flash, con buena relación velocidad/calidad para prototipos y agentes.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 5,
          "limite_tokens_minuto": 250000,
          "limite_peticiones_dia": 20,
          "limite_tokens_dia": null,
          "contexto_tokens": 1048576,
          "modalidades": [
            "texto",
            "imagen",
            "audio",
            "video"
          ],
          "documentacion": "https://ai.google.dev/gemini-api/docs/models",
          "notas": null,
          "licencia": "Propietaria",
          "parametros": null
        },
        {
          "nombre": "gemini-3.5-flash-lite",
          "nombre_display": "Gemini 3.5 Flash Lite",
          "descripcion": "Variante ligera con 500 peticiones diarias: ideal para pruebas de alto volumen, chatbots básicos y clasificación.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 15,
          "limite_tokens_minuto": 250000,
          "limite_peticiones_dia": 500,
          "limite_tokens_dia": null,
          "contexto_tokens": 1048576,
          "modalidades": [
            "texto",
            "imagen",
            "audio",
            "video"
          ],
          "documentacion": "https://ai.google.dev/gemini-api/docs/models",
          "notas": null,
          "licencia": "Propietaria",
          "parametros": null
        },
        {
          "nombre": "gemini-3.1-flash-lite",
          "nombre_display": "Gemini 3.1 Flash Lite",
          "descripcion": "Modelo Lite de Gemini 3.1 con límite diario amplio para tareas simples de texto y visión.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 15,
          "limite_tokens_minuto": 250000,
          "limite_peticiones_dia": 500,
          "limite_tokens_dia": null,
          "contexto_tokens": 1048576,
          "modalidades": [
            "texto",
            "imagen",
            "audio",
            "video"
          ],
          "documentacion": "https://ai.google.dev/gemini-api/docs/models",
          "notas": null,
          "licencia": "Propietaria",
          "parametros": null
        },
        {
          "nombre": "gemma-4-26b-a4b-it",
          "nombre_display": "Gemma 4 26B A4B",
          "descripcion": "Modelo abierto Gemma 4 con mezcla de expertos y 26B de parámetros; instrucciones, texto, imagen y vídeo.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 30,
          "limite_tokens_minuto": 16000,
          "limite_peticiones_dia": 14400,
          "limite_tokens_dia": null,
          "contexto_tokens": 262144,
          "modalidades": [
            "texto",
            "imagen",
            "video"
          ],
          "documentacion": "https://ai.google.dev/gemini-api/docs/models",
          "notas": "14.400 peticiones al día, pero solo 16K tokens por minuto.",
          "licencia": "Gemma Terms",
          "parametros": "26B (4B activos)"
        },
        {
          "nombre": "gemma-4-31b-it",
          "nombre_display": "Gemma 4 31B",
          "descripcion": "Gemma 4 de 31B parámetros, orientado a instrucciones, con visión y contexto de 262K tokens.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 30,
          "limite_tokens_minuto": 16000,
          "limite_peticiones_dia": 14400,
          "limite_tokens_dia": null,
          "contexto_tokens": 262144,
          "modalidades": [
            "texto",
            "imagen",
            "video"
          ],
          "documentacion": "https://ai.google.dev/gemini-api/docs/models",
          "notas": "14.400 peticiones al día, pero solo 16K tokens por minuto.",
          "licencia": "Gemma Terms",
          "parametros": "31B"
        },
        {
          "nombre": "gemini-3.8-flash-tts",
          "nombre_display": "Gemini 3.8 Flash TTS",
          "descripcion": "Conversión de texto a voz con Gemini 3.8 Flash: genera audio natural para narración y asistentes.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 3,
          "limite_tokens_minuto": 10000,
          "limite_peticiones_dia": 10,
          "limite_tokens_dia": null,
          "contexto_tokens": null,
          "modalidades": [
            "texto",
            "audio"
          ],
          "documentacion": "https://ai.google.dev/gemini-api/docs/speech-generation",
          "notas": "Solo 10 peticiones al día en el nivel gratuito.",
          "licencia": "Propietaria",
          "parametros": null
        },
        {
          "nombre": "gemini-3.5-transcribe",
          "nombre_display": "Gemini 3.5 Transcribe",
          "descripcion": "Transcripción de audio a texto con Gemini 3.5, útil para subtítulos, reuniones y notas de voz.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 3,
          "limite_tokens_minuto": 10000,
          "limite_peticiones_dia": 25,
          "limite_tokens_dia": null,
          "contexto_tokens": null,
          "modalidades": [
            "audio",
            "texto"
          ],
          "documentacion": "https://ai.google.dev/gemini-api/docs/audio",
          "notas": "25 peticiones al día; el audio de entrada cuenta para el límite de tokens.",
          "licencia": "Propietaria",
          "parametros": null
        },
        {
          "nombre": "gemini-3.8-live",
          "nombre_display": "Gemini 3.8 Live",
          "descripcion": "API Live en tiempo real para conversaciones de voz y vídeo de baja latencia con Gemini 3.8.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": null,
          "limite_tokens_minuto": 65000,
          "limite_peticiones_dia": null,
          "limite_tokens_dia": null,
          "contexto_tokens": null,
          "modalidades": [
            "audio",
            "video",
            "texto"
          ],
          "documentacion": "https://ai.google.dev/gemini-api/docs/live",
          "notas": "Sin límite publicado de peticiones; el límite es de 65K tokens por minuto.",
          "licencia": "Propietaria",
          "parametros": null
        }
      ],
      "verificado": "2026-11-19",
      "actualizacion": "mixta"
    },
    {
      "id": "openrouter",
      "nombre": "OpenRouter",
      "sitio_web": "https://openrouter.ai/",
      "documentacion": "https://openrouter.ai/docs",
      "notas": "Agregador con modelos de muchos laboratorios. Los modelos con sufijo :free son gratuitos con 20 peticiones/minuto y 50/día (1.000/día si compraste $10 o más en créditos).",
      "modelos": [
        {
          "nombre": "inclusionai/ling-3.2-flash:free",
          "nombre_display": "Ling 3.2 Flash",
          "descripcion": "Modelo de razonamiento híbrido de inclusionAI; acepta texto e imagen (hasta 200 imágenes por petición) y contexto de 1M tokens.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": 50,
          "limite_tokens_dia": null,
          "contexto_tokens": 1048576,
          "modalidades": [
            "texto",
            "imagen"
          ],
          "documentacion": "https://openrouter.ai/inclusionai/ling-3.2-flash:free",
          "notas": null,
          "licencia": null,
          "parametros": null
        },
        {
          "nombre": "baidu/ernie-5.5-flash-preview:free",
          "nombre_display": "ERNIE 5.5 Flash Preview",
          "descripcion": "Modelo insignia de Baidu con mejoras en código, agentes, investigación profunda y trabajo con conocimiento.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": 50,
          "limite_tokens_dia": null,
          "contexto_tokens": 1024000,
          "modalidades": [
            "texto"
          ],
          "documentacion": "https://openrouter.ai/baidu/ernie-5.5-flash-preview:free",
          "notas": null,
          "licencia": null,
          "parametros": null
        },
        {
          "nombre": "liquid/lfm-3-1.7b:free",
          "nombre_display": "LFM3 1.7B",
          "descripcion": "Modelo compacto de 1,7B parámetros, entrenado para agentes, uso de herramientas y salidas estructuradas.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": 50,
          "limite_tokens_dia": null,
          "contexto_tokens": 262144,
          "modalidades": [
            "texto"
          ],
          "documentacion": "https://openrouter.ai/liquid/lfm-3-1.7b:free",
          "notas": null,
          "licencia": null,
          "parametros": "1,7B"
        },
        {
          "nombre": "particle-ai/particle-1:free",
          "nombre_display": "Particle-1",
          "descripcion": "Modelo de Particle AI con contexto de 1M tokens que acepta texto e imágenes.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": 50,
          "limite_tokens_dia": null,
          "contexto_tokens": 1048576,
          "modalidades": [
            "texto",
            "imagen"
          ],
          "documentacion": "https://openrouter.ai/particle-ai/particle-1:free",
          "notas": null,
          "licencia": null,
          "parametros": null
        },
        {
          "nombre": "recursive/flint-v1.0:free",
          "nombre_display": "Flint",
          "descripcion": "Modelo de Recursive orientado a conversación y razonamiento, con contexto de 262K tokens.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": 50,
          "limite_tokens_dia": null,
          "contexto_tokens": 262144,
          "modalidades": [
            "texto"
          ],
          "documentacion": "https://openrouter.ai/recursive/flint-v1.0:free",
          "notas": null,
          "licencia": null,
          "parametros": null
        },
        {
          "nombre": "nvidia/nemotron-3.5-super-vl:free",
          "nombre_display": "Nemotron 3.5 Super VL",
          "descripcion": "Modelo multimodal de NVIDIA que comprende texto, imágenes y vídeo con contexto de 1M tokens.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": 50,
          "limite_tokens_dia": null,
          "contexto_tokens": 1000000,
          "modalidades": [
            "texto",
            "imagen",
            "video"
          ],
          "documentacion": "https://openrouter.ai/nvidia/nemotron-3.5-super-vl:free",
          "notas": null,
          "licencia": "OpenMDW 1.1",
          "parametros": "120B (12B activos)"
        },
        {
          "nombre": "nvidia/nemotron-3.5-lightning:free",
          "nombre_display": "Nemotron 3.5 Lightning",
          "descripcion": "Modelo de texto rápido de NVIDIA con contexto de 1M tokens para tareas de alto volumen.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": 50,
          "limite_tokens_dia": null,
          "contexto_tokens": 1000000,
          "modalidades": [
            "texto"
          ],
          "documentacion": "https://openrouter.ai/nvidia/nemotron-3.5-lightning:free",
          "notas": null,
          "licencia": "OpenMDW 1.1",
          "parametros": "30B (3B activos)"
        },
        {
          "nombre": "nvidia/nemotron-3-ultra-550b-a55b:free",
          "nombre_display": "Nemotron 3 Ultra",
          "descripcion": "Modelo de gran escala de NVIDIA (550B parámetros totales) para razonamiento y tareas complejas.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": 50,
          "limite_tokens_dia": null,
          "contexto_tokens": 1000000,
          "modalidades": [
            "texto"
          ],
          "documentacion": "https://openrouter.ai/nvidia/nemotron-3-ultra-550b-a55b:free",
          "notas": null,
          "licencia": "OpenMDW 1.1",
          "parametros": "550B (55B activos)"
        },
        {
          "nombre": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
          "nombre_display": "Nemotron 3 Nano Omni",
          "descripcion": "Modelo ómnibus y eficiente de NVIDIA: acepta texto, audio, imagen y vídeo, con razonamiento integrado.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": 50,
          "limite_tokens_dia": null,
          "contexto_tokens": 256000,
          "modalidades": [
            "texto",
            "audio",
            "imagen",
            "video"
          ],
          "documentacion": "https://openrouter.ai/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
          "notas": null,
          "licencia": "OpenMDW 1.1",
          "parametros": "30B (3B activos)"
        },
        {
          "nombre": "google/gemma-4-26b-a4b-it:free",
          "nombre_display": "Gemma 4 26B A4B",
          "descripcion": "Modelo abierto de Google con mezcla de expertos; admite texto, imagen y vídeo.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": 50,
          "limite_tokens_dia": null,
          "contexto_tokens": 262144,
          "modalidades": [
            "imagen",
            "texto",
            "video"
          ],
          "documentacion": "https://openrouter.ai/google/gemma-4-26b-a4b-it:free",
          "notas": null,
          "licencia": "Gemma Terms",
          "parametros": "26B (4B activos)"
        },
        {
          "nombre": "google/gemma-4-31b-it:free",
          "nombre_display": "Gemma 4 31B",
          "descripcion": "Modelo abierto de Google de 31B parámetros para instrucciones, visión y vídeo.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": 50,
          "limite_tokens_dia": null,
          "contexto_tokens": 262144,
          "modalidades": [
            "imagen",
            "texto",
            "video"
          ],
          "documentacion": "https://openrouter.ai/google/gemma-4-31b-it:free",
          "notas": null,
          "licencia": "Gemma Terms",
          "parametros": "31B"
        },
        {
          "nombre": "openrouter/free",
          "nombre_display": "OpenRouter Free",
          "descripcion": "Enrutador automático que elige un modelo gratuito disponible para cada petición.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": 50,
          "limite_tokens_dia": null,
          "contexto_tokens": 200000,
          "modalidades": [
            "texto",
            "imagen"
          ],
          "documentacion": "https://openrouter.ai/openrouter/free",
          "notas": "El modelo concreto puede variar en cada petición.",
          "licencia": "Varias",
          "parametros": null
        }
      ],
      "verificado": "2026-11-21",
      "actualizacion": "automatica"
    },
    {
      "id": "groq",
      "nombre": "Groq",
      "sitio_web": "https://console.groq.com/",
      "documentacion": "https://console.groq.com/docs/rate-limits",
      "notas": "El plan gratuito aplica límites por modelo. Los modelos de audio usan límites en segundos de audio, no en tokens.",
      "modelos": [
        {
          "nombre": "openai/gpt-oss-120b",
          "nombre_display": "GPT-OSS 120B",
          "descripcion": "Modelo abierto de OpenAI con razonamiento fuerte, ideal para agentes, código y preguntas complejas.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 30,
          "limite_tokens_minuto": 8000,
          "limite_peticiones_dia": 1000,
          "limite_tokens_dia": 200000,
          "contexto_tokens": 131072,
          "modalidades": [
            "texto"
          ],
          "documentacion": "https://console.groq.com/docs/models",
          "notas": null,
          "licencia": "Apache 2.0",
          "parametros": "120B (5,1B activos)"
        },
        {
          "nombre": "openai/gpt-oss-20b",
          "nombre_display": "GPT-OSS 20B",
          "descripcion": "Versión ligera de GPT-OSS: rápida y capaz para chat, clasificación y generación de código.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 30,
          "limite_tokens_minuto": 8000,
          "limite_peticiones_dia": 1000,
          "limite_tokens_dia": 200000,
          "contexto_tokens": 131072,
          "modalidades": [
            "texto"
          ],
          "documentacion": "https://console.groq.com/docs/models",
          "notas": null,
          "licencia": "Apache 2.0",
          "parametros": "20B (3,6B activos)"
        },
        {
          "nombre": "qwen/qwen3.8-27b",
          "nombre_display": "Qwen 3.8 27B",
          "descripcion": "Modelo de Alibaba Qwen para razonamiento, tareas multilingües y uso de herramientas.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 30,
          "limite_tokens_minuto": 8000,
          "limite_peticiones_dia": 1000,
          "limite_tokens_dia": 200000,
          "contexto_tokens": 131072,
          "modalidades": [
            "texto"
          ],
          "documentacion": "https://console.groq.com/docs/models",
          "notas": null,
          "licencia": "Apache 2.0",
          "parametros": "27B"
        },
        {
          "nombre": "whisper-large-v3",
          "nombre_display": "Whisper Large v3",
          "descripcion": "Transcripción de audio a texto de alta precisión en muchos idiomas.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": 2000,
          "limite_tokens_dia": null,
          "contexto_tokens": null,
          "modalidades": [
            "audio",
            "texto"
          ],
          "documentacion": "https://console.groq.com/docs/speech-to-text",
          "notas": null,
          "limite_extra": "7.200 segundos de audio/hora · 28.800 segundos de audio/día",
          "licencia": "MIT",
          "parametros": "1,55B"
        },
        {
          "nombre": "whisper-large-v3-turbo",
          "nombre_display": "Whisper Large v3 Turbo",
          "descripcion": "Variante rápida de Whisper para transcripción con menor latencia.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": 2000,
          "limite_tokens_dia": null,
          "contexto_tokens": null,
          "modalidades": [
            "audio",
            "texto"
          ],
          "documentacion": "https://console.groq.com/docs/speech-to-text",
          "notas": null,
          "limite_extra": "7.200 segundos de audio/hora · 28.800 segundos de audio/día",
          "licencia": "MIT",
          "parametros": "809M"
        },
        {
          "nombre": "canopylabs/orpheus-v1-english",
          "nombre_display": "Orpheus v1 English",
          "descripcion": "Síntesis de voz en inglés con entonación natural para narración y asistentes.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 10,
          "limite_tokens_minuto": 1200,
          "limite_peticiones_dia": 100,
          "limite_tokens_dia": 3600,
          "contexto_tokens": 4000,
          "modalidades": [
            "texto",
            "audio"
          ],
          "documentacion": "https://console.groq.com/docs/text-to-speech",
          "notas": null,
          "licencia": null,
          "parametros": null
        },
        {
          "nombre": "canopylabs/orpheus-arabic-saudi",
          "nombre_display": "Orpheus Arabic (Saudi)",
          "descripcion": "Síntesis de voz en árabe saudí para aplicaciones de audio y asistentes.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 10,
          "limite_tokens_minuto": 1200,
          "limite_peticiones_dia": 100,
          "limite_tokens_dia": 3600,
          "contexto_tokens": 4000,
          "modalidades": [
            "texto",
            "audio"
          ],
          "documentacion": "https://console.groq.com/docs/text-to-speech",
          "notas": null,
          "licencia": null,
          "parametros": null
        },
        {
          "nombre": "openai/gpt-oss-safeguard-20b",
          "nombre_display": "GPT-OSS Safeguard 20B",
          "descripcion": "Modelo de OpenAI para clasificación y moderación de contenido según políticas de seguridad.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 3,
          "limite_tokens_minuto": 2000,
          "limite_peticiones_dia": 1000,
          "limite_tokens_dia": 200000,
          "contexto_tokens": 131072,
          "modalidades": [
            "texto"
          ],
          "documentacion": "https://console.groq.com/docs/models",
          "notas": null,
          "licencia": "Apache 2.0",
          "parametros": "20B (3,6B activos)"
        },
        {
          "nombre": "meta-llama/llama-prompt-guard-2-86m",
          "nombre_display": "Llama Prompt Guard 2 86M",
          "descripcion": "Clasificador ligero para detectar inyecciones de prompt y contenido malicioso.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 30,
          "limite_tokens_minuto": 15000,
          "limite_peticiones_dia": 14400,
          "limite_tokens_dia": 500000,
          "contexto_tokens": 512,
          "modalidades": [
            "texto"
          ],
          "documentacion": "https://console.groq.com/docs/models",
          "notas": null,
          "licencia": null,
          "parametros": "86M"
        },
        {
          "nombre": "meta-llama/llama-prompt-guard-2-22m",
          "nombre_display": "Llama Prompt Guard 2 22M",
          "descripcion": "Versión ultra ligera de Prompt Guard para filtrado de prompts en tiempo real.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 30,
          "limite_tokens_minuto": 15000,
          "limite_peticiones_dia": 14400,
          "limite_tokens_dia": 500000,
          "contexto_tokens": 512,
          "modalidades": [
            "texto"
          ],
          "documentacion": "https://console.groq.com/docs/models",
          "notas": null,
          "licencia": null,
          "parametros": "22M"
        }
      ],
      "verificado": "2026-11-18",
      "actualizacion": "manual"
    },
    {
      "id": "mistral",
      "nombre": "Mistral AI",
      "sitio_web": "https://mistral.ai/",
      "documentacion": "https://docs.mistral.ai/models",
      "notas": "Mistral no publica los límites del plan gratuito de Studio y su API no tiene un nivel gratuito general. Solo el modelo de moderación es gratis vía API; el resto son pesos abiertos que puedes ejecutar por tu cuenta.",
      "modelos": [
        {
          "nombre": "mistral-moderation-2603",
          "nombre_display": "Mistral Moderation 2",
          "descripcion": "Modelo de moderación multimodal (texto e imagen) con detección de jailbreak y contexto de 128K tokens.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": null,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": null,
          "limite_tokens_dia": null,
          "contexto_tokens": 131072,
          "modalidades": [
            "texto",
            "imagen"
          ],
          "documentacion": "https://docs.mistral.ai/models/mistral-moderation-26-03",
          "notas": "Gratis vía API. Mistral no publica límites de peticiones para este modelo.",
          "licencia": "Propietaria",
          "parametros": null
        },
        {
          "nombre": "mistral-small-2603",
          "nombre_display": "Mistral Small 4",
          "descripcion": "Modelo híbrido de 119B parámetros (6,5B activos) que unifica instrucciones, razonamiento y código.",
          "tipo_acceso": "autoalojable",
          "limite_peticiones_minuto": null,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": null,
          "limite_tokens_dia": null,
          "contexto_tokens": 262144,
          "modalidades": [
            "texto",
            "imagen"
          ],
          "documentacion": "https://docs.mistral.ai/models/mistral-small-4-0-26-03",
          "notas": "La API cuesta $0,15/M tokens de entrada y $0,60/M de salida. Pesos Apache 2.0: puedes autoalojarlo gratis.",
          "licencia": "Apache 2.0",
          "parametros": "119B (6,5B activos)"
        },
        {
          "nombre": "ministral-8b-2512",
          "nombre_display": "Ministral 3 8B",
          "descripcion": "Modelo compacto con visión, pensado para despliegue en el borde y hardware modesto.",
          "tipo_acceso": "autoalojable",
          "limite_peticiones_minuto": null,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": null,
          "limite_tokens_dia": null,
          "contexto_tokens": 262144,
          "modalidades": [
            "texto",
            "imagen"
          ],
          "documentacion": "https://docs.mistral.ai/models/ministral-3-8b-25-12",
          "notas": "API de pago. Pesos Apache 2.0 para autoalojamiento gratuito.",
          "licencia": "Apache 2.0",
          "parametros": "8B"
        },
        {
          "nombre": "voxtral-small-2507",
          "nombre_display": "Voxtral Small",
          "descripcion": "Modelo con entrada de audio para transcripción, comprensión de voz y tareas multimodales.",
          "tipo_acceso": "autoalojable",
          "limite_peticiones_minuto": null,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": null,
          "limite_tokens_dia": null,
          "contexto_tokens": 32768,
          "modalidades": [
            "audio",
            "texto"
          ],
          "documentacion": "https://docs.mistral.ai/models/voxtral-small-25-07",
          "notas": "API de pago; pesos abiertos disponibles para ejecución local.",
          "licencia": "Apache 2.0",
          "parametros": "24B"
        },
        {
          "nombre": "shieldstral-1.0",
          "nombre_display": "Shieldstral 1.0",
          "descripcion": "Modelo de moderación de contenido de texto e imagen, con contexto de 32K tokens.",
          "tipo_acceso": "autoalojable",
          "limite_peticiones_minuto": null,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": null,
          "limite_tokens_dia": null,
          "contexto_tokens": 32768,
          "modalidades": [
            "texto",
            "imagen"
          ],
          "documentacion": "https://docs.mistral.ai/models/shieldstral-1-0",
          "notas": "Pesos abiertos para moderación autoalojada.",
          "licencia": "Pesos abiertos",
          "parametros": null
        }
      ],
      "verificado": "2026-11-18",
      "actualizacion": "manual"
    },
    {
      "id": "cerebras",
      "nombre": "Cerebras",
      "sitio_web": "https://cloud.cerebras.ai/",
      "documentacion": "https://inference-docs.cerebras.ai/",
      "notas": "Nivel Free Trial con límites por modelo. La inferencia compartida incluye dos modelos de pesos abiertos y se sirve a muy alta velocidad.",
      "verificado": "2026-11-18",
      "actualizacion": "manual",
      "modelos": [
        {
          "nombre": "gpt-oss-120b",
          "nombre_display": "GPT-OSS 120B",
          "descripcion": "Modelo abierto de OpenAI con razonamiento y uso de herramientas, servido por Cerebras a unos 3.000 tokens por segundo.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 5,
          "limite_tokens_minuto": 30000,
          "limite_peticiones_dia": null,
          "limite_tokens_dia": 1000000,
          "contexto_tokens": 65536,
          "modalidades": [
            "texto"
          ],
          "documentacion": "https://inference-docs.cerebras.ai/models/openai-oss",
          "notas": "Free Trial: 5 RPM, 30K tokens/min sin caché y 1M tokens/día. El contexto gratuito es de 65K.",
          "licencia": "Apache 2.0",
          "parametros": "120B (5,1B activos)"
        },
        {
          "nombre": "qwen-3.8-27b",
          "nombre_display": "Qwen 3.8 27B",
          "descripcion": "Modelo denso multimodal de Alibaba para agentes, código, investigación y flujos de trabajo de larga duración.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 300,
          "limite_tokens_minuto": 150000,
          "limite_peticiones_dia": null,
          "limite_tokens_dia": null,
          "contexto_tokens": 65536,
          "modalidades": [
            "texto",
            "imagen"
          ],
          "documentacion": "https://inference-docs.cerebras.ai/models/qwen-3.8-27b",
          "notas": "Free Trial: 300 RPM y 150K tokens/min sin caché. El contexto gratuito es de 64K.",
          "limite_extra": "750K tokens/min totales (incluyendo caché).",
          "licencia": "Apache 2.0",
          "parametros": "27B"
        }
      ]
    },
    {
      "id": "cloudflare",
      "nombre": "Cloudflare Workers AI",
      "sitio_web": "https://developers.cloudflare.com/workers-ai/",
      "documentacion": "https://developers.cloudflare.com/workers-ai/models/",
      "notas": "Incluido en el plan gratuito de Workers con 10.000 Neuronas al día. Los límites son por tipo de tarea y el consumo se descuenta del cupo diario.",
      "verificado": "2026-11-18",
      "actualizacion": "manual",
      "modelos": [
        {
          "nombre": "@cf/openai/gpt-oss-120b",
          "nombre_display": "GPT-OSS 120B",
          "descripcion": "Modelo abierto de OpenAI para razonamiento, agentes y cargas de propósito general, ejecutado en la red de Cloudflare.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 300,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": null,
          "limite_tokens_dia": null,
          "contexto_tokens": 128000,
          "modalidades": [
            "texto"
          ],
          "documentacion": "https://developers.cloudflare.com/workers-ai/models/gpt-oss-120b/",
          "notas": "Consume Neuronas del cupo gratuito de 10.000/día. Generación de texto: 300 peticiones/minuto.",
          "licencia": "Apache 2.0",
          "parametros": "120B (5,1B activos)"
        },
        {
          "nombre": "@cf/qwen/qwen3.8-27b",
          "nombre_display": "Qwen 3.8 27B",
          "descripcion": "Modelo multimodal de Qwen con visión, razonamiento y llamadas a funciones para agentes y código.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 300,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": null,
          "limite_tokens_dia": null,
          "contexto_tokens": 262144,
          "modalidades": [
            "texto",
            "imagen"
          ],
          "documentacion": "https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/",
          "notas": "Consume Neuronas del cupo gratuito de 10.000/día. Generación de texto: 300 peticiones/minuto.",
          "licencia": "Apache 2.0",
          "parametros": "27B"
        },
        {
          "nombre": "@cf/google/gemma-4-26b-a4b-it",
          "nombre_display": "Gemma 4 26B A4B",
          "descripcion": "Modelo abierto de Google con mezcla de expertos, visión y razonamiento, adecuado para agentes y análisis de imágenes.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 300,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": null,
          "limite_tokens_dia": null,
          "contexto_tokens": 256000,
          "modalidades": [
            "texto",
            "imagen"
          ],
          "documentacion": "https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/",
          "notas": "Consume Neuronas del cupo gratuito de 10.000/día. Generación de texto: 300 peticiones/minuto.",
          "licencia": "Gemma Terms",
          "parametros": "26B (4B activos)"
        }
      ]
    },
    {
      "id": "cohere",
      "nombre": "Cohere",
      "sitio_web": "https://dashboard.cohere.com/",
      "documentacion": "https://docs.cohere.com/docs/models",
      "notas": "Las claves de evaluación (trial) son gratuitas, pero están limitadas a 1.000 llamadas API al mes y 20 peticiones/minuto en los modelos Chat.",
      "verificado": "2026-11-18",
      "actualizacion": "manual",
      "modelos": [
        {
          "nombre": "command-a-plus-05-2026",
          "nombre_display": "Command A+",
          "descripcion": "Modelo insignia de Cohere con mezcla de expertos, visión, agentes, razonamiento y traducción en un solo conjunto de pesos.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": null,
          "limite_tokens_dia": null,
          "contexto_tokens": 128000,
          "modalidades": [
            "texto",
            "imagen"
          ],
          "documentacion": "https://docs.cohere.com/docs/command-a-plus",
          "notas": "Clave trial: 20 RPM y 1.000 llamadas API al mes.",
          "limite_extra": "1.000 llamadas API al mes por cuenta.",
          "licencia": "Propietaria",
          "parametros": null
        },
        {
          "nombre": "command-a-03-2025",
          "nombre_display": "Command A",
          "descripcion": "Modelo para agentes, RAG, uso de herramientas y cargas multilingües con contexto de 256K tokens.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": null,
          "limite_tokens_dia": null,
          "contexto_tokens": 256000,
          "modalidades": [
            "texto"
          ],
          "documentacion": "https://docs.cohere.com/docs/command-a",
          "notas": "Clave trial: 20 RPM y 1.000 llamadas API al mes.",
          "limite_extra": "1.000 llamadas API al mes por cuenta.",
          "licencia": "Propietaria",
          "parametros": null
        },
        {
          "nombre": "command-a-reasoning-08-2025",
          "nombre_display": "Command A Reasoning",
          "descripcion": "Modelo de razonamiento en 23 idiomas para problemas complejos, agentes y tareas de varios pasos.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": null,
          "limite_tokens_dia": null,
          "contexto_tokens": 256000,
          "modalidades": [
            "texto"
          ],
          "documentacion": "https://docs.cohere.com/docs/command-a-reasoning",
          "notas": "Clave trial: 20 RPM y 1.000 llamadas API al mes.",
          "limite_extra": "1.000 llamadas API al mes por cuenta.",
          "licencia": "Propietaria",
          "parametros": null
        },
        {
          "nombre": "command-a-vision-07-2025",
          "nombre_display": "Command A Vision",
          "descripcion": "Modelo multimodal para gráficos, tablas, OCR, preguntas sobre documentos y detección de objetos.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": null,
          "limite_tokens_dia": null,
          "contexto_tokens": 128000,
          "modalidades": [
            "texto",
            "imagen"
          ],
          "documentacion": "https://docs.cohere.com/docs/command-a-vision",
          "notas": "Clave trial: 20 RPM y 1.000 llamadas API al mes.",
          "limite_extra": "1.000 llamadas API al mes por cuenta.",
          "licencia": "Propietaria",
          "parametros": null
        },
        {
          "nombre": "north-mini-code-1.0",
          "nombre_display": "North Mini Code",
          "descripcion": "Modelo de mezcla de expertos de 30B totales y 3B activos, entrenado para programación agéntica y uso de herramientas.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": null,
          "limite_tokens_dia": null,
          "contexto_tokens": 256000,
          "modalidades": [
            "texto"
          ],
          "documentacion": "https://docs.cohere.com/docs/north-mini-code-1.0",
          "notas": "Clave trial: 20 RPM y 1.000 llamadas API al mes. También aparece como modelo :free en OpenRouter.",
          "limite_extra": "1.000 llamadas API al mes por cuenta.",
          "licencia": null,
          "parametros": "30B (3B activos)"
        },
        {
          "nombre": "tiny-aya-global",
          "nombre_display": "Tiny Aya Global",
          "descripcion": "Modelo multilingüe de 3,35B parámetros que cubre 70 idiomas, con un buen equilibrio entre idiomas y regiones.",
          "tipo_acceso": "gratis",
          "limite_peticiones_minuto": 20,
          "limite_tokens_minuto": null,
          "limite_peticiones_dia": null,
          "limite_tokens_dia": null,
          "contexto_tokens": 8000,
          "modalidades": [
            "texto"
          ],
          "documentacion": "https://docs.cohere.com/docs/aya",
          "notas": "Disponible con clave trial; sus pesos también pueden autoalojarse.",
          "limite_extra": "1.000 llamadas API al mes por cuenta.",
          "licencia": "Pesos abiertos",
          "parametros": "3,35B"
        }
      ]
    }
  ],
  "version": 2,
  "historial": [
    {
      "fecha": "2026-11-21T06:48:01Z",
      "estado": "parcial",
      "detalle": "OpenRouter: 12 modelos gratuitos verificados (0 añadidos, 1 retirados, 0 actualizados). Google: sin API key (GOOGLE_API_KEY); datos conservados."
    },
    {
      "fecha": "2026-11-20T06:50:49Z",
      "estado": "parcial",
      "detalle": "OpenRouter: 13 modelos gratuitos verificados (0 añadidos, 2 retirados, 0 actualizados). Google: sin API key (GOOGLE_API_KEY); datos conservados."
    },
    {
      "fecha": "2026-11-19T02:45:13Z",
      "estado": "parcial",
      "detalle": "OpenRouter: 15 modelos gratuitos verificados (0 añadidos, 0 retirados, 0 actualizados). Google: sin API key (GOOGLE_API_KEY); datos conservados."
    },
    {
      "fecha": "2026-11-19T02:22:57Z",
      "estado": "parcial",
      "detalle": "OpenRouter: 15 modelos gratuitos verificados (0 añadidos, 0 retirados, 2 actualizados). Google: sin API key (GOOGLE_API_KEY); datos conservados."
    }
  ]
};
