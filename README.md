# Drishti IAP
### Intelligent Safety & Accident Prevention Platform (IAP)

Drishti IAP is an AI-assisted safety intelligence platform designed to identify, analyze, rank, and manage safety precursors before they escalate into serious incidents.

Built for **Smart India Hackathon (SIH) – Problem Statement 26165**.

> **Drishti AI** is the ML intelligence engine within the broader **Drishti IAP** platform. The platform is designed to detect and analyze **Serious Injury or Fatality (SIF)** potential and recurring safety precursors.

---

## Overview

**Drishti IAP** converts safety observations, near misses, and incident reports into actionable intelligence focused on **Serious Injury or Fatality (SIF)** potential.

The system combines:

- Structured safety reporting
- AI/ML-based precursor analysis
- SIF potential assessment and SBRI priority scoring
- Safety risk and priority ranking
- Operational analytics
- Team-based intervention proposals
- Admin review and case assignment
- Evidence and attachment management
- Audit logging
- Case resolution tracking

The goal is to move safety management from a **reactive incident-response model** toward a **proactive precursor-intelligence model**.

---

## Key Features

### 1. Public Safety Reporting

Users can submit safety observations and reports without requiring an account.

Supported report types:

- Unsafe Act / Unsafe Condition (UA/UC)
- Near Miss
- Incident

Reports can provide contextual safety information such as:

- Site
- Location
- Activity
- Equipment
- Hazard
- Energy source
- Exposure
- Unsafe act/condition
- Barrier/control
- Actual outcome
- Immediate action
- Supporting attachments

Additional safety intelligence is derived by Drishti AI rather than being required from the public reporter, including SIF potential, LSR classification, Barrier Failure, and Barrier Function.

Each report receives a unique report ID such as:

`RPT-8F3A91C2`

---

### 2. Drishti AI — Safety Intelligence Engine

Drishti AI provides the ML and inference layer used to analyze submitted safety reports and generate evidence-grounded precursor intelligence.

The intelligence layer evaluates:

- Hazard characteristics
- Energy sources
- Exposure
- Barrier failures
- Potential consequences
- Safety rule violations
- SIF potential
- Evidence phrases

The resulting intelligence can be used to prioritize cases requiring intervention.

---

### 3. Safety Risk & Priority Ranking

The dashboard provides a ranked view of safety cases based on their relative safety risk and priority.

Cases can be categorized as:

- **Active** – unresolved and not assigned
- **Assigned** – unresolved and assigned to a team
- **Resolved** – successfully closed

The ranking helps safety teams focus their attention on cases requiring intervention.

---

### 4. Operational Analytics

The dashboard provides a high-level view of emerging operational patterns.

Current analytics include:

- Most common problems
- Most active sites
- Active cases
- Assigned cases
- Resolved cases

This provides a quick overview of where safety issues are concentrating.

---

### 5. Team Proposal Workflow

Teams can propose solutions for active safety cases.

A proposal can contain:

- Team information
- Solution proposal
- Supporting attachments

Only eligible cases can receive proposals.

A case must be:

- Active
- Unassigned

for a new proposal to be submitted.

---

### 6. Admin Review

Administrators can review submitted team proposals and:

- Accept proposals
- Reject proposals
- Add admin notes
- Assign accepted cases to teams

When a proposal is accepted:

1. The proposal is marked as accepted.
2. The case becomes `assigned`.
3. The selected team is associated with the case.
4. Other pending proposals for the same case are rejected.
5. An audit entry is created.
6. If the proposal came from an unregistered team, a team invitation can be generated.

---

### 7. Team Invitations

For accepted proposals from teams that are not yet registered, the platform can generate a secure invitation.

The invitation:

- Uses a secure token
- Has an expiry period
- Provides a signup URL
- Allows the invited team to complete registration

---

### 8. Authentication & Role-Based Access

The platform supports authenticated users and role-based access.

Current roles include:

- Admin
- Team

Public users can submit reports and access the public dashboard without authentication.

Authenticated users receive access to their respective areas.

---

### 9. Evidence & Attachments

Safety reports and team proposals support attachments.

Supported file types include:

- PDF
- JPEG
- PNG
- WebP

Upload limits:

- Maximum 5 files
- Maximum 10 MB per file

Files are stored using **Supabase Storage**, while their accessible URLs are stored with the relevant records.

---

### 10. Audit Logging

Important administrative actions are recorded through audit logs.

This provides traceability for actions such as:

- Proposal acceptance
- Proposal rejection
- Case assignment
- Case status changes

---

## Drishti AI — ML Intelligence Engine

Drishti AI is the Python/FastAPI ML service used by the application to run the trained safety-intelligence pipeline for **Serious Injury or Fatality (SIF)** precursor analysis.

### Model & Inference Stack

- **Encoder:** `google/muril-base-cased`
- **Representation:** 768-dimensional MuRIL embedding
- **Trained safety heads:**
  - SIF
  - LSR
  - Barrier Failure
  - Barrier Function
- Evidence-grounding and consistency checks
- Canonical precursor normalization
- SBRI-based risk/priority scoring
- Reusable end-to-end inference pipeline

The encoder is used in frozen form during inference, while the trained safety heads provide the downstream task predictions.

### AI-generated Safety Intelligence

Drishti AI derives:

- Serious Injury or Fatality (SIF) potential
- Life-Saving Rule (LSR) classification
- Barrier Failure
- Barrier Function
- Evidence-grounded findings
- Canonical precursor(s)
- SBRI / priority outputs

`scenario_family` is retained for dataset/provenance and validation bookkeeping and is not treated as a public reporter field or a production inference output.

### Inference Flow

```text
Safety Report
     │
     ▼
Frozen MuRIL Encoder
     │
     ▼
768-D Representation
     │
 ┌───┼───────────────┬─────────────────┐
 ▼   ▼               ▼                 ▼
SIF  LSR      Barrier Failure   Barrier Function
 │    │               │                 │
 └────┴───────────────┴─────────────────┘
                    │
                    ▼
           Evidence Grounding
                    │
                    ▼
          Consistency / Validation
                    │
                    ▼
         Canonical Precursor Layer
                    │
                    ▼
                 SBRI
                    │
                    ▼
             Risk / Priority
```

### Production Inference Service

The runtime service loads the final trained checkpoint and supporting inference artifacts from:

```text
ml-service/model/
```

Reusable inference code lives in:

```text
ml-service/inference/
```

---

## Structured Report Schema

The platform maintains two complementary groups of structured fields. The first group is aligned to the OISD-form-grounded incident-reporting fields used in the development dataset; the second contains product-specific analytical fields used for precursor and barrier intelligence.

### OISD-form-aligned fields

- `major_minor_nearmiss`
- `incident_type_category`
- `facility_status`
- `location`
- `location_detail`
- `sector`
- `organisation`
- `time_of_incident`
- `cause_of_incident_category`
- `avoidable`
- `prevention_category`
- `similar_incident_occurred_before`
- `report_date`

### Product analytical fields

- `activity`
- `equipment`
- `hazard`
- `energy_source`
- `exposure`
- `unsafe_act_condition`
- `barrier_or_control`
- `potential_consequence`

These fields are part of the structured report/inference representation even when the public UI presents a simplified intake experience. Model-derived fields such as Barrier Failure and Barrier Function are generated by the ML layer rather than required from the public reporter. Missing values are represented explicitly in the ML normalization layer rather than being silently inferred.

## ML Service API

The ML service is exposed through FastAPI.

### Health Check

```http
GET /health
```

Example response:

```json
{
  "status": "ok",
  "model": "FINAL_41_5Y_B",
  "encoder": "google/muril-base-cased"
}
```

### Analyze Safety Report

```http
POST /analyze-report
Content-Type: application/json
```

Request:

```json
{
  "report_text": "Safety report text here"
}
```

The response contains the structured ML/inference result, including the available SIF, LSR, barrier, evidence, precursor, consistency, and SBRI outputs.

---

## System Architecture

```text
                    ┌──────────────────────┐
                    │      Public User     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React / Vite UI    │
                    │                      │
                    │ • Dashboard          │
                    │ • Report Submission  │
                    │ • Team Proposal      │
                    │ • Admin Center       │
                    │ • Team Dashboard     │
                    └──────────┬───────────┘
                               │
                         REST API / JWT
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Node.js / Express    │
                    │      Backend         │
                    │                      │
                    │ • Authentication     │
                    │ • Reports            │
                    │ • Proposals          │
                    │ • Teams              │
                    │ • Cases              │
                    │ • Audit Logs         │
                    └───────┬───────┬──────┘
                            │       │
                ┌───────────┘       └────────────┐
                ▼                                ▼
       ┌─────────────────┐              ┌─────────────────┐
       │ MongoDB Atlas   │              │ Supabase        │
       │                 │              │ Storage         │
       │ • Reports       │              │                 │
       │ • Teams         │              │ • Evidence      │
       │ • Proposals     │              │ • Attachments   │
       │ • Users         │              └─────────────────┘
       │ • Audit Logs    │
       └─────────────────┘
                │
                │
                ▼
       ┌────────────────────────────┐
       │       Drishti AI           │
       │     Python / FastAPI       │
       │        ML Service          │
       │                            │
       │ • MuRIL Inference          │
       │ • SIF Classification       │
       │ • LSR Classification       │
       │ • Barrier Analysis         │
       │ • Evidence Grounding       │
       │ • Precursor Intelligence   │
       │ • SBRI Scoring             │
       └────────────────────────────┘
```

---

## Repository Structure

```text
SIH-26165/
│
├── frontend/
│   └── React / Vite application
│
├── backend/
│   └── Node.js / Express application
│
├── ml-service/
│   ├── inference/
│   │   ├── __init__.py
│   │   ├── drishti_startup.py
│   │   └── inference_pipeline.py
│   │
│   ├── model/
│   │   ├── FINAL_PROJECT_CHECKPOINT.pt
│   │   ├── sif_head.pt
│   │   ├── lsr_head.pt
│   │   ├── barrier_failure_head.pt
│   │   ├── barrier_function_mlp.pt
│   │   └── supporting inference artifacts
│   │
│   ├── app.py
│   ├── requirements.txt
│   └── README
│
├── Codebase.ipynb
└── README.md
```

---

## Local Setup

### 1. Frontend

```bash
cd frontend
```

Install dependencies and run the frontend using the package scripts defined in the frontend project.

### 2. Backend

```bash
cd backend
```

Install dependencies and run the backend using the package scripts defined in the backend project.

### 3. Drishti AI ML Service

```bash
cd ml-service
pip install -r requirements.txt
python -m uvicorn app:app --host 127.0.0.1 --port 8001
```

The ML service will be available at:

```text
http://127.0.0.1:8001
```

Health endpoint:

```text
http://127.0.0.1:8001/health
```

API endpoint:

```text
http://127.0.0.1:8001/analyze-report
```

---

## ML Development Notebook

The model development, experimentation, training, validation, and demonstration workflow is retained in:

```text
Codebase.ipynb
```

The notebook documents the ML pipeline and provides a reproducible development/demo reference, while the `ml-service/` directory contains the runtime inference implementation used by the application.

---

## Technology Stack

### Frontend

- React
- Vite

### Backend

- Node.js
- Express
- JWT-based authentication

### ML / AI

- Python
- FastAPI
- PyTorch
- Hugging Face Transformers
- MuRIL
- NumPy
- Pandas
- scikit-learn

### Data & Storage

- MongoDB Atlas
- Supabase Storage

---

## End-to-End Application Flow

```text
User submits safety report
            │
            ▼
       React / Vite
            │
            ▼
      Node / Express
            │
            ▼
    Drishti AI ML Service
            │
            ▼
      MuRIL + Safety Heads
            │
            ▼
 Evidence + Precursor Intelligence
            │
            ▼
       SBRI / Priority
            │
            ▼
      Backend / Database
            │
            ▼
        Dashboard
```

---

## Demo

The repository includes a live end-to-end ML demonstration in `Codebase.ipynb`.

The demo passes a safety report through the complete inference pipeline and displays the resulting:

- SIF prediction
- LSR predictions
- Barrier Failure result
- Barrier Function result
- Evidence
- Canonical precursor information
- Consistency gate result
- SBRI
- Final risk band

---

## Drishti IAP — Project Objective

The platform is designed to provide traceable, evidence-grounded precursor intelligence so safety teams can move from reviewing isolated reports toward identifying recurring patterns, understanding barrier failures, and prioritizing intervention.

The core design emphasizes:

**report → evidence → precursor → risk/priority → intervention**

---

## License

This project was developed as a prototype for **Smart India Hackathon – Problem Statement 26165**.
