import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAssets, getTotalNetWorth, getSnapshots } from '@/app/actions/assets'
import { getGoals } from '@/app/actions/goals'
import { getProfile } from '@/app/actions/profile'
import Link from 'next/link'
import { Menu, Plus } from 'lucide-react'
import MobileMenu from '@/components/MobileMenu'
import DashboardClient from '@/components/DashboardClient'
import PageHeader, { HeaderButton } from '@/components/PageHeader'
import { pageStyles } from '@/lib/constants/pageStyles'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getProfile()
  const assets = await getAssets()
  const totalNetWorth = await getTotalNetWorth()
  const snapshots = await getSnapshots()
  const goal = await getGoals()

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="px-6 pt-7 pb-0">
        <PageHeader
          title="My Money"
          buttonColor={pageStyles.dashboard.buttonColor}
          leftAction={
            <MobileMenu
              username={profile?.username || undefined}
              totalNetWorth={totalNetWorth}
              profilePhotoUrl={profile?.profile_photo_url}
              buttonColor={pageStyles.dashboard.buttonColor}
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

      {/* Dashboard Content */}
      <DashboardClient
        totalNetWorth={totalNetWorth}
        assets={assets}
        snapshots={snapshots}
        goal={goal}
        hasSeenWelcome={profile?.has_seen_welcome ?? true}
      />
    </div>
  )
}
