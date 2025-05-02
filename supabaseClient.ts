// filepath: c:\Users\localadmin\Desktop\workout_app4\supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase project URL and API key
const SUPABASE_URL = 'https://uplzwvwxfeuyioozfoof.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbHp3dnd4ZmV1eWlvb3pmb29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDI1NTQsImV4cCI6MjA1OTAxODU1NH0.x47YR8kuh7KPOg5ZM2RHsEChJF_yVUUj_CcteVm4LGo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);