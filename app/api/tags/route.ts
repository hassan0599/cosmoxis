import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSubscriptionWithUsage } from '@/lib/stripe/subscription'
import type { TagInsert } from '@/types/database'

// GET /api/tags - Get all tags for the current user
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: tags, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(tags || [])
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to tags (Pro+ feature)
    const { limits } = await getSubscriptionWithUsage(user.id)

    if (!limits.customCategories && limits.customCategories !== Infinity) {
      // Free plan doesn't have tags
      return NextResponse.json(
        {
          error:
            'Tags are available on Pro and Business plans. Upgrade to create tags.',
        },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { name, color } = body as TagInsert

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 },
      )
    }

    // Check if tag name already exists
    const { data: existingTag } = await supabase
      .from('tags')
      .select('id')
      .eq('user_id', user.id)
      .ilike('name', name)
      .single()

    if (existingTag) {
      return NextResponse.json(
        { error: 'A tag with this name already exists' },
        { status: 400 },
      )
    }

    // Create the tag
    const { data: tag, error: insertError } = await supabase
      .from('tags')
      .insert({
        user_id: user.id,
        name: name.trim(),
        color: color || '#9CA3AF',
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
  }
}
