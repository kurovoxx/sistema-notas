import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gqiwdaoimqnugobzawzc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxaXdkYW9pbXFudWdvYnphd3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDY2OTIsImV4cCI6MjA2NzA4MjY5Mn0.OKVJtgPJs7GkqrMy3XfiStxZqtkxyCYahNsKUOobPLk';
export const supabase = createClient(supabaseUrl, supabaseKey);
