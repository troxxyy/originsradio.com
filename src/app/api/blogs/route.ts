import { NextRequest, NextResponse } from 'next/server'
import { getPublishedBlogs } from '@/data/blogs-supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const { blogs, total } = await getPublishedBlogs(page, limit)

    return NextResponse.json({ blogs, total, page, limit })
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    )
  }
}
