import nodemailer, { Transporter } from 'nodemailer';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private async loadTemplate(templateName: string, data: any): Promise<string> {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);

    try {
      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      const template = Handlebars.compile(templateSource);
      return template(data);
    } catch (error) {
      console.error(`Error loading template ${templateName}:`, error);
      // Fallback to basic template
      return `<p>${data.message || 'Notification'}</p>`;
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Auto-École" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`✅ Email sent to ${to}: ${subject}`);
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }

  // Email de bienvenue
  async sendWelcomeEmail(to: string, firstName: string, lastName: string): Promise<void> {
    const html = await this.loadTemplate('welcome', {
      firstName,
      lastName,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
    });

    await this.sendEmail(to, 'Bienvenue dans notre auto-école !', html);
  }

  // Rappel de leçon
  async sendLessonReminder(
    to: string,
    studentName: string,
    lessonDate: Date,
    lessonType: string,
    instructorName: string,
    location: string
  ): Promise<void> {
    const html = await this.loadTemplate('lesson-reminder', {
      studentName,
      lessonDate: lessonDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      lessonType: lessonType === 'DRIVE' ? 'Conduite' : lessonType === 'CODE' ? 'Code' : 'Évaluation',
      instructorName,
      location,
    });

    await this.sendEmail(
      to,
      `Rappel : Leçon ${lessonType === 'DRIVE' ? 'de conduite' : 'de code'} demain`,
      html
    );
  }

  // Confirmation de réservation
  async sendBookingConfirmation(
    to: string,
    studentName: string,
    lessonDate: Date,
    lessonType: string,
    duration: number
  ): Promise<void> {
    const html = await this.loadTemplate('booking-confirmation', {
      studentName,
      lessonDate: lessonDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      lessonType: lessonType === 'DRIVE' ? 'Conduite' : lessonType === 'CODE' ? 'Code' : 'Évaluation',
      duration,
    });

    await this.sendEmail(to, 'Confirmation de réservation', html);
  }

  // Annulation de leçon
  async sendLessonCancellation(
    to: string,
    studentName: string,
    lessonDate: Date,
    reason: string
  ): Promise<void> {
    const html = await this.loadTemplate('lesson-cancellation', {
      studentName,
      lessonDate: lessonDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      reason,
    });

    await this.sendEmail(to, 'Annulation de leçon', html);
  }

  // Confirmation de paiement
  async sendPaymentConfirmation(
    to: string,
    studentName: string,
    amount: number,
    description: string,
    invoiceNumber?: string
  ): Promise<void> {
    const html = await this.loadTemplate('payment-confirmation', {
      studentName,
      amount: new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(amount),
      description,
      invoiceNumber,
      date: new Date().toLocaleDateString('fr-FR'),
    });

    await this.sendEmail(to, 'Confirmation de paiement', html);
  }

  // Facture envoyée
  async sendInvoice(
    to: string,
    studentName: string,
    invoiceNumber: string,
    amount: number,
    dueDate?: Date
  ): Promise<void> {
    const html = await this.loadTemplate('invoice', {
      studentName,
      invoiceNumber,
      amount: new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(amount),
      dueDate: dueDate?.toLocaleDateString('fr-FR'),
    });

    await this.sendEmail(to, `Facture ${invoiceNumber}`, html);
  }

  // Notification examen
  async sendExamNotification(
    to: string,
    studentName: string,
    examType: string,
    examDate: Date,
    location: string
  ): Promise<void> {
    const html = await this.loadTemplate('exam-notification', {
      studentName,
      examType: examType === 'CODE' ? 'du code de la route' : 'de conduite',
      examDate: examDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      location,
    });

    await this.sendEmail(to, `Convocation à l'examen ${examType === 'CODE' ? 'du code' : 'de conduite'}`, html);
  }
}

export const emailService = new EmailService();
