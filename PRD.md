# PRD: Campus Facilities Booking Module

## 1\. Overview

The goal is to create a booking interface at `/booking` that allows students/staff to reserve campus facilities. The entry point will strictly follow the UI pattern of the existing SAP/ASF selector (a 2x2 grid of interactive cards). The backend will utilize Firebase for real-time availability and data storage.

## 2\. User Interface (The Selector)

**Layout:** A Responsive Grid (`grid-cols-1 sm:grid-cols-2`) exactly matching the provided code snippet.
**Interaction:** Clicking a card opens a Modal or navigates to a sub-route (e.g., `/booking/music`) to select time slots.

### Card Configuration

We will reuse the card component structure but map it to the 4 services. To maintain visual distinction, we will assign a unique color theme to each category.

#### Card 1: Discussion Rooms

  * **Theme:** Indigo (Intellectual/Study)
  * **Icon:** `ChatBubbleBottomCenterTextIcon` (Heroicons)
  * **Title:** Discussion Rooms
  * **Description:** Reserve a private room in the library for group studies or project discussions.
  * **Sub-types:** Small (4-5 pax), Large (8-10 pax).

#### Card 2: Music Room

  * **Theme:** Rose (Creative/Arts)
  * **Icon:** `MusicalNoteIcon`
  * **Title:** Music Room
  * **Description:** Book the soundproof studio to practice instruments or jam sessions.
  * **Sub-types:** Single Room only.

#### Card 3: Pool Tables

  * **Theme:** Amber (Recreation/Leisure)
  * **Icon:** `GlobeAltIcon` (Resembles a ball) or custom billiard svg.
  * **Title:** Pool Tables
  * **Description:** Reserve a table for a game of 8-ball. Equipment provided.
  * **Sub-types:** Large Table, Small Table.

#### Card 4: Ping Pong Tables

  * **Theme:** Teal (Sport/Activity)
  * **Icon:** `TrophyIcon` or custom paddle svg.
  * **Title:** Ping Pong Tables
  * **Description:** Book a table tennis session. Paddles and balls available at the counter.
  * **Sub-types:** Table A, Table B.

-----

## 3\. Functional Requirements & Logic

### 3.1. General Logic

  * **Slot Duration:** All bookings are fixed at **1 hour**.
  * **Validation:** A user cannot book a slot if it is already present in the Firebase `bookings` collection for that specific `resourceId` and `timestamp`.
  * **Date Selection:** Users can only book for the current day or up to 7 days in advance (configurable).

### 3.2. Service Specifics

| Service | Inventory (Resource IDs) | Operating Hours | Logic |
| :--- | :--- | :--- | :--- |
| **Discussion Rooms** | `disc_small_1`, `disc_small_2`, `disc_small_3`<br>`disc_large_1`, `disc_large_2` | **08:00 - 18:00**<br>(10 Slots) | User selects "Size" preference. System shows availability across matching IDs. |
| **Music Room** | `music_room_1` | **08:00 - 17:00**<br>(9 Slots) | Direct booking. |
| **Pool Table** | `pool_large_1`<br>`pool_small_1` | **08:00 - 17:00**<br>(9 Slots) | User selects "Table Size" preference. |
| **Ping Pong** | `pingpong_1`, `pingpong_2` | **08:00 - 17:00**<br>(9 Slots) | Treat as identical resources. Assign first available. |

-----

## 4\. Database Schema (Firebase Firestore)

We will use a flattened structure for easy querying of availability.

### Collection: `bookings`

Each document represents a confirmed reservation.

```json
{
  "id": "auto_generated_id",
  "userId": "student_12345",
  "userName": "John Doe",
  "category": "DISCUSSION_ROOM", // Enum: DISCUSSION, MUSIC, POOL, PINGPONG
  "resourceId": "disc_small_1", // The specific item booked
  "subType": "SMALL", // Optional, helper for UI
  "date": "2023-10-27", // YYYY-MM-DD for easy filtering
  "startTime": "09:00", // 24hr format
  "endTime": "10:00",
  "status": "CONFIRMED", // CONFIRMED, CANCELLED
  "createdAt": "timestamp"
}
```

### Collection: `resources` (Config - Optional)

*Used to dynamically render the dropdowns inside the booking flow.*

```json
{
  "id": "disc_small_1",
  "category": "DISCUSSION_ROOM",
  "name": "Library Room A (Small)",
  "capacity": 5
}
```

-----

## 5\. Booking Flow UI/UX

When a user clicks a card (e.g., Discussion Rooms):

1.  **Step 1: Filter (Modal/Drawer)**
      * Date Picker.
      * Sub-type Selector (e.g., "Small Room" or "Large Room").
2.  **Step 2: Availability Grid**
      * System queries Firebase: `collection('bookings').where('date', '==', selectedDate).where('category', '==', 'DISCUSSION')`.
      * UI renders time slots (08:00 to 18:00).
      * **Logic:** If `disc_small_1`, `disc_small_2`, AND `disc_small_3` are ALL booked at 09:00, the 09:00 button is disabled (Gray). Otherwise, it is selectable (Green).
3.  **Step 3: Confirmation**
      * User clicks "Book 09:00".
      * System assigns a specific random available `resourceId` (e.g., assigns `disc_small_2` because 1 is busy).
      * User inputs their name and student email.
      * User gets a summary of their booking.
4.  **Step 4: Finalize Booking**
      * Write to Firebase.
      * Show Success Message.

-----

## 6\. Implementation Snippet (Frontend Data Structure)

To render the cards using your existing code style, use this array to map over:

```javascript
const bookingOptions = [
  {
    id: "discussion",
    title: "Discussion Rooms",
    desc: "Private library rooms. 3 Small (4-5 pax), 2 Large (8-10 pax).",
    hours: "8am - 6pm",
    iconColor: "text-indigo-600",
    bgColor: "bg-indigo-100",
    hoverColor: "group-hover:bg-indigo-200",
    icon: <ChatBubbleLeftRightIcon className="h-8 w-8" />, // Import from heroicons
  },
  {
    id: "music",
    title: "Music Room",
    desc: "Soundproof studio room for instrument practice.",
    hours: "8am - 5pm",
    iconColor: "text-rose-600",
    bgColor: "bg-rose-100",
    hoverColor: "group-hover:bg-rose-200",
    icon: <MusicalNoteIcon className="h-8 w-8" />,
  },
  {
    id: "pool",
    title: "Pool Table",
    desc: "1 Large and 1 Small table available for recreation.",
    hours: "8am - 5pm",
    iconColor: "text-amber-600",
    bgColor: "bg-amber-100",
    hoverColor: "group-hover:bg-amber-200",
    icon: <GlobeAltIcon className="h-8 w-8" />,
  },
  {
    id: "pingpong",
    title: "Ping Pong",
    desc: "2 Tables available. Paddles provided at counter.",
    hours: "8am - 5pm",
    iconColor: "text-teal-600",
    bgColor: "bg-teal-100",
    hoverColor: "group-hover:bg-teal-200",
    icon: <TrophyIcon className="h-8 w-8" />,
  },
];
```