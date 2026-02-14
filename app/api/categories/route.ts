import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSubscriptionWithUsage } from '@/lib/stripe/subscription'
import type { CustomCategoryInsert } from '@/types/database'

// Default categories that come with the system
export const DEFAULT_CATEGORIES = [
  { name: 'Meals', color: '#EF4444', icon: 'utensils' },
  { name: 'Travel', color: '#3B82F6', icon: 'plane' },
  { name: 'Office', color: '#10B981', icon: 'briefcase' },
  { name: 'Utilities', color: '#F59E0B', icon: 'zap' },
  { name: 'Other', color: '#6B7280', icon: 'more-horizontal' },
] as const

// GET /api/categories - Get all categories (default + custom)
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

    // Get custom categories
    const { data: customCategories, error } = await supabase
      .from('custom_categories')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return both default and custom categories
    return NextResponse.json({
      default: DEFAULT_CATEGORIES,
      custom: customCategories || [],
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 },
    )
  }
}

// POST /api/categories - Create a new custom category
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

    // Check plan limits
    const { subscription, limits } = await getSubscriptionWithUsage(user.id)

    // Count existing custom categories
    const { count } = await supabase
      .from('custom_categories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (
      count !== null &&
      count >= limits.customCategories &&
      limits.customCategories !== Infinity
    ) {
      return NextResponse.json(
        {
          error: `You've reached the maximum of ${limits.customCategories} custom categories. Upgrade your plan to add more.`,
        },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { name, color, icon } = body as CustomCategoryInsert

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 },
      )
    }

    // Check if category name already exists (including default categories)
    const defaultNames = DEFAULT_CATEGORIES.map((c) => c.name.toLowerCase())
    if (defaultNames.includes(name.toLowerCase())) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 },
      )
    }

    const { data: existingCategory } = await supabase
      .from('custom_categories')
      .select('id')
      .eq('user_id', user.id)
      .ilike('name', name)
      .single()

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 },
      )
    }

    // Create the category
    const { data: category, error: insertError } = await supabase
      .from('custom_categories')
      .insert({
        user_id: user.id,
        name: name.trim(),
        color: color || '#3670ED',
        icon: icon || null,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 },
    )
  }
}
