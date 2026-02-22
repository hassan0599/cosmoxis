'use client'

import { useState, useCallback, useEffect } from 'react'
import { CategoriesService, type Category } from '@/services/categories.service'
import { TagsService } from '@/services/tags.service'
import type { CustomCategory, Tag } from '@/types/database'
import { toast } from '@/hooks/use-toast'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [categoriesData, tagsData] = await Promise.all([
        CategoriesService.getCategories(),
        TagsService.getTags(),
      ])

      const allCategories: Category[] = [
        ...categoriesData.default.map((c) => ({
          ...c,
          id: `default-${c.name.toLowerCase()}`,
          isDefault: true,
        })),
        ...(categoriesData.custom || []).map((c) => ({
          ...c,
          isDefault: false,
        })),
      ]

      setCategories(allCategories)
      setTags(tagsData)
    } catch (error) {
      console.error('Failed to fetch categories and tags:', error)
      toast({
        title: 'Error',
        description: 'Failed to load categories and tags.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createCategory = useCallback(
    async (name: string, color: string): Promise<CustomCategory | null> => {
      try {
        const result = await CategoriesService.createCategory(name, color)
        setCategories((prev) => [...prev, { ...result, isDefault: false }])
        toast({
          title: 'Success',
          description: 'Category created successfully!',
          variant: 'success',
        })
        return result
      } catch (error) {
        console.error('Failed to create category:', error)
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to create category.',
          variant: 'destructive',
        })
        return null
      }
    },
    [],
  )

  const updateCategory = useCallback(
    async (
      id: string,
      name: string,
      color: string,
    ): Promise<CustomCategory | null> => {
      if (id.startsWith('default-')) return null

      try {
        const result = await CategoriesService.updateCategory(id, name, color)
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...result } : c)),
        )
        toast({
          title: 'Success',
          description: 'Category updated successfully!',
          variant: 'success',
        })
        return result
      } catch (error) {
        console.error('Failed to update category:', error)
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to update category.',
          variant: 'destructive',
        })
        return null
      }
    },
    [],
  )

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    if (id.startsWith('default-')) return false

    try {
      await CategoriesService.deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast({
        title: 'Success',
        description: 'Category deleted successfully!',
        variant: 'success',
      })
      return true
    } catch (error) {
      console.error('Failed to delete category:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to delete category.',
        variant: 'destructive',
      })
      return false
    }
  }, [])

  const createTag = useCallback(
    async (name: string, color: string): Promise<Tag | null> => {
      try {
        const result = await TagsService.createTag(name, color)
        setTags((prev) => [...prev, result])
        toast({
          title: 'Success',
          description: 'Tag created successfully!',
          variant: 'success',
        })
        return result
      } catch (error) {
        console.error('Failed to create tag:', error)
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to create tag.',
          variant: 'destructive',
        })
        return null
      }
    },
    [],
  )

  const deleteTag = useCallback(async (id: string): Promise<boolean> => {
    try {
      await TagsService.deleteTag(id)
      setTags((prev) => prev.filter((t) => t.id !== id))
      toast({
        title: 'Success',
        description: 'Tag deleted successfully!',
        variant: 'success',
      })
      return true
    } catch (error) {
      console.error('Failed to delete tag:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to delete tag.',
        variant: 'destructive',
      })
      return false
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    categories,
    tags,
    isLoading,
    fetchData,
    createCategory,
    updateCategory,
    deleteCategory,
    createTag,
    deleteTag,
  }
}
