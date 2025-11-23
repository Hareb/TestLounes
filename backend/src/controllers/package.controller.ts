import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const packageController = {
  // Get all packages (optionally filter by active status)
  async getAll(req: Request, res: Response) {
    try {
      const { active } = req.query;

      const packages = await prisma.package.findMany({
        where: active === 'true' ? { isActive: true } : {},
        include: {
          _count: {
            select: { purchases: true }
          }
        },
        orderBy: [
          { isPopular: 'desc' },
          { price: 'asc' }
        ]
      });

      return res.json({
        success: true,
        data: packages,
        message: 'Packages retrieved successfully'
      });
    } catch (error: any) {
      console.error('Get packages error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve packages',
        error: error.message
      });
    }
  },

  // Get package by ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const package_ = await prisma.package.findUnique({
        where: { id },
        include: {
          _count: {
            select: { purchases: true }
          }
        }
      });

      if (!package_) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      return res.json({
        success: true,
        data: package_,
        message: 'Package retrieved successfully'
      });
    } catch (error: any) {
      console.error('Get package error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve package',
        error: error.message
      });
    }
  },

  // Create new package (admin only)
  async create(req: Request, res: Response) {
    try {
      const {
        name,
        description,
        type,
        codeHours,
        driveHours,
        price,
        validityMonths,
        isPopular
      } = req.body;

      // Validation
      if (!name || !type || !price) {
        return res.status(400).json({
          success: false,
          message: 'Name, type, and price are required'
        });
      }

      const package_ = await prisma.package.create({
        data: {
          name,
          description,
          type,
          codeHours: codeHours || 0,
          driveHours: driveHours || 0,
          price,
          validityMonths,
          isPopular: isPopular || false
        }
      });

      return res.status(201).json({
        success: true,
        data: package_,
        message: 'Package created successfully'
      });
    } catch (error: any) {
      console.error('Create package error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create package',
        error: error.message
      });
    }
  },

  // Update package (admin only)
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        type,
        codeHours,
        driveHours,
        price,
        validityMonths,
        isActive,
        isPopular
      } = req.body;

      const package_ = await prisma.package.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(type && { type }),
          ...(codeHours !== undefined && { codeHours }),
          ...(driveHours !== undefined && { driveHours }),
          ...(price !== undefined && { price }),
          ...(validityMonths !== undefined && { validityMonths }),
          ...(isActive !== undefined && { isActive }),
          ...(isPopular !== undefined && { isPopular })
        }
      });

      return res.json({
        success: true,
        data: package_,
        message: 'Package updated successfully'
      });
    } catch (error: any) {
      console.error('Update package error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update package',
        error: error.message
      });
    }
  },

  // Delete package (admin only)
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if package has purchases
      const purchaseCount = await prisma.packagePurchase.count({
        where: { packageId: id }
      });

      if (purchaseCount > 0) {
        // Soft delete - deactivate instead of deleting
        await prisma.package.update({
          where: { id },
          data: { isActive: false }
        });

        return res.json({
          success: true,
          message: 'Package deactivated (has existing purchases)'
        });
      }

      // Hard delete if no purchases
      await prisma.package.delete({
        where: { id }
      });

      return res.json({
        success: true,
        message: 'Package deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete package error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete package',
        error: error.message
      });
    }
  },

  // Purchase package (student)
  async purchase(req: Request, res: Response) {
    try {
      const { id: packageId } = req.params;
      const { studentId, pricePaid } = req.body;

      // Get package details
      const package_ = await prisma.package.findUnique({
        where: { id: packageId }
      });

      if (!package_ || !package_.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Package not found or inactive'
        });
      }

      // Calculate expiry date
      let expiryDate = null;
      if (package_.validityMonths) {
        expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + package_.validityMonths);
      }

      // Create package purchase
      const purchase = await prisma.packagePurchase.create({
        data: {
          studentId,
          packageId,
          codeHoursBought: package_.codeHours,
          driveHoursBought: package_.driveHours,
          pricePaid: pricePaid || package_.price,
          expiryDate,
          isActive: true
        },
        include: {
          package: true,
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

      return res.status(201).json({
        success: true,
        data: purchase,
        message: 'Package purchased successfully'
      });
    } catch (error: any) {
      console.error('Purchase package error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to purchase package',
        error: error.message
      });
    }
  },

  // Get student's purchased packages
  async getStudentPackages(req: Request, res: Response) {
    try {
      const { studentId } = req.params;

      const purchases = await prisma.packagePurchase.findMany({
        where: { studentId },
        include: {
          package: true
        },
        orderBy: { purchaseDate: 'desc' }
      });

      // Calculate remaining hours for each purchase
      const purchasesWithRemaining = purchases.map(purchase => ({
        ...purchase,
        codeHoursRemaining: purchase.codeHoursBought - purchase.codeHoursUsed,
        driveHoursRemaining: purchase.driveHoursBought - purchase.driveHoursUsed,
        totalPaid: purchase.pricePaid,
        isExpired: purchase.expiryDate ? new Date() > purchase.expiryDate : false
      }));

      return res.json({
        success: true,
        data: purchasesWithRemaining,
        message: 'Student packages retrieved successfully'
      });
    } catch (error: any) {
      console.error('Get student packages error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve student packages',
        error: error.message
      });
    }
  },

  // Update package purchase hours (when lesson is consumed)
  async updateUsedHours(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { codeHoursUsed, driveHoursUsed } = req.body;

      const purchase = await prisma.packagePurchase.findUnique({
        where: { id }
      });

      if (!purchase) {
        return res.status(404).json({
          success: false,
          message: 'Package purchase not found'
        });
      }

      // Validate hours don't exceed bought hours
      const newCodeHours = codeHoursUsed !== undefined ? codeHoursUsed : purchase.codeHoursUsed;
      const newDriveHours = driveHoursUsed !== undefined ? driveHoursUsed : purchase.driveHoursUsed;

      if (newCodeHours > purchase.codeHoursBought || newDriveHours > purchase.driveHoursBought) {
        return res.status(400).json({
          success: false,
          message: 'Used hours cannot exceed bought hours'
        });
      }

      const updatedPurchase = await prisma.packagePurchase.update({
        where: { id },
        data: {
          ...(codeHoursUsed !== undefined && { codeHoursUsed }),
          ...(driveHoursUsed !== undefined && { driveHoursUsed })
        },
        include: {
          package: true
        }
      });

      return res.json({
        success: true,
        data: updatedPurchase,
        message: 'Package hours updated successfully'
      });
    } catch (error: any) {
      console.error('Update used hours error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update used hours',
        error: error.message
      });
    }
  },

  // Get package statistics
  async getStats(req: Request, res: Response) {
    try {
      const totalPackages = await prisma.package.count();
      const activePackages = await prisma.package.count({
        where: { isActive: true }
      });
      const totalPurchases = await prisma.packagePurchase.count();
      const activePurchases = await prisma.packagePurchase.count({
        where: { isActive: true }
      });

      const revenue = await prisma.packagePurchase.aggregate({
        _sum: { pricePaid: true }
      });

      // Most popular packages
      const popularPackages = await prisma.package.findMany({
        include: {
          _count: {
            select: { purchases: true }
          }
        },
        orderBy: {
          purchases: {
            _count: 'desc'
          }
        },
        take: 5
      });

      return res.json({
        success: true,
        data: {
          totalPackages,
          activePackages,
          totalPurchases,
          activePurchases,
          totalRevenue: revenue._sum.pricePaid || 0,
          popularPackages
        },
        message: 'Package statistics retrieved successfully'
      });
    } catch (error: any) {
      console.error('Get package stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve statistics',
        error: error.message
      });
    }
  }
};
