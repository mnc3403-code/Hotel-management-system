import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const hotelId = '1683aa18-7b60-4fae-9548-124d914813a3'; // HORIZON SUITES

async function insertRooms() {
  const newRooms = [
    {
      hotel_id: hotelId,
      room_type: "Presidential Suite",
      price_per_night: 1299,
      amenities: ["Free WiFi", "Free Breakfast", "Room Service", "Pool Access", "Mountain View"],
      images: [
        "/src/assets/presidential_suite_new.png",
        "/src/assets/roomImg4.png",
        "/src/assets/roomImg2.png",
        "/src/assets/roomImg3.png"
      ],
      is_available: true
    },
    {
      hotel_id: hotelId,
      room_type: "Family Suite",
      price_per_night: 599,
      amenities: ["Free WiFi", "Free Breakfast", "Room Service", "Pool Access"],
      images: [
        "/src/assets/family_suite_new.png",
        "/src/assets/roomImg2.png",
        "/src/assets/roomImg1.png",
        "/src/assets/roomImg4.png"
      ],
      is_available: true
    }
  ];

  const { data, error } = await supabase.from('rooms').insert(newRooms).select();
  if (error) {
    console.error("Error inserting rooms:", error);
  } else {
    console.log("Successfully inserted rooms:", data);
  }
}

insertRooms();
