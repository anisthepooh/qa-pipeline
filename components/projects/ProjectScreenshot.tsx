'use client'

import { useState } from 'react'
import { Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

export const PROJECT_COLORS = [
  'bg-linear-to-br from-green-100 to-green-300',
  'bg-linear-to-br from-blue-100 to-blue-300',
  'bg-linear-to-br from-violet-100 to-violet-300',
  'bg-linear-to-br from-rose-100 to-rose-300',
  'bg-linear-to-br from-amber-100 to-amber-300',
  'bg-linear-to-br from-emerald-100 to-emerald-300',
]

type Status = 'loading' | 'loaded' | 'errored'

function buildMicrolinkUrl(url: string) {
  const params = new URLSearchParams({
    url,
    screenshot: 'true',
    meta: 'false',
    embed: 'screenshot.url',
    colorScheme: 'light',
    'viewport.isMobile': 'false',
    'viewport.deviceScaleFactor': '1',
    'viewport.width': '1200',
    'viewport.height': '750',
  })
  return `https://api.microlink.io/?${params.toString()}`
}

export function ProjectScreenshot({ url, color }: { url: string; color?: number }) {
  const [status, setStatus] = useState<Status>('loading')
  const thumbUrl = buildMicrolinkUrl(url)
  const bg = PROJECT_COLORS[color ?? 0] ?? PROJECT_COLORS[0]

  return (
    <div className="w-full h-36 overflow-hidden relative flex-shrink-0">
      <div className={cn('pt-3 px-3 w-full h-full', bg)}>
        <AnimatePresence mode="wait">
          {status === 'errored' ? (
            <motion.div
              key="fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 bg-white rounded-t-md"
            >
              <Globe className="w-6 h-6" />
              <span className="text-[11px]">No preview</span>
            </motion.div>
          ) : (
            <div key="screenshot" className="w-full h-full relative">
              {/* Shimmer skeleton while loading */}
              <AnimatePresence>
                {status === 'loading' && (
                  <motion.div
                    key="shimmer"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 rounded-t-md overflow-hidden bg-white/60"
                  >
                    <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.img
                src={thumbUrl}
                alt=""
                initial={{ opacity: 0, scale: 0.98, y: 6 }}
                animate={status === 'loaded' ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="w-full h-full object-cover object-top rounded-t-md"
                onLoad={() => setStatus('loaded')}
                onError={() => setStatus('errored')}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
