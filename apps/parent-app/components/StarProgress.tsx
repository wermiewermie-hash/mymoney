'use client'

import { motion } from 'motion/react'
import { svgPaths } from '@/lib/svgPaths'

interface StarProgressProps {
  progress: number // 0-100
  size?: number
  inView?: boolean
  celebrate?: boolean
}

export default function StarProgress({ progress, size = 160, inView = true, celebrate = false }: StarProgressProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress))

  // Calculate the wavy mask position based on progress
  // The star path coordinates range from approximately y=7.48 (top) to y=153.8 (bottom)
  // The mask's wavy top edge starts at y=77.8593
  const starTop = 7.48
  const starBottom = 153.8
  const starHeight = starBottom - starTop
  const maskTop = 77.8593
  const overshoot = 15 // Extra pixels to push beyond the top at 100%

  // Calculate where the wavy line should be positioned to show the correct fill percentage
  // At 0% progress: wavy line at bottom of star (no fill visible)
  // At 100% progress: wavy line overshoots above the star (ensures complete fill)
  const targetY = starBottom - (clampedProgress / 100) * (starHeight + overshoot)

  // Calculate translation needed to move mask from its original position to target
  const translateY = targetY - maskTop

  return (
    <div className="relative flex items-center justify-center" style={{ width: '180px', height: '180px' }}>
      <svg
        viewBox="0 0 183 163"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Outer drop shadow filter for entire star */}
          <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="169.796" id="filter0_d" width="191.837" x="-4.89796" y="-1.92947">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
            <feMorphology in="SourceAlpha" operator="dilate" radius="2.44898" result="effect1_dropShadow" />
            <feOffset dy="1.63265" />
            <feGaussianBlur stdDeviation="1.22449" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
            <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow" />
            <feBlend in="SourceGraphic" in2="effect1_dropShadow" mode="normal" result="shape" />
          </filter>

          {/* Inner shadow filter for background star */}
          <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="156.101" id="filter1_i" width="158.664" x="11.688" y="3.26531">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
            <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
            <feOffset dy="4.89796" />
            <feGaussianBlur stdDeviation="3.26531" />
            <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.662745 0 0 0 0 0.239216 0 0 0 0.09 0" />
            <feBlend in2="shape" mode="normal" result="effect1_innerShadow" />
          </filter>

          {/* Double inner shadow filter for filled star - no drop shadow, using parent filter0_d */}
          <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="156.101" id="filter2_ii" width="161.929" x="11.6882" y="3.26536">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
            <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
            <feOffset dy="4.89796" />
            <feGaussianBlur stdDeviation="6.12245" />
            <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.932298 0 0 0 0 0.572209 0 0 0 0 0.120004 0 0 0 1 0" />
            <feBlend in2="shape" mode="normal" result="effect1_innerShadow" />
            <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
            <feOffset dx="3.26531" />
            <feGaussianBlur stdDeviation="1.63265" />
            <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
            <feBlend in2="effect1_innerShadow" mode="normal" result="effect2_innerShadow" />
          </filter>

          {/* Gradient for filled star */}
          <linearGradient gradientUnits="userSpaceOnUse" id="starFillGradient" x1="142.041" x2="66.1222" y1="149.907" y2="70.3956">
            <stop offset="0.492215" stopColor="#FBBF24" />
            <stop offset="0.831731" stopColor="#FFD740" />
          </linearGradient>

          {/* Wavy mask for progress - animates from bottom to top */}
          <mask height="300" id="progressMask" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" } as React.CSSProperties} width="180" x="0" y="0">
            <motion.g
              initial={{ y: starHeight }}
              animate={{ y: inView ? translateY : starHeight }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              {/* Wavy top edge */}
              <path
                d={svgPaths.p30494080}
                fill="#D9D9D9"
                stroke="white"
                strokeWidth="0.816326"
              />
              {/* Extended rectangle to ensure bottom of star is always filled */}
              <rect
                x="0"
                y="155.622"
                width="180"
                height="200"
                fill="#D9D9D9"
              />
            </motion.g>
          </mask>
        </defs>

        <motion.g
          filter="url(#filter0_d)"
          animate={celebrate ? {
            rotate: [0, -8, 8, -6, 6, -4, 4, 0]
          } : {}}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
            delay: 0.7
          }}
          style={{ transformOrigin: '91px 81px' }}
        >
          {/* Background star with inner shadow */}
          <g filter="url(#filter1_i)">
            <motion.path
              d={svgPaths.p3ef0a00}
              fill="#FEF5D1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: inView ? 1 : 0, scale: inView ? 1 : 0.8 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ transformOrigin: '91px 81px' }}
            />
          </g>

          {/* Filled star with wavy mask and double inner shadows */}
          <g mask="url(#progressMask)">
            <g filter="url(#filter2_ii)">
              <motion.path
                d={svgPaths.p28cbaa00}
                fill="url(#starFillGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: inView ? 1 : 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              />
            </g>
          </g>
        </motion.g>
      </svg>
    </div>
  )
}
