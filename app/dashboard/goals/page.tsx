import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import GoalsClient from '@/components/GoalsClient'

export default async function GoalsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's goal (we'll create a simple goals table)
  const { data: goal } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Default goal if none exists
  const defaultGoal = {
    id: null,
    name: 'Video Game Console',
    target_amount: 450,
    current_amount: 350,
    emoji: '🎮',
    user_id: user.id,
  }

  return <GoalsClient goal={goal || defaultGoal} />
}
