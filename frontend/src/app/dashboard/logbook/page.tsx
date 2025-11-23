'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n/i18n-context'
import { logbookService } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, CheckCircle, TrendingUp, Award } from 'lucide-react'

export default function LogbookPage() {
  const { t } = useTranslation()
  const [logbook, setLogbook] = useState<any>(null)
  const [gdeGrid, setGdeGrid] = useState<any>(null)
  const [progressSummary, setProgressSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('')
  const [selectedCompetence, setSelectedCompetence] = useState(1)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const role = localStorage.getItem('userRole') || 'STUDENT'
      setUserRole(role)

      // TODO: Get actual student ID
      const studentId = 'student-123'

      // Fetch logbook
      const logbookRes = await logbookService.getByStudentId(studentId)
      setLogbook(logbookRes.data.data)

      // Fetch progress summary
      const progressRes = await logbookService.getProgressSummary(studentId)
      setProgressSummary(progressRes.data.data)

      // Fetch GDE grid details
      const gdeRes = await logbookService.getGDEGrid()
      setGdeGrid(gdeRes.data.data)
    } catch (error) {
      console.error('Error fetching logbook:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSkillScore = async (comp: number, skill: number, newScore: number) => {
    try {
      const studentId = 'student-123' // TODO: Get actual student ID
      const fieldName = `comp${comp}_skill${skill}`

      await logbookService.updateSkills(studentId, {
        [fieldName]: newScore,
      })

      // Refresh data
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la mise à jour')
    }
  }

  const validateCompetence = async (comp: number) => {
    if (!confirm(`Valider la compétence ${comp} ?`)) return

    try {
      const studentId = 'student-123' // TODO: Get actual student ID
      await logbookService.validateCompetence(studentId, comp)
      alert('Compétence validée !')
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur')
    }
  }

  const getLevelColor = (score: number) => {
    if (score === 0) return 'bg-gray-200'
    if (score <= 2) return 'bg-red-200'
    if (score === 3) return 'bg-yellow-200'
    if (score === 4) return 'bg-blue-200'
    return 'bg-green-200'
  }

  const getLevelLabel = (score: number) => {
    const labels: Record<number, string> = {
      0: t.logbook.skillLevels[0],
      1: t.logbook.skillLevels[1],
      2: t.logbook.skillLevels[2],
      3: t.logbook.skillLevels[3],
      4: t.logbook.skillLevels[4],
      5: t.logbook.skillLevels[5],
    }
    return labels[score] || '-'
  }

  if (loading || !logbook || !progressSummary) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">{t.common.loading}</div>
      </div>
    )
  }

  const canEdit = userRole === 'ADMIN' || userRole === 'INSTRUCTOR'

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t.logbook.title}</h1>
        <p className="text-gray-500 mt-1">Grille d'évaluation GDE officielle</p>
      </div>

      {/* Overall Progress Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{t.logbook.overallProgress}</CardTitle>
              <CardDescription>
                {logbook.student.user.firstName} {logbook.student.user.lastName}
              </CardDescription>
            </div>
            {logbook.isComplete && (
              <Badge className="bg-green-600">
                <Award className="h-4 w-4 mr-1" />
                Complété
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">{t.logbook.progress}</span>
              <span className="text-sm font-bold">{Math.round(logbook.overallProgress)}%</span>
            </div>
            <Progress value={logbook.overallProgress} className="h-3" />
          </div>

          <div className="grid grid-cols-4 gap-4 pt-4 border-t">
            {[1, 2, 3, 4].map((comp) => {
              const compData = progressSummary.competences.find((c: any) => c.competence === comp)
              const isValidated = logbook[`comp${comp}_validated`]

              return (
                <div key={comp} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-sm font-medium">Comp. {comp}</span>
                    {isValidated && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                  <Progress value={compData?.progress || 0} className="h-2 mb-1" />
                  <p className="text-xs text-gray-500">{Math.round(compData?.progress || 0)}%</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Competences Tabs */}
      <Tabs value={`comp${selectedCompetence}`} onValueChange={(v) => setSelectedCompetence(Number(v.replace('comp', '')))}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comp1">
            {t.logbook.comp1}
            {logbook.comp1_validated && <CheckCircle className="h-3 w-3 ml-1" />}
          </TabsTrigger>
          <TabsTrigger value="comp2">
            {t.logbook.comp2}
            {logbook.comp2_validated && <CheckCircle className="h-3 w-3 ml-1" />}
          </TabsTrigger>
          <TabsTrigger value="comp3">
            {t.logbook.comp3}
            {logbook.comp3_validated && <CheckCircle className="h-3 w-3 ml-1" />}
          </TabsTrigger>
          <TabsTrigger value="comp4">
            {t.logbook.comp4}
            {logbook.comp4_validated && <CheckCircle className="h-3 w-3 ml-1" />}
          </TabsTrigger>
        </TabsList>

        {[1, 2, 3, 4].map((comp) => (
          <TabsContent key={comp} value={`comp${comp}`} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{gdeGrid?.[`competence${comp}`]?.name}</CardTitle>
                <CardDescription>
                  {progressSummary.competences.find((c: any) => c.competence === comp)?.progress.toFixed(0)}% complété
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 7].map((skillNum) => {
                  const fieldName = `comp${comp}_skill${skillNum}`
                  const currentScore = logbook[fieldName] || 0
                  const skillDescription = gdeGrid?.[`competence${comp}`]?.skills?.[skillNum - 1] || `Compétence ${skillNum}`

                  return (
                    <div key={skillNum} className="space-y-2 pb-4 border-b last:border-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">Compétence {comp}.{skillNum}</h4>
                          <p className="text-sm text-gray-600 mt-1">{skillDescription}</p>
                        </div>
                        <Badge className={getLevelColor(currentScore)}>
                          {getLevelLabel(currentScore)}
                        </Badge>
                      </div>

                      {canEdit && (
                        <div className="flex gap-2">
                          {[0, 1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              onClick={() => updateSkillScore(comp, skillNum, score)}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                currentScore === score
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      )}

                      {!canEdit && (
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-2 flex-1 rounded ${
                                level <= currentScore ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}

                {canEdit && !logbook[`comp${comp}_validated`] && (
                  <div className="pt-4">
                    <Button
                      className="w-full"
                      onClick={() => validateCompetence(comp)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t.logbook.validate} {t.logbook[`comp${comp}` as keyof typeof t.logbook]}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Toutes les compétences doivent être au niveau 3 minimum
                    </p>
                  </div>
                )}

                {logbook[`comp${comp}_validated`] && (
                  <div className="pt-4 text-center">
                    <Badge className="bg-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {t.logbook.validated}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
