import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAssets, getTotalNetWorth, getSnapshots } from '@/app/actions/assets'
import { getGoals } from '@/app/actions/goals'
import { getProfile } from '@/app/actions/profile'
import DashboardClient from '@/components/DashboardClient'
import DashboardHeader from '@/components/DashboardHeader'

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic'

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
      <DashboardHeader
        username={profile?.username || undefined}
        totalNetWorth={totalNetWorth}
        profilePhotoUrl={profile?.profile_photo_url}
        assets={assets}
      />

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
