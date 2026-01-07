# Hotel Owner Flowchart

This flowchart outlines the user journey for a Hotel Owner managing their properties and bookings on the platform.

```mermaid
graph TD
    A[Landing Page] --> B{Has Account?}
    B -- No --> C[Sign Up as Hotel Owner]
    B -- Yes --> D[Login]
    C --> D
    D --> E[Owner Dashboard]

    %% Dashboard Main Sections
    E --> F[Property Management]
    E --> G[Booking Management]
    E --> H[Analytics & Reports]
    E --> I[Profile & Settings]

    %% Property Management Flow
    F --> F1[List All Properties]
    F1 --> F2{Action?}
    F2 -- Add New --> F3[Add Hotel Details]
    F3 --> F4[Upload Photos]
    F4 --> F5[Set Amenities]
    F5 --> F6[Define Rooms & Pricing]
    F6 --> F7[Publish Listing]
    
    F2 -- Edit Existing --> F8[Update Hotel Info]
    F2 -- Delete --> F9[Remove Listing]

    %% Booking Management Flow
    G --> G1[View All Bookings]
    G1 --> G2{Booking Status}
    G2 -- Pending --> G3[Accept / Reject]
    G2 -- Confirmed --> G4[View Details]
    G4 --> G5[Manage Check-in/Check-out]
    G2 -- History --> G6[View Past Bookings]

    %% Analytics Flow
    H --> H1[View Revenue]
    H --> H2[Occupancy Rates]
    H --> H3[Guest Reviews]
    H3 --> H4[Reply to Reviews]

    %% Settings Flow
    I --> I1[Account Details]
    I --> I2[Payment Methods]
    I --> I3[Notification Preferences]
    I --> J[Logout]
    J --> A
```

## Key Modules

1.  **Authentication**: Secure login/signup specifically for property owners.
2.  **Dashboard**: Central hub for all management activities.
3.  **Property Management**: CRUD operations for hotels and rooms.
4.  **Booking Management**: Handling reservations and guest status.
5.  **Analytics**: Insights into business performance.

## Flow Description

1.  **Registration & Onboarding**:
    *   Potential owners sign up specifically as "Hotel Owners".
    *   They undergo a verification process (optional/simulated).
    *   Once verified, they access the **Owner Dashboard**.

2.  **Dashboard Overview**:
    *   The landing page for owners.
    *   Shows quick stats: Active Bookings, Total Revenue, Occupancy Rate.
    *   Provides quick links to "Add Property" or "View Bookings".

3.  **Property Management**:
    *   **Add New**: Owners input hotel details (Name, Location, Description), upload high-quality images, and define amenities.
    *   **Room Setup**: Define room types (Single, Double, Suite), prices per night, and available quantity.
    *   **Edit/Update**: Owners can update pricing or availability in real-time.

4.  **Booking Handling**:
    *   Owners receive notifications for new bookings.
    *   **Pending**: Review guest details and special requests.
    *   **Action**: Accept or Reject the booking (if manual approval is set) or view auto-confirmed bookings.
    *   **Check-in/Out**: Update status when guests arrive or leave.

5.  **Analytics & Insights**:
    *   Visual graphs showing earnings over time.
    *   Review feedback from guests and reply to reviews to maintain reputation.
