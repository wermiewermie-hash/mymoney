import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { username, email, newPassword } = await request.json()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update username in profiles table
    if (username !== undefined) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id)

      if (profileError) {
        return NextResponse.json(
          { error: 'Failed to update username' },
          { status: 500 }
        )
      }
    }

    // Update email if changed
    if (email && email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email,
      })

      if (emailError) {
        return NextResponse.json(
          { error: 'Failed to update email' },
          { status: 500 }
        )
      }
    }

    // Update password if provided
    if (newPassword) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (passwordError) {
        return NextResponse.json(
          { error: 'Failed to update password' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
