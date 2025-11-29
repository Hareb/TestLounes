import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Compter les ressources principales
    const [
      totalStudents,
      activeStudents,
      totalInstructors,
      totalVehicles,
      totalLessons,
      completedLessons,
      totalRevenue
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.instructor.count({ where: { status: 'ACTIVE' } }),
      prisma.vehicle.count({ where: { status: { in: ['AVAILABLE', 'IN_USE'] } } }),
      prisma.lesson.count(),
      prisma.lesson.count({ where: { status: 'COMPLETED' } }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      })
    ]);

    // Statistiques des examens
    const examStats = await prisma.student.groupBy({
      by: ['codeExamPassed', 'driveExamPassed'],
      _count: true
    });

    // Leçons à venir (7 prochains jours)
    const upcomingLessons = await prisma.lesson.findMany({
      where: {
        startTime: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        status: { in: ['SCHEDULED', 'CONFIRMED'] }
      },
      include: {
        students: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
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
        }
      },
      orderBy: { startTime: 'asc' },
      take: 10
    });

    // Paiements récents
    const recentPayments = await prisma.payment.findMany({
      where: { status: 'COMPLETED' },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Revenus mensuels (6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await prisma.payment.groupBy({
      by: ['paidAt'],
      where: {
        status: 'COMPLETED',
        paidAt: { gte: sixMonthsAgo }
      },
      _sum: { amount: true }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          activeStudents,
          totalInstructors,
          totalVehicles,
          totalLessons,
          completedLessons,
          totalRevenue: totalRevenue._sum.amount || 0
        },
        examStats,
        upcomingLessons,
        recentPayments,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

export const getInstructorDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
      return;
    }

    const instructor = await prisma.instructor.findUnique({
      where: { userId: req.user.userId }
    });

    if (!instructor) {
      res.status(404).json({
        success: false,
        message: 'Profil moniteur non trouvé'
      });
      return;
    }

    // Leçons du jour
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLessons = await prisma.lesson.findMany({
      where: {
        instructorId: instructor.id,
        startTime: {
          gte: today,
          lt: tomorrow
        }
      },
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
        vehicle: true
      },
      orderBy: { startTime: 'asc' }
    });

    // Statistiques personnelles
    const [totalLessons, completedLessons] = await Promise.all([
      prisma.lesson.count({
        where: { instructorId: instructor.id }
      }),
      prisma.lesson.count({
        where: {
          instructorId: instructor.id,
          status: 'COMPLETED'
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        todayLessons,
        stats: {
          totalLessons,
          completedLessons,
          totalHoursTaught: instructor.totalHoursTaught
        }
      }
    });
  } catch (error) {
    console.error('Get instructor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du tableau de bord'
    });
  }
};
