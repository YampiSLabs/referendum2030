---
title: "Arquitectura de Seguretat"
description: "Protecció dels actius digitals i anonimat basat en hash sense signatures identificadores."
order: 2
---
L'enginyeria darrera la seguretat de la plataforma utilitza:

- **Tokens Hash-Locked:** Els tokens electorals no contenen cap informació personal. Són cadenes aleatòries generades de forma única que es registren en format SHA-256 irreversibles quan s'utilitzen.
- **Canal Xifrat HTTPS:** Totes les peticions entre l'Astro frontend i el backend Django a PythonAnywhere estan forçades sota xifrat TLS 1.3 per evitar qualsevol intercepció.
- **Resiliència contra atacs DDoS:** L'API compta amb polítiques de limitació de ràtio (Rate Limiting) per evitar esgotament de recursos i injeccions massives de vots fraudulents.
