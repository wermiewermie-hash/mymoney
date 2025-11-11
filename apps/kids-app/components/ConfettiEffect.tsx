'use client'

import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiEffectProps {
  trigger: boolean
  onComplete?: () => void
}

export function ConfettiEffect({ trigger, onComplete }: ConfettiEffectProps) {
  const prevTrigger = useRef(false)
  const animationRunning = useRef(false)

  useEffect(() => {
    // Only start if trigger changed from false to true and animation is not already running
    if (trigger && !prevTrigger.current && !animationRunning.current) {
      console.log('🎉 Confetti triggered!')
      animationRunning.current = true

      const duration = 500 // 0.5 seconds
      const animationEnd = Date.now() + duration
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 99999,
        disableForReducedMotion: true
      }

      // Fire an initial big burst immediately
      confetti({
        ...defaults,
        particleCount: 100,
        origin: { x: 0.5, y: 0.5 }
      })

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          clearInterval(interval)
          animationRunning.current = false
          console.log('✅ Confetti complete!')
          if (onComplete) {
            onComplete()
          }
          return
        }

        const particleCount = 50 * (timeLeft / duration)

        // Single burst from the center of the screen
        confetti({
          ...defaults,
          particleCount,
          origin: { x: 0.5, y: 0.5 }
        })
      }, 50)

      return () => {
        clearInterval(interval)
        animationRunning.current = false
      }
    }

    // Update previous trigger value
    prevTrigger.current = trigger
  }, [trigger, onComplete])

  return null
}
