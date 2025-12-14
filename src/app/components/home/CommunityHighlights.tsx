import { Heart, MessageCircle, Share2, Instagram } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

const CommunityHighlights = () => {
  const highlights = [
    {
      id: 1,
      type: 'instagram',
      content: 'Amazing vibes at last night\'s event! Thanks to everyone who came out 🎵',
      image: '/placeholder.svg',
      likes: 234,
      comments: 45,
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      type: 'instagram',
      content: 'New set dropping tomorrow at midnight. Who\'s ready? 🔥',
      image: '/placeholder.svg',
      likes: 189,
      comments: 32,
      timestamp: '5 hours ago'
    },
    {
      id: 3,
      type: 'instagram',
      content: 'Behind the scenes with our resident artists preparing for the weekend 📸',
      image: '/placeholder.svg',
      likes: 312,
      comments: 67,
      timestamp: '1 day ago'
    },
  ]

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Instagram className="w-6 h-6 text-white" />
          Community Highlights
        </h2>
        <a
          href="https://instagram.com/origins.radio"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          Follow us →
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {highlights.map((post, idx) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <Card className="border-white/[0.05] bg-white/[0.015] backdrop-blur-sm hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 overflow-hidden group">
              <CardContent className="p-0">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt="Community post"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <Badge className="absolute top-3 right-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.12]">
                    <Instagram className="w-3 h-3 mr-1" />
                    Instagram
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-sm text-white/80 mb-3 line-clamp-2">
                    {post.content}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-white/60">
                      <span className="flex items-center gap-1 text-xs">
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </span>
                    </div>
                    <span className="text-xs text-white/40">
                      {post.timestamp}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default CommunityHighlights
