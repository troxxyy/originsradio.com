import '../../index.css'

export async function generateStaticParams() {
  // Return only the root route  
  return [{ slug: [] }]
}

// Prevent dynamic params - only generate the routes we specify
export const dynamicParams = false

// Use client component for everything
export default async function CatchAllPage() {
  const { ClientOnly } = await import('../client')
  return <ClientOnly />
}
