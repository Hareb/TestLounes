import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const bookingController = {
  // Get all bookings (filtered by role)
  async getAll(req: Request, res: Response) {
    try {
      const { status, studentId, instructorId, startDate, endDate } = req.query;
      const userRole = (req as any).user.role;
      const userId = (req as any).user.userId;

      let whereClause: any = {};

      // Role-based filtering
      if (userRole === 'STUDENT') {
        const student = await prisma.student.findUnique({
          where: { userId }
        });
        whereClause.studentId = student?.id;
      } else if (userRole === 'INSTRUCTOR') {
        const instructor = await prisma.instructor.findUnique({
          where: { userId }
        });
        whereClause.instructorId = instructor?.id;
      }

      // Additional filters
      if (status) whereClause.status = status;
      if (studentId) whereClause.studentId = studentId;
      if (instructorId) whereClause.instructorId = instructorId;

      // Date range filter
      if (startDate || endDate) {
        whereClause.startTime = {};
        if (startDate) whereClause.startTime.gte = new Date(startDate as string);
        if (endDate) whereClause.startTime.lte = new Date(endDate as string);
      }

      const bookings = await prisma.booking.findMany({
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
          },
          instructor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          vehicle: {
            select: {
              brand: true,
              model: true,
              plateNumber: true
            }
          },
          lesson: true
        },
        orderBy: { startTime: 'asc' }
      });

      return res.json({
        success: true,
        data: bookings,
        message: 'Bookings retrieved successfully'
      });
    } catch (error: any) {
      console.error('Get bookings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve bookings',
        error: error.message
      });
    }
  },

  // Get booking by ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const booking = await prisma.booking.findUnique({
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
          vehicle: true,
          lesson: true
        }
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      return res.json({
        success: true,
        data: booking,
        message: 'Booking retrieved successfully'
      });
    } catch (error: any) {
      console.error('Get booking error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve booking',
        error: error.message
      });
    }
  },

  // Create booking (student)
  async create(req: Request, res: Response) {
    try {
      const {
        studentId,
        instructorId,
        vehicleId,
        type,
        startTime,
        duration,
        studentNotes
      } = req.body;

      // Validation
      if (!studentId || !type || !startTime || !duration) {
        return res.status(400).json({
          success: false,
          message: 'Student ID, type, start time, and duration are required'
        });
      }

      // Calculate end time
      const start = new Date(startTime);
      const end = new Date(start);
      end.setHours(end.getHours() + duration);

      // Check if student has available hours
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          packagePurchases: {
            where: {
              isActive: true,
              OR: [
                { expiryDate: null },
                { expiryDate: { gte: new Date() } }
              ]
            }
          }
        }
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Calculate total available hours
      const totalDriveHours = student.packagePurchases.reduce(
        (sum, p) => sum + (p.driveHoursBought - p.driveHoursUsed),
        0
      );
      const totalCodeHours = student.packagePurchases.reduce(
        (sum, p) => sum + (p.codeHoursBought - p.codeHoursUsed),
        0
      );

      if (type === 'DRIVE' && totalDriveHours < duration) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient driving hours. Please purchase additional hours.',
          availableHours: totalDriveHours
        });
      }

      if (type === 'CODE' && totalCodeHours < duration) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient code hours. Please purchase additional hours.',
          availableHours: totalCodeHours
        });
      }

      // Check for conflicts if instructor or vehicle specified
      if (instructorId || vehicleId) {
        const conflicts = await prisma.booking.findMany({
          where: {
            OR: [
              ...(instructorId ? [{ instructorId }] : []),
              ...(vehicleId ? [{ vehicleId }] : [])
            ],
            status: { in: ['PENDING', 'CONFIRMED'] },
            AND: [
              { startTime: { lt: end } },
              { endTime: { gt: start } }
            ]
          }
        });

        if (conflicts.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Time slot conflict with existing booking'
          });
        }
      }

      // Set cancellation deadline (24 hours before)
      const cancellationDeadline = new Date(start);
      cancellationDeadline.setHours(cancellationDeadline.getHours() - 24);

      const booking = await prisma.booking.create({
        data: {
          studentId,
          instructorId,
          vehicleId,
          type,
          startTime: start,
          endTime: end,
          duration,
          studentNotes,
          cancellationDeadline,
          canCancel: new Date() < cancellationDeadline
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

      return res.status(201).json({
        success: true,
        data: booking,
        message: 'Booking created successfully'
      });
    } catch (error: any) {
      console.error('Create booking error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create booking',
        error: error.message
      });
    }
  },

  // Confirm booking (admin/instructor)
  async confirm(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { instructorId, vehicleId, adminNotes } = req.body;

      const booking = await prisma.booking.findUnique({
        where: { id }
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      if (booking.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: 'Only pending bookings can be confirmed'
        });
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          ...(instructorId && { instructorId }),
          ...(vehicleId && { vehicleId }),
          ...(adminNotes && { adminNotes })
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

      // TODO: Send confirmation email to student

      return res.json({
        success: true,
        data: updatedBooking,
        message: 'Booking confirmed successfully'
      });
    } catch (error: any) {
      console.error('Confirm booking error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to confirm booking',
        error: error.message
      });
    }
  },

  // Cancel booking
  async cancel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { cancelReason } = req.body;
      const userId = (req as any).user.userId;

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          student: {
            include: {
              user: true
            }
          }
        }
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel completed or already cancelled booking'
        });
      }

      // Check if student is cancelling and if they can still cancel
      if (booking.student.userId === userId) {
        if (!booking.canCancel || (booking.cancellationDeadline && new Date() > booking.cancellationDeadline)) {
          return res.status(403).json({
            success: false,
            message: 'Cancellation deadline has passed'
          });
        }
      }

      const cancelledBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: userId,
          cancelReason
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
          }
        }
      });

      // TODO: Send cancellation notification

      return res.json({
        success: true,
        data: cancelledBooking,
        message: 'Booking cancelled successfully'
      });
    } catch (error: any) {
      console.error('Cancel booking error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel booking',
        error: error.message
      });
    }
  },

  // Convert booking to lesson (admin/instructor)
  async convertToLesson(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          student: {
            include: {
              packagePurchases: {
                where: {
                  isActive: true,
                  OR: [
                    { expiryDate: null },
                    { expiryDate: { gte: new Date() } }
                  ]
                },
                orderBy: { purchaseDate: 'asc' }
              }
            }
          }
        }
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      if (booking.status !== 'CONFIRMED') {
        return res.status(400).json({
          success: false,
          message: 'Only confirmed bookings can be converted to lessons'
        });
      }

      if (!booking.instructorId || !booking.vehicleId) {
        return res.status(400).json({
          success: false,
          message: 'Booking must have instructor and vehicle assigned'
        });
      }

      // Create lesson
      const lesson = await prisma.lesson.create({
        data: {
          studentId: booking.studentId,
          instructorId: booking.instructorId,
          vehicleId: booking.vehicleId,
          type: booking.type,
          status: 'SCHEDULED',
          startTime: booking.startTime,
          endTime: booking.endTime,
          duration: booking.duration,
          bookingId: booking.id
        }
      });

      // Update booking status
      await prisma.booking.update({
        where: { id },
        data: { status: 'COMPLETED' }
      });

      // Deduct hours from package purchase
      const purchase = booking.student.packagePurchases[0];
      if (purchase) {
        if (booking.type === 'DRIVE') {
          await prisma.packagePurchase.update({
            where: { id: purchase.id },
            data: {
              driveHoursUsed: purchase.driveHoursUsed + booking.duration
            }
          });
        } else if (booking.type === 'CODE') {
          await prisma.packagePurchase.update({
            where: { id: purchase.id },
            data: {
              codeHoursUsed: purchase.codeHoursUsed + booking.duration
            }
          });
        }
      }

      return res.json({
        success: true,
        data: lesson,
        message: 'Booking converted to lesson successfully'
      });
    } catch (error: any) {
      console.error('Convert to lesson error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to convert booking to lesson',
        error: error.message
      });
    }
  },

  // Mark booking as no-show
  async markNoShow(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;

      const booking = await prisma.booking.update({
        where: { id },
        data: {
          status: 'NO_SHOW',
          adminNotes: adminNotes || 'Student did not show up'
        },
        include: {
          student: {
            include: {
              user: true
            }
          }
        }
      });

      // TODO: Send no-show notification and potentially charge fee

      return res.json({
        success: true,
        data: booking,
        message: 'Booking marked as no-show'
      });
    } catch (error: any) {
      console.error('Mark no-show error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark booking as no-show',
        error: error.message
      });
    }
  },

  // Get available slots
  async getAvailableSlots(req: Request, res: Response) {
    try {
      const { date, instructorId, type } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Date is required'
        });
      }

      const startOfDay = new Date(date as string);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date as string);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all bookings for the date
      const existingBookings = await prisma.booking.findMany({
        where: {
          ...(instructorId && { instructorId: instructorId as string }),
          status: { in: ['PENDING', 'CONFIRMED'] },
          startTime: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        select: {
          startTime: true,
          endTime: true
        }
      });

      // Generate time slots (8am to 6pm, 1-hour slots)
      const slots = [];
      for (let hour = 8; hour < 18; hour++) {
        const slotStart = new Date(startOfDay);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(slotStart);
        slotEnd.setHours(slotEnd.getHours() + 1);

        // Check if slot conflicts with existing bookings
        const hasConflict = existingBookings.some(booking => {
          return (
            (slotStart >= booking.startTime && slotStart < booking.endTime) ||
            (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
            (slotStart <= booking.startTime && slotEnd >= booking.endTime)
          );
        });

        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          available: !hasConflict
        });
      }

      return res.json({
        success: true,
        data: slots,
        message: 'Available slots retrieved successfully'
      });
    } catch (error: any) {
      console.error('Get available slots error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve available slots',
        error: error.message
      });
    }
  }
};
