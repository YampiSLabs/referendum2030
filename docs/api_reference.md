# API Reference Guide

The backend for **Referendum 2030** is a Django REST Framework API. This document details the endpoints, expected parameters, payload formats, and sample responses.

- **Base URL**: `http://localhost:8000/api/v1` (Local Docker)
- **Interactive Swagger Documentation**: Accessible at `http://localhost:8000/api/v1/docs/` when running in development mode.

---

## 🚦 Endpoints Quick Reference

| Method | Endpoint | Description | Authentication |
| :--- | :--- | :--- | :--- |
| **GET** | `/healthz/` | Health check endpoint | None |
| **GET** | `/referendums/` | List all referendums | None |
| **GET** | `/referendums/current/` | Retrieve active referendum | None |
| **GET** | `/referendums/{slug}/` | Retrieve specific referendum | None |
| **POST** | `/referendums/{slug}/tokens/` | Issue a new voting token | IP Throttle |
| **POST** | `/referendums/{slug}/votes/` | Cast an anonymous ballot | Token Validation |
| **GET** | `/referendums/{slug}/results/`| Fetch current aggregated results | None |
| **GET** | `/referendums/{slug}/logs/` | Retrieve the public audit trail | None |

---

## 🛠️ Detailed Endpoint Documentation

### 1. Health Check
Checks if the database and API are healthy.

* **Endpoint**: `/healthz/`
* **Method**: `GET`
* **Response (200 OK)**:
  ```json
  {
    "status": "ok"
  }
  ```
* **cURL Command**:
  ```bash
  curl http://localhost:8000/api/v1/healthz/
  ```

---

### 2. Get Current Referendum
Returns information about the active referendum, including the question and available options.

* **Endpoint**: `/referendums/current/`
* **Method**: `GET`
* **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "title": "Referèndum d'Autodeterminació de Catalunya 2030",
    "slug": "referendum-2030",
    "description": "Simulació de consulta cívica digital no oficial i sense vinculació legal.",
    "is_current": true,
    "starts_at": "2030-10-01T09:00:00Z",
    "ends_at": "2030-10-01T20:00:00Z",
    "questions": [
      {
        "id": 1,
        "text": "Voleu que Catalunya sigui un Estat independent en forma de República?",
        "options": [
          { "id": 1, "label": "Sí" },
          { "id": 2, "label": "No" },
          { "id": 3, "label": "Vot en Blanc" }
        ]
      }
    ]
  }
  ```
* **cURL Command**:
  ```bash
  curl http://localhost:8000/api/v1/referendums/current/
  ```

---

### 3. Generate Voter Token
Requests a new, unused token for voting. This is strictly rate-limited to avoid automation.

* **Endpoint**: `/referendums/{slug}/tokens/`
* **Method**: `POST`
* **Response (201 Created)**:
  ```json
  {
    "token": "REF30-GH2K-P9XQ",
    "created_at": "2026-05-18T09:14:00.123456Z"
  }
  ```
* **cURL Command**:
  ```bash
  curl -X POST http://localhost:8000/api/v1/referendums/referendum-2030/tokens/
  ```

---

### 4. Cast Anonymized Vote
Submits a vote for a given option using a plain-text token.

* **Endpoint**: `/referendums/{slug}/votes/`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "token": "REF30-GH2K-P9XQ",
    "option_id": 1
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "receipt_code": "RCP-8X2F-3J9K",
    "created_at": "2026-05-18T09:15:32.987654Z"
  }
  ```
* **Error Responses**:
  * **400 Bad Request** (Invalid parameters or missing fields).
  * **403 Forbidden** (Token already used, invalid, or referendum closed).
* **cURL Command**:
  ```bash
  curl -X POST http://localhost:8000/api/v1/referendums/referendum-2030/votes/ \
       -H "Content-Type: application/json" \
       -d '{"token": "REF30-GH2K-P9XQ", "option_id": 1}'
  ```

---

### 5. Fetch Aggregated Results
Provides aggregate voting tallies. Only accessible if `PUBLIC_RESULTS_ENABLED` is turned on in the administrative dashboard (Constance settings).

* **Endpoint**: `/referendums/{slug}/results/`
* **Method**: `GET`
* **Response (200 OK)**:
  ```json
  {
    "referendum": "referendum-2030",
    "total_votes": 12840,
    "participation_rate": 68.42,
    "questions": [
      {
        "id": 1,
        "text": "Voleu que Catalunya sigui un Estat independent en forma de República?",
        "results": [
          { "option_id": 1, "label": "Sí", "votes": 8210, "percentage": 63.94 },
          { "option_id": 2, "label": "No", "votes": 3940, "percentage": 30.69 },
          { "option_id": 3, "label": "Vot en Blanc", "votes": 690, "percentage": 5.37 }
        ]
      }
    ]
  }
  ```
* **cURL Command**:
  ```bash
  curl http://localhost:8000/api/v1/referendums/referendum-2030/results/
  ```

---

### 6. Public Audit Logs
Returns the complete list of cryptographic receipt codes and all published system events. This constitutes the public ledger.

* **Endpoint**: `/referendums/{slug}/logs/`
* **Method**: `GET`
* **Response (200 OK)**:
  ```json
  [
    {
      "id": 432,
      "event_type": "vote_cast",
      "public_message": "S'ha registrat un vot amb codi de rebut RCP-8X2F-3J9K.",
      "metadata": {
        "receipt_code": "RCP-8X2F-3J9K",
        "option_id": 1
      },
      "created_at": "2026-05-18T09:15:32.987654Z"
    },
    {
      "id": 431,
      "event_type": "token_issued",
      "public_message": "S'ha emès una credencial de votació anonimitzada.",
      "metadata": {},
      "created_at": "2026-05-18T09:14:00.123456Z"
    }
  ]
  ```
* **cURL Command**:
  ```bash
  curl http://localhost:8000/api/v1/referendums/referendum-2030/logs/
  ```
