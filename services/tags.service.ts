import type { Tag } from '@/types/database'

// Tags API Service
export class TagsService {
  private static baseUrl = '/api/tags'

  static async getTags(): Promise<Tag[]> {
    const response = await fetch(this.baseUrl)

    if (!response.ok) {
      throw new Error('Failed to fetch tags')
    }

    return response.json()
  }

  static async createTag(name: string, color: string): Promise<Tag> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create tag')
    }

    return result
  }

  static async updateTag(
    id: string,
    name: string,
    color: string,
  ): Promise<Tag> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update tag')
    }

    return result
  }

  static async deleteTag(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.error || 'Failed to delete tag')
    }
  }
}
