import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createMemberSchedule, getMemberScheduleByName, updateMemberSchedule, type WeeklySchedule } from "@/lib/schedule";

const SYSTEM_PROMPT = `You are a precise Data Extraction Agent for a university organization. Your job is to convert images of class timetables into structured JSON data representing "Busy Times".

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
}`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const session = formData.get("session") as string;
    const file = formData.get("file") as File;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!session || !session.trim()) {
      return NextResponse.json(
        { error: "Session is required" },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "Timetable file is required" },
        { status: 400 }
      );
    }

    // Check file size (4MB limit)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 4MB" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");

    // Determine MIME type
    const mimeType = file.type || "application/pdf";

    // Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenAI({ apiKey });

    // Call Gemini API
    const response = await genAI.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: "Extract the busy times from this timetable image following the JSON schema provided.",
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.1,
        maxOutputTokens: 2000,
      },
    });

    // Extract response text
    let responseText = response.text || "";
    
    // Clean up markdown code blocks if present
    responseText = responseText.trim();
    if (responseText.startsWith("```json")) {
      responseText = responseText.slice(7);
    } else if (responseText.startsWith("```")) {
      responseText = responseText.slice(3);
    }
    if (responseText.endsWith("```")) {
      responseText = responseText.slice(0, -3);
    }
    responseText = responseText.trim();

    // Parse the JSON response
    let parsedSchedule: { schedule: WeeklySchedule };
    try {
      parsedSchedule = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse Gemini response:", responseText);
      return NextResponse.json(
        { error: "Failed to parse timetable. Please try a clearer image." },
        { status: 422 }
      );
    }

    // Validate the schedule structure
    const schedule = parsedSchedule.schedule;
    if (!schedule) {
      return NextResponse.json(
        { error: "Invalid schedule format returned from AI" },
        { status: 422 }
      );
    }

    // Ensure all days exist
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
    for (const day of days) {
      if (!schedule[day]) {
        schedule[day] = [];
      }
    }

    // Check if member already exists for this session
    const existingMember = await getMemberScheduleByName(name.trim(), session.trim());
    
    let memberSchedule;
    if (existingMember) {
      // Update existing member
      memberSchedule = await updateMemberSchedule(existingMember.id, { schedule });
    } else {
      // Create new member
      memberSchedule = await createMemberSchedule({
        name: name.trim(),
        session: session.trim(),
        schedule,
      });
    }

    return NextResponse.json({
      success: true,
      memberSchedule,
      parsedSchedule: schedule,
    });

  } catch (error) {
    console.error("Error parsing timetable:", error);
    return NextResponse.json(
      { error: "Failed to parse timetable" },
      { status: 500 }
    );
  }
}
