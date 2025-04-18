
import { createClient } from '@supabase/supabase-js';

// Define the Supabase URL and key explicitly
const supabaseUrl = 'https://pswgsxyxhdhhpvugkdqa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzd2dzeHl4aGRoaHB2dWdrZHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMDU5MjUsImV4cCI6MjA1Nzc4MTkyNX0.IiJhneDLCqOqrDRnf6xarWnlGucKJ1qcY8Kh1WbGT6M';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: true,
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' },
  },
});
