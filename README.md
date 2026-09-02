# Oil India Safety Intelligence Framework (SIF)
### SIF Precursor Intelligence Platform

An AI-assisted safety intelligence platform designed to identify, analyze, rank, and manage safety precursors before they escalate into serious incidents.

Built for **Smart India Hackathon (SIH) – Problem Statement 26165**.

---

## Overview

The Safety Intelligence Framework (SIF) platform converts safety observations, near misses, and incident reports into actionable intelligence.

The system combines:

- Structured safety reporting
- AI/ML-based precursor analysis
- Safety Intelligence Framework (SIF) scoring
- Distress/case ranking
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

Reports can include:

- Site
- Location
- Activity
- Equipment
- Hazard
- Energy source
- Exposure
- Unsafe act/condition
- Barrier/control
- Barrier failure mode
- Barrier function
- Potential consequence
- Actual outcome
- Immediate action
- Supporting attachments

Each report receives a unique report ID such as:

`RPT-8F3A91C2`

---

### 2. AI-Assisted Safety Intelligence

The platform is designed to analyze reported safety precursors and identify high-risk patterns.

The intelligence layer can evaluate:

- Hazard characteristics
- Energy sources
- Exposure
- Barrier failures
- Potential consequences
- Safety rule violations
- SIF potential
- Evidence phrases
- Scenario families

The resulting intelligence can be used to prioritize cases requiring intervention.

---

### 3. Distress Ranking

The dashboard provides a ranked view of safety cases based on their relative distress/risk.

Cases can be categorized as:

- **Active** – unresolved and not assigned
- **Assigned** – unresolved and assigned to a team
- **Resolved** – successfully closed

The ranking helps safety teams focus their attention on the cases requiring the greatest intervention.

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
       ┌─────────────────────┐
       │ Python / FastAPI ML │
       │       Service       │
       │                     │
       │ • Intelligence      │
       │ • Scoring           │
       │ • Classification    │
       │ • Pattern Analysis  │
       └─────────────────────┘
