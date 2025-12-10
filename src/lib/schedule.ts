import { getDb } from "./mongodb";
import { v4 as uuidv4 } from "uuid";

export type TimeSlot = {
  start: string; // HH:MM format
  end: string;   // HH:MM format
};

export type WeeklySchedule = {
  Monday: TimeSlot[];
  Tuesday: TimeSlot[];
  Wednesday: TimeSlot[];
  Thursday: TimeSlot[];
  Friday: TimeSlot[];
};

export type MemberSchedule = {
  id: string;
  name: string;
  session: string;
  schedule: WeeklySchedule;
  createdAt: string;
  updatedAt: string;
};

export type NewMemberSchedule = {
  name: string;
  session: string;
  schedule: WeeklySchedule;
};

export type ScheduleSlot = {
  id: string;
  day: keyof WeeklySchedule;
  start: string;
  end: string;
  assignedMembers: string[]; // Array of member IDs
  session: string;
  createdAt: string;
  updatedAt: string;
};

const DAYS: (keyof WeeklySchedule)[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TARGET_SLOTS = [
  { start: "11:00", end: "12:00" },
  { start: "12:00", end: "13:00" },
  { start: "13:00", end: "14:00" },
];

async function getMemberSchedulesCollection() {
  const db = await getDb();
  return db.collection<MemberSchedule>("memberSchedules");
}

async function getScheduleSlotsCollection() {
  const db = await getDb();
  return db.collection<ScheduleSlot>("scheduleSlots");
}

// Member Schedule CRUD
export async function createMemberSchedule(data: NewMemberSchedule): Promise<MemberSchedule> {
  const collection = await getMemberSchedulesCollection();
  const now = new Date().toISOString();
  
  const memberSchedule: MemberSchedule = {
    id: uuidv4(),
    name: data.name,
    session: data.session,
    schedule: data.schedule,
    createdAt: now,
    updatedAt: now,
  };

  await collection.insertOne(memberSchedule);
  return memberSchedule;
}

export async function getAllMemberSchedules(session?: string): Promise<MemberSchedule[]> {
  const collection = await getMemberSchedulesCollection();
  const query = session ? { session } : {};
  return collection.find(query).sort({ name: 1 }).toArray();
}

export async function getMemberScheduleById(id: string): Promise<MemberSchedule | undefined> {
  const collection = await getMemberSchedulesCollection();
  const schedule = await collection.findOne({ id });
  return schedule || undefined;
}

export async function getMemberScheduleByName(name: string, session: string): Promise<MemberSchedule | undefined> {
  const collection = await getMemberSchedulesCollection();
  const schedule = await collection.findOne({ name, session });
  return schedule || undefined;
}

export async function updateMemberSchedule(id: string, updates: Partial<NewMemberSchedule>): Promise<MemberSchedule | undefined> {
  const collection = await getMemberSchedulesCollection();
  await collection.updateOne(
    { id },
    { $set: { ...updates, updatedAt: new Date().toISOString() } }
  );
  return getMemberScheduleById(id);
}

export async function deleteMemberSchedule(id: string): Promise<void> {
  const collection = await getMemberSchedulesCollection();
  await collection.deleteOne({ id });
}

// Schedule Slots CRUD
export async function getOrCreateScheduleSlots(session: string): Promise<ScheduleSlot[]> {
  const collection = await getScheduleSlotsCollection();
  const existingSlots = await collection.find({ session }).toArray();
  
  if (existingSlots.length > 0) {
    return existingSlots;
  }

  // Create all slots for the session
  const now = new Date().toISOString();
  const slots: ScheduleSlot[] = [];

  for (const day of DAYS) {
    for (const timeSlot of TARGET_SLOTS) {
      slots.push({
        id: uuidv4(),
        day,
        start: timeSlot.start,
        end: timeSlot.end,
        assignedMembers: [],
        session,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  await collection.insertMany(slots);
  return slots;
}

export async function getScheduleSlots(session: string): Promise<ScheduleSlot[]> {
  const collection = await getScheduleSlotsCollection();
  return collection.find({ session }).toArray();
}

export async function createScheduleSlot(
  day: keyof WeeklySchedule,
  start: string,
  end: string,
  session: string,
  assignedMembers: string[] = []
): Promise<ScheduleSlot> {
  const collection = await getScheduleSlotsCollection();
  const now = new Date().toISOString();
  
  const slot: ScheduleSlot = {
    id: uuidv4(),
    day,
    start,
    end,
    assignedMembers,
    session,
    createdAt: now,
    updatedAt: now,
  };

  await collection.insertOne(slot);
  return slot;
}

export async function updateScheduleSlot(id: string, assignedMembers: string[]): Promise<ScheduleSlot | undefined> {
  const collection = await getScheduleSlotsCollection();
  await collection.updateOne(
    { id },
    { $set: { assignedMembers, updatedAt: new Date().toISOString() } }
  );
  const slot = await collection.findOne({ id });
  return slot || undefined;
}

export async function clearAllSlots(session: string): Promise<void> {
  const collection = await getScheduleSlotsCollection();
  await collection.updateMany(
    { session },
    { $set: { assignedMembers: [], updatedAt: new Date().toISOString() } }
  );
}

// Availability Logic
export function isMemberBusyAt(schedule: WeeklySchedule, day: keyof WeeklySchedule, start: string, end: string): boolean {
  const daySchedule = schedule[day];
  if (!daySchedule || daySchedule.length === 0) return false;

  const slotStart = timeToMinutes(start);
  const slotEnd = timeToMinutes(end);

  for (const busySlot of daySchedule) {
    const busyStart = timeToMinutes(busySlot.start);
    const busyEnd = timeToMinutes(busySlot.end);

    // Check for overlap
    if (slotStart < busyEnd && slotEnd > busyStart) {
      return true;
    }
  }

  return false;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export async function getAvailableMembersForSlot(
  session: string,
  day: keyof WeeklySchedule,
  start: string,
  end: string
): Promise<MemberSchedule[]> {
  const members = await getAllMemberSchedules(session);
  
  return members.filter(member => {
    return !isMemberBusyAt(member.schedule, day, start, end);
  });
}

// Randomizer Algorithm
export async function randomizeSchedule(session: string): Promise<ScheduleSlot[]> {
  const members = await getAllMemberSchedules(session);
  const slots = await getOrCreateScheduleSlots(session);
  const collection = await getScheduleSlotsCollection();

  // Clear existing assignments
  await clearAllSlots(session);

  const updatedSlots: ScheduleSlot[] = [];

  for (const slot of slots) {
    // Get available members for this slot
    const availableMembers = members.filter(member => {
      return !isMemberBusyAt(member.schedule, slot.day, slot.start, slot.end);
    });

    // Randomly select 2 members if available
    const shuffled = availableMembers.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 2).map(m => m.id);

    await collection.updateOne(
      { id: slot.id },
      { $set: { assignedMembers: selected, updatedAt: new Date().toISOString() } }
    );

    updatedSlots.push({
      ...slot,
      assignedMembers: selected,
      updatedAt: new Date().toISOString(),
    });
  }

  return updatedSlots;
}

// Get all unique sessions
export async function getAllSessions(): Promise<string[]> {
  const collection = await getMemberSchedulesCollection();
  const sessions = await collection.distinct("session");
  return sessions.sort();
}
