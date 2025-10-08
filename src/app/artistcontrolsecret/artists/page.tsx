import ArtistControlGuard from "@/components/admin/ArtistControlGuard"
import AdminArtists from '@/pages/AdminArtists'

export default function AdminArtistsPage() {
  return (
    <ArtistControlGuard>
      <AdminArtists />
    </ArtistControlGuard>
  )
}
