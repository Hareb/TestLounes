import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getAllInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, status } = req.query;

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
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
        },
        items: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des factures'
    });
  }
};

export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: true
          }
        },
        items: true,
        payments: true
      }
    });

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
      return;
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la facture'
    });
  }
};

export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, items, dueDate } = req.body;

    // Générer le numéro de facture
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count();
    const invoiceNumber = `FAC-${year}-${String(count + 1).padStart(5, '0')}`;

    // Calculer le total
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        studentId,
        totalAmount,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice
          }))
        }
      },
      include: {
        student: {
          include: {
            user: true
          }
        },
        items: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Facture créée avec succès',
      data: invoice
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la facture'
    });
  }
};

export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, issuedAt } = req.body;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(issuedAt && { issuedAt: new Date(issuedAt) })
      },
      include: {
        student: {
          include: {
            user: true
          }
        },
        items: true
      }
    });

    res.json({
      success: true,
      message: 'Facture mise à jour avec succès',
      data: invoice
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la facture'
    });
  }
};

export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.invoice.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Facture supprimée avec succès'
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la facture'
    });
  }
};
