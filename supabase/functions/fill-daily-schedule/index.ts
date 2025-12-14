import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
       throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Get current week Monday based on Istanbul time
    const now = new Date()
    // Convert to Istanbul time string to get the correct day relative to station time
    const options = { timeZone: "Europe/Istanbul", year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric' } as const;
    // We just need to know "what day is it in Istanbul" to calculate the Monday
    const istanbulNowString = now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" });
    const istanbulNow = new Date(istanbulNowString);
    
    const day = istanbulNow.getDay()
    const diff = istanbulNow.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(istanbulNow.setDate(diff))
    
    // Format YYYY-MM-DD manually to ensure local date
    const year = monday.getFullYear()
    const month = String(monday.getMonth() + 1).padStart(2, '0')
    const date = String(monday.getDate()).padStart(2, '0')
    const currentWeekMonday = `${year}-${month}-${date}`
    
    console.log(`Checking schedule for week starting: ${currentWeekMonday} (Istanbul Time)`)

    // 2. Fetch all sets
    const { data: sets, error: setsError } = await supabase
      .from('sets')
      .select('id, title, duration, audio_url')
    
    if (setsError) {
       console.error('Error fetching sets:', setsError)
       throw new Error(`Error fetching sets: ${setsError.message}`)
    }
    
    if (!sets || sets.length === 0) {
      console.warn('No sets found.')
      return new Response(
        JSON.stringify({ success: false, message: 'No sets found in database.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`Found ${sets.length} sets.`)

    // 3. Iterate days 0-6 (Monday to Sunday)
    const results = []
    
    for (let dayIdx = 0; dayIdx <= 6; dayIdx++) {
        // Iterate hours 21, 22, 23
        for (let hourIdx = 21; hourIdx <= 23; hourIdx++) {
            const startTime = `${hourIdx}:00:00`
            
            // Check if schedule exists for this day and time
            const { data: existing, error: checkError } = await supabase
                .from('radio_schedule_weekly')
                .select('id')
                .eq('week_start_date', currentWeekMonday)
                .eq('day_of_week', dayIdx)
                .eq('start_time_local', startTime)
                .maybeSingle()
            
            if (checkError) {
                console.error(`Error checking schedule for day ${dayIdx} at ${startTime}:`, checkError)
                results.push({ day: dayIdx, time: startTime, status: 'error', error: checkError.message })
                continue
            }
                
            if (!existing) {
                // Pick random set
                const randomSet = sets[Math.floor(Math.random() * sets.length)]
                const durationMinutes = randomSet.duration ? Math.floor(randomSet.duration / 60) : 60
                
                console.log(`Filling day ${dayIdx} at ${startTime} with set: ${randomSet.title} (${randomSet.id})`)
                
                // Insert
                const { data: inserted, error: insertError } = await supabase
                    .from('radio_schedule_weekly')
                    .insert({
                        week_start_date: currentWeekMonday,
                        day_of_week: dayIdx,
                        start_time_local: startTime,
                        duration_minutes: durationMinutes > 0 ? durationMinutes : 60,
                        content_type: 'set',
                        set_id: randomSet.id,
                        title: randomSet.title,
                        is_active: true,
                        timezone: 'Europe/Istanbul'
                    })
                    .select()
                    
                if (insertError) {
                    console.error(`Error inserting for day ${dayIdx} at ${startTime}:`, insertError)
                    results.push({ day: dayIdx, time: startTime, status: 'error', error: insertError.message })
                } else {
                    results.push({ day: dayIdx, time: startTime, status: 'filled', set: randomSet.title })
                }
            } else {
                results.push({ day: dayIdx, time: startTime, status: 'skipped', reason: 'exists' })
            }
        }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
