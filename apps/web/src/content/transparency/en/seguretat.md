---
title: "Security Architecture"
description: "Protection of digital assets and anonymity based on hash without identifying signatures."
order: 2
---
The engineering behind the platform's security utilizes:

- **Hash-Locked Tokens:** Electoral tokens do not contain any personal information. They are uniquely generated random strings that are registered in irreversible SHA-256 format when used.
- **HTTPS Encrypted Channel:** All requests between the Astro frontend and the Django backend on PythonAnywhere are forced under TLS 1.3 encryption to prevent any interception.
- **Resilience against DDoS attacks:** The API features Rate Limiting policies to prevent resource exhaustion and massive injections of fraudulent votes.
