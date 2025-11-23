import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { LessonStatus, LessonType } from '@prisma/client';

export const getAllLessons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, instructorId, status, type, startDate, endDate } = req.query;

    const where: any = {};
    if (studentId) where.studentId = studentId;
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
        student: {
          include: {
            user: true
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
      studentId,
      instructorId,
      vehicleId,
      type,
      startTime,
      duration,
      topic,
      location
    } = req.body;

    // Calculer l'heure de fin
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

    // Vérifier les conflits de planning
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
        message: 'Conflit de planning détecté'
      });
      return;
    }

    const lesson = await prisma.lesson.create({
      data: {
        studentId,
        instructorId,
        vehicleId,
        type,
        startTime: start,
        endTime: end,
        duration,
        topic,
        location
      },
      include: {
        student: {
          include: {
            user: true
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
        student: {
          include: {
            user: true
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
        student: true
      }
    });

    // Mettre à jour les heures utilisées de l'élève
    if (lesson.type === LessonType.CODE) {
      await prisma.student.update({
        where: { id: lesson.studentId },
        data: {
          codeHoursUsed: { increment: lesson.duration }
        }
      });
    } else if (lesson.type === LessonType.DRIVE || lesson.type === LessonType.EXAM_PREPARATION) {
      await prisma.student.update({
        where: { id: lesson.studentId },
        data: {
          driveHoursUsed: { increment: lesson.duration }
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

export const deleteLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

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
