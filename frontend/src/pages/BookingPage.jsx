import React, { useState, useEffect } from "react";
import { CheckCircle, CreditCard, Calendar } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";

const BookingPage = () => {
  const [step, setStep] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state || {};

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    firstName: user.name?.split(" ")[0] || "",
    lastName: user.name?.split(" ")[1] || "",
    email: user.email || "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      ".booking-step",
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
    );
  }, [step]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBook = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          guestName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          propertyId: bookingData.hotelId || "507f1f77bcf86cd799439011", // Use passed hotelId or fallback
          propertyName: bookingData.hotelName || "Luxury Hotel",
          checkInDate: new Date(),
          checkOutDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          roomType: bookingData.roomType || "Deluxe Room",
          amount: bookingData.total || 50000,
          status: "Pending",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStep(3);
      } else {
        alert(data.error || "Booking failed");
      }
    } catch (error) {
      alert("Could not connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Complete your booking
        </h1>

        {/* Progress Bar */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                }`}
            >
              1
            </div>
            <div
              className={`w-20 h-1 ${step >= 2 ? "bg-black" : "bg-gray-200"}`}
            ></div>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                }`}
            >
              2
            </div>
            <div
              className={`w-20 h-1 ${step >= 3 ? "bg-black" : "bg-gray-200"}`}
            ></div>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                }`}
            >
              3
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 booking-step">
          {step === 1 && (
            <div>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Your Details</h2>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Booking for</p>
                  <p className="font-bold">
                    {bookingData.hotelName || "Selected Hotel"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black"
                    placeholder="Doe"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-bold">
                    Rs. {bookingData.total?.toLocaleString() || "0"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
              <div className="space-y-4 mb-8">
                <div className="border border-black bg-gray-50 p-4 rounded-xl flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <CreditCard size={24} />
                    <span className="font-bold">Credit Card</span>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-black"></div>
                </div>
                <div className="border border-gray-200 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="font-bold">PayPal</span>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="Card Number"
                  className="col-span-2 w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black"
                />
                <input
                  type="text"
                  name="expiry"
                  value={formData.expiry}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black"
                />
                <input
                  type="text"
                  name="cvc"
                  value={formData.cvc}
                  onChange={handleChange}
                  placeholder="CVC"
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 border border-gray-200 text-gray-900 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleBook}
                  disabled={loading}
                  className="w-2/3 bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading
                    ? "Processing..."
                    : `Pay Rs. ${bookingData.total?.toLocaleString() || "0"}`}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Booking Confirmed!</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Thank you for your booking. We've sent a confirmation email to
                your inbox with all the details.
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  to="/portal"
                  className="px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors"
                >
                  My Portal
                </Link>
                <Link
                  to="/"
                  className="px-8 py-3 border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-colors"
                >
                  Back Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
