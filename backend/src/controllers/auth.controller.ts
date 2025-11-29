import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { Role } from '@prisma/client';

// Inscription
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis'
      });
      return;
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role || Role.STUDENT
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true
      }
    });

    // Générer un token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur'
    });
  }
};

// Connexion
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
      return;
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        instructor: true
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
      return;
    }

    // Vérifier le mot de passe
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
      return;
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Votre compte a été désactivé. Contactez l\'administration.'
      });
      return;
    }

    // Générer un token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Retirer le mot de passe de la réponse
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion'
    });
  }
};

// Profil utilisateur
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        student: true,
        instructor: true
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
      return;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
};

// Mise à jour du profil
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
      return;
    }

    const { firstName, lastName, phone, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(avatar && { avatar })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true
      }
    });

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
};

// Changer le mot de passe
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Mot de passe actuel et nouveau mot de passe requis'
      });
      return;
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
      return;
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
      return;
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await hashPassword(newPassword);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe'
    });
  }
};
