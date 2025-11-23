'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n/i18n-context'
import { examService, studentService } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, CheckCircle, XCircle, TrendingUp, Award, Send, Plus } from 'lucide-react'

export default function ExamsPage() {
  const { t } = useTranslation()
  const [exams, setExams] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('')
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    studentId: '',
    type: 'CODE',
    examDate: '',
    examCenter: '',
    examAddress: '',
    notes: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const role = localStorage.getItem('userRole') || 'STUDENT'
      setUserRole(role)

      // Fetch exams
      const examsRes = await examService.getAll()
      setExams(examsRes.data.data || [])

      // Fetch stats for admin
      if (role === 'ADMIN' || role === 'SECRETARY') {
        const statsRes = await examService.getStats()
        setStats(statsRes.data.data)

        // Fetch students for scheduling
        const studentsRes = await studentService.getAll()
        setStudents(studentsRes.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, any> = {
      SCHEDULED: {
        variant: 'secondary',
        label: t.exams.statuses.SCHEDULED,
        color: 'text-blue-600',
      },
      PASSED: {
        variant: 'default',
        label: t.exams.statuses.PASSED,
        color: 'text-green-600',
        icon: CheckCircle,
      },
      FAILED: {
        variant: 'destructive',
        label: t.exams.statuses.FAILED,
        color: 'text-red-600',
        icon: XCircle,
      },
      CANCELLED: {
        variant: 'outline',
        label: t.exams.statuses.CANCELLED,
        color: 'text-gray-600',
      },
      NO_SHOW: {
        variant: 'destructive',
        label: t.exams.statuses.NO_SHOW,
        color: 'text-orange-600',
      },
    }

    const config = configs[status] || configs.SCHEDULED
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {config.label}
      </Badge>
    )
  }

  const getTypeLabel = (type: string) => {
    return type === 'CODE' ? t.exams.types.CODE : t.exams.types.DRIVE
  }

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await examService.create(scheduleForm)
      alert('Examen planifié avec succès !')
      setShowScheduleForm(false)
      setScheduleForm({
        studentId: '',
        type: 'CODE',
        examDate: '',
        examCenter: '',
        examAddress: '',
        notes: '',
      })
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la planification')
    }
  }

  const handleSendConvocation = async (examId: string) => {
    try {
      await examService.sendConvocation(examId)
      alert('Convocation envoyée !')
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur')
    }
  }

  const handleRecordResult = async (examId: string) => {
    const passed = confirm('L\'élève a-t-il réussi l\'examen ?')
    const score = prompt('Score (pour examen CODE, sur 40) :')

    try {
      await examService.recordResult(examId, {
        result: passed,
        score: score ? parseInt(score) : null,
      })
      alert('Résultat enregistré !')
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur')
    }
  }

  const handleCancel = async (examId: string) => {
    const notes = prompt('Raison de l\'annulation :')
    if (!notes) return

    try {
      await examService.cancel(examId, notes)
      alert('Examen annulé')
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">{t.common.loading}</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t.exams.title}</h1>
          <p className="text-gray-500 mt-1">
            {exams.length} {t.exams.total}
          </p>
        </div>
        {(userRole === 'ADMIN' || userRole === 'SECRETARY') && (
          <Button onClick={() => setShowScheduleForm(!showScheduleForm)}>
            <Plus className="h-4 w-4 mr-2" />
            {t.exams.add}
          </Button>
        )}
      </div>

      {/* Stats Cards (Admin only) */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.exams.statuses.SCHEDULED}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduledExams}</div>
              <p className="text-xs text-muted-foreground">Examens à venir</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux Code</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.codePassRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalCodeExams} examens CODE
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux Conduite</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.drivePassRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalDriveExams} examens CONDUITE
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score Moyen Code</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgCodeScore.toFixed(1)}/40</div>
              <p className="text-xs text-muted-foreground">Moyenne générale</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Schedule Form */}
      {showScheduleForm && (
        <Card>
          <CardHeader>
            <CardTitle>{t.exams.schedule}</CardTitle>
            <CardDescription>Planifier un nouvel examen</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Élève *</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={scheduleForm.studentId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, studentId: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner un élève</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.user.firstName} {student.user.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>{t.exams.type} *</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={scheduleForm.type}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
                    required
                  >
                    <option value="CODE">{t.exams.types.CODE}</option>
                    <option value="DRIVE">{t.exams.types.DRIVE}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>{t.exams.date} *</Label>
                  <Input
                    type="datetime-local"
                    value={scheduleForm.examDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, examDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.exams.center}</Label>
                  <Input
                    value={scheduleForm.examCenter}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, examCenter: e.target.value })}
                    placeholder="Nom du centre d'examen"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>{t.exams.address}</Label>
                  <Input
                    value={scheduleForm.examAddress}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, examAddress: e.target.value })}
                    placeholder="Adresse complète"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Notes</Label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                    value={scheduleForm.notes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                    placeholder="Instructions ou informations complémentaires..."
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Planifier l'examen</Button>
                <Button type="button" variant="outline" onClick={() => setShowScheduleForm(false)}>
                  {t.common.cancel}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Exams List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="scheduled">{t.exams.statuses.SCHEDULED}</TabsTrigger>
          <TabsTrigger value="passed">{t.exams.statuses.PASSED}</TabsTrigger>
          <TabsTrigger value="failed">{t.exams.statuses.FAILED}</TabsTrigger>
        </TabsList>

        {['all', 'scheduled', 'passed', 'failed'].map((filter) => (
          <TabsContent key={filter} value={filter} className="space-y-4">
            {exams
              .filter((exam) => filter === 'all' || exam.status === filter.toUpperCase())
              .map((exam) => (
                <Card key={exam.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getTypeLabel(exam.type)}
                          {exam.result && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {exam.result === false && <XCircle className="h-5 w-5 text-red-600" />}
                        </CardTitle>
                        <CardDescription>
                          {new Date(exam.examDate).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </CardDescription>
                      </div>
                      {getStatusBadge(exam.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {exam.student && (
                        <div>
                          <span className="text-gray-500">Élève:</span>
                          <p className="font-medium">
                            {exam.student.user.firstName} {exam.student.user.lastName}
                          </p>
                        </div>
                      )}
                      {exam.examCenter && (
                        <div>
                          <span className="text-gray-500">{t.exams.center}:</span>
                          <p className="font-medium">{exam.examCenter}</p>
                        </div>
                      )}
                      {exam.score !== null && (
                        <div>
                          <span className="text-gray-500">{t.exams.score}:</span>
                          <p className="font-medium text-lg">
                            {exam.score}/{exam.maxScore || 40}
                          </p>
                        </div>
                      )}
                      {exam.convocationSent && (
                        <div>
                          <span className="text-gray-500">{t.exams.convocation}:</span>
                          <Badge variant="outline" className="ml-2">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Envoyée
                          </Badge>
                        </div>
                      )}
                    </div>

                    {exam.examAddress && (
                      <div className="pt-2 border-t">
                        <span className="text-sm text-gray-500">{t.exams.address}:</span>
                        <p className="text-sm mt-1">{exam.examAddress}</p>
                      </div>
                    )}

                    {exam.notes && (
                      <div className="pt-2 border-t">
                        <span className="text-sm text-gray-500">Notes:</span>
                        <p className="text-sm mt-1">{exam.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {(userRole === 'ADMIN' || userRole === 'SECRETARY' || userRole === 'INSTRUCTOR') && (
                      <div className="flex gap-2 pt-3 border-t">
                        {exam.status === 'SCHEDULED' && !exam.convocationSent && (
                          <Button size="sm" variant="outline" onClick={() => handleSendConvocation(exam.id)}>
                            <Send className="h-4 w-4 mr-1" />
                            {t.exams.sendConvocation}
                          </Button>
                        )}
                        {exam.status === 'SCHEDULED' && (
                          <Button size="sm" onClick={() => handleRecordResult(exam.id)}>
                            {t.exams.recordResult}
                          </Button>
                        )}
                        {exam.status === 'SCHEDULED' && (
                          <Button size="sm" variant="destructive" onClick={() => handleCancel(exam.id)}>
                            {t.common.cancel}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

            {exams.filter((exam) => filter === 'all' || exam.status === filter.toUpperCase()).length === 0 && (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-gray-500">{t.common.noData}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
