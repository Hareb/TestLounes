import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

class PDFService {
  private createBasePDF(): PDFKit.PDFDocument {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    return doc;
  }

  private addHeader(doc: PDFKit.PDFDocument, title: string): void {
    doc
      .fontSize(20)
      .fillColor('#1e40af')
      .text('Auto-École', 50, 50)
      .fontSize(10)
      .fillColor('#666')
      .text('Système de Gestion', 50, 75)
      .moveDown();

    doc
      .fontSize(16)
      .fillColor('#000')
      .text(title, 50, 120)
      .moveDown();
  }

  private addFooter(doc: PDFKit.PDFDocument): void {
    const bottom = doc.page.height - 50;

    doc
      .fontSize(8)
      .fillColor('#666')
      .text(
        'Auto-École - Tous droits réservés',
        50,
        bottom,
        { align: 'center', width: doc.page.width - 100 }
      )
      .text(
        new Date().toLocaleDateString('fr-FR'),
        50,
        bottom + 12,
        { align: 'center', width: doc.page.width - 100 }
      );
  }

  async generateInvoicePDF(invoiceData: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = this.createBasePDF();
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        this.addHeader(doc, `Facture ${invoiceData.invoiceNumber}`);

        // Informations client
        doc
          .fontSize(10)
          .fillColor('#000')
          .text('Facturé à :', 50, 180)
          .fontSize(12)
          .text(`${invoiceData.student.firstName} ${invoiceData.student.lastName}`, 50, 200)
          .fontSize(10)
          .text(invoiceData.student.email, 50, 220)
          .moveDown();

        // Informations facture
        doc
          .fontSize(10)
          .text(`Date d'émission : ${new Date(invoiceData.issuedAt || invoiceData.createdAt).toLocaleDateString('fr-FR')}`, 350, 180)
          .text(`Numéro : ${invoiceData.invoiceNumber}`, 350, 200);

        if (invoiceData.dueDate) {
          doc.text(`Date d'échéance : ${new Date(invoiceData.dueDate).toLocaleDateString('fr-FR')}`, 350, 220);
        }

        // Tableau des items
        let y = 280;

        // Header du tableau
        doc
          .rect(50, y, doc.page.width - 100, 25)
          .fillAndStroke('#1e40af', '#1e40af')
          .fillColor('#fff')
          .fontSize(10)
          .text('Description', 60, y + 8, { width: 250 })
          .text('Quantité', 310, y + 8, { width: 70, align: 'right' })
          .text('Prix unitaire', 380, y + 8, { width: 80, align: 'right' })
          .text('Total', 460, y + 8, { width: 80, align: 'right' });

        y += 25;

        // Items
        doc.fillColor('#000');
        invoiceData.items.forEach((item: any) => {
          doc
            .fontSize(9)
            .text(item.description, 60, y + 8, { width: 250 })
            .text(item.quantity.toString(), 310, y + 8, { width: 70, align: 'right' })
            .text(
              new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.unitPrice),
              380,
              y + 8,
              { width: 80, align: 'right' }
            )
            .text(
              new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.totalPrice),
              460,
              y + 8,
              { width: 80, align: 'right' }
            );

          doc
            .strokeColor('#ddd')
            .moveTo(50, y + 25)
            .lineTo(doc.page.width - 50, y + 25)
            .stroke();

          y += 25;
        });

        // Total
        y += 10;
        doc
          .fontSize(12)
          .fillColor('#000')
          .text('Total HT :', 380, y, { width: 80, align: 'right' })
          .text(
            new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(invoiceData.totalAmount),
            460,
            y,
            { width: 80, align: 'right' }
          );

        y += 20;
        doc
          .fontSize(14)
          .fillColor('#1e40af')
          .text('Total TTC :', 380, y, { width: 80, align: 'right' })
          .text(
            new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(invoiceData.totalAmount),
            460,
            y,
            { width: 80, align: 'right' }
          );

        // Statut de paiement
        y += 40;
        if (invoiceData.status === 'PAID') {
          doc
            .fontSize(10)
            .fillColor('#10b981')
            .text('✓ PAYÉE', 50, y)
            .fillColor('#000')
            .text(`Le ${new Date(invoiceData.paidAt).toLocaleDateString('fr-FR')}`, 120, y);
        } else {
          doc
            .fontSize(10)
            .fillColor('#f59e0b')
            .text('● EN ATTENTE DE PAIEMENT', 50, y);
        }

        // Notes
        y += 40;
        doc
          .fontSize(9)
          .fillColor('#666')
          .text('Merci de votre confiance !', 50, y)
          .text('Pour toute question, contactez-nous à contact@autoecole.fr', 50, y + 15);

        // Footer
        this.addFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateContractPDF(studentData: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = this.createBasePDF();
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        this.addHeader(doc, 'Contrat de Formation');

        // Contenu du contrat
        let y = 180;

        doc
          .fontSize(12)
          .fillColor('#000')
          .text('ENTRE LES SOUSSIGNÉS :', 50, y)
          .moveDown();

        y += 30;
        doc
          .fontSize(10)
          .text('L\'Auto-École, représentée par son gérant', 50, y)
          .text('Numéro d\'agrément : XXX-XXXX-XXXX', 50, y + 20)
          .moveDown();

        y += 60;
        doc
          .fontSize(10)
          .text('ET', 50, y)
          .moveDown();

        y += 30;
        doc
          .text(`${studentData.user.firstName} ${studentData.user.lastName}`, 50, y)
          .text(`Né(e) le ${new Date(studentData.dateOfBirth).toLocaleDateString('fr-FR')}`, 50, y + 20)
          .text(`Adresse : ${studentData.address}, ${studentData.postalCode} ${studentData.city}`, 50, y + 40)
          .moveDown();

        y += 90;
        doc
          .fontSize(12)
          .text('ARTICLE 1 - OBJET DU CONTRAT', 50, y)
          .fontSize(10)
          .text(
            'Le présent contrat a pour objet la formation à la conduite automobile en vue de l\'obtention du permis de conduire catégorie B.',
            50,
            y + 25,
            { width: 500, align: 'justify' }
          );

        y += 80;
        doc
          .fontSize(12)
          .text('ARTICLE 2 - DURÉE ET DÉROULEMENT', 50, y)
          .fontSize(10)
          .text(
            `La formation comprend ${studentData.driveHoursPaid} heures de conduite pratique et ${studentData.codeHoursPaid} heures de formation au code de la route.`,
            50,
            y + 25,
            { width: 500, align: 'justify' }
          );

        y += 80;
        doc
          .fontSize(12)
          .text('ARTICLE 3 - PRIX', 50, y)
          .fontSize(10)
          .text(
            'Le coût total de la formation s\'élève à XXXX € TTC, comprenant les frais pédagogiques et administratifs.',
            50,
            y + 25,
            { width: 500, align: 'justify' }
          );

        y += 80;
        doc
          .fontSize(10)
          .text('Date et signatures :', 50, y)
          .text('L\'Auto-École', 50, y + 40)
          .text('L\'Élève', 350, y + 40);

        // Footer
        this.addFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateCertificatePDF(studentData: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = this.createBasePDF();
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        this.addHeader(doc, 'Attestation de Fin de Formation');

        // Contenu
        let y = 200;

        doc
          .fontSize(12)
          .fillColor('#000')
          .text('L\'Auto-École atteste que :', 50, y, { align: 'center', width: 500 });

        y += 40;
        doc
          .fontSize(16)
          .fillColor('#1e40af')
          .text(`${studentData.user.firstName} ${studentData.user.lastName}`, 50, y, {
            align: 'center',
            width: 500,
          });

        y += 40;
        doc
          .fontSize(12)
          .fillColor('#000')
          .text(`Né(e) le ${new Date(studentData.dateOfBirth).toLocaleDateString('fr-FR')}`, 50, y, {
            align: 'center',
            width: 500,
          });

        y += 60;
        doc
          .fontSize(11)
          .text('A suivi avec assiduité la formation à la conduite automobile', 50, y, {
            align: 'center',
            width: 500,
          })
          .text('en vue de l\'obtention du permis de conduire catégorie B.', 50, y + 20, {
            align: 'center',
            width: 500,
          });

        y += 80;
        doc
          .text(`Total d\'heures de conduite : ${studentData.driveHoursUsed}h`, 50, y, {
            align: 'center',
            width: 500,
          })
          .text(`Formation du code : ${studentData.codeExamPassed ? 'Réussie' : 'En cours'}`, 50, y + 20, {
            align: 'center',
            width: 500,
          });

        y += 80;
        doc
          .fontSize(10)
          .text(`Fait à Paris, le ${new Date().toLocaleDateString('fr-FR')}`, 50, y, {
            align: 'center',
            width: 500,
          });

        y += 60;
        doc.text('Le Gérant', 350, y);

        // Footer
        this.addFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

export const pdfService = new PDFService();
