import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getGoogleStock, getCash, getTotalNetWorth, getSnapshots } from '@/app/actions/kidsAssets'
import { getGoals } from '@/app/actions/goals'
import { getProfile } from '@/app/actions/profile'
import MobileMenu from '@/components/MobileMenu'
import KidsDashboardClient from '@/components/KidsDashboardClient'
import PageHeader from '@/components/PageHeader'
import { pageStyles } from '@/lib/constants/pageStyles'

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
  const googleStock = await getGoogleStock()
  const cash = await getCash()
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
        />
      </div>

      {/* Dashboard Content */}
      <KidsDashboardClient
        totalNetWorth={totalNetWorth}
        googleStock={googleStock}
        cash={cash}
        snapshots={snapshots}
        goal={goal}
      />
    </div>
  )
}
