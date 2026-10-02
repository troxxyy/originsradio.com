import RadioScheduleClient from './RadioScheduleClient'
import { getPublicSchedule } from '@/lib/public-content'
import { absoluteUrl, pageMetadata } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'

export const revalidate = 60
export const metadata = pageMetadata('Weekly Radio Schedule & DJ Sets', 'See the OriginsRadio weekly programme: resident DJs, guest mixes and electronic music sets. Programme times are shown in Europe/Istanbul time.', '/radio/schedule')

export default async function RadioSchedulePage() {
  const schedule = await getPublicSchedule()
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'OriginsRadio Weekly Radio Schedule', url: absoluteUrl('/radio/schedule') }} />
    <RadioScheduleClient initialSchedule={schedule} />
  </>
}
