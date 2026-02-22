export interface Stats {
  month: string
  totalSpent: number
  receiptCount: number
  categoryBreakdown: Record<string, number>
  availableMonths: string[]
}

// Statistics API Service
export class StatsService {
  private static baseUrl = '/api/stats'

  static async getStats(): Promise<Stats> {
    const response = await fetch(this.baseUrl)

    if (!response.ok) {
      throw new Error('Failed to fetch statistics')
    }

    return response.json()
  }
}
