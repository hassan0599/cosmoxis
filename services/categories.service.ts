import type { CustomCategory } from '@/types/database'

export interface Category {
  id: string
  name: string
  color: string
  icon?: string | null
  isDefault?: boolean
}

// Categories API Service
export class CategoriesService {
  private static baseUrl = '/api/categories'

  static async getCategories(): Promise<{
    default: Category[]
    custom: CustomCategory[]
  }> {
    const response = await fetch(this.baseUrl)

    if (!response.ok) {
      throw new Error('Failed to fetch categories')
    }

    return response.json()
  }

  static async createCategory(
    name: string,
    color: string,
  ): Promise<CustomCategory> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create category')
    }

    return result
  }

  static async updateCategory(
    id: string,
    name: string,
    color: string,
  ): Promise<CustomCategory> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update category')
    }

    return result
  }

  static async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.error || 'Failed to delete category')
    }
  }
}
