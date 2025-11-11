'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import MobileMenu from '@/components/MobileMenu'
import PageHeader, { HeaderButton } from '@/components/PageHeader'
import SendGiftModal from '@/components/SendGiftModal'
import { pageStyles } from '@/lib/constants/pageStyles'
import type { Asset } from '@/lib/types/database.types'

interface DashboardHeaderProps {
  username?: string
  totalNetWorth: number
  profilePhotoUrl?: string | null
  assets: Asset[]
}

export default function DashboardHeader({ username, totalNetWorth, profilePhotoUrl, assets }: DashboardHeaderProps) {
  const [showGiftModal, setShowGiftModal] = useState(false)

  return (
    <>
      <div className="px-6 pt-7 pb-0">
        <PageHeader
          title="My Money"
          buttonColor={pageStyles.dashboard.buttonColor}
          leftAction={
            <MobileMenu
              username={username}
              totalNetWorth={totalNetWorth}
              profilePhotoUrl={profilePhotoUrl}
              buttonColor={pageStyles.dashboard.buttonColor}
              onSendGift={() => setShowGiftModal(true)}
            />
          }
          rightAction={
            <Link href="/dashboard/add-asset?returnUrl=%2Fdashboard">
              <HeaderButton color={pageStyles.dashboard.buttonColor}>
                <Plus className="h-5 w-5" />
              </HeaderButton>
            </Link>
          }
        />
      </div>

      <SendGiftModal
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        username={username || 'Parent'}
      />
    </>
  )
}
