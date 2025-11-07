import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAssets, getTotalNetWorth, getSnapshots } from '@/app/actions/assets'
import { getGoals } from '@/app/actions/goals'
import { getProfile } from '@/app/actions/profile'
import Link from 'next/link'
import MobileMenu from '@/components/MobileMenu'
import DashboardClient from '@/components/DashboardClient'

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
      <div className="px-6 pt-8 pb-0">
        <div className="flex items-center justify-between mb-8">
          <MobileMenu
            username={profile?.username || undefined}
            totalNetWorth={totalNetWorth}
            profilePhotoUrl={profile?.profile_photo_url}
          />

          <h1 className="text-white text-2xl [text-shadow:rgba(0,0,0,0.1)_0px_4px_6px]">My Money</h1>

          <Link
            href="/dashboard/add-asset"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FFA93D] to-[#FFD740] hover:opacity-90 text-white shadow-md transition-opacity"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
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
