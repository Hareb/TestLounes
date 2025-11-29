import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { Role, StudentStatus, FormationType } from '@prisma/client';

// Obtenir tous les élèves
export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, formationType, search, page = '1', limit = '10' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (formationType) {
      where.formationType = formationType;
    }

    if (search) {
      where.OR = [
        { user: { firstName: { contains: search as string, mode: 'insensitive' } } },
        { user: { lastName: { contains: search as string, mode: 'insensitive' } } },
        { user: { email: { contains: search as string, mode: 'insensitive' } } },
        { neph: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              avatar: true,
              isActive: true
            }
          },
          _count: {
            select: {
              lessonEnrollments: true,
              payments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.student.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des élèves'
    });
  }
};

// Obtenir un élève par ID
export const getStudentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
            isActive: true,
            createdAt: true
          }
        },
        lessonEnrollments: {
          include: {
            lesson: {
              include: {
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
              }
            }
          },
          take: 10
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        evaluations: {
          orderBy: { createdAt: 'desc' }
        },
        documents: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Élève non trouvé'
      });
      return;
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'élève'
    });
  }
};

// Créer un nouvel élève
export const createStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      // User data
      email,
      password,
      firstName,
      lastName,
      phone,
      // Student data
      dateOfBirth,
      placeOfBirth,
      address,
      city,
      postalCode,
      neph,
      formationType,
      codeHoursPaid,
      driveHoursPaid
    } = req.body;

    // Validation
    if (!email || !firstName || !lastName || !dateOfBirth || !address) {
      res.status(400).json({
        success: false,
        message: 'Champs obligatoires manquants'
      });
      return;
    }

    // Créer l'utilisateur et l'élève
    const student = await prisma.student.create({
      data: {
        dateOfBirth: new Date(dateOfBirth),
        placeOfBirth,
        address,
        city,
        postalCode,
        neph,
        formationType: formationType || FormationType.TRADITIONAL,
        codeHoursPaid: codeHoursPaid || 0,
        driveHoursPaid: driveHoursPaid || 0,
        user: {
          create: {
            email,
            password, // Devrait être hashé avant
            firstName,
            lastName,
            phone,
            role: Role.STUDENT
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Élève créé avec succès',
      data: student
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'élève'
    });
  }
};

// Mettre à jour un élève
export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const student = await prisma.student.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.dateOfBirth && { dateOfBirth: new Date(updateData.dateOfBirth) }),
        ...(updateData.idCardExpiry && { idCardExpiry: new Date(updateData.idCardExpiry) })
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Élève mis à jour avec succès',
      data: student
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'élève'
    });
  }
};

// Supprimer un élève
export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.student.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Élève supprimé avec succès'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'élève'
    });
  }
};

// Obtenir les statistiques d'un élève
export const getStudentStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        lessonEnrollments: {
          where: {
            lesson: {
              status: 'COMPLETED'
            }
          },
          include: {
            lesson: true
          }
        },
        evaluations: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Élève non trouvé'
      });
      return;
    }

    const stats = {
      progression: {
        codeHoursPaid: student.codeHoursPaid,
        codeHoursUsed: student.codeHoursUsed,
        codeHoursRemaining: student.codeHoursPaid - student.codeHoursUsed,
        driveHoursPaid: student.driveHoursPaid,
        driveHoursUsed: student.driveHoursUsed,
        driveHoursRemaining: student.driveHoursPaid - student.driveHoursUsed
      },
      exams: {
        codeExamPassed: student.codeExamPassed,
        codeExamDate: student.codeExamDate,
        driveExamAttempts: student.driveExamAttempts,
        driveExamDate: student.driveExamDate,
        driveExamPassed: student.driveExamPassed
      },
      latestEvaluation: student.evaluations[0] || null,
      totalLessonsCompleted: student.lessonEnrollments.length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};
