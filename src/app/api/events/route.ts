import { NextRequest, NextResponse } from 'next/server'
import { getOurWorkProjects } from '@/lib/supabase-utils'
import { isUpcomingEvent } from '@/lib/event-dates'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const upcomingOnly = searchParams.get('upcoming') === 'true'

    const projects = await getOurWorkProjects()
    
    let filtered = projects
    if (upcomingOnly) {
      filtered = projects.filter(p => isUpcomingEvent(p))
    }

    return NextResponse.json({ events: filtered })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
