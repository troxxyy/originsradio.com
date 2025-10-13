# Radio Schedule Weekly Reset System

## Overview

The radio schedule is designed to reset every week on **Monday**. This ensures that each week starts with a fresh schedule, and old schedules are automatically archived.

## How It Works

### 1. Week Tracking
- Every schedule entry has a `week_start_date` field that stores the Monday of the week it belongs to
- When displaying or fetching schedules, only the current week's schedule is shown
- The current week's Monday is calculated automatically based on the system date

### 2. Automatic Reset
The schedule "resets" automatically by:
- Only showing schedules where `week_start_date` matches the current week's Monday
- When Monday arrives, the system will automatically show a new (empty) week
- Old schedules remain in the database but are filtered out from display

### 3. Schedule Management

#### Admin Panel Features
Located at: `/artistcontrolsecret/schedule`

**Current Week Display:**
- Shows the current week's Monday date at the top of the page
- All schedule entries are for the current week only

**Archive Old Schedules Button:**
- Sets `is_active = false` for all schedules from previous weeks
- Useful for keeping the database clean
- Can be run manually when needed

**Copy to Next Week Button:**
- Duplicates the current week's schedule to next week
- Useful when you want to keep the same schedule pattern
- Automatically sets the correct `week_start_date` for next week

### 4. Database Functions

**`get_current_week_monday()`**
- Returns the Monday of the current week as a date
- Used in queries to filter by current week

**`archive_old_radio_schedules()`**
- Deactivates all schedules from previous weeks
- Sets `is_active = false` for old entries

### 5. Edge Function (Optional Automation)

A Supabase Edge Function is available at: `supabase/functions/archive-old-schedules/index.ts`

This can be triggered:
- Manually via HTTP request
- Via a cron job every Monday morning
- Via Supabase's scheduled functions

To set up automatic archiving:
1. Deploy the edge function to Supabase
2. Set up a cron trigger in Supabase Dashboard
3. Schedule it to run every Monday at midnight (or desired time)

Example cron expression for Monday at 1 AM UTC:
```
0 1 * * 1
```

## Usage Guide

### For Admins

#### Setting Up a New Week's Schedule
1. Go to `/artistcontrolsecret/schedule`
2. You'll see the current week's schedule (Monday to Sunday)
3. Fill in the schedule for each day and time slot
4. Click "Save" on each row to save the entry

#### Copying Schedule to Next Week
1. On Sunday or early Monday, click "Copy to Next Week"
2. This will duplicate the current week's schedule to next week
3. You can then make adjustments for the next week

#### Archiving Old Schedules
1. Click "Archive Old" to deactivate previous weeks' schedules
2. This helps keep the database clean and performant
3. Old schedules are not deleted, just marked as inactive

### For Developers

#### Querying the Current Week's Schedule
```typescript
import { getAllWeeklyRadioSchedule } from '@/lib/supabase-utils'

// This automatically filters by current week
const scheduleData = await getAllWeeklyRadioSchedule()
```

#### Getting Current Week's Monday
```typescript
import { getCurrentWeekMonday } from '@/lib/supabase-utils'

const currentWeekMonday = getCurrentWeekMonday() // Returns: "2025-10-13"
```

#### Creating a Schedule Entry
```typescript
import { upsertWeeklyRadioSchedule } from '@/lib/supabase-utils'

await upsertWeeklyRadioSchedule({
  day_of_week: 0, // Monday
  start_time_local: '19:00',
  duration_minutes: 60,
  content_type: 'set',
  set_id: 'some-set-id',
  title: 'Evening Show',
  timezone: 'Europe/Istanbul',
  is_active: true,
  // week_start_date is automatically set to current week if not provided
})
```

## Database Schema

### `radio_schedule_weekly` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `day_of_week` | integer | 0 = Monday, 6 = Sunday |
| `start_time_local` | text | Local time in HH:mm format |
| `duration_minutes` | integer | Duration of the slot |
| `content_type` | text | 'set' or 'stream' |
| `set_id` | uuid | Foreign key to sets table (nullable) |
| `stream_url` | text | URL for live streams (nullable) |
| `title` | text | Display title |
| `timezone` | text | Timezone (default: Europe/Istanbul) |
| `is_active` | boolean | Whether the schedule is active |
| `week_start_date` | date | Monday of the week (YYYY-MM-DD) |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

### Indexes
- `idx_radio_schedule_week_start` on `week_start_date`
- `idx_radio_schedule_active` on `is_active`
- `idx_radio_schedule_week_active` composite on `(week_start_date, is_active)`

## Migration

To apply the database schema:

```bash
# Run the migration
supabase migration up
```

The migration file is: `supabase/migrations/20251013100000_create_radio_schedule_weekly.sql`

## React Query Cache

The schedule query is cached with the current week's Monday in the query key:
```typescript
queryKey: ['radio_schedule_weekly', getCurrentWeekMonday()]
```

This means:
- When a new week starts, the query key changes automatically
- React Query will fetch the new week's schedule
- No manual cache invalidation needed for week changes

## Best Practices

1. **Set up schedules in advance**: Use "Copy to Next Week" on Sundays
2. **Archive regularly**: Run "Archive Old" periodically to keep database clean
3. **Timezone awareness**: All times are in Europe/Istanbul timezone by default
4. **Backup**: Old schedules are never deleted, only deactivated

