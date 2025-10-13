# Weekly Reset Setup Guide

## Quick Start

The radio schedule now automatically resets every Monday! Here's how to set it up and use it.

## Setup Steps

### 1. Apply Database Migration

Run the following command to create the `radio_schedule_weekly` table with weekly reset support:

```bash
cd /Users/sina/Documents/OriginsRadio/origins-radio
supabase migration up
```

Or if you're using the Supabase CLI with a remote project:

```bash
supabase db push
```

This will create:
- The `radio_schedule_weekly` table with `week_start_date` field
- Database indexes for performance
- Helper functions for archiving old schedules

### 2. Test the Admin Panel

1. Navigate to: `/artistcontrolsecret/schedule`
2. You should see:
   - Current week's Monday date displayed at the top
   - "Archive Old" button (archives previous weeks)
   - "Copy to Next Week" button (duplicates current schedule)
   - Empty schedule grid for the current week

### 3. Add Your First Schedule

1. Fill in time slots for the week (Monday-Sunday, 19:00-23:00)
2. For each slot, select:
   - **Content Type**: "Set" (pre-recorded) or "Stream" (live)
   - **Set**: Choose from your uploaded sets (if type is "Set")
   - **Stream URL**: Enter streaming URL (if type is "Stream")
   - **Title**: Display name for the show
   - **Active**: Check to make the slot active
3. Click "Save" on each row

### 4. View the Schedule

Navigate to: `/radio/schedule`

You'll see the weekly grid displaying only the current week's active schedule.

## Weekly Workflow

### Sunday Evening / Monday Morning

**Option 1: Copy Last Week's Schedule**
1. Go to admin panel
2. Click "Copy to Next Week"
3. Adjust any shows that need to change

**Option 2: Create Fresh Schedule**
1. Go to admin panel
2. Fill in the new week's schedule manually
3. Save each entry

### Cleaning Up (Optional)

Once a month, click "Archive Old" to:
- Mark old schedules as inactive
- Keep database clean and fast
- Old data is preserved, just hidden from queries

## How the Weekly Reset Works

### Automatic Display
- **Monday arrives** → System automatically shows Monday's date as the new week start
- **Schedule queries** → Only fetch entries where `week_start_date` matches current week
- **React Query cache** → Automatically updates when week changes (no manual refresh needed)

### What Gets Reset
- The **display** resets (shows empty week if no schedule exists)
- Old schedules **stay in database** (just filtered out)
- Nothing is deleted automatically

### What Doesn't Reset
- Archived schedules (remain in database)
- Sets and artists (unchanged)
- All settings and configurations

## Optional: Automated Archiving

### Setup Supabase Edge Function

1. Deploy the edge function:
```bash
supabase functions deploy archive-old-schedules
```

2. In Supabase Dashboard:
   - Go to Database → Cron Jobs (or Edge Functions)
   - Create new scheduled job
   - Function: `archive-old-schedules`
   - Schedule: `0 1 * * 1` (Every Monday at 1 AM UTC)
   - Save

Now old schedules will be automatically archived every Monday!

## Troubleshooting

### Schedule Not Showing
- Check if `week_start_date` is set correctly (should be current Monday)
- Verify `is_active` is `true`
- Check browser console for errors

### Can't See Old Schedules
- This is expected! Old schedules are filtered out
- To view all schedules, modify the query to remove the `week_start_date` filter

### Copy to Next Week Not Working
- Make sure current week has active schedules
- Check console for errors
- Verify you're authenticated as admin

## API Reference

### Frontend Functions

```typescript
// Get current week's Monday
import { getCurrentWeekMonday } from '@/lib/supabase-utils'
const monday = getCurrentWeekMonday() // "2025-10-13"

// Fetch current week's schedule
import { getAllWeeklyRadioSchedule } from '@/lib/supabase-utils'
const schedule = await getAllWeeklyRadioSchedule()

// Archive old schedules
import { archiveOldRadioSchedules } from '@/lib/supabase-utils'
const result = await archiveOldRadioSchedules()
console.log(`Archived ${result.count} entries`)

// Copy to next week
import { copyScheduleToNextWeek } from '@/lib/supabase-utils'
const result = await copyScheduleToNextWeek()
console.log(`Copied ${result.count} entries`)
```

### Database Functions

```sql
-- Get current week's Monday
SELECT get_current_week_monday();

-- Archive old schedules manually
SELECT archive_old_radio_schedules();

-- View all schedules (including archived)
SELECT * FROM radio_schedule_weekly ORDER BY week_start_date DESC;

-- View only current week
SELECT * FROM radio_schedule_weekly 
WHERE week_start_date = get_current_week_monday() 
AND is_active = true;
```

## Support

For detailed documentation, see: `RADIO_SCHEDULE_WEEKLY_RESET.md`

For issues or questions, check the codebase comments or create an issue.

