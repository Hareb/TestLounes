import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('❌ Error:', err);

  // Erreur Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        res.status(409).json({
          success: false,
          message: 'Une ressource avec ces données existe déjà',
          field: err.meta?.target
        });
        return;

      case 'P2025':
        res.status(404).json({
          success: false,
          message: 'Ressource non trouvée'
        });
        return;

      case 'P2003':
        res.status(400).json({
          success: false,
          message: 'Violation de contrainte de clé étrangère'
        });
        return;

      default:
        res.status(500).json({
          success: false,
          message: 'Erreur de base de données',
          code: err.code
        });
        return;
    }
  }

  // Erreur de validation Prisma
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      message: 'Données de validation invalides'
    });
    return;
  }

  // Erreur générique
  res.status(500).json({
    success: false,
    message: err.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
