const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/Booking');
const Property = require('./models/Property');

dotenv.config();

const properties = [
  {
    name: 'Mountain View',
    location: 'Nepal',
    type: 'Hotel',
    rooms: 50,
    pricePerNight: 5000,
    rating: 4.5
  },
  {
    name: 'Lakeside Inn',
    location: 'Pokhara',
    type: 'Resort',
    rooms: 30,
    pricePerNight: 8000,
    rating: 4.8
  },
  {
    name: 'Heritage Hotel',
    location: 'Kathmandu',
    type: 'Hotel',
    rooms: 40,
    pricePerNight: 6000,
    rating: 4.2
  }
];

const bookings = [
  {
    guestName: 'Alice Johnson',
    email: 'alice@example.com',
    propertyName: 'Mountain View',
    checkInDate: new Date('2025-04-18'),
    checkOutDate: new Date('2025-04-20'),
    status: 'Confirmed',
    roomType: 'Deluxe',
    amount: 10000
  },
  {
    guestName: 'Bob Lee',
    email: 'bob@example.com',
    propertyName: 'Lakeside Inn',
    checkInDate: new Date('2025-05-01'),
    checkOutDate: new Date('2025-05-03'),
    status: 'Pending',
    roomType: 'Suite',
    amount: 16000
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    await Property.deleteMany();
    const createdProperties = await Property.insertMany(properties);
    console.log('Properties seeded!');

    await Booking.deleteMany();
    const bookingsWithIds = bookings.map(booking => {
      const property = createdProperties.find(p => p.name === booking.propertyName);
      return { ...booking, propertyId: property._id };
    });
    await Booking.insertMany(bookingsWithIds);
    console.log('Bookings seeded!');

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
