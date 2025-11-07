import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE() {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete user's assets first (foreign key constraint)
    const { error: assetsError } = await supabase
      .from('assets')
      .delete()
      .eq('user_id', user.id)

    if (assetsError) {
      return NextResponse.json(
        { error: 'Failed to delete user data' },
        { status: 500 }
      )
    }

    // Delete user's snapshots
    const { error: snapshotsError } = await supabase
      .from('snapshots')
      .delete()
      .eq('user_id', user.id)

    if (snapshotsError) {
      return NextResponse.json(
        { error: 'Failed to delete user data' },
        { status: 500 }
      )
    }

    // Delete user's goals if they exist
    await supabase.from('goals').delete().eq('user_id', user.id)

    // Delete user's profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to delete profile' },
        { status: 500 }
      )
    }

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
