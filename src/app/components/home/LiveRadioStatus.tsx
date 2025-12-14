'use client'

import { Radio, Play } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { useCurrentRadioSlot } from '@/hooks/use-radio'

const LiveRadioStatus = () => {
  const { currentSlot, isLoading } = useCurrentRadioSlot(5000)
  const isLive = !!currentSlot?.isLiveStream
  const artistName = currentSlot?.item?.set?.artists?.name ?? null
  const currentShow =
    artistName && (currentSlot?.item?.title || '')
      ? `${artistName} — ${currentSlot.item.title}`
      : (currentSlot?.item?.title || 'Origins Radio')

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-white/20 bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-md overflow-hidden relative">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-white/5 opacity-50"></div>
          
          <CardContent className="p-6 sm:p-8 relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Left section */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <Radio className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  {isLive && (
                    <motion.div
                      className="absolute -top-1 -right-1"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <div className="w-5 h-5 rounded-full bg-white border-2 border-black"></div>
                    </motion.div>
                  )}
                </div>
                
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {isLoading ? 'Checking…' : isLive ? 'Live Now' : 'Off Air'}
                    </h3>
                    <Badge 
                      variant={isLive ? "default" : "outline"} 
                      className={`${isLive ? 'bg-white text-black hover:bg-white/90' : 'bg-white/10'} border-none`}
                    >
                      {isLoading ? '...' : isLive ? 'LIVE' : 'OFF AIR'}
                    </Badge>
                  </div>
                  <p className="text-white/70 text-sm sm:text-base">
                    {isLive ? currentShow : 'Check our sets below'}
                  </p>
                </div>
              </div>

              {/* Right section */}
              <a
                href="#upnext"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-colors group"
              >
                <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Listen Now</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  )
}

export default LiveRadioStatus
