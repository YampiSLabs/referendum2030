---
title: "Arquitectura de Seguridad"
description: "Protección de los activos digitales y anonimato basado en hash sin firmas identificadoras."
order: 2
---
La ingeniería detrás de la seguridad de la plataforma utiliza:

- **Tokens Hash-Locked:** Los tokens electorales no contienen ninguna información personal. Son cadenas aleatorias generadas de forma única que se registran en formato SHA-256 irreversible cuando se utilizan.
- **Canal Cifrado HTTPS:** Todas las peticiones entre el frontend Astro y el backend Django en PythonAnywhere están forzadas bajo cifrado TLS 1.3 para evitar cualquier intercepción.
- **Resiliencia contra ataques DDoS:** La API cuenta con políticas de limitación de ratio (Rate Limiting) para evitar el agotamiento de recursos e inyecciones masivas de votos fraudulentos.
