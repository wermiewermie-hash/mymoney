import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAssetHistory } from '@/app/actions/assetHistory'
import AccountDetailsClient from '@/components/AccountDetailsClient'

export default async function AccountDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the specific asset
  const { data: asset } = await supabase
    .from('assets')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!asset) {
    redirect('/dashboard/accounts')
  }

  // Fetch all assets to determine color based on sorted order (matching AllAccountsClient)
  const { data: allAssets } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', user.id)

  // Sort assets by type (same as AllAccountsClient)
  const assetsSortedByType = [...(allAssets || [])].sort((a, b) => {
    const order = { stock: 1, cash: 2, debt: 3 }
    return (order[a.type as keyof typeof order] || 2) - (order[b.type as keyof typeof order] || 2)
  })

  // Find the index of the current asset in the sorted list
  const assetIndex = assetsSortedByType.findIndex(a => a.id === id)

  // Fetch asset history
  const assetHistory = await getAssetHistory(id)

  return <AccountDetailsClient asset={asset} assetHistory={assetHistory} assetIndex={assetIndex} />
}
