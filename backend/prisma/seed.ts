import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed de la base de données...');

  // Hasher un mot de passe par défaut
  const defaultPassword = await bcrypt.hash('Password123!', 10);

  // ============================================
  // UTILISATEURS ET RÔLES
  // ============================================

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@autoecole.fr' },
    update: {},
    create: {
      email: 'admin@autoecole.fr',
      password: defaultPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '0601020304',
      role: 'ADMIN',
      isActive: true
    }
  });

  console.log('✅ Admin créé');

  // Secrétariat
  const secretary = await prisma.user.upsert({
    where: { email: 'secretariat@autoecole.fr' },
    update: {},
    create: {
      email: 'secretariat@autoecole.fr',
      password: defaultPassword,
      firstName: 'Marie',
      lastName: 'Martin',
      phone: '0601020305',
      role: 'SECRETARY',
      isActive: true
    }
  });

  console.log('✅ Secrétaire créé');

  // Moniteurs
  const instructor1User = await prisma.user.upsert({
    where: { email: 'moniteur1@autoecole.fr' },
    update: {},
    create: {
      email: 'moniteur1@autoecole.fr',
      password: defaultPassword,
      firstName: 'Pierre',
      lastName: 'Bernard',
      phone: '0601020306',
      role: 'INSTRUCTOR',
      isActive: true
    }
  });

  const instructor1 = await prisma.instructor.upsert({
    where: { userId: instructor1User.id },
    update: {},
    create: {
      userId: instructor1User.id,
      diploma: 'BEPECASER',
      diplomaNumber: 'BEP123456',
      weeklyHours: 35,
      status: 'ACTIVE'
    }
  });

  const instructor2User = await prisma.user.upsert({
    where: { email: 'moniteur2@autoecole.fr' },
    update: {},
    create: {
      email: 'moniteur2@autoecole.fr',
      password: defaultPassword,
      firstName: 'Sophie',
      lastName: 'Dubois',
      phone: '0601020307',
      role: 'INSTRUCTOR',
      isActive: true
    }
  });

  const instructor2 = await prisma.instructor.upsert({
    where: { userId: instructor2User.id },
    update: {},
    create: {
      userId: instructor2User.id,
      diploma: 'Titre Pro ECSR',
      diplomaNumber: 'TP987654',
      weeklyHours: 35,
      status: 'ACTIVE'
    }
  });

  console.log('✅ Moniteurs créés');

  // ============================================
  // VÉHICULES
  // ============================================

  const vehicle1 = await prisma.vehicle.upsert({
    where: { plateNumber: 'AB-123-CD' },
    update: {},
    create: {
      brand: 'Renault',
      model: 'Clio 5',
      plateNumber: 'AB-123-CD',
      type: 'CAR_MANUAL',
      year: 2022,
      mileage: 15000,
      status: 'AVAILABLE',
      insuranceExpiry: new Date('2025-12-31'),
      instructorId: instructor1.id
    }
  });

  const vehicle2 = await prisma.vehicle.upsert({
    where: { plateNumber: 'EF-456-GH' },
    update: {},
    create: {
      brand: 'Peugeot',
      model: '208',
      plateNumber: 'EF-456-GH',
      type: 'CAR_AUTOMATIC',
      year: 2023,
      mileage: 8000,
      status: 'AVAILABLE',
      insuranceExpiry: new Date('2025-11-30'),
      instructorId: instructor2.id
    }
  });

  console.log('✅ Véhicules créés');

  // ============================================
  // ÉLÈVES
  // ============================================

  const student1User = await prisma.user.upsert({
    where: { email: 'eleve1@example.com' },
    update: {},
    create: {
      email: 'eleve1@example.com',
      password: defaultPassword,
      firstName: 'Lucas',
      lastName: 'Petit',
      phone: '0601020308',
      role: 'STUDENT',
      isActive: true
    }
  });

  const student1 = await prisma.student.upsert({
    where: { userId: student1User.id },
    update: {},
    create: {
      userId: student1User.id,
      dateOfBirth: new Date('2005-03-15'),
      placeOfBirth: 'Paris',
      address: '10 Rue de la République',
      city: 'Paris',
      postalCode: '75001',
      neph: 'NEPH123456789',
      formationType: 'TRADITIONAL',
      status: 'ACTIVE',
      codeHoursPaid: 20,
      codeHoursUsed: 12,
      driveHoursPaid: 30,
      driveHoursUsed: 15,
      initialEvaluation: 25
    }
  });

  const student2User = await prisma.user.upsert({
    where: { email: 'eleve2@example.com' },
    update: {},
    create: {
      email: 'eleve2@example.com',
      password: defaultPassword,
      firstName: 'Emma',
      lastName: 'Moreau',
      phone: '0601020309',
      role: 'STUDENT',
      isActive: true
    }
  });

  const student2 = await prisma.student.upsert({
    where: { userId: student2User.id },
    update: {},
    create: {
      userId: student2User.id,
      dateOfBirth: new Date('2006-07-22'),
      placeOfBirth: 'Lyon',
      address: '25 Avenue des Champs',
      city: 'Lyon',
      postalCode: '69001',
      neph: 'NEPH987654321',
      formationType: 'AAC',
      status: 'ACTIVE',
      codeHoursPaid: 20,
      codeHoursUsed: 20,
      driveHoursPaid: 20,
      driveHoursUsed: 10,
      codeExamPassed: true,
      initialEvaluation: 20
    }
  });

  console.log('✅ Élèves créés');

  // ============================================
  // LEÇONS
  // ============================================

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  await prisma.lesson.create({
    data: {
      studentId: student1.id,
      instructorId: instructor1.id,
      vehicleId: vehicle1.id,
      type: 'DRIVE',
      status: 'SCHEDULED',
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000),
      duration: 1,
      topic: 'Circulation en ville',
      location: 'Agence'
    }
  });

  await prisma.lesson.create({
    data: {
      studentId: student2.id,
      instructorId: instructor2.id,
      vehicleId: vehicle2.id,
      type: 'DRIVE',
      status: 'COMPLETED',
      startTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      duration: 2,
      topic: 'Conduite sur autoroute',
      location: 'Agence',
      notes: 'Très bon progrès, à l\'aise sur autoroute'
    }
  });

  console.log('✅ Leçons créées');

  // ============================================
  // ÉVALUATIONS
  // ============================================

  await prisma.evaluation.create({
    data: {
      studentId: student1.id,
      competence1: 3,
      competence2: 3,
      competence3: 2,
      competence4: 2,
      globalScore: 2.5,
      comments: 'Bon niveau général, manque de pratique en conditions difficiles',
      evaluator: 'Pierre Bernard'
    }
  });

  console.log('✅ Évaluations créées');

  // ============================================
  // FACTURES ET PAIEMENTS
  // ============================================

  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'FAC-2024-00001',
      studentId: student1.id,
      status: 'PAID',
      totalAmount: 1200,
      paidAmount: 1200,
      issuedAt: new Date(),
      paidAt: new Date(),
      items: {
        create: [
          {
            description: 'Forfait code (20h)',
            quantity: 1,
            unitPrice: 300,
            totalPrice: 300
          },
          {
            description: 'Forfait conduite (30h)',
            quantity: 1,
            unitPrice: 900,
            totalPrice: 900
          }
        ]
      }
    }
  });

  await prisma.payment.create({
    data: {
      studentId: student1.id,
      invoiceId: invoice1.id,
      amount: 1200,
      method: 'CARD',
      status: 'COMPLETED',
      description: 'Paiement forfait initial',
      paidAt: new Date()
    }
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'FAC-2024-00002',
      studentId: student2.id,
      status: 'PAID',
      totalAmount: 900,
      paidAmount: 900,
      issuedAt: new Date(),
      paidAt: new Date(),
      items: {
        create: [
          {
            description: 'Forfait AAC complet',
            quantity: 1,
            unitPrice: 900,
            totalPrice: 900
          }
        ]
      }
    }
  });

  await prisma.payment.create({
    data: {
      studentId: student2.id,
      invoiceId: invoice2.id,
      amount: 900,
      method: 'CPF',
      status: 'COMPLETED',
      description: 'Paiement via CPF',
      paidAt: new Date()
    }
  });

  console.log('✅ Factures et paiements créés');

  console.log('\n✨ Seed terminé avec succès!');
  console.log('\n📝 Comptes créés:');
  console.log('   Admin: admin@autoecole.fr / Password123!');
  console.log('   Secrétariat: secretariat@autoecole.fr / Password123!');
  console.log('   Moniteur 1: moniteur1@autoecole.fr / Password123!');
  console.log('   Moniteur 2: moniteur2@autoecole.fr / Password123!');
  console.log('   Élève 1: eleve1@example.com / Password123!');
  console.log('   Élève 2: eleve2@example.com / Password123!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
