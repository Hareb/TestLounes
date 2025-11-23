import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const logbookController = {
  // Get or create student's learning logbook
  async getByStudentId(req: Request, res: Response) {
    try {
      const { studentId } = req.params;

      let logbook = await prisma.learningLogbook.findUnique({
        where: { studentId },
        include: {
          student: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      // Create logbook if doesn't exist
      if (!logbook) {
        logbook = await prisma.learningLogbook.create({
          data: {
            studentId
          },
          include: {
            student: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            }
          }
        });
      }

      return res.json({
        success: true,
        data: logbook,
        message: 'Learning logbook retrieved successfully'
      });
    } catch (error: any) {
      console.error('Get logbook error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve learning logbook',
        error: error.message
      });
    }
  },

  // Update skill scores
  async updateSkills(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const skillUpdates = req.body;

      // Validate skill scores (must be 0-5)
      const validatedUpdates: any = {};
      for (const [key, value] of Object.entries(skillUpdates)) {
        if (key.startsWith('comp') && key.includes('skill')) {
          const score = value as number;
          if (score < 0 || score > 5) {
            return res.status(400).json({
              success: false,
              message: `Invalid score for ${key}. Must be between 0 and 5.`
            });
          }
          validatedUpdates[key] = score;
        }
      }

      // Update logbook
      const logbook = await prisma.learningLogbook.update({
        where: { studentId },
        data: validatedUpdates
      });

      // Recalculate overall progress
      const totalSkills = 28; // 4 competences × 7 skills
      let totalScore = 0;

      for (let comp = 1; comp <= 4; comp++) {
        for (let skill = 1; skill <= 7; skill++) {
          const fieldName = `comp${comp}_skill${skill}` as keyof typeof logbook;
          totalScore += (logbook[fieldName] as number) || 0;
        }
      }

      const overallProgress = (totalScore / (totalSkills * 5)) * 100;

      // Check if all skills are at level 5 (complete)
      const isComplete = overallProgress === 100;

      // Update progress and completion status
      const updatedLogbook = await prisma.learningLogbook.update({
        where: { studentId },
        data: {
          overallProgress,
          isComplete,
          ...(isComplete && !logbook.completedAt && { completedAt: new Date() })
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      return res.json({
        success: true,
        data: updatedLogbook,
        message: 'Logbook updated successfully'
      });
    } catch (error: any) {
      console.error('Update logbook error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update logbook',
        error: error.message
      });
    }
  },

  // Validate a competence (mark it as validated)
  async validateCompetence(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const { competence } = req.body;

      if (!competence || competence < 1 || competence > 4) {
        return res.status(400).json({
          success: false,
          message: 'Competence must be between 1 and 4'
        });
      }

      // Check if all skills in competence are at level 3 or higher
      const logbook = await prisma.learningLogbook.findUnique({
        where: { studentId }
      });

      if (!logbook) {
        return res.status(404).json({
          success: false,
          message: 'Learning logbook not found'
        });
      }

      let canValidate = true;
      for (let skill = 1; skill <= 7; skill++) {
        const fieldName = `comp${competence}_skill${skill}` as keyof typeof logbook;
        const score = (logbook[fieldName] as number) || 0;
        if (score < 3) {
          canValidate = false;
          break;
        }
      }

      if (!canValidate) {
        return res.status(400).json({
          success: false,
          message: 'All skills in this competence must be at level 3 or higher to validate'
        });
      }

      const validatedField = `comp${competence}_validated` as keyof typeof logbook;
      const updatedLogbook = await prisma.learningLogbook.update({
        where: { studentId },
        data: {
          [validatedField]: true
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      return res.json({
        success: true,
        data: updatedLogbook,
        message: `Competence ${competence} validated successfully`
      });
    } catch (error: any) {
      console.error('Validate competence error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to validate competence',
        error: error.message
      });
    }
  },

  // Get competence details with skill descriptions
  async getCompetenceDetails(req: Request, res: Response) {
    try {
      // GDE Grid structure - Official French driving competences
      const gdeGrid = {
        competence1: {
          name: 'Maîtriser le maniement du véhicule dans un trafic faible ou nul',
          skills: [
            'Connaître les principaux organes et commandes du véhicule',
            'Effectuer des vérifications intérieures et extérieures',
            'Entrer, s\'installer au poste de conduite et en sortir',
            'Tenir, tourner le volant et maintenir la trajectoire',
            'Démarrer et s\'arrêter',
            'Doser l\'accélération et le freinage à diverses allures',
            'Utiliser la boîte de vitesses'
          ]
        },
        competence2: {
          name: 'Appréhender la route et circuler dans des conditions normales',
          skills: [
            'Connaître et respecter les règles de circulation',
            'Rechercher la signalisation, les indices utiles et en tenir compte',
            'Positionner le véhicule sur la chaussée et choisir la voie de circulation',
            'Adapter l\'allure aux situations',
            'Détecter, identifier et franchir les intersections suivant le régime de priorité',
            'Tourner à droite et à gauche en agglomération',
            'Franchir les ronds-points et les carrefours à sens giratoire'
          ]
        },
        competence3: {
          name: 'Circuler dans des conditions difficiles et partager la route avec les autres usagers',
          skills: [
            'Évaluer et maintenir les distances de sécurité',
            'Croiser, dépasser, être dépassé',
            'Passer des virages et conduire en déclivité',
            'Connaître les caractéristiques des autres usagers et savoir se comporter à leur égard',
            'S\'insérer, circuler et sortir d\'une voie rapide',
            'Conduire dans une file de véhicules et dans une circulation dense',
            'Conduire quand l\'adhérence et la visibilité sont réduites'
          ]
        },
        competence4: {
          name: 'Pratiquer une conduite autonome, sûre et économique',
          skills: [
            'Suivre un itinéraire de manière autonome',
            'Préparer et effectuer un voyage longue distance en autonomie',
            'Connaître les principaux facteurs de risque au volant',
            'Connaître les comportements à adopter en cas d\'accident',
            'Faire l\'expérience des aides à la conduite du véhicule',
            'Avoir des notions sur l\'entretien, le dépannage et les situations d\'urgence',
            'Pratiquer l\'éco-conduite'
          ]
        }
      };

      return res.json({
        success: true,
        data: gdeGrid,
        message: 'GDE competence details retrieved successfully'
      });
    } catch (error: any) {
      console.error('Get competence details error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve competence details',
        error: error.message
      });
    }
  },

  // Get progress summary for a student
  async getProgressSummary(req: Request, res: Response) {
    try {
      const { studentId } = req.params;

      const logbook = await prisma.learningLogbook.findUnique({
        where: { studentId }
      });

      if (!logbook) {
        return res.status(404).json({
          success: false,
          message: 'Learning logbook not found'
        });
      }

      // Calculate progress per competence
      const competencesProgress = [];
      for (let comp = 1; comp <= 4; comp++) {
        let totalScore = 0;
        const skills = [];

        for (let skill = 1; skill <= 7; skill++) {
          const fieldName = `comp${comp}_skill${skill}` as keyof typeof logbook;
          const score = (logbook[fieldName] as number) || 0;
          totalScore += score;
          skills.push({ skill, score });
        }

        const validatedField = `comp${comp}_validated` as keyof typeof logbook;
        const isValidated = logbook[validatedField] as boolean;
        const progress = (totalScore / 35) * 100; // 7 skills × 5 max score

        competencesProgress.push({
          competence: comp,
          progress,
          isValidated,
          skills
        });
      }

      return res.json({
        success: true,
        data: {
          studentId,
          overallProgress: logbook.overallProgress,
          isComplete: logbook.isComplete,
          completedAt: logbook.completedAt,
          competences: competencesProgress
        },
        message: 'Progress summary retrieved successfully'
      });
    } catch (error: any) {
      console.error('Get progress summary error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve progress summary',
        error: error.message
      });
    }
  }
};
