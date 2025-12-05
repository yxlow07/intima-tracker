import { getAllActivities, getActivitiesByFormType, getSAPActivitiesForCalendar, createActivity, type FormType } from "@/lib/activity";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const formType = searchParams.get("formType") as FormType | null;
        const forCalendar = searchParams.get("forCalendar") === "true";

        let activities;
        if (forCalendar) {
            activities = getSAPActivitiesForCalendar();
        } else if (formType) {
            activities = getActivitiesByFormType(formType);
        } else {
            activities = getAllActivities();
        }

        return NextResponse.json(activities);
    } catch (error) {
        console.error("Error fetching activities:", error);
        return NextResponse.json(
            { error: "Failed to fetch activities" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        const activity = createActivity({
            activityName: body.activityName,
            description: body.description || undefined,
            activityDate: body.activityDate || undefined,
            activityType: body.activityType || undefined,
            affiliate: body.affiliate || undefined,
            status: body.status || "Pending",
            formType: body.formType || "SAP",
            sapActivityId: body.sapActivityId || undefined,
        });

        return NextResponse.json(activity, { status: 201 });
    } catch (error) {
        console.error("Error creating activity:", error);
        return NextResponse.json(
            { error: "Failed to create activity" },
            { status: 500 }
        );
    }
}
