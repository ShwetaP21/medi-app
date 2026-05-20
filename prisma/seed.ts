import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const hashedPassword = await bcrypt.hash('Demo@1234', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@medivault.app' },
    update: {},
    create: {
      name: 'Demo Patient',
      email: 'demo@medivault.app',
      password: hashedPassword,
      role: 'PATIENT',
    },
  })

  console.log(`✅ Demo user: demo@medivault.app / Demo@1234`)

  await prisma.healthRecord.createMany({
    data: [
      {
        userId: user.id,
        title: 'Annual Health Checkup',
        type: 'VISIT',
        description: 'Routine annual checkup. All vitals normal. Blood pressure 120/80. Weight 72kg.',
        doctorName: 'Dr. Priya Mehta',
        diagnosis: 'Healthy - no concerns',
        visitDate: new Date('2025-01-15'),
      },
      {
        userId: user.id,
        title: 'CBC Blood Test',
        type: 'LAB_RESULT',
        description: 'Complete blood count. Haemoglobin: 13.5 g/dL (normal). WBC: 7500 (normal). Platelets: 250000 (normal).',
        doctorName: 'Dr. Ananya Rao',
        visitDate: new Date('2025-02-10'),
      },
      {
        userId: user.id,
        title: 'Flu Vaccination',
        type: 'VACCINATION',
        description: 'Annual influenza vaccine administered. No adverse reactions.',
        doctorName: 'Dr. Priya Mehta',
        visitDate: new Date('2024-10-05'),
      },
    ],
    skipDuplicates: true,
  })

  const futureDate1 = new Date()
  futureDate1.setDate(futureDate1.getDate() + 7)
  futureDate1.setHours(10, 30, 0, 0)

  const futureDate2 = new Date()
  futureDate2.setDate(futureDate2.getDate() + 21)
  futureDate2.setHours(14, 0, 0, 0)

  await prisma.appointment.createMany({
    data: [
      {
        userId: user.id,
        title: 'Follow-up Consultation',
        doctorName: 'Priya Mehta',
        specialty: 'General Medicine',
        location: 'Apollo Hospital, Mumbai',
        appointmentDate: futureDate1,
        duration: 30,
        status: 'UPCOMING',
        notes: 'Bring previous CBC reports',
      },
      {
        userId: user.id,
        title: 'Eye Examination',
        doctorName: 'Ramesh Iyer',
        specialty: 'Ophthalmology',
        location: 'Lilavati Hospital, Bandra',
        appointmentDate: futureDate2,
        duration: 45,
        status: 'UPCOMING',
      },
      {
        userId: user.id,
        title: 'Dental Cleaning',
        doctorName: 'Sunita Joshi',
        specialty: 'Dentistry',
        location: 'Smile Dental Clinic',
        appointmentDate: new Date('2025-01-20T11:00:00'),
        duration: 60,
        status: 'COMPLETED',
      },
    ],
    skipDuplicates: true,
  })

  await prisma.medication.createMany({
    data: [
      {
        userId: user.id,
        name: 'Vitamin D3',
        dosage: '60,000 IU',
        frequency: 'Once weekly',
        startDate: new Date('2025-01-01'),
        prescribedBy: 'Dr. Priya Mehta',
        notes: 'Take with breakfast on Sundays',
        isActive: true,
      },
      {
        userId: user.id,
        name: 'Omega-3 Fish Oil',
        dosage: '1000mg',
        frequency: 'Twice daily',
        startDate: new Date('2024-11-01'),
        prescribedBy: 'Dr. Priya Mehta',
        notes: 'Take with meals',
        isActive: true,
      },
      {
        userId: user.id,
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Three times daily',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-10'),
        prescribedBy: 'Dr. Sunita Joshi',
        notes: 'Complete the full course',
        isActive: false,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
