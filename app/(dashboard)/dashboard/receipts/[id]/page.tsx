import { ReceiptDetail } from '@/components/receipt-detail'

interface ReceiptDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ReceiptDetailPage({
  params,
}: ReceiptDetailPageProps) {
  const resolvedParams = await params
  return <ReceiptDetail receiptId={resolvedParams.id} />
}
