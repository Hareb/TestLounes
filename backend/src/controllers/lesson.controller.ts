import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { LessonStatus, LessonType } from '@prisma/client';

export const getAllLessons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, instructorId, status, type, startDate, endDate } = req.query;

    const where: any = {};

    // CHANGÉ: Filtre par élève via la table de liaison
    if (studentId) {
      where.students = {
        some: {
          studentId: studentId
        }
      };
    }

    if (instructorId) where.instructorId = instructorId;
    if (status) where.status = status;
    if (type) where.type = type;

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate as string);
      if (endDate) where.startTime.lte = new Date(endDate as string);
    }

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        students: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    phone: true
                  }
                }
              }
            }
          }
        },
        instructor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        vehicle: true
      },
      orderBy: { startTime: 'desc' }
    });

    res.json({
      success: true,
      data: lessons
    });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des leçons'
    });
  }
};

export const getLessonById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            student: {
              include: {
                user: true
              }
            }
          }
        },
        instructor: {
          include: {
            user: true
          }
        },
        vehicle: true
      }
    });

    if (!lesson) {
      res.status(404).json({
        success: false,
        message: 'Leçon non trouvée'
      });
      return;
    }

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la leçon'
    });
  }
};

export const createLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      studentIds, // CHANGÉ: accepte un tableau d'IDs
      instructorId,
      vehicleId,
      type,
      startTime,
      duration,
      topic,
      location
    } = req.body;

    // Validation: au moins 1 élève requis
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Au moins un élève est requis'
      });
      return;
    }

    // Calculer l'heure de fin
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

    // Vérifier les conflits de planning pour moniteur/véhicule
    const conflicts = await prisma.lesson.findMany({
      where: {
        OR: [
          { instructorId },
          { vehicleId }
        ],
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        AND: [
          { startTime: { lte: end } },
          { endTime: { gte: start } }
        ]
      }
    });

    if (conflicts.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Conflit de planning détecté pour le moniteur ou le véhicule'
      });
      return;
    }

    // NOUVEAU: Vérifier les conflits pour les élèves
    const studentConflicts = await prisma.lesson.findMany({
      where: {
        students: {
          some: {
            studentId: { in: studentIds }
          }
        },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        AND: [
          { startTime: { lte: end } },
          { endTime: { gte: start } }
        ]
      },
      include: {
        students: {
          include: {
            student: {
              include: {
                user: { select: { firstName: true, lastName: true } }
              }
            }
          }
        }
      }
    });

    if (studentConflicts.length > 0) {
      const conflictedStudents = studentConflicts[0].students
        .map(s => `${s.student.user.firstName} ${s.student.user.lastName}`)
        .join(', ');

      res.status(409).json({
        success: false,
        message: `Conflit de planning pour: ${conflictedStudents}`
      });
      return;
    }

    // Créer la leçon avec plusieurs élèves
    const lesson = await prisma.lesson.create({
      data: {
        instructorId,
        vehicleId,
        type,
        startTime: start,
        endTime: end,
        duration,
        topic,
        location,
        isGroupLesson: studentIds.length > 1, // Marquer comme cours collectif si 2+ élèves
        students: {
          create: studentIds.map(studentId => ({
            studentId
          }))
        }
      },
      include: {
        students: {
          include: {
            student: {
              include: {
                user: true
              }
            }
          }
        },
        instructor: {
          include: {
            user: true
          }
        },
        vehicle: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Leçon créée avec succès',
      data: lesson
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la leçon'
    });
  }
};

export const updateLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Si on change l'heure de début, recalculer l'heure de fin
    if (updateData.startTime && updateData.duration) {
      const start = new Date(updateData.startTime);
      updateData.endTime = new Date(start.getTime() + updateData.duration * 60 * 60 * 1000);
    }

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.startTime && { startTime: new Date(updateData.startTime) }),
        ...(updateData.endTime && { endTime: new Date(updateData.endTime) })
      },
      include: {
        students: {
          include: {
            student: {
              include: {
                user: true
              }
            }
          }
        },
        instructor: {
          include: {
            user: true
          }
        },
        vehicle: true
      }
    });

    res.json({
      success: true,
      message: 'Leçon mise à jour avec succès',
      data: lesson
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la leçon'
    });
  }
};

export const cancelLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        status: LessonStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason
      }
    });

    res.json({
      success: true,
      message: 'Leçon annulée avec succès',
      data: lesson
    });
  } catch (error) {
    console.error('Cancel lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la leçon'
    });
  }
};

export const completeLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        status: LessonStatus.COMPLETED,
        notes
      },
      include: {
        students: {
          include: {
            student: true
          }
        },
        instructor: true
      }
    });

    // Déduire les heures COMPLÈTES pour CHAQUE élève PRÉSENT
    const hoursPerStudent = lesson.duration; // Chaque élève perd la durée complète (choix de l'utilisateur)

    for (const enrollment of lesson.students) {
      // Vérifier si l'élève était présent (par défaut: true)
      if (enrollment.attended) {
        // Déduire les heures selon le type de cours
        if (lesson.type === LessonType.CODE) {
          await prisma.student.update({
            where: { id: enrollment.studentId },
            data: {
              codeHoursUsed: { increment: hoursPerStudent }
            }
          });
        } else if (lesson.type === LessonType.DRIVE || lesson.type === LessonType.EXAM_PREPARATION) {
          await prisma.student.update({
            where: { id: enrollment.studentId },
            data: {
              driveHoursUsed: { increment: hoursPerStudent }
            }
          });
        }

        // Tracker les heures déduites dans la table de liaison
        await prisma.lessonStudent.update({
          where: {
            lessonId_studentId: {
              lessonId: lesson.id,
              studentId: enrollment.studentId
            }
          },
          data: {
            hoursDeducted: hoursPerStudent
          }
        });
      }
    }

    // Mettre à jour les heures enseignées du moniteur (une seule fois)
    if (lesson.instructorId) {
      await prisma.instructor.update({
        where: { id: lesson.instructorId },
        data: {
          totalHoursTaught: { increment: lesson.duration }
        }
      });
    }

    res.json({
      success: true,
      message: 'Leçon terminée avec succès',
      data: lesson
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la finalisation de la leçon'
    });
  }
};

// Mettre à jour les présences des élèves d'une leçon
export const updateAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { attendances } = req.body; // Array: [{ studentId, attended: boolean }]

    if (!attendances || !Array.isArray(attendances)) {
      res.status(400).json({
        success: false,
        message: 'Format de données invalide'
      });
      return;
    }

    // Vérifier que la leçon existe
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        students: true
      }
    });

    if (!lesson) {
      res.status(404).json({
        success: false,
        message: 'Leçon non trouvée'
      });
      return;
    }

    // Mettre à jour chaque présence
    for (const attendance of attendances) {
      await prisma.lessonStudent.update({
        where: {
          lessonId_studentId: {
            lessonId: id,
            studentId: attendance.studentId
          }
        },
        data: {
          attended: attendance.attended
        }
      });
    }

    // Récupérer la leçon mise à jour
    const updatedLesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            student: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Présences mises à jour avec succès',
      data: updatedLesson
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des présences'
    });
  }
};

export const deleteLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Récupérer la leçon avant de la supprimer pour ajuster les heures si nécessaire
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            student: true
          }
        },
        instructor: true
      }
    });

    if (!lesson) {
      res.status(404).json({
        success: false,
        message: 'Leçon non trouvée'
      });
      return;
    }

    // Si la leçon était COMPLETED, décrémenter les heures pour TOUS les élèves
    if (lesson.status === LessonStatus.COMPLETED) {
      for (const enrollment of lesson.students) {
        // Utiliser les heures déduites enregistrées (si disponibles) pour plus de précision
        const hoursToReturn = enrollment.hoursDeducted || lesson.duration;

        // Décrémenter les heures selon le type de cours
        if (lesson.type === LessonType.CODE) {
          await prisma.student.update({
            where: { id: enrollment.studentId },
            data: {
              codeHoursUsed: { decrement: hoursToReturn }
            }
          });
        } else if (lesson.type === LessonType.DRIVE || lesson.type === LessonType.EXAM_PREPARATION) {
          await prisma.student.update({
            where: { id: enrollment.studentId },
            data: {
              driveHoursUsed: { decrement: hoursToReturn }
            }
          });
        }
      }

      // Décrémenter les heures du moniteur
      if (lesson.instructorId) {
        await prisma.instructor.update({
          where: { id: lesson.instructorId },
          data: {
            totalHoursTaught: { decrement: lesson.duration }
          }
        });
      }
    }

    // Supprimer la leçon (CASCADE supprimera automatiquement les entrées lesson_students)
    await prisma.lesson.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Leçon supprimée avec succès'
    });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la leçon'
    });
  }
};
