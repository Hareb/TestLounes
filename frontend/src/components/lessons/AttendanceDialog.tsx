"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { lessonService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Loader2, UserCheck, UserX, Users } from 'lucide-react'

interface AttendanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lesson?: any
  onSuccess: () => void
}

export function AttendanceDialog({ open, onOpenChange, lesson, onSuccess }: AttendanceDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [attendances, setAttendances] = useState<{ studentId: string; attended: boolean; studentName: string }[]>([])

  useEffect(() => {
    if (lesson && open) {
      // Initialize attendance state from lesson data
      const initialAttendances = lesson.students?.map((enrollment: any) => ({
        studentId: enrollment.studentId || enrollment.student?.id,
        attended: enrollment.attended !== undefined ? enrollment.attended : true,
        studentName: enrollment.student
          ? `${enrollment.student.user.firstName} ${enrollment.student.user.lastName}`
          : 'Unknown Student'
      })) || []
      setAttendances(initialAttendances)
    }
  }, [lesson, open])

  const handleToggleAttendance = (studentId: string) => {
    setAttendances((prev) =>
      prev.map((att) =>
        att.studentId === studentId ? { ...att, attended: !att.attended } : att
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = attendances.map(att => ({
        studentId: att.studentId,
        attended: att.attended
      }))

      await lessonService.updateAttendance(lesson.id, payload)

      toast({
        title: 'Succès',
        description: 'Présences mises à jour avec succès',
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const presentCount = attendances.filter(a => a.attended).length
  const absentCount = attendances.length - presentCount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gestion des présences</DialogTitle>
          <DialogDescription>
            Marquez les élèves présents ou absents pour cette leçon
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Summary badges */}
          <div className="flex gap-2 justify-center">
            <Badge variant="default" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {attendances.length} total
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
              <UserCheck className="h-3 w-3" />
              {presentCount} présent{presentCount > 1 ? 's' : ''}
            </Badge>
            {absentCount > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-red-100 text-red-800">
                <UserX className="h-3 w-3" />
                {absentCount} absent{absentCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Attendance list */}
          <div className="space-y-3 border rounded-md p-4 max-h-[400px] overflow-y-auto">
            {attendances.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucun élève inscrit à cette leçon
              </p>
            ) : (
              attendances.map((attendance) => (
                <div
                  key={attendance.studentId}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`attendance-${attendance.studentId}`}
                      checked={attendance.attended}
                      onCheckedChange={() => handleToggleAttendance(attendance.studentId)}
                    />
                    <label
                      htmlFor={`attendance-${attendance.studentId}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {attendance.studentName}
                    </label>
                  </div>
                  <Badge
                    variant={attendance.attended ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {attendance.attended ? 'Présent' : 'Absent'}
                  </Badge>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || attendances.length === 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
