import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { pdfService } from '../services/pdf.service';

// Générer PDF facture
export const generateInvoicePDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
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
        items: true
      }
    });

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
      return;
    }

    const pdfBuffer = await pdfService.generateInvoicePDF(invoice);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facture-${invoice.invoiceNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate invoice PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du PDF'
    });
  }
};

// Générer PDF contrat
export const generateContractPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Élève non trouvé'
      });
      return;
    }

    const pdfBuffer = await pdfService.generateContractPDF(student);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contrat-${student.user.lastName}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate contract PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du PDF'
    });
  }
};

// Générer PDF attestation
export const generateCertificatePDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Élève non trouvé'
      });
      return;
    }

    const pdfBuffer = await pdfService.generateCertificatePDF(student);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=attestation-${student.user.lastName}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate certificate PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du PDF'
    });
  }
};
