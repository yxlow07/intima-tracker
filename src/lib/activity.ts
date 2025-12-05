import { getDb } from "./mongodb";
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

async function getActivitiesCollection() {
  const db = await getDb();
  return db.collection<Activity>("activities");
}

async function getLogsCollection() {
  const db = await getDb();
  return db.collection<Log>("logs");
}

export async function createActivity(activity: NewActivity): Promise<Activity> {
  const collection = await getActivitiesCollection();
  const uniqueToken = uuidv4();
  const now = new Date().toISOString();
  
  const newActivity: Activity = {
    id: uuidv4(),
    activityName: activity.activityName,
    description: activity.description || undefined,
    activityDate: activity.activityDate || undefined,
    activityType: activity.activityType || undefined,
    affiliate: activity.affiliate || undefined,
    status: activity.status,
    publicViewCount: 0,
    uniqueToken,
    formType: activity.formType || "SAP",
    sapActivityId: activity.sapActivityId || undefined,
    createdAt: now,
    updatedAt: now,
  };

  await collection.insertOne(newActivity);
  return newActivity;
}

export async function getAllActivities(): Promise<Activity[]> {
  const collection = await getActivitiesCollection();
  return collection.find().sort({ createdAt: -1 }).toArray();
}

export async function getActivityById(id: string): Promise<Activity | undefined> {
  const collection = await getActivitiesCollection();
  const activity = await collection.findOne({ id });
  return activity || undefined;
}

export async function getActivityByToken(token: string): Promise<Activity | undefined> {
  const collection = await getActivitiesCollection();
  const activity = await collection.findOne({ uniqueToken: token });
  return activity || undefined;
}

export async function incrementViewCount(id: string): Promise<void> {
  const collection = await getActivitiesCollection();
  await collection.updateOne({ id }, { $inc: { publicViewCount: 1 } });
}

export async function updateActivity(
  id: string,
  updates: Partial<Omit<Activity, "id" | "uniqueToken" | "createdAt" | "publicViewCount">>,
): Promise<Activity | undefined> {
  const collection = await getActivitiesCollection();
  
  if (Object.keys(updates).length === 0) {
    return getActivityById(id);
  }

  await collection.updateOne(
    { id },
    { $set: { ...updates, updatedAt: new Date().toISOString() } }
  );
  return getActivityById(id);
}

export async function deleteActivity(id: string): Promise<void> {
  const collection = await getActivitiesCollection();
  const logsCollection = await getLogsCollection();
  
  // Delete associated logs first
  await logsCollection.deleteMany({ activityId: id });
  await collection.deleteOne({ id });
}

export async function getUnderReviewActivities(): Promise<Activity[]> {
  const collection = await getActivitiesCollection();
  return collection.find({ status: "Under Review" }).sort({ createdAt: -1 }).toArray();
}

// Form type specific functions
export async function getActivitiesByFormType(formType: FormType): Promise<Activity[]> {
  const collection = await getActivitiesCollection();
  return collection.find({ formType }).sort({ createdAt: -1 }).toArray();
}

export async function getAllSAPs(): Promise<Activity[]> {
  return getActivitiesByFormType("SAP");
}

export async function getAllASFs(): Promise<Activity[]> {
  return getActivitiesByFormType("ASF");
}

export async function getSAPActivitiesForCalendar(): Promise<Activity[]> {
  const collection = await getActivitiesCollection();
  return collection.find({ formType: "SAP", status: "Approved" }).sort({ activityDate: 1 }).toArray();
}

export async function getLinkedASF(sapActivityId: string): Promise<Activity | undefined> {
  const collection = await getActivitiesCollection();
  const activity = await collection.findOne({ sapActivityId, formType: "ASF" });
  return activity || undefined;
}

export async function getLinkedSAP(asfActivity: Activity): Promise<Activity | undefined> {
  if (!asfActivity.sapActivityId) return undefined;
  return getActivityById(asfActivity.sapActivityId);
}

// Log functions
export async function createLog(log: NewLog): Promise<Log> {
  const collection = await getLogsCollection();
  const newLog: Log = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    log: log.log || undefined,
    activityId: log.activityId,
  };
  
  await collection.insertOne(newLog);
  return newLog;
}

export async function getLogById(id: string): Promise<Log | undefined> {
  const collection = await getLogsCollection();
  const log = await collection.findOne({ id });
  return log || undefined;
}

export async function getLogsForActivity(activityId: string): Promise<Log[]> {
  const collection = await getLogsCollection();
  return collection.find({ activityId }).sort({ timestamp: -1 }).toArray();
}
