import { discoveryOverview, discoveryResponse } from '@/lib/llm-discovery'

export const dynamic = 'force-static'

export function GET() {
  return discoveryResponse(discoveryOverview)
}
