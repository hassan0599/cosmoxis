'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  Palette,
  Check,
  X,
  Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useSubscription } from '@/hooks/use-subscription'
import type { CustomCategory, Tag as TagType } from '@/types/database'

interface Category {
  id: string
  name: string
  color: string
  icon?: string | null
  isDefault?: boolean
}

interface CategoryManagerProps {
  onCategoryChange?: () => void
}

const PRESET_COLORS = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#EAB308',
  '#84CC16',
  '#22C55E',
  '#10B981',
  '#14B8A6',
  '#06B6D4',
  '#0EA5E9',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#A855F7',
  '#D946EF',
  '#EC4899',
  '#F43F5E',
  '#64748B',
  '#6B7280',
  '#3670ED',
]

export function CategoryManager({ onCategoryChange }: CategoryManagerProps) {
  const { subscription, limits } = useSubscription()
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#3670ED')
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#9CA3AF')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [showNewTag, setShowNewTag] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const plan = subscription?.plan || 'free'
  const canCreateCategories =
    limits.customCategories > 0 || limits.customCategories === Infinity
  const canCreateTags = plan !== 'free'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Fetch categories
      const categoriesRes = await fetch('/api/categories')
      const categoriesData = await categoriesRes.json()

      const allCategories: Category[] = [
        ...categoriesData.default.map(
          (c: { name: string; color: string; icon: string }) => ({
            id: `default-${c.name.toLowerCase()}`,
            name: c.name,
            color: c.color,
            icon: c.icon,
            isDefault: true,
          }),
        ),
        ...(categoriesData.custom || []).map((c: CustomCategory) => ({
          ...c,
          isDefault: false,
        })),
      ]

      setCategories(allCategories)

      // Fetch tags
      const tagsRes = await fetch('/api/tags')
      const tagsData = await tagsRes.json()
      setTags(Array.isArray(tagsData) ? tagsData : [])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    setError(null)

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName,
          color: newCategoryColor,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create category')
        return
      }

      setCategories((prev) => [...prev, { ...data, isDefault: false }])
      setNewCategoryName('')
      setNewCategoryColor('#3670ED')
      setShowNewCategory(false)
      onCategoryChange?.()
    } catch (err) {
      setError('Failed to create category')
    }
  }

  const handleUpdateCategory = async (
    id: string,
    name: string,
    color: string,
  ) => {
    if (id.startsWith('default-')) return // Can't edit default categories

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to update category')
        return
      }

      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
      )
      setEditingId(null)
      onCategoryChange?.()
    } catch (err) {
      setError('Failed to update category')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (id.startsWith('default-')) return // Can't delete default categories

    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to delete category')
        return
      }

      setCategories((prev) => prev.filter((c) => c.id !== id))
      onCategoryChange?.()
    } catch (err) {
      setError('Failed to delete category')
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    setError(null)

    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTagName,
          color: newTagColor,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create tag')
        return
      }

      setTags((prev) => [...prev, data])
      setNewTagName('')
      setNewTagColor('#9CA3AF')
      setShowNewTag(false)
    } catch (err) {
      setError('Failed to create tag')
    }
  }

  const handleDeleteTag = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return

    try {
      const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to delete tag')
        return
      }

      setTags((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      setError('Failed to delete tag')
    }
  }

  if (isLoading) {
    return (
      <div className='animate-pulse space-y-4'>
        <div className='h-8 w-32 bg-slate-200 rounded' />
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='h-10 bg-slate-200 rounded' />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      {error && (
        <div className='p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm'>
          {error}
        </div>
      )}

      {/* Categories Section */}
      <div>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-slate-900'>Categories</h3>
          {canCreateCategories && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowNewCategory(true)}>
              <Plus className='w-4 h-4 mr-1' />
              Add Category
            </Button>
          )}
        </div>

        {!canCreateCategories && (
          <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2'>
            <Crown className='w-4 h-4 text-blue-600' />
            <span className='text-sm text-blue-700'>
              Custom categories are available on Pro and Business plans.
            </span>
          </div>
        )}

        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              isEditing={editingId === category.id}
              onStartEdit={() => setEditingId(category.id)}
              onSaveEdit={(name, color) =>
                handleUpdateCategory(category.id, name, color)
              }
              onCancelEdit={() => setEditingId(null)}
              onDelete={() => handleDeleteCategory(category.id)}
              presetColors={PRESET_COLORS}
            />
          ))}

          {showNewCategory && (
            <Card className='p-3 border-dashed'>
              <div className='space-y-2'>
                <Input
                  placeholder='Category name'
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className='h-8'
                />
                <div className='flex gap-1 flex-wrap'>
                  {PRESET_COLORS.slice(0, 8).map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewCategoryColor(color)}
                      className={`w-5 h-5 rounded-full border-2 ${
                        newCategoryColor === color
                          ? 'border-slate-900'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className='flex gap-1'>
                  <Button size='sm' onClick={handleCreateCategory}>
                    <Check className='w-3 h-3' />
                  </Button>
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => {
                      setShowNewCategory(false)
                      setNewCategoryName('')
                    }}>
                    <X className='w-3 h-3' />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Tags Section */}
      <div>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-slate-900 flex items-center gap-2'>
            <Tag className='w-5 h-5' />
            Tags
          </h3>
          {canCreateTags && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowNewTag(true)}>
              <Plus className='w-4 h-4 mr-1' />
              Add Tag
            </Button>
          )}
        </div>

        {!canCreateTags && (
          <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2'>
            <Crown className='w-4 h-4 text-blue-600' />
            <span className='text-sm text-blue-700'>
              Tags are available on Pro and Business plans.
            </span>
          </div>
        )}

        <div className='flex flex-wrap gap-2'>
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              className='pl-3 pr-1 py-1 flex items-center gap-1'
              style={{ backgroundColor: tag.color + '20', color: tag.color }}>
              {tag.name}
              <button
                onClick={() => handleDeleteTag(tag.id)}
                className='ml-1 hover:bg-black/10 rounded-full p-0.5'>
                <X className='w-3 h-3' />
              </button>
            </Badge>
          ))}

          {showNewTag && (
            <Card className='p-2 flex items-center gap-2'>
              <Input
                placeholder='Tag name'
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className='h-7 w-24'
              />
              <div className='flex gap-1'>
                {PRESET_COLORS.slice(0, 5).map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewTagColor(color)}
                    className={`w-4 h-4 rounded-full border ${
                      newTagColor === color
                        ? 'border-slate-900'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <Button size='sm' className='h-7' onClick={handleCreateTag}>
                Add
              </Button>
              <Button
                size='sm'
                variant='ghost'
                className='h-7'
                onClick={() => {
                  setShowNewTag(false)
                  setNewTagName('')
                }}>
                <X className='w-3 h-3' />
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

interface CategoryItemProps {
  category: Category
  isEditing: boolean
  onStartEdit: () => void
  onSaveEdit: (name: string, color: string) => void
  onCancelEdit: () => void
  onDelete: () => void
  presetColors: string[]
}

function CategoryItem({
  category,
  isEditing,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  presetColors,
}: CategoryItemProps) {
  const [editName, setEditName] = useState(category.name)
  const [editColor, setEditColor] = useState(category.color)

  if (isEditing) {
    return (
      <Card className='p-3'>
        <div className='space-y-2'>
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className='h-8'
          />
          <div className='flex gap-1 flex-wrap'>
            {presetColors.slice(0, 8).map((color) => (
              <button
                key={color}
                onClick={() => setEditColor(color)}
                className={`w-5 h-5 rounded-full border-2 ${
                  editColor === color
                    ? 'border-slate-900'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className='flex gap-1'>
            <Button size='sm' onClick={() => onSaveEdit(editName, editColor)}>
              <Check className='w-3 h-3' />
            </Button>
            <Button size='sm' variant='ghost' onClick={onCancelEdit}>
              <X className='w-3 h-3' />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className='p-3 flex items-center justify-between group'
      style={{ backgroundColor: category.color + '10' }}>
      <div className='flex items-center gap-2'>
        <div
          className='w-3 h-3 rounded-full'
          style={{ backgroundColor: category.color }}
        />
        <span className='font-medium text-slate-700'>{category.name}</span>
        {category.isDefault && (
          <Badge variant='secondary' className='text-xs'>
            Default
          </Badge>
        )}
      </div>

      {!category.isDefault && (
        <div className='opacity-0 group-hover:opacity-100 flex gap-1'>
          <button
            onClick={onStartEdit}
            className='p-1 hover:bg-black/10 rounded'>
            <Pencil className='w-3 h-3 text-slate-500' />
          </button>
          <button onClick={onDelete} className='p-1 hover:bg-black/10 rounded'>
            <Trash2 className='w-3 h-3 text-red-500' />
          </button>
        </div>
      )}
    </Card>
  )
}
