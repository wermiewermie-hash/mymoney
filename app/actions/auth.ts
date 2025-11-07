'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const username = formData.get('username') as string
  const password = formData.get('password') as string

  // Create a service role client to bypass RLS for username lookup
  const serviceSupabase = await createClient()

  // Look up the email from the username (using service role to bypass RLS)
  const { data: profile, error: lookupError } = await serviceSupabase
    .from('profiles')
    .select('email')
    .eq('username', username)
    .maybeSingle()

  if (lookupError || !profile || !profile.email) {
    return { error: 'Invalid username or password' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password,
  })

  if (error) {
    return { error: 'Invalid username or password' }
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
