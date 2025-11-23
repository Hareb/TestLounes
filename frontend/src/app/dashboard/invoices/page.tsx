'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Download, Eye, Send } from 'lucide-react'
import { invoiceService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n/i18n-context'

interface Invoice {
  id: string
  invoiceNumber: string
  totalAmount: number
  paidAmount: number
  status: string
  issuedAt?: string
  dueDate?: string
  createdAt: string
  student: {
    user: {
      firstName: string
      lastName: string
      email: string
    }
  }
  items: any[]
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { t } = useTranslation()

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await invoiceService.getAll()
      setInvoices(response.data.data)
    } catch (error) {
      toast({
        title: t.messages.error,
        description: 'Failed to load invoices',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      DRAFT: { variant: 'outline', label: 'Draft' },
      SENT: { variant: 'default', label: 'Sent' },
      PAID: { variant: 'success', label: t.status.paid },
      OVERDUE: { variant: 'destructive', label: t.status.overdue },
      CANCELLED: { variant: 'outline', label: t.status.cancelled },
    }
    const config = variants[status] || { variant: 'outline', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const downloadPDF = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pdf/invoice/${invoiceId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facture-${invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: t.messages.success,
        description: 'Invoice downloaded'
      })
    } catch (error) {
      toast({
        title: t.messages.error,
        description: 'Failed to download invoice',
        variant: 'destructive'
      })
    }
  }

  const totalRevenue = invoices
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + i.totalAmount, 0)

  const pendingAmount = invoices
    .filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED')
    .reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t.invoices.title}</h1>
          <p className="text-gray-600">{invoices.length} {t.invoices.total}</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t.invoices.add}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t.invoices.revenue}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t.invoices.pendingAmount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(pendingAmount)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t.invoices.paidInvoices}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.filter(i => i.status === 'PAID').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.invoices.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t.common.noData}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.invoices.number}</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>{t.common.status}</TableHead>
                  <TableHead className="text-right">{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <span className="font-mono font-semibold">
                        {invoice.invoiceNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {invoice.student.user.firstName} {invoice.student.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{invoice.student.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {formatCurrency(invoice.totalAmount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-green-600 font-semibold">
                        {formatCurrency(invoice.paidAmount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invoice.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => downloadPDF(invoice.id, invoice.invoiceNumber)}
                          title={t.invoices.downloadPDF}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title={t.common.view}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title={t.common.send}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
