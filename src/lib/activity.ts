import db from "./db";
import { v4 as uuidv4 } from "uuid";

export type FormType = "SAP" | "ASF";

export type Activity = {
  id: string;
  activityName: string;
  description?: string;
  activityDate?: string;
  activityType?: string;
  affiliate?: string;
  status: string;
  publicViewCount: number;
  uniqueToken: string;
  formType: FormType;
  sapActivityId?: string;
  createdAt: string;
  updatedAt: string;
};

export type NewActivity = Omit<Activity, "id" | "uniqueToken" | "createdAt" | "updatedAt" | "publicViewCount">;

export type Log = {
  id: string;
  timestamp: string;
  log?: string;
  activityId: string;
};

export type NewLog = Omit<Log, "id" | "timestamp">;

export function createActivity(activity: NewActivity): Activity {
  const uniqueToken = uuidv4();
  const stmt = db.prepare(
    "INSERT INTO Activity (id, activityName, description, activityDate, activityType, affiliate, status, uniqueToken, formType, sapActivityId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  stmt.run(
    uuidv4(),
    activity.activityName,
    activity.description || null,
    activity.activityDate || null,
    activity.activityType || null,
    activity.affiliate || null,
    activity.status,
    uniqueToken,
    activity.formType || "SAP",
    activity.sapActivityId || null,
  );
  return getActivityByToken(uniqueToken)!; // Refetch to get all fields including defaults
}

export function getAllActivities(): Activity[] {
  const stmt = db.prepare("SELECT * FROM Activity ORDER BY createdAt DESC");
  return stmt.all() as Activity[];
}

export function getActivityById(id: string): Activity | undefined {
  const stmt = db.prepare("SELECT * FROM Activity WHERE id = ?");
  return stmt.get(id) as Activity | undefined;
}

export function getActivityByToken(token: string): Activity | undefined {
  const stmt = db.prepare("SELECT * FROM Activity WHERE uniqueToken = ?");
  return stmt.get(token) as Activity | undefined;
}

export function incrementViewCount(id: string): void {
  const stmt = db.prepare(
    "UPDATE Activity SET publicViewCount = publicViewCount + 1 WHERE id = ?",
  );
  stmt.run(id);
}

export function updateActivity(
  id: string,
  updates: Partial<Omit<Activity, "id" | "uniqueToken" | "createdAt" | "publicViewCount">>,
): Activity | undefined {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = Object.values(updates);

  if (fields.length === 0) {
    return getActivityById(id); // Nothing to update
  }

  const stmt = db.prepare(
    `UPDATE Activity SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
  );
  stmt.run(...values, id);
  return getActivityById(id);
}

export function deleteActivity(id: string): void {
  const stmt = db.prepare("DELETE FROM Activity WHERE id = ?");
  stmt.run(id);
}

export function getUnderReviewActivities(): Activity[] {
  const stmt = db.prepare("SELECT * FROM Activity WHERE status = 'Under Review' ORDER BY createdAt DESC");
  return stmt.all() as Activity[];
}

// Form type specific functions
export function getActivitiesByFormType(formType: FormType): Activity[] {
  const stmt = db.prepare("SELECT * FROM Activity WHERE formType = ? ORDER BY createdAt DESC");
  return stmt.all(formType) as Activity[];
}

export function getAllSAPs(): Activity[] {
  return getActivitiesByFormType("SAP");
}

export function getAllASFs(): Activity[] {
  return getActivitiesByFormType("ASF");
}

export function getSAPActivitiesForCalendar(): Activity[] {
  const stmt = db.prepare("SELECT * FROM Activity WHERE formType = 'SAP' AND status = 'Approved' ORDER BY activityDate ASC");
  return stmt.all() as Activity[];
}

export function getLinkedASF(sapActivityId: string): Activity | undefined {
  const stmt = db.prepare("SELECT * FROM Activity WHERE sapActivityId = ? AND formType = 'ASF'");
  return stmt.get(sapActivityId) as Activity | undefined;
}

export function getLinkedSAP(asfActivity: Activity): Activity | undefined {
  if (!asfActivity.sapActivityId) return undefined;
  return getActivityById(asfActivity.sapActivityId);
}

// Log functions
export function createLog(log: NewLog): Log {
  const id = uuidv4();
  const stmt = db.prepare(
    "INSERT INTO Logs (id, log, activityId) VALUES (?, ?, ?)",
  );
  stmt.run(id, log.log || null, log.activityId);
  return getLogById(id)!;
}

export function getLogById(id: string): Log | undefined {
  const stmt = db.prepare("SELECT * FROM Logs WHERE id = ?");
  return stmt.get(id) as Log | undefined;
}

export function getLogsForActivity(activityId: string): Log[] {
  const stmt = db.prepare("SELECT * FROM Logs WHERE activityId = ? ORDER BY timestamp DESC");
  return stmt.all(activityId) as Log[];
}
