import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zhijysxahvwvtnhywkjb.supabase.co"; 
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoaWp5c3hhaHZ3dnRuaHl3a2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4OTkyODIsImV4cCI6MjA4MjQ3NTI4Mn0.C8hTflgunbLH-nprzyM3DNUJCdQe2y2iqESxz1WvuYc"; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
