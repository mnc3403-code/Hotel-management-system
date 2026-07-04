import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '@clerk/clerk-react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user } = useUser();
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [dbUser, setDbUser] = useState(null);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [currency] = useState('$');

  // Fetch current user from Supabase by email
  useEffect(() => {
    const fetchDbUser = async () => {
      if (!user) { setDbUser(null); return; }
      const email = user.primaryEmailAddress?.emailAddress;
      if (!email) return;
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      if (data) setDbUser(data);
    };
    fetchDbUser();
  }, [user]);

  // Fetch all rooms with hotel info
  const fetchRooms = async () => {
    setLoadingRooms(true);
    const { data, error } = await supabase
      .from('rooms')
      .select('*, hotels(*)')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setRooms(data);
    } else {
      // Fallback to dummy data
      const { roomsDummyData } = await import('../assets/assets');
      const normalizedRooms = roomsDummyData.map(r => ({
        ...r,
        id: r._id,
        room_type: r.roomType,
        price_per_night: r.pricePerNight,
        is_available: r.isAvailable,
        hotel_id: r.hotel?._id,
        hotels: r.hotel ? { ...r.hotel, id: r.hotel._id } : null,
      }));
      setRooms(normalizedRooms);
    }
    setLoadingRooms(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Fetch user bookings when dbUser is available
  const fetchUserBookings = async () => {
    if (!dbUser?.id) { setBookings([]); return; }
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms (*, hotels(*)),
        hotels (*)
      `)
      .eq('user_id', dbUser.id)
      .order('created_at', { ascending: false });

    if (!error && data) setBookings(data);
  };

  useEffect(() => {
    fetchUserBookings();
  }, [dbUser]);

  return (
    <AppContext.Provider value={{
      rooms, setRooms, fetchRooms,
      hotels, setHotels,
      bookings, setBookings, fetchUserBookings,
      dbUser, setDbUser,
      loadingRooms,
      currency,
      supabase,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
