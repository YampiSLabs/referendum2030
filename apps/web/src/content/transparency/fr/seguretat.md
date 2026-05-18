---
title: "Architecture de Sécurité"
description: "Protection des actifs numériques et anonymat basé sur le hachage sans signature d'identification."
order: 2
---
L'ingénierie derrière la sécurité de la plateforme utilise :

- **Jetons Hash-Locked :** Les jetons électoraux ne contiennent aucune information personnelle. Ce sont des chaînes aléatoires générées de manière unique qui sont enregistrées au format SHA-256 irréversible lors de leur utilisation.
- **Canal Chiffré HTTPS :** Toutes les requêtes entre le frontend Astro et le backend Django sur PythonAnywhere sont obligatoirement chiffrées en TLS 1.3 pour éviter toute interception.
- **Résilience contre les attaques DDoS :** L'API dispose de politiques de limitation de débit (Rate Limiting) pour éviter l'épuisement des ressources et les injections massives de votes frauduleux.
