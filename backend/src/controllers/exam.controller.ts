import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const examController = {
  // Get all exams (filtered by role)
  async getAll(req: Request, res: Response) {
    try {
      const { type, status, studentId, startDate, endDate } = req.query;
      const userRole = (req as any).user.role;
      const userId = (req as any).user.userId;

      let whereClause: any = {};

      // Role-based filtering
      if (userRole === 'STUDENT') {
        const student = await prisma.student.findUnique({
          where: { userId }
        });
        whereClause.studentId = student?.id;
      }

      // Additional filters
      if (type) whereClause.type = type;
      if (status) whereClause.status = status;
      if (studentId) whereClause.studentId = studentId;

      // Date range filter
      if (startDate || endDate) {
        whereClause.examDate = {};
        if (startDate) whereClause.examDate.gte = new Date(startDate as string);
        if (endDate) whereClause.examDate.lte = new Date(endDate as string);
      }

      const exams = await prisma.exam.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true
                }
              }
            }
          }
        },
        orderBy: { examDate: 'desc' }
      });

      return res.json({
        success: true,
        data: exams,
        message: 'Exams retrieved successfully'
      });
    } catch (error: any) {
      console.error('Get exams error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve exams',
        error: error.message
      });
    }
  },

  // Get exam by ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const exam = await prisma.exam.findUnique({
        where: { id },
        include: {
          student: {
            include: {
              user: true
            }
          }
        }
      });

      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found'
        });
      }

      return res.json({
        success: true,
        data: exam,
        message: 'Exam retrieved successfully'
      });
    } catch (error: any) {
      console.error('Get exam error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve exam',
        error: error.message
      });
    }
  },

  // Schedule new exam
  async create(req: Request, res: Response) {
    try {
      const {
        studentId,
        type,
        examDate,
        examCenter,
        examAddress,
        notes
      } = req.body;

      // Validation
      if (!studentId || !type || !examDate) {
        return res.status(400).json({
          success: false,
          message: 'Student ID, type, and exam date are required'
        });
      }

      // Validate type
      if (type !== 'CODE' && type !== 'DRIVE') {
        return res.status(400).json({
          success: false,
          message: 'Exam type must be CODE or DRIVE'
        });
      }

      // Check if student exists
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: true
        }
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // For DRIVE exam, check if student passed CODE exam
      if (type === 'DRIVE') {
        const passedCodeExam = await prisma.exam.findFirst({
          where: {
            studentId,
            type: 'CODE',
            status: 'PASSED'
          }
        });

        if (!passedCodeExam) {
          return res.status(400).json({
            success: false,
            message: 'Student must pass CODE exam before scheduling DRIVE exam'
          });
        }
      }

      const exam = await prisma.exam.create({
        data: {
          studentId,
          type,
          examDate: new Date(examDate),
          examCenter,
          examAddress,
          notes,
          maxScore: type === 'CODE' ? 40 : null
        },
        include: {
          student: {
            include: {
              user: true
            }
          }
        }
      });

      return res.status(201).json({
        success: true,
        data: exam,
        message: 'Exam scheduled successfully'
      });
    } catch (error: any) {
      console.error('Create exam error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to schedule exam',
        error: error.message
      });
    }
  },

  // Update exam
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        examDate,
        examCenter,
        examAddress,
        status,
        notes
      } = req.body;

      const exam = await prisma.exam.update({
        where: { id },
        data: {
          ...(examDate && { examDate: new Date(examDate) }),
          ...(examCenter !== undefined && { examCenter }),
          ...(examAddress !== undefined && { examAddress }),
          ...(status && { status }),
          ...(notes !== undefined && { notes })
        },
        include: {
          student: {
            include: {
              user: true
            }
          }
        }
      });

      return res.json({
        success: true,
        data: exam,
        message: 'Exam updated successfully'
      });
    } catch (error: any) {
      console.error('Update exam error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update exam',
        error: error.message
      });
    }
  },

  // Record exam result
  async recordResult(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { result, score, faults, accompaniedBy, notes } = req.body;

      if (result === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Result is required (true for passed, false for failed)'
        });
      }

      const exam = await prisma.exam.findUnique({
        where: { id }
      });

      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found'
        });
      }

      // Validate score for CODE exam
      if (exam.type === 'CODE') {
        if (score === undefined || score < 0 || score > 40) {
          return res.status(400).json({
            success: false,
            message: 'Score is required for CODE exam and must be between 0 and 40'
          });
        }

        // CODE exam requires score >= 35 to pass
        if (result && score < 35) {
          return res.status(400).json({
            success: false,
            message: 'CODE exam requires a score of at least 35 to pass'
          });
        }
      }

      const updatedExam = await prisma.exam.update({
        where: { id },
        data: {
          status: result ? 'PASSED' : 'FAILED',
          result,
          score,
          faults,
          accompaniedBy,
          notes
        },
        include: {
          student: {
            include: {
              user: true
            }
          }
        }
      });

      // TODO: Send result notification email

      return res.json({
        success: true,
        data: updatedExam,
        message: `Exam result recorded: ${result ? 'PASSED' : 'FAILED'}`
      });
    } catch (error: any) {
      console.error('Record exam result error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to record exam result',
        error: error.message
      });
    }
  },

  // Send convocation email
  async sendConvocation(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const exam = await prisma.exam.findUnique({
        where: { id },
        include: {
          student: {
            include: {
              user: true
            }
          }
        }
      });

      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found'
        });
      }

      if (exam.status !== 'SCHEDULED') {
        return res.status(400).json({
          success: false,
          message: 'Can only send convocation for scheduled exams'
        });
      }

      // TODO: Send convocation email using email service
      // await emailService.sendExamNotification(exam.student.user.email, exam);

      const updatedExam = await prisma.exam.update({
        where: { id },
        data: {
          convocationSent: true,
          convocationDate: new Date()
        }
      });

      return res.json({
        success: true,
        data: updatedExam,
        message: 'Convocation sent successfully'
      });
    } catch (error: any) {
      console.error('Send convocation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send convocation',
        error: error.message
      });
    }
  },

  // Cancel exam
  async cancel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const exam = await prisma.exam.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          notes: notes || 'Exam cancelled'
        },
        include: {
          student: {
            include: {
              user: true
            }
          }
        }
      });

      return res.json({
        success: true,
        data: exam,
        message: 'Exam cancelled successfully'
      });
    } catch (error: any) {
      console.error('Cancel exam error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel exam',
        error: error.message
      });
    }
  },

  // Mark as no-show
  async markNoShow(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const exam = await prisma.exam.update({
        where: { id },
        data: {
          status: 'NO_SHOW',
          notes: notes || 'Student did not show up for exam'
        },
        include: {
          student: {
            include: {
              user: true
            }
          }
        }
      });

      return res.json({
        success: true,
        data: exam,
        message: 'Exam marked as no-show'
      });
    } catch (error: any) {
      console.error('Mark no-show error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark exam as no-show',
        error: error.message
      });
    }
  },

  // Get exam statistics
  async getStats(req: Request, res: Response) {
    try {
      const totalExams = await prisma.exam.count();
      const scheduledExams = await prisma.exam.count({
        where: { status: 'SCHEDULED' }
      });
      const passedExams = await prisma.exam.count({
        where: { status: 'PASSED' }
      });
      const failedExams = await prisma.exam.count({
        where: { status: 'FAILED' }
      });

      // Success rate per type
      const codeExams = await prisma.exam.findMany({
        where: { type: 'CODE' }
      });
      const driveExams = await prisma.exam.findMany({
        where: { type: 'DRIVE' }
      });

      const codePassRate = codeExams.length > 0
        ? (codeExams.filter(e => e.status === 'PASSED').length / codeExams.length) * 100
        : 0;

      const drivePassRate = driveExams.length > 0
        ? (driveExams.filter(e => e.status === 'PASSED').length / driveExams.length) * 100
        : 0;

      // Average CODE exam score
      const codeScores = codeExams
        .filter(e => e.score !== null)
        .map(e => e.score as number);
      const avgCodeScore = codeScores.length > 0
        ? codeScores.reduce((sum, score) => sum + score, 0) / codeScores.length
        : 0;

      return res.json({
        success: true,
        data: {
          totalExams,
          scheduledExams,
          passedExams,
          failedExams,
          codePassRate: Math.round(codePassRate * 100) / 100,
          drivePassRate: Math.round(drivePassRate * 100) / 100,
          avgCodeScore: Math.round(avgCodeScore * 100) / 100,
          totalCodeExams: codeExams.length,
          totalDriveExams: driveExams.length
        },
        message: 'Exam statistics retrieved successfully'
      });
    } catch (error: any) {
      console.error('Get exam stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve exam statistics',
        error: error.message
      });
    }
  }
};
