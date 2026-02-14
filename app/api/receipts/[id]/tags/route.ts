import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/receipts/[id]/tags - Get tags for a receipt
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify receipt belongs to user
    const { data: receipt, error: receiptError } = await supabase
      .from('receipts')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (receiptError || !receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    // Get tags for the receipt
    const { data: receiptTags, error } = await supabase
      .from('receipt_tags')
      .select(
        `
        tag_id,
        created_at,
        tags (
          id,
          name,
          color
        )
      `,
      )
      .eq('receipt_id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    type ReceiptTagWithTags = {
      tag_id: string
      created_at: string
      tags: {
        id: string
        name: string
        color: string
      }
    }

    return NextResponse.json(
      (receiptTags as ReceiptTagWithTags[])?.map((rt) => rt.tags) || [],
    )
  } catch (error) {
    console.error('Error fetching receipt tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch receipt tags' },
      { status: 500 },
    )
  }
}

// POST /api/receipts/[id]/tags - Add a tag to a receipt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { tagId } = body

    if (!tagId) {
      return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 })
    }

    // Verify receipt belongs to user
    const { data: receipt } = await supabase
      .from('receipts')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    // Verify tag belongs to user
    const { data: tag } = await supabase
      .from('tags')
      .select('id')
      .eq('id', tagId)
      .eq('user_id', user.id)
      .single()

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // Add tag to receipt
    const { error } = await supabase.from('receipt_tags').insert({
      receipt_id: id,
      tag_id: tagId,
    })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Tag already added to receipt' },
          { status: 400 },
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding tag to receipt:', error)
    return NextResponse.json(
      { error: 'Failed to add tag to receipt' },
      { status: 500 },
    )
  }
}

// DELETE /api/receipts/[id]/tags - Remove a tag from a receipt
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const tagId = searchParams.get('tagId')

    if (!tagId) {
      return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 })
    }

    // Remove tag from receipt
    const { error } = await supabase
      .from('receipt_tags')
      .delete()
      .eq('receipt_id', id)
      .eq('tag_id', tagId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing tag from receipt:', error)
    return NextResponse.json(
      { error: 'Failed to remove tag from receipt' },
      { status: 500 },
    )
  }
}
