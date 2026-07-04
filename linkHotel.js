import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function linkHotel() {
  console.log('Linking hotel to user...');

  // Get the first user in the database
  const { data: users, error: userError } = await supabase.from('users').select('id, email').limit(1);
  
  if (userError || !users || users.length === 0) {
    console.error('No users found in database to link to!');
    return;
  }
  
  const ownerId = users[0].id;
  console.log(`Found user: ${users[0].email} (ID: ${ownerId})`);

  // Update the hotel to belong to this user
  const { data: updateData, error: updateError } = await supabase
    .from('hotels')
    .update({ owner_id: ownerId })
    .not('id', 'is', null) // target all hotels
    .select();

  if (updateError) {
    console.error('Failed to update hotels:', updateError);
  } else {
    console.log(`Successfully linked ${updateData.length} hotels to the user!`);
  }
}

linkHotel();
