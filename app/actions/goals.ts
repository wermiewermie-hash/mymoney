'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getGoals() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: goal } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return goal
}

export async function updateGoal(goalId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const emoji = formData.get('emoji') as string
  const targetAmount = formData.get('targetAmount') ? parseFloat(formData.get('targetAmount') as string) : undefined
  const currentAmount = formData.get('currentAmount') ? parseFloat(formData.get('currentAmount') as string) : undefined

  const updates: any = {}
  if (name) updates.name = name
  if (emoji) updates.emoji = emoji
  if (targetAmount !== undefined) updates.target_amount = targetAmount
  if (currentAmount !== undefined) updates.current_amount = currentAmount

  const { error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', goalId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/goals')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function createGoal(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const emoji = formData.get('emoji') as string
  const targetAmount = parseFloat(formData.get('targetAmount') as string)
  const currentAmount = parseFloat(formData.get('currentAmount') as string) || 0

  const { error } = await supabase.from('goals').insert({
    user_id: user.id,
    name,
    emoji,
    target_amount: targetAmount,
    current_amount: currentAmount,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/goals')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteGoal(goalId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/goals')
  revalidatePath('/dashboard')
  return { success: true }
}
