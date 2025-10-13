import { useState } from 'react'
import { Mail, CheckCircle, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

const NewsletterSignup = () => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    setIsSubmitted(true)
    setEmail('')

    // Reset after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false)
    }, 5000)
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-white/20 bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-md overflow-hidden relative">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
          
          <CardContent className="p-8 sm:p-12 relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              {/* Icon */}
              <div className="inline-flex p-4 rounded-full bg-white/10 border border-white/20 mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              {/* Heading */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Stay in the Loop
              </h2>
              <p className="text-base sm:text-lg text-white/70 mb-8">
                Get notified about new sets, upcoming events, and exclusive content from Origins Radio
              </p>

              {/* Form */}
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                  >
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/50"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-12 px-8 bg-white hover:bg-white/90 text-black font-semibold border-none"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Subscribing...
                        </span>
                      ) : (
                        'Subscribe'
                      )}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="p-3 rounded-full bg-white/10 border border-white/20">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-lg font-semibold text-white">
                      You're all set! 🎉
                    </p>
                    <p className="text-sm text-white/60">
                      Check your inbox for a confirmation email
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Privacy note */}
              <p className="mt-6 text-xs text-white/40">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  )
}

export default NewsletterSignup
