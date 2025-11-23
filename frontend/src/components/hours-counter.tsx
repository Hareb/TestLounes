'use client'

import { useState, useEffect } from 'react'
import { packageService } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Clock, AlertTriangle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/i18n-context'

interface HoursCounterProps {
  studentId?: string
}

export function HoursCounter({ studentId }: HoursCounterProps) {
  const { t } = useTranslation()
  const [packages, setPackages] = useState<any[]>([])
  const [totalCodeHours, setTotalCodeHours] = useState({ remaining: 0, total: 0 })
  const [totalDriveHours, setTotalDriveHours] = useState({ remaining: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (studentId) {
      fetchPackages()
    }
  }, [studentId])

  const fetchPackages = async () => {
    try {
      const res = await packageService.getStudentPackages(studentId!)
      const pkgs = res.data.data || []
      setPackages(pkgs)

      // Calculate totals
      let codeRemaining = 0
      let codeTotal = 0
      let driveRemaining = 0
      let driveTotal = 0

      pkgs.forEach((pkg: any) => {
        const isExpired = pkg.isExpired || (pkg.expiryDate && new Date(pkg.expiryDate) < new Date())
        if (!isExpired && pkg.isActive) {
          codeRemaining += pkg.codeHoursBought - pkg.codeHoursUsed
          codeTotal += pkg.codeHoursBought
          driveRemaining += pkg.driveHoursBought - pkg.driveHoursUsed
          driveTotal += pkg.driveHoursBought
        }
      })

      setTotalCodeHours({ remaining: codeRemaining, total: codeTotal })
      setTotalDriveHours({ remaining: driveRemaining, total: driveTotal })
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-gray-500">{t.common.loading}</p>
        </CardContent>
      </Card>
    )
  }

  if (packages.length === 0) {
    return null
  }

  const codePercentage = totalCodeHours.total > 0
    ? ((totalCodeHours.total - totalCodeHours.remaining) / totalCodeHours.total) * 100
    : 0

  const drivePercentage = totalDriveHours.total > 0
    ? ((totalDriveHours.total - totalDriveHours.remaining) / totalDriveHours.total) * 100
    : 0

  const isCodeLow = totalCodeHours.remaining < 5 && totalCodeHours.total > 0
  const isDriveLow = totalDriveHours.remaining < 5 && totalDriveHours.total > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t.packages.hoursRemaining}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Code Hours */}
        {totalCodeHours.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t.packages.codeHours}</span>
                {isCodeLow && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Faible
                  </Badge>
                )}
              </div>
              <span className={`text-lg font-bold ${isCodeLow ? 'text-orange-600' : ''}`}>
                {totalCodeHours.remaining}h / {totalCodeHours.total}h
              </span>
            </div>
            <Progress value={codePercentage} className="h-2" />
          </div>
        )}

        {/* Drive Hours */}
        {totalDriveHours.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t.packages.driveHours}</span>
                {isDriveLow && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Faible
                  </Badge>
                )}
              </div>
              <span className={`text-lg font-bold ${isDriveLow ? 'text-orange-600' : ''}`}>
                {totalDriveHours.remaining}h / {totalDriveHours.total}h
              </span>
            </div>
            <Progress value={drivePercentage} className="h-2" />
          </div>
        )}

        {(isCodeLow || isDriveLow) && (
          <div className="pt-3 border-t">
            <p className="text-xs text-orange-600">
              ⚠️ Heures bientôt épuisées. Pensez à acheter un nouveau forfait.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
