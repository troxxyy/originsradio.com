import ArtistControlGuard from "@/components/admin/ArtistControlGuard"
import AdminRadioSchedule from '@/pages/AdminRadioSchedule'

export default function AdminSchedulePage() {
  return (
    <ArtistControlGuard>
      <AdminRadioSchedule />
    </ArtistControlGuard>
  )
}
