import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Valid activity types that match the form options
const VALID_ACTIVITY_TYPES = ["Sports", "Charitable", "Non-Charitable"];

// Normalize activity type using simple string matching
function normalizeActivityType(activityType: string | null): string | null {
  if (!activityType) return null;

  const normalized = activityType.toLowerCase().trim();

  // Direct matches
  for (const validType of VALID_ACTIVITY_TYPES) {
    if (normalized === validType.toLowerCase()) {
      return validType;
    }
  }

  // Partial matches / common variations
  if (normalized.includes("sport")) return "Sports";
  if (normalized.includes("charit")) {
    // Check if it's "non-charitable" first
    if (normalized.includes("non")) return "Non-Charitable";
    return "Charitable";
  }
  if (normalized.includes("non-charit") || normalized.includes("noncharit")) {
    return "Non-Charitable";
  }

  // If no match found, return closest match based on similarity
  // Simple approach: find which valid type shares the most characters
  let bestMatch = VALID_ACTIVITY_TYPES[0];
  let bestScore = 0;

  for (const validType of VALID_ACTIVITY_TYPES) {
    const score = calculateSimilarity(normalized, validType.toLowerCase());
    if (score > bestScore) {
      bestScore = score;
      bestMatch = validType;
    }
  }

  // Only return match if similarity is reasonable (> 0.3)
  return bestScore > 0.3 ? bestMatch : null;
}

// Simple Jaccard similarity based on character bigrams
function calculateSimilarity(str1: string, str2: string): number {
  const getBigrams = (str: string): Set<string> => {
    const bigrams = new Set<string>();
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.substring(i, i + 2));
    }
    return bigrams;
  };

  const bigrams1 = getBigrams(str1);
  const bigrams2 = getBigrams(str2);

  let intersection = 0;
  bigrams1.forEach((bigram) => {
    if (bigrams2.has(bigram)) intersection++;
  });

  const union = bigrams1.size + bigrams2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// Strip markdown code fences from response
function stripMarkdownCodeFences(text: string): string {
  let result = text.trim();

  // Remove ```json at the start
  if (result.startsWith("```json")) {
    result = result.slice(7);
  } else if (result.startsWith("```")) {
    result = result.slice(3);
  }

  // Remove ``` at the end
  if (result.endsWith("```")) {
    result = result.slice(0, -3);
  }

  return result.trim();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF files are allowed." },
        { status: 400 }
      );
    }

    // Check file size (15MB limit)
    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 15MB." },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      return NextResponse.json(
        { error: "Server configuration error: API key not set" },
        { status: 500 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString("base64");

    // Initialize Gemini AI
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const config = {
      thinkingConfig: {
        thinkingBudget: 0,
      },
      systemInstruction: [
        {
          text: `**Role:**
You are a Data Extraction Specialist for a university Student Affairs Office. Your goal is to accurately parse "Student Activity Proposal" (SAP) PDF forms into a strict JSON format.

**Input:**
A multi-page PDF document containing a Student Activity Proposal.

**Output:**
Return ONLY a raw JSON object. Do not include markdown formatting (like \`\`\`json), explanations, or preamble.

**Extraction Rules:**
1. **Activity Name:** Extract from "OFFICIAL ACTIVITY NAME".
2. **Description:** Combine the text from "OBJECTIVE(S)" and "Methodology of Activity" (found on page 4) into a single summary string.
3. **Activity Date:** Extract "DATE OF ACTIVITY". Convert to format YYYY-MM-DD if possible. If a range is given, use the start date.
4. **Activity Time:** Extract the starting time of the activity. Return in format like "9:00 AM" or "14:30".
5. **Activity Type:** Check the "Nature of Activity" table (Page 2). You MUST return one of these EXACT values only: "Sports", "Charitable", or "Non-Charitable". Map the activity type as follows:
   - Sports activities, tournaments, matches → "Sports"
   - Charity events, donations, volunteer work, community service → "Charitable"  
   - Workshops, talks, seminars, competitions, exhibitions, cultural events, and all other activities → "Non-Charitable"
6. **Affiliate:** Extract from "AFFILIATE NAME" (Page 1).
7. **Venue:** Extract from "VENUE" (Page 1).
8. **Budget:** Extract the "GRAND TOTAL" from the Budgeting section. Return as a number/float.
9. **INTIMA Subsidy: ** Extract the "INTIMA SUBSIDY REQUIRED" from the Budgeting section. Return as a number/float.

**JSON Structure to use:**
{
  "activityName": "String",
  "description": "String",
  "activityDate": "YYYY-MM-DD",
  "activityTime": "String",
  "activityType": "Sports" | "Charitable" | "Non-Charitable",
  "affiliate": "String",
  "venue": "String",
  "estimatedBudget": Number,
  "intimaSubsidy": Number
}

**Handling Missing Data:**
If a field is empty or illegible in the PDF, return \`null\` for that JSON key.`,
        },
      ],
    };

    const model = "gemini-2.5-flash-lite";
    const contents = [
      {
        role: "user" as const,
        parts: [
          {
            text: "Please extract the data from this Student Activity Proposal PDF document.",
          },
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Data,
            },
          },
        ],
      },
    ];

    // Use non-streaming for simpler response handling
    const response = await ai.models.generateContent({
      model,
      config,
      contents,
    });

    // Get the text response
    const responseText = response.text || "";

    if (!responseText) {
      return NextResponse.json(
        { error: "No response from AI model" },
        { status: 500 }
      );
    }

    // Strip markdown code fences if present
    const cleanedResponse = stripMarkdownCodeFences(responseText);

    // Parse the JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedResponse);
    } catch {
      console.error("Failed to parse AI response as JSON:", cleanedResponse);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    // Normalize the activity type to match form options
    if (parsedData.activityType) {
      parsedData.activityType = normalizeActivityType(parsedData.activityType);
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Error parsing SAP:", error);
    return NextResponse.json(
      { error: "Failed to parse document. Please try again." },
      { status: 500 }
    );
  }
}
