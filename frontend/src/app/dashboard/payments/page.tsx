'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Download } from 'lucide-react'
import { paymentService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n/i18n-context'

interface Payment {
  id: string
  amount: number
  method: string
  status: string
  description?: string
  createdAt: string
  paidAt?: string
  student: {
    user: {
      firstName: string
      lastName: string
      email: string
    }
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { t } = useTranslation()

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await paymentService.getAll()
      setPayments(response.data.data)
    } catch (error) {
      toast({
        title: t.messages.error,
        description: 'Failed to load payments',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const getMethodBadge = (method: string) => {
    const labels: Record<string, string> = {
      CASH: t.payments.methods.cash,
      CARD: t.payments.methods.card,
      TRANSFER: t.payments.methods.transfer,
      CHECK: t.payments.methods.check,
      CPF: t.payments.methods.cpf,
      INSTALLMENT: t.payments.methods.installment,
    }
    return <Badge variant="outline">{labels[method] || method}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      COMPLETED: { variant: 'success', label: t.status.paid },
      PENDING: { variant: 'warning', label: t.status.pending },
      FAILED: { variant: 'destructive', label: 'Failed' },
      REFUNDED: { variant: 'outline', label: 'Refunded' },
    }
    const config = variants[status] || { variant: 'outline', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const totalAmount = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t.payments.title}</h1>
          <p className="text-gray-600">{payments.length} {t.payments.total}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t.common.export}
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t.payments.add}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t.payments.totalCollected}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalAmount)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t.payments.thisMonth}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.filter(p => {
                const date = new Date(p.createdAt)
                const now = new Date()
                return date.getMonth() === now.getMonth()
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t.payments.pending}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {payments.filter(p => p.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.payments.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t.common.noData}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.payments.date}</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>{t.payments.description}</TableHead>
                  <TableHead>{t.payments.amount}</TableHead>
                  <TableHead>{t.payments.method}</TableHead>
                  <TableHead>{t.common.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {payment.student.user.firstName} {payment.student.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{payment.student.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{payment.description || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(payment.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getMethodBadge(payment.method)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
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
