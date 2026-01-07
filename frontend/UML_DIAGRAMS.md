# Detailed UML Diagrams for Hotel Booking System

This document contains comprehensive UML diagrams representing the exact architecture, data flows, and logic of the Hotel Booking Application.

---

## 1. Class Diagram (Component & Data Structure)
**Description**: This diagram represents the React Component hierarchy acting as classes, along with the data interfaces used in the application.

```mermaid
classDiagram
    %% Core Data Models
    class Hotel {
        +int id
        +string name
        +string location
        +number price
        +number rating
        +string image
        +string[] amenities
        +number latitude
        +number longitude
        +string description
        +getAmenityIcon(name)
    }

    class User {
        +string email
        +string password
        +string userType
        +boolean isAuthenticated
        +login(email, password)
        +logout()
    }

    class BookingState {
        +int step
        +string firstName
        +string lastName
        +string email
        +string paymentMethod
        +string cardNumber
        +string expiry
        +string cvc
        +boolean isConfirmed
    }

    class AIMessage {
        +int id
        +string text
        +string sender
        +Date timestamp
        +string[] suggestions
        +Hotel[] hotels
    }

    %% React Components
    class App {
        +state loading
        +handlePreloaderComplete()
    }

    class HotelDetailsPage {
        +Hotel hotelData
        +object userLocation
        +boolean showRoute
        +array routeCoords
        +fetchRoute(start, end)
        +handleNavigate()
    }

    class BookingPage {
        +int step
        +setStep(step)
        +handlePayment()
        +confirmBooking()
    }

    class AIAssistant {
        +boolean isOpen
        +AIMessage[] messages
        +string inputValue
        +object userPreferences
        +MistralClient backend
        +generateAIResponse(msg)
        +handleSendMessage(e)
    }

    class MapService {
        +getCoordinates()
        +fetchOSRMRoute(start, end)
    }

    class AuthManager {
        +checkCredentials(email, pass)
        +setLocalStorage()
    }

    %% Relationships
    App *-- HotelDetailsPage : Routes
    App *-- BookingPage : Routes
    App *-- AIAssistant : Global Widget
    HotelDetailsPage ..> Hotel : Uses
    HotelDetailsPage ..> MapService : Calls
    BookingPage ..> BookingState : Manages
    AIAssistant ..> MistralClient : API Call
    AIAssistant ..> Hotel : Filters/Recommends
    LoginPage ..> AuthManager : Validates
```

---

## 2. Sequence Diagram: Hotel Search to Booking
**Description**: Detailed interaction flow for a user searching for a hotel, viewing details, calculating a route, and completing a booking.

```mermaid
sequenceDiagram
    participant User
    participant LandingPage as Landing Page
    participant SearchPage as Search Page
    participant DetailsPage as Hotel Details
    participant MapService as OSRM / Leaflet
    participant BookingPage as Booking Page
    participant LocalStorage as Browser Storage

    User->>LandingPage: Enters Search Query (Location)
    LandingPage->>SearchPage: Navigate with query
    SearchPage->>SearchPage: Filter hotels.js list
    SearchPage-->>User: Display filtered Hotel Cards

    User->>SearchPage: Clicks "View Details" on Hotel X
    SearchPage->>DetailsPage: Navigate /hotel/:id
    DetailsPage->>DetailsPage: Find hotel by ID from data
    DetailsPage-->>User: Render Gallery, Info, Price

    %% Map interaction
    User->>DetailsPage: Click "Navigate"
    DetailsPage->>MapService: navigator.geolocation.getCurrentPosition()
    MapService-->>DetailsPage: Return {lat, lng}
    DetailsPage->>MapService: fetch(OSRM_API_URL)
    MapService-->>DetailsPage: Return GeoJSON Route
    DetailsPage-->>User: Draw Polyline on MapContainer

    %% Booking Flow
    User->>DetailsPage: Click "Reserve Now"
    DetailsPage->>BookingPage: Navigate /booking
    
    %% Step 1
    BookingPage-->>User: Show Step 1 (Personal Details)
    User->>BookingPage: Input Name, Email -> Click Continue
    BookingPage->>BookingPage: setStep(2)

    %% Step 2
    BookingPage-->>User: Show Step 2 (Payment)
    User->>BookingPage: Select Card/PayPal -> Input Details
    User->>BookingPage: Click "Pay & Book"
    
    %% Step 3
    BookingPage->>BookingPage: Simulate Processing (Wait...)
    BookingPage->>LocalStorage: Save Booking Data (Hypothetical)
    BookingPage->>BookingPage: setStep(3)
    BookingPage-->>User: Show "Booking Confirmed" & Success Checkmark
    
    User->>BookingPage: Click "Go to Dashboard"
```

---

## 3. Sequence Diagram: AI Assistant Interaction
**Description**: Shows the internal logic of the AI Assistant, including local fallbacks and API calls.

```mermaid
sequenceDiagram
    actor User
    participant UI as Chat Interface
    participant Logic as AI Handler
    participant Mistral as Mistral AI SDK
    participant DB as Hotel Data

    User->>UI: Click Sparkles Icon
    UI->>Logic: isOpen = true
    UI-->>User: Show Chat Panel + Welcome Msg

    User->>UI: Type "Find me a hotel in Pokhara under 10k"
    UI->>Logic: handleSendMessage(input)
    Logic->>Logic: Add UserMessage to State
    
    alt API Key Configured
        Logic->>DB: Read all hotels
        Logic->>Logic: Construct System Prompt (Context + Hotel DB)
        Logic->>Mistral: chat.complete(messages)
        Mistral-->>Logic: Return AI Response string
    else No API Key / Error
        Logic->>Logic: Parse keywords ("Pokhara", "10k")
        Logic->>DB: Filter hotels manually
        Logic->>Logic: generateLocalResponse()
    end

    Logic->>Logic: Parse Intent (Location/Budget/General)
    Logic->>Logic: Update userPreferences state
    Logic->>UI: Add AI Message + Hotel Cards + Suggestions
    UI-->>User: Render Response bubbles & Cards
```

---

## 4. Activity Diagram: Detailed User Journey
**Description**: Covers the complete decision-making process for a traveler using the app.

```mermaid
flowchart TD
    Start((Start)) --> Preolaoder[Preloader Animation]
    Preolaoder --> CheckAuth{Is Authenticated?}
    
    CheckAuth -- No --> Login[Login Page]
    Login --> UserType{Select Type}
    UserType -- Traveler --> InputCreds[Enter Traveler Creds]
    UserType -- Owner --> InputOwner[Enter Owner Creds]
    InputCreds --> SubmitLogin
    InputOwner --> SubmitLogin
    SubmitLogin --> Valid{Credentials Valid?}
    Valid -- No --> Error[Shake Animation / Error Msg] --> Login
    Valid -- Yes --> SetAuth[Set localStorage]
    
    SetAuth --> Redirect{User Type?}
    Redirect -- Owner --> Dashboard[Owner Dashboard]
    Redirect -- Traveler --> Home[Landing Page]
    
    Home --> Action{User Action}
    
    %% AI Path
    Action -- Click AI --> OpenAI[Open AI Assistant]
    OpenAI --> Query[Ask Question]
    Query --> Process[Process Intent]
    Process --> Recommends[Show Recommendations]
    Recommends --> ClickCard[Click Hotel Card] --> Details
    
    %% Search Path
    Action -- Search Form --> SearchResults[Search Page]
    SearchResults --> Filters[Apply Filters]
    Filters --> SelectHotel[Select Hotel] --> Details
    
    %% Details Path
    Details[Hotel Details Page] --> Interact{Interaction}
    Interact -- View Map --> GetLoc[Get User Location]
    GetLoc --> FetchRoute[Fetch OSRM Route]
    FetchRoute --> Draw[Draw Route Line]
    
    Interact -- Book --> BookingStart[Booking Page Step 1]
    
    BookingStart --> InputDetails[Fill Personal Info]
    InputDetails --> Step2[Step 2: Payment]
    Step2 --> Method{Select Method}
    Method -- Card --> CardForm[Enter Card Details]
    Method -- PayPal --> PayPalAuth[PayPal Mock]
    
    CardForm --> Confirm[Pay & Book]
    Confirm --> ProcessBook[Processing...]
    ProcessBook --> Success[Step 3: Confirmed]
    Success --> End((End))
```

---

## 5. Use Case Diagram (Detailed)
**Description**: Maps all user interactions to specific actors.

```mermaid
usecaseDiagram
    actor "Guest User" as Guest
    actor "Registered Traveler" as Traveler
    actor "Hotel Owner" as Owner
    actor "AI Service" as AI

    package "Front Office" {
        usecase "Browse Search Results" as UC1
        usecase "View Hotel Details" as UC2
        usecase "Interact with Map" as UC3
        usecase "Chat with AI Assistant" as UC4
        usecase "Register/Login" as UC5
    }

    package "Booking System" {
        usecase "Select Dates & Guests" as UC6
        usecase "Enter Payment Details" as UC7
        usecase "Receive Confirmation" as UC8
        usecase "View Booking History" as UC9
    }

    package "Back Office (Owner)" {
        usecase "View Dashboard" as UC10
        usecase "Manage Properties" as UC11
        usecase "Track Revenue" as UC12
    }

    %% Relationships
    Guest --> UC1
    Guest --> UC2
    Guest --> UC3
    Guest --> UC4
    Guest --> UC5

    Traveler --> UC1
    Traveler --> UC2
    Traveler --> UC3
    Traveler --> UC4
    Traveler --> UC6
    Traveler --> UC7
    Traveler --> UC8
    Traveler --> UC9

    Owner --> UC5
    Owner --> UC10
    Owner --> UC11
    Owner --> UC12

    UC4 ..> AI : Connects to
    UC3 ..> "OSRM API" : Fetches Route
```
