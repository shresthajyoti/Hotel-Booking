# Traveler User Flow

This flowchart illustrates the journey of a "Traveler" user within the Hotel Booking Application.

```mermaid
graph TD
    Start((Start Application)) --> Preloader[Preloader Animation]
    Preloader --> LoginCheck{Is User Logged In?}
    
    %% Authentication Flow
    LoginCheck -- No --> LoginPage[Login Page]
    LoginPage -->|Select 'Traveler'| TravelerLogin[Enter Credentials]
    TravelerLogin -->|Success| LandingPage[Landing Page / Home]
    LoginPage -->|No Account?| SignupPage[Signup Page]
    SignupPage -->|Create Account| LoginPage

    %% Main Browsing Flow
    LoginCheck -- Yes --> LandingPage
    LandingPage --> Search[Search Hotels]
    LandingPage --> Popular[View Popular Hotels]
    LandingPage --> AI[Ask AI Assistant]
    
    %% Search & Selection
    Search --> Filter[Filter Results]
    Filter --> HotelList[Hotel List]
    Popular --> HotelList
    AI -->|Recommendations| HotelList
    
    HotelList -->|Select Hotel| HotelDetails[Hotel Details Page]
    
    %% Hotel Details Interaction
    HotelDetails --> ViewImages[View Images]
    HotelDetails --> ViewMap[View Map Location]
    HotelDetails --> ReadReviews[Read Reviews]
    HotelDetails --> BookBtn{Click 'Book Now'}
    
    %% Booking Flow
    BookBtn -->|Authenticated| BookingPage[Booking Page]
    BookBtn -->|Not Authenticated| LoginPage
    
    BookingPage --> FillDetails[Fill Guest Details]
    FillDetails --> ConfirmBooking[Confirm Booking]
    ConfirmBooking --> Success((Booking Confirmed))
    
    %% Navigation
    LandingPage --> NavServices[Services Page]
    LandingPage --> NavAbout[About Page]
    LandingPage --> NavContact[Contact Page]
```

## Flow Description

1.  **Initial Access**: When the user opens the application, they are greeted by a Preloader animation.
2.  **Authentication**:
    *   By default, the app redirects to the **Login Page** after loading.
    *   The user selects "Traveler" and logs in.
    *   New users can navigate to the **Signup Page** to create an account.
3.  **Home / Landing Page**:
    *   Once logged in, the traveler lands on the Home page.
    *   Here they can search for hotels, view popular picks, or interact with the **AI Assistant**.
4.  **Discovery**:
    *   Users can use the **Search** feature to find specific hotels.
    *   The **AI Assistant** can also suggest hotels based on preferences.
5.  **Hotel Details**:
    *   Clicking on a hotel takes the user to the **Hotel Details Page**.
    *   Users can view amenities, photos, reviews, and the hotel's location on a map.
6.  **Booking**:
    *   The "Book Now" button initiates the booking process.
    *   This leads to the **Booking Page** (a protected route).
    *   The user fills in their details and confirms the booking.
