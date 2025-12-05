import db from "./db";
import { v4 as uuidv4 } from "uuid";

export type AffiliateIdeaStatus = "Pending Approval" | "Approved" | "Rejected";

export type AffiliateIdea = {
  id: string;
  affiliateName: string;
  description?: string;
  positionsOpen?: string; // JSON string array stored in DB
  contact: string;
  studentEmail: string;
  status: AffiliateIdeaStatus;
  createdAt: string;
  updatedAt: string;
};

export type NewAffiliateIdea = {
  affiliateName: string;
  description?: string;
  positionsOpen?: string[];
  contact: string;
  studentEmail: string;
};

// Validate student email format: xx@student.newinti.edu.my
export function validateStudentEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@student\.newinti\.edu\.my$/i;
  return emailRegex.test(email);
}

export function createAffiliateIdea(idea: NewAffiliateIdea): AffiliateIdea {
  const id = uuidv4();
  const positionsOpenJson = idea.positionsOpen ? JSON.stringify(idea.positionsOpen) : null;
  
  const stmt = db.prepare(
    "INSERT INTO AffiliateIdea (id, affiliateName, description, positionsOpen, contact, studentEmail, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  stmt.run(
    id,
    idea.affiliateName,
    idea.description || null,
    positionsOpenJson,
    idea.contact,
    idea.studentEmail,
    "Pending Approval"
  );
  
  return getAffiliateIdeaById(id)!;
}

export function getAllAffiliateIdeas(): AffiliateIdea[] {
  const stmt = db.prepare("SELECT * FROM AffiliateIdea ORDER BY createdAt DESC");
  return stmt.all() as AffiliateIdea[];
}

export function getApprovedAffiliateIdeas(): AffiliateIdea[] {
  const stmt = db.prepare("SELECT * FROM AffiliateIdea WHERE status = 'Approved' ORDER BY createdAt DESC");
  return stmt.all() as AffiliateIdea[];
}

export function getPendingAffiliateIdeas(): AffiliateIdea[] {
  const stmt = db.prepare("SELECT * FROM AffiliateIdea WHERE status = 'Pending Approval' ORDER BY createdAt DESC");
  return stmt.all() as AffiliateIdea[];
}

export function getAffiliateIdeaById(id: string): AffiliateIdea | undefined {
  const stmt = db.prepare("SELECT * FROM AffiliateIdea WHERE id = ?");
  return stmt.get(id) as AffiliateIdea | undefined;
}

export function updateAffiliateIdeaStatus(id: string, status: AffiliateIdeaStatus): AffiliateIdea | undefined {
  const stmt = db.prepare(
    "UPDATE AffiliateIdea SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?"
  );
  stmt.run(status, id);
  return getAffiliateIdeaById(id);
}

export function updateAffiliateIdea(
  id: string,
  updates: Partial<Omit<AffiliateIdea, "id" | "createdAt">>
): AffiliateIdea | undefined {
  const allowedFields = ["affiliateName", "description", "positionsOpen", "contact", "studentEmail", "status"];
  const filteredUpdates = Object.entries(updates).filter(([key]) => allowedFields.includes(key));
  
  if (filteredUpdates.length === 0) {
    return getAffiliateIdeaById(id);
  }

  const fields = filteredUpdates.map(([key]) => `${key} = ?`).join(", ");
  const values = filteredUpdates.map(([, value]) => {
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    return value;
  });

  const stmt = db.prepare(
    `UPDATE AffiliateIdea SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`
  );
  stmt.run(...values, id);
  return getAffiliateIdeaById(id);
}

export function deleteAffiliateIdea(id: string): void {
  const stmt = db.prepare("DELETE FROM AffiliateIdea WHERE id = ?");
  stmt.run(id);
}

// Helper to parse positions from DB
export function parsePositions(positionsOpen?: string): string[] {
  if (!positionsOpen) return [];
  try {
    return JSON.parse(positionsOpen);
  } catch {
    return [];
  }
}
