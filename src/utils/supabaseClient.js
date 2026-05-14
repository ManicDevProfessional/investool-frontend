import { createClient } from '@supabase/supabase-js'

// You will get these two URLs from your free Supabase dashboard once you create a project
const supabaseUrl = 'https://kkxaqjfemhfnasozpuqp.supabase.co'
const supabaseKey = 'sb_publishable_-0X3Ve5m_oDxqug78IPYmQ_q9wGAbyA'

export const supabase = createClient(supabaseUrl, supabaseKey)