import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { Role, InstructorStatus } from '@prisma/client';

export const getAllInstructors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status) where.status = status;

    const instructors = await prisma.instructor.findMany({
      where,
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
        vehicles: true,
        _count: {
          select: {
            lessons: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: instructors
    });
  } catch (error) {
    console.error('Get instructors error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des moniteurs'
    });
  }
};

export const getInstructorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const instructor = await prisma.instructor.findUnique({
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
        vehicles: true,
        availabilities: true,
        lessons: {
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
          orderBy: { startTime: 'desc' },
          take: 20
        }
      }
    });

    if (!instructor) {
      res.status(404).json({
        success: false,
        message: 'Moniteur non trouvé'
      });
      return;
    }

    res.json({
      success: true,
      data: instructor
    });
  } catch (error) {
    console.error('Get instructor error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du moniteur'
    });
  }
};

export const createInstructor = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      diploma,
      diplomaNumber,
      diplomaExpiry,
      weeklyHours
    } = req.body;

    const instructor = await prisma.instructor.create({
      data: {
        diploma,
        diplomaNumber,
        diplomaExpiry: diplomaExpiry ? new Date(diplomaExpiry) : undefined,
        weeklyHours: weeklyHours || 35,
        user: {
          create: {
            email,
            password,
            firstName,
            lastName,
            phone,
            role: Role.INSTRUCTOR
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
      message: 'Moniteur créé avec succès',
      data: instructor
    });
  } catch (error) {
    console.error('Create instructor error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du moniteur'
    });
  }
};

export const updateInstructor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const instructor = await prisma.instructor.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.diplomaExpiry && { diplomaExpiry: new Date(updateData.diplomaExpiry) })
      },
      include: {
        user: true
      }
    });

    res.json({
      success: true,
      message: 'Moniteur mis à jour avec succès',
      data: instructor
    });
  } catch (error) {
    console.error('Update instructor error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du moniteur'
    });
  }
};

export const deleteInstructor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.instructor.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Moniteur supprimé avec succès'
    });
  } catch (error) {
    console.error('Delete instructor error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du moniteur'
    });
  }
};
