import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, status, method } = req.query;

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;
    if (method) where.method = method;

    const payments = await prisma.payment.findMany({
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
        invoice: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paiements'
    });
  }
};

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, amount, method, description, invoiceId } = req.body;

    const payment = await prisma.payment.create({
      data: {
        studentId,
        amount,
        method,
        description,
        invoiceId,
        status: 'COMPLETED',
        paidAt: new Date()
      },
      include: {
        student: {
          include: {
            user: true
          }
        }
      }
    });

    // Si paiement lié à une facture, mettre à jour le montant payé
    if (invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId }
      });

      if (invoice) {
        const newPaidAmount = invoice.paidAmount + amount;
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            paidAmount: newPaidAmount,
            status: newPaidAmount >= invoice.totalAmount ? 'PAID' : invoice.status,
            paidAt: newPaidAmount >= invoice.totalAmount ? new Date() : invoice.paidAt
          }
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Paiement enregistré avec succès',
      data: payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du paiement'
    });
  }
};

export const deletePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.payment.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Paiement supprimé avec succès'
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du paiement'
    });
  }
};
