import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCash } from '@/app/actions/kidsAssets'
import CashForm from '@/components/CashForm'
import PageHeader, { HeaderButton } from '@/components/PageHeader'
import { ArrowLeft } from 'lucide-react'
import { pageStyles } from '@/lib/constants/pageStyles'

export default async function CashPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const cash = await getCash()

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <div className="px-6 pt-7 pb-7">
        <PageHeader
          title={cash ? 'Update Cash' : 'Add Cash'}
          buttonColor={pageStyles.dashboard.buttonColor}
          leftAction={
            <a href="/dashboard">
              <HeaderButton color={pageStyles.dashboard.buttonColor}>
                <ArrowLeft className="h-5 w-5" />
              </HeaderButton>
            </a>
          }
        />
      </div>

      {/* Form */}
      <div className="px-6">
        <CashForm existingCash={cash} />
      </div>
    </div>
  )
}
