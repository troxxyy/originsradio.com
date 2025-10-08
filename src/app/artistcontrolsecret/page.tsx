import ArtistControlGuard from "@/components/admin/ArtistControlGuard"
import AdminArtists from '@/pages/AdminArtists'

export default function ArtistControlPage() {
  return (
    <ArtistControlGuard>
      <AdminArtists />
    </ArtistControlGuard>
  )
}
