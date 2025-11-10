import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EditAssetForm from '@/components/EditAssetForm'

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: asset, error } = await supabase
    .from('assets')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !asset) {
    redirect('/dashboard')
  }

  return <EditAssetForm asset={asset} />
}
