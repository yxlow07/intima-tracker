Add on a new page, on the route /schedule

Here is the **Product Requirements Document (PRD)** for the **Schedule Parser & Allocator**.

-----

# Product Requirements Document: Schedule Parser

## 1\. Executive Summary

**Product Name:** AutoScheduler (Internal Tool)
**Objective:** To automate the ingestion of member timetables and simplify the scheduling of duties/meetings during the "Golden Window" (Monday–Friday, 11:00 AM – 1:00 PM).
**Target Users:** Organization Admins / Team Leads.

## 2\. User Flow

1.  **Upload Phase:** Admin enters a member's Name and uploads an PDF of their timetable.
2.  **Processing Phase:** Gemini API processes the visual data and extracts "Busy" intervals into a structured JSON format.
3.  **Action Phase:** The Admin can choose the randomize the scheduling.
      * **Action A (Randomize):** Assign all slots with random personnel
      * **Action B (Query):** In the timetable, display the personnel available at the specific time.

## 3\. Functional Requirements

### A. Input Module

  * **Fields:**
      * `Name` (String, Required)
      * `Session` (String, Required, e.g. "Sem 1 2026")
      * `Timetable File` (File Input: PDF). 
  * **Validation:** Ensure file size is under 4MB (Gemini payload limits).

### B. The AI Parser (Gemini)

  * **Model:** `gemini-flash-lite-latest` (Recommended for speed and low cost)
  * **Task:** OCR the timetable, interpret grid lines/time blocks, and output a strict JSON of *busy* times.
  * **Constraint:** Must handle 12hr/24hr formats and varying table layouts.
  * The returned data is stored in the database

### C. The Logic Engine (The "Brain")

  * **Availability Filter:** The system must treat the 11:00 AM – 1:00 PM window as the "Target Zone."
  * **Randomizer Algorithm:**
    1.  Fetch `Busy Slots` for the user.
    2.  Generate all possible 1-hour slots in the Target Zone (e.g., Mon 11-12, Mon 12-1, Tue 11-12...).
    3.  Subtract `Busy Slots`.
    4.  Return `random.choice(Remaining_Slots)`.
  * A slot needs at least 2 personnel to be considered "available".  

### D. UI
 * Display a button to "randomize" the schedule.
 * Display a schedule view with a grid, for each slot show a dropdown of available personnel to add on

-----

## 4\. Technical Architecture & Schema

### Data Schema (JSON Output from Gemini)

We need a standardized output to store in the DB.

```json
{
  "name": "Member Name",
  "schedule": {
    "Monday": [
      {"start": "09:00", "end": "11:00"},
      {"start": "14:00", "end": "16:00"}
    ],
    "Tuesday": [], 
    "Wednesday": [
      {"start": "11:00", "end": "12:00"} 
    ]
    // ... Thu, Fri
  }
}
```

-----

## 5\. The System Prompt

This is the most critical part. It must force Gemini to ignore visual noise and return machine-readable data. Remember to trim ```json blocks from the final output if the model forgets and adds them.

**Prompt Configuration:**

  * **Temperature:** 0.1 (We want precision, not creativity).
  * **Output Token Limit:** 2000.
  * **Format:** JSON Mode.

**System Instruction:**

```text
You are a precise Data Extraction Agent for a university organization. Your job is to convert images of class timetables into structured JSON data representing "Busy Times".

## INPUT
You will receive an image of a weekly timetable (Monday to Friday).

## TASK
1. Identify the days of the week columns.
2. Identify the time slots (vertical axis).
3. Detect all "Occupied" or "Busy" blocks (classes, labs, tutorials).
4. Ignore empty white space (which represents "Free" time).
5. Convert all times to 24-hour format (HH:MM).

## CRITICAL RULES
- Output STRICT VALID JSON only. No markdown, no commentary.
- If a class runs from 10:00 AM to 12:00 PM, output {"start": "10:00", "end": "12:00"}.
- If there are no classes on a specific day, return an empty array [] for that day.
- Ensure you accurately detect the specific "11:00" to "13:00" window as this is high priority, but extract ALL busy times for the whole day.

## JSON SCHEMA
{
  "schedule": {
    "Monday": [{"start": "HH:MM", "end": "HH:MM"}, ...],
    "Tuesday": [{"start": "HH:MM", "end": "HH:MM"}, ...],
    "Wednesday": [{"start": "HH:MM", "end": "HH:MM"}, ...],
    "Thursday": [{"start": "HH:MM", "end": "HH:MM"}, ...],
    "Friday": [{"start": "HH:MM", "end": "HH:MM"}, ...]
  }
}
```

-----

## 6\. Logic Implementation Guide

Here is the pseudocode for how your application will handle the user's specific requests after the JSON is saved.

### Feature A: Randomize Slot (11am-1pm)

*User Request:* "Assign all slots with random personnel"
- fetch user's busy slots from DB.
- generate all possible 1-hour slots between 11:00 and 13:00.
- subtract busy slots from possible slots.
- randomly select one from remaining slots.

### Feature B: Select from Available Personnel

*User Request:* "Who is free on [Day] at [Time]?"
- dropdown to select user that is free on that day/time.

-----