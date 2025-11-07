import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAssets } from '@/app/actions/assets'
import { getAssetHistory } from '@/app/actions/assetHistory'
import AllAccountsClient from '@/components/AllAccountsClient'

export default async function AllAccountsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const assets = await getAssets()

  // Get historical data for each asset
  const assetsWithHistory = await Promise.all(
    assets.map(async (asset) => {
      const history = await getAssetHistory(asset.id)
      return {
        ...asset,
        history,
      }
    })
  )

  return <AllAccountsClient assets={assetsWithHistory} />
}
