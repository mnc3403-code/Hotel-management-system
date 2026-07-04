import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('Seeding dummy hotel and rooms...');

  // 1. Insert Hotel
  const hotelPayload = {
    name: 'HORIZON SUITES',
    address: 'Main Road 123 Street, 23 Colony',
    contact: '+0123456789',
    city: 'New York',
  };

  const { data: hotelData, error: hotelError } = await supabase
    .from('hotels')
    .insert(hotelPayload)
    .select()
    .single();

  if (hotelError) {
    console.error('Failed to insert hotel:', hotelError);
    return;
  }
  
  console.log('Inserted Hotel with ID:', hotelData.id);

  // 2. Insert Rooms
  const roomsPayload = [
    {
      hotel_id: hotelData.id,
      room_type: 'Double Bed',
      price_per_night: 399,
      amenities: ["Room Service", "Mountain View", "Pool Access"],
      images: ["/src/assets/roomImg1.png", "/src/assets/roomImg2.png", "/src/assets/roomImg3.png", "/src/assets/roomImg4.png"],
      is_available: true
    },
    {
      hotel_id: hotelData.id,
      room_type: 'Double Bed',
      price_per_night: 299,
      amenities: ["Room Service", "Mountain View", "Pool Access"],
      images: ["/src/assets/roomImg2.png", "/src/assets/roomImg3.png", "/src/assets/roomImg4.png", "/src/assets/roomImg1.png"],
      is_available: true
    },
    {
      hotel_id: hotelData.id,
      room_type: 'Double Bed',
      price_per_night: 249,
      amenities: ["Free WiFi", "Free Breakfast", "Room Service"],
      images: ["/src/assets/roomImg3.png", "/src/assets/roomImg4.png", "/src/assets/roomImg1.png", "/src/assets/roomImg2.png"],
      is_available: true
    },
    {
      hotel_id: hotelData.id,
      room_type: 'Single Bed',
      price_per_night: 199,
      amenities: ["Free WiFi", "Room Service", "Pool Access"],
      images: ["/src/assets/roomImg4.png", "/src/assets/roomImg1.png", "/src/assets/roomImg2.png", "/src/assets/roomImg3.png"],
      is_available: true
    }
  ];

  const { data: roomsData, error: roomsError } = await supabase
    .from('rooms')
    .insert(roomsPayload)
    .select();

  if (roomsError) {
    console.error('Failed to insert rooms:', roomsError);
    return;
  }

  console.log(`Inserted ${roomsData.length} rooms successfully!`);
}

seed();
