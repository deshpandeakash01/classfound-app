import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ocrgnfwoykebyppwwimy.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jcmduZndveWtlYnlwcHd3aW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzkzNjAsImV4cCI6MjA5MjQxNTM2MH0.TP_96t9VLHvMjx8bZlyzWDYnaaoE2JpJ4r8tsIrMsnw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
