'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { GoalHistory } from '@/lib/types/database.types'

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

  // Create history entry if current_amount was updated
  if (currentAmount !== undefined) {
    await createGoalHistory(goalId, currentAmount, new Date().toISOString())
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

  const { data: insertedGoal, error } = await supabase.from('goals').insert({
    user_id: user.id,
    name,
    emoji,
    target_amount: targetAmount,
    current_amount: currentAmount,
  }).select().single()

  if (error) {
    return { error: error.message }
  }

  // Create initial history entry
  if (insertedGoal && currentAmount > 0) {
    await createGoalHistory(insertedGoal.id, currentAmount, new Date().toISOString())
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

// Create goal history entry
async function createGoalHistory(
  goalId: string,
  amount: number,
  changeDate: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase.from('goal_history').insert({
    goal_id: goalId,
    user_id: user.id,
    amount,
    change_date: changeDate,
  })

  if (error) {
    console.error('Error creating goal history:', error)
    return { error: error.message }
  }

  return { success: true }
}

// Get goal history
export async function getGoalHistory(goalId: string): Promise<GoalHistory[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('goal_history')
    .select('*')
    .eq('goal_id', goalId)
    .eq('user_id', user.id)
    .order('change_date', { ascending: true })

  if (error) {
    console.error('Error fetching goal history:', error)
    return []
  }

  return data || []
}
