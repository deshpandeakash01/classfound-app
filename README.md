BMSCE Room Booking & Schedule Management System (MVP)

## Project Overview

This application is a specialized mobile solution designed for B.M.S. College of Engineering (BMSCE) to solve the "empty classroom discovery" and "adhoc booking" problem. It serves as a bridge between fixed college timetables and dynamic room availability.

## Technical Architecture

- **Frontend:** React Native (Expo)
- **Backend/Database:** Supabase (PostgreSQL)
- **Data Engineering:** Automated PDF extraction via NotebookLM for high-fidelity schedule ingestion.
- **Authentication:** Supabase Auth with Role-Based Access Control (RBAC).

## Database Schema (PostgreSQL)

The system operates on four primary entities:

### 1. `profiles`

Manages user identity and permissions.

- `id`: UUID (Primary Key, links to Supabase Auth)
- `role`: Enum ('student', 'faculty', 'cr', 'admin') - Governs booking privileges.
- `email`: User's college/personal email.

### 2. `rooms`

Physical infrastructure registry.

- `room_name`: e.g., 'APS-104', 'Physics Lab'.
- `block_name`: e.g., 'APS Block', 'Science Block'.
- `room_type`: 'classroom' or 'lab'.

### 3. `schedules`

The static truth (College Timetable).

- `day_of_week`: 1-6 (Monday-Saturday).
- `start_time` / `end_time`: 24h format.
- `section_name`: 46 unique sections across Physics (PA-PX) and Chemistry (CA-CX) cycles.
- `subject_name`: Linked subject/lab.

### 4. `bookings`

The dynamic layer (User Reservations).

- Stores adhoc bookings made by Faculty or CRs that override or supplement the static schedule.

## Key Features

### 1. Real-Time Availability Engine

- **Logic:** The app queries `schedules` for the current `day_of_week` and `current_time`. It cross-references this with `bookings`.
- **Output:** A real-time list of "Free Rooms" currently available in the APS, Science, or Mechanical blocks.

### 2. Multi-Branch Schedule Support

The database contains 100% of the first-year engineering batch data, including specialized branches:

- **Computer Science & AI:** CSE, AIML, CS-IOT, CS-ADS, CSDS, CSBS.
- **Core Branches:** ECE, EEE, ME, CHE, IEM, CV, BT.

### 3. Smart Lab Mapping

- Automated SQL triggers reassign classes to physical lab buildings based on `subject_name` (e.g., 'PHY (LAB)' automatically maps to 'Physics Lab' room ID regardless of the classroom listed in the raw PDF).

### 4. Role-Based Access (RBAC)

- **Students:** Can view free rooms and their own section's schedule.
- **CRs (Class Representatives):** Can request bookings for extra classes.
- **Faculty:** Can override room status for meetings or lab sessions.

## Data Integration Workflow

1. **Extraction:** Raw PDFs processed via LLM into structured SQL values.
2. **Standardization:** All room names mapped to a physical coordinate system (Floor 0-5, Rooms 01-07).
3. **Cleanup:** Automated removal of `*R` (Free/Reserved) tags to ensure Saturdays and gap hours are accurately represented as available.

## Deployment Status

- **Backend:** Fully configured on Supabase with master schemas and complete timetable data for 46 sections.
- **Frontend:** React Native integration using `@supabase/supabase-js` and `expo-secure-store`.
