// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  const adminEmail = 'yashodip@bookify.com'
  const adminPassword = '123123'

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10)
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)

  // Create Admin User
  const existingOldAdmin = await prisma.user.findUnique({
    where: { email: 'admin@bookify.com' },
  })
  const existingNewAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  let admin
  if (existingOldAdmin && !existingNewAdmin) {
    admin = await prisma.user.update({
      where: { id: existingOldAdmin.id },
      data: {
        name: 'Admin User',
        email: adminEmail,
        password: hashedAdminPassword,
        role: 'ADMIN',
        isVerified: true,
        isActive: true,
      },
    })
  } else {
    admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: 'Admin User',
        password: hashedAdminPassword,
        role: 'ADMIN',
        isVerified: true,
        isActive: true,
      },
      create: {
        name: 'Admin User',
        email: adminEmail,
        password: hashedAdminPassword,
        role: 'ADMIN',
        isVerified: true,
        isActive: true,
      },
    })
  }
  console.log('✅ Created admin user:', admin.email)

  // Create Organiser User (Yashodip)
  const organiser = await prisma.user.upsert({
    where: { email: 'yashodipmore2004@gmail.com' },
    update: {},
    create: {
      name: 'Yashodip More',
      email: 'yashodipmore2004@gmail.com',
      password: hashedPassword,
      role: 'ORGANISER',
      isVerified: true,
      isActive: true,
    },
  })
  console.log('✅ Created organiser user:', organiser.email)

  // Create Customer User
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'customer@example.com',
      password: hashedPassword,
      role: 'CUSTOMER',
      isVerified: true,
      isActive: true,
    },
  })
  console.log('✅ Created customer user:', customer.email)

  // Create Provider Slots
  const provider1 = await prisma.providerSlot.create({
    data: {
      name: 'Dr. Sharma',
      userId: organiser.id,
      isActive: true,
    },
  })
  console.log('✅ Created provider:', provider1.name)

  const provider2 = await prisma.providerSlot.create({
    data: {
      name: 'Dr. Patel',
      isActive: true,
    },
  })
  console.log('✅ Created provider:', provider2.name)

  // Create Appointment Type
  const appointmentType = await prisma.appointmentType.create({
    data: {
      name: 'Medical Consultation',
      description: 'General medical consultation with experienced doctors',
      duration: 30,
      isPublished: true,
      maxBookingsPerSlot: 2,
      requiresPayment: false,
      requiresConfirmation: false,
      scheduleType: 'WEEKLY',
      assignmentType: 'AUTO',
      location: 'VIT Pune Medical Center',
      organiserId: organiser.id,
      providers: {
        create: [
          { providerId: provider1.id },
          { providerId: provider2.id },
        ],
      },
      weeklySchedules: {
        create: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
          { dayOfWeek: 5, startTime: '09:00', endTime: '13:00' }, // Friday
        ],
      },
      questions: {
        create: [
          {
            questionText: 'What is the reason for your visit?',
            isRequired: true,
            order: 1,
          },
          {
            questionText: 'Do you have any allergies?',
            isRequired: false,
            order: 2,
          },
        ],
      },
    },
  })
  console.log('✅ Created appointment type:', appointmentType.name)

  // Create Sample Booking
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  const endTime = new Date(tomorrow)
  endTime.setMinutes(endTime.getMinutes() + appointmentType.duration)

  const booking = await prisma.booking.create({
    data: {
      appointmentTypeId: appointmentType.id,
      customerId: customer.id,
      providerId: provider1.id,
      startTime: tomorrow,
      endTime: endTime,
      status: 'CONFIRMED',
      capacity: 1,
      notes: 'First time visit',
    },
  })
  console.log('✅ Created sample booking:', booking.confirmationCode)

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
