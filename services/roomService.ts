import { supabase } from '../supabase';

export const fetchFreeRooms = async (dateStr: string, startTimeStr: string, endTimeStr: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_free_rooms', {
        query_date: dateStr,
        query_start_time: startTimeStr,
        query_end_time: endTimeStr
      });

    if (error) {
      console.error('Supabase RPC Error:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Network/Fetch Error:', error);
    return [];
  }
};