import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  'https://dsrpvieuxhbtsljbjyuj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzcnB2aWV1eGhidHNsamJqeXVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjMzNjYwMiwiZXhwIjoyMDkxOTEyNjAyfQ.CISmgbKXFf-iKpgIL5FeCiHF_mjw2eG38EPFTDH4tpE'
)