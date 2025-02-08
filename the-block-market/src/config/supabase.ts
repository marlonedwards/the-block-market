import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://knmltwmxgvzkreywydct.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubWx0d214Z3Z6a3JleXd5ZGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5OTU1MDcsImV4cCI6MjA1NDU3MTUwN30.I3GmrzKLmbsKDDffzpf7ySOb-O6DJ0fIwP38cPG2CKU"

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)