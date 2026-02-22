import type { Receipt, ReceiptInsert, ReceiptUpdate } from '@/types/database'

// Receipt API Service
export class ReceiptService {
  private static baseUrl = '/api/receipts'

  static async getReceipts(params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    startDate?: string
    endDate?: string
  }): Promise<{
    receipts: Receipt[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.category) searchParams.append('category', params.category)
    if (params?.startDate) searchParams.append('startDate', params.startDate)
    if (params?.endDate) searchParams.append('endDate', params.endDate)

    const url = params
      ? `${this.baseUrl}?${searchParams.toString()}`
      : this.baseUrl
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Failed to fetch receipts')
    }

    return response.json()
  }

  static async getReceipt(id: string): Promise<{ receipts: Receipt[] }> {
    const response = await fetch(`${this.baseUrl}?id=${id}`)

    if (!response.ok) {
      throw new Error('Failed to fetch receipt')
    }

    return response.json()
  }

  static async createReceipt(
    data: Omit<ReceiptInsert, 'user_id'>,
  ): Promise<Receipt> {
    const response = await fetch('/api/save-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to save receipt')
    }

    return result
  }

  static async updateReceipt(
    id: string,
    data: Partial<ReceiptUpdate>,
  ): Promise<{ success: boolean; receipt: Receipt }> {
    const response = await fetch(this.baseUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update receipt')
    }

    return result
  }

  static async deleteReceipt(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}?id=${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete receipt')
    }

    return response.json()
  }

  static async exportCsv(): Promise<Blob> {
    const response = await fetch('/api/export-csv')

    if (!response.ok) {
      throw new Error('Failed to export CSV')
    }

    return response.blob()
  }
}
