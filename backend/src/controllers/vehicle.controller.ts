import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getAllVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, type } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const vehicles = await prisma.vehicle.findMany({
      where,
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
        _count: {
          select: {
            lessons: true,
            maintenances: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des véhicules'
    });
  }
};

export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
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
        maintenances: {
          orderBy: { performedAt: 'desc' }
        }
      }
    });

    if (!vehicle) {
      res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
      return;
    }

    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du véhicule'
    });
  }
};

export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      brand,
      model,
      plateNumber,
      type,
      year,
      mileage,
      insuranceExpiry,
      instructorId
    } = req.body;

    const vehicle = await prisma.vehicle.create({
      data: {
        brand,
        model,
        plateNumber,
        type,
        year,
        mileage: mileage || 0,
        insuranceExpiry: new Date(insuranceExpiry),
        instructorId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Véhicule créé avec succès',
      data: vehicle
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du véhicule'
    });
  }
};

export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.insuranceExpiry && { insuranceExpiry: new Date(updateData.insuranceExpiry) }),
        ...(updateData.technicalControl && { technicalControl: new Date(updateData.technicalControl) }),
        ...(updateData.lastMaintenance && { lastMaintenance: new Date(updateData.lastMaintenance) }),
        ...(updateData.nextMaintenance && { nextMaintenance: new Date(updateData.nextMaintenance) })
      }
    });

    res.json({
      success: true,
      message: 'Véhicule mis à jour avec succès',
      data: vehicle
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du véhicule'
    });
  }
};

export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.vehicle.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Véhicule supprimé avec succès'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du véhicule'
    });
  }
};
