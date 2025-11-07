import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAssets, getSnapshots } from '@/app/actions/assets'
import HistoryClient from '@/components/HistoryClient'

export default async function HistoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const snapshots = await getSnapshots()
  const assets = await getAssets()

  return <HistoryClient snapshots={snapshots} assets={assets} />
}
