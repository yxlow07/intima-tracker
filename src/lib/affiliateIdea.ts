import { getDb } from "./mongodb";
import { v4 as uuidv4 } from "uuid";

export type AffiliateIdeaStatus = "Pending Approval" | "Approved" | "Rejected";

export type AffiliateIdea = {
  id: string;
  affiliateName: string;
  description?: string;
  positionsOpen?: string[]; // Now stored as array directly in MongoDB
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

async function getAffiliateIdeasCollection() {
  const db = await getDb();
  return db.collection<AffiliateIdea>("affiliateIdeas");
}

// Validate student email format: xx@student.newinti.edu.my
export function validateStudentEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@student\.newinti\.edu\.my$/i;
  return emailRegex.test(email);
}

export async function createAffiliateIdea(idea: NewAffiliateIdea): Promise<AffiliateIdea> {
  const collection = await getAffiliateIdeasCollection();
  const now = new Date().toISOString();
  
  const newIdea: AffiliateIdea = {
    id: uuidv4(),
    affiliateName: idea.affiliateName,
    description: idea.description || undefined,
    positionsOpen: idea.positionsOpen || undefined,
    contact: idea.contact,
    studentEmail: idea.studentEmail,
    status: "Pending Approval",
    createdAt: now,
    updatedAt: now,
  };

  await collection.insertOne(newIdea);
  return newIdea;
}

export async function getAllAffiliateIdeas(): Promise<AffiliateIdea[]> {
  const collection = await getAffiliateIdeasCollection();
  return collection.find().sort({ createdAt: -1 }).toArray();
}

export async function getApprovedAffiliateIdeas(): Promise<AffiliateIdea[]> {
  const collection = await getAffiliateIdeasCollection();
  return collection.find({ status: "Approved" }).sort({ createdAt: -1 }).toArray();
}

export async function getPendingAffiliateIdeas(): Promise<AffiliateIdea[]> {
  const collection = await getAffiliateIdeasCollection();
  return collection.find({ status: "Pending Approval" }).sort({ createdAt: -1 }).toArray();
}

export async function getAffiliateIdeaById(id: string): Promise<AffiliateIdea | undefined> {
  const collection = await getAffiliateIdeasCollection();
  const idea = await collection.findOne({ id });
  return idea || undefined;
}

export async function updateAffiliateIdeaStatus(id: string, status: AffiliateIdeaStatus): Promise<AffiliateIdea | undefined> {
  const collection = await getAffiliateIdeasCollection();
  await collection.updateOne(
    { id },
    { $set: { status, updatedAt: new Date().toISOString() } }
  );
  return getAffiliateIdeaById(id);
}

export async function updateAffiliateIdea(
  id: string,
  updates: Partial<Omit<AffiliateIdea, "id" | "createdAt">>
): Promise<AffiliateIdea | undefined> {
  const collection = await getAffiliateIdeasCollection();
  const allowedFields = ["affiliateName", "description", "positionsOpen", "contact", "studentEmail", "status"];
  const filteredUpdates = Object.entries(updates).filter(([key]) => allowedFields.includes(key));
  
  if (filteredUpdates.length === 0) {
    return getAffiliateIdeaById(id);
  }

  const updateObj = Object.fromEntries(filteredUpdates);
  await collection.updateOne(
    { id },
    { $set: { ...updateObj, updatedAt: new Date().toISOString() } }
  );
  return getAffiliateIdeaById(id);
}

export async function deleteAffiliateIdea(id: string): Promise<void> {
  const collection = await getAffiliateIdeasCollection();
  await collection.deleteOne({ id });
}

// Helper to parse positions - now just returns the array directly since MongoDB stores arrays natively
export function parsePositions(positionsOpen?: string[] | string): string[] {
  if (!positionsOpen) return [];
  if (Array.isArray(positionsOpen)) return positionsOpen;
  // Fallback for legacy string data
  try {
    return JSON.parse(positionsOpen);
  } catch {
    return [];
  }
}
