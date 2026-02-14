import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const id = searchParams.get('id')

    // If ID is provided, fetch single receipt
    if (id) {
      const { data: receipt, error: fetchError } = await supabase
        .from('receipts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        console.error('Database fetch error:', fetchError)
        return NextResponse.json(
          { error: 'Failed to fetch receipt' },
          { status: 500 },
        )
      }

      return NextResponse.json({ receipts: receipt ? [receipt] : [] })
    }

    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('receipts')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (search) {
      query = query.ilike('merchant_name', `%${search}%`)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (startDate) {
      query = query.gte('date', startDate)
    }

    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data: receipts, error: fetchError, count } = await query

    if (fetchError) {
      console.error('Database fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch receipts' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      receipts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Fetch receipts error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to fetch receipts'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Receipt ID is required' },
        { status: 400 },
      )
    }

    // Get receipt to find image path
    const { data: receipt } = await supabase
      .from('receipts')
      .select('image_url')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    // Delete receipt from database
    const { error: deleteError } = await supabase
      .from('receipts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Database delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete receipt' },
        { status: 500 },
      )
    }

    // Delete image from storage if exists
    if (receipt?.image_url) {
      const urlParts = receipt.image_url.split('/')
      const fileName = `${user.id}/${urlParts[urlParts.length - 1]}`
      await supabase.storage.from('receipt-images').remove([fileName])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete receipt error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to delete receipt'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, merchant_name, date, total_amount, currency, category, notes } =
      body

    if (!id) {
      return NextResponse.json(
        { error: 'Receipt ID is required' },
        { status: 400 },
      )
    }

    const { data: receipt, error: updateError } = await supabase
      .from('receipts')
      .update({
        merchant_name,
        date,
        total_amount,
        currency,
        category,
        notes,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update receipt' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, receipt })
  } catch (error) {
    console.error('Update receipt error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to update receipt'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
