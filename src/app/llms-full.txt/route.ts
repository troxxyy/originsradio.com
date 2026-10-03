import { getPublicArtists, getPublicBlogs, getPublicProjects } from '@/lib/public-content'
import { catalogueLink, catalogueText, discoveryOverview, discoveryResponse } from '@/lib/llm-discovery'

export const dynamic = 'force-static'
export const revalidate = 300

export async function GET() {
  const [artists, blogs, projects] = await Promise.all([getPublicArtists(), getPublicBlogs(), getPublicProjects()])
  const sections = [discoveryOverview, '## Artist biographies\n']
  for (const artist of artists.filter(row => row.slug)) {
    sections.push(`### ${catalogueText(artist.name)}\n\nSource: ${catalogueLink(artist.name, `/artists/${encodeURIComponent(artist.slug)}`)}\nLocation: ${catalogueText(artist.location) || 'Not specified'}\nGenres: ${artist.genre?.map(catalogueText).join(', ') || 'Not specified'}\n\n${catalogueText(artist.bio)}\n`)
  }
  sections.push('## Published article summaries\n')
  for (const blog of blogs.filter(row => row.slug)) {
    const summary = catalogueText(blog.excerpt || blog.seo_description || blog.content).slice(0, 600)
    sections.push(`### ${catalogueText(blog.title)}\n\nSource: ${catalogueLink(blog.title, `/blog/${encodeURIComponent(blog.slug)}`)}\n\n${summary}\n`)
  }
  sections.push('## Event descriptions\n\nDates below preserve the source wording. Do not infer a year when it is absent. An upcoming flag alone does not confirm ticket availability; consult the source page.\n')
  for (const project of projects.filter(row => row.slug)) {
    sections.push(`### ${catalogueText(project.title)}\n\nSource: ${catalogueLink(project.title, `/events/${encodeURIComponent(project.slug!)}`)}\nStatus in catalogue: ${project.upcoming ? 'Marked upcoming; check source for current details' : 'Archive'}\nDate as published: ${catalogueText(project.date) || 'Not specified'}\nLocation: ${catalogueText(project.location) || 'Not specified'}\n\n${catalogueText(project.description)}\n`)
  }
  return discoveryResponse(sections.join('\n'))
}
