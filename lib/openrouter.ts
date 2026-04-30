const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'nvidia/nemotron-nano-12b-v2-vl:free'
const FALLBACK_MODEL = 'mistralai/mistral-small-3.1-24b-instruct:free'

const RECEIPT_EXTRACTION_PROMPT = `You are an expert receipt data extractor. Analyze this receipt image and extract the following information in valid JSON format:
{
  "merchant_name": "string",
  "date": "YYYY-MM-DD",
  "total_amount": number,
  "currency": "USD",
  "suggested_category": "meals | travel | office | utilities | other",
  "line_items": [{"description": "string", "amount": number}],
  "confidence_score": 0-1
}
If any field is unclear, use null. Be accurate with numbers. Return ONLY the JSON, no markdown formatting or code blocks.`

export interface ExtractedReceiptData {
  merchant_name: string | null
  date: string | null
  total_amount: number | null
  currency: string
  suggested_category:
    | 'meals'
    | 'travel'
    | 'office'
    | 'utilities'
    | 'other'
    | null
  line_items: Array<{ description: string; amount: number }> | null
  confidence_score: number | null
}

export async function extractReceiptData(
  base64Image: string,
): Promise<ExtractedReceiptData> {
  // Ensure base64 image has correct format
  if (!base64Image.startsWith('data:image/')) {
    throw new Error('Invalid image format')
  }

  // Try primary model first, then fallback model on error
  const models = [MODEL, FALLBACK_MODEL]

  let lastError: Error | null = null

  for (const model of models) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer':
            process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Cosmoxis',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: RECEIPT_EXTRACTION_PROMPT,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: base64Image,
                  },
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        lastError = new Error(
          `OpenRouter API error: ${response.status} - ${errorText}`,
        )
        // Try next model if this one failed
        continue
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        lastError = new Error('No content returned from OpenRouter API')
        // Try next model if this one returned no content
        continue
      }

      // Parse the JSON from the response
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim()

      try {
        const parsed = JSON.parse(jsonStr)
        return {
          merchant_name: parsed.merchant_name || null,
          date: parsed.date || null,
          total_amount:
            typeof parsed.total_amount === 'number'
              ? parsed.total_amount
              : null,
          currency: parsed.currency || 'USD',
          suggested_category: parsed.suggested_category || null,
          line_items: Array.isArray(parsed.line_items)
            ? parsed.line_items
            : null,
          confidence_score:
            typeof parsed.confidence_score === 'number'
              ? parsed.confidence_score
              : null,
        }
      } catch (parseError) {
        console.error('Failed to parse JSON from response:', content)
        lastError = new Error('Failed to parse receipt data from AI response')
        // Try next model if parsing failed
        continue
      }
    } catch (error) {
      lastError = error as Error
      // Try next model
      continue
    }
  }

  // All models failed
  throw lastError || new Error('All models failed to extract receipt data')
}
