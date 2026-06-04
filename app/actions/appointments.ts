'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import {
  appointmentSchema
} from '@/lib/validations'

export async function createAppointment(formData: {
  title: string
  doctorName: string
  specialty?: string
  location?: string
  appointmentDate: string
  duration: number
  notes?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const parsed = appointmentSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const appointment = await prisma.appointment.create({
    data: {
      ...parsed.data,
      appointmentDate: new Date(parsed.data.appointmentDate),
      userId: session.user.id,
    },
  })

  revalidatePath('/dashboard/appointments')
  revalidatePath('/dashboard')
  return appointment
}

export async function updateAppointment(
  id: string,
  formData: {
    title: string
    doctorName: string
    specialty?: string
    location?: string
    appointmentDate: string
    duration: number
    notes?: string
  }
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const parsed = appointmentSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const updated = await prisma.appointment.updateMany({
    where: { id, userId: session.user.id },
    data: {
      ...parsed.data,
      appointmentDate: new Date(parsed.data.appointmentDate),
    },
  })

  if (updated.count === 0) throw new Error('Appointment not found')

  revalidatePath('/dashboard/appointments')
  revalidatePath('/dashboard')
}

export async function updateAppointmentStatus(
  id: string,
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  await prisma.appointment.updateMany({
    where: { id, userId: session.user.id },
    data: { status },
  })

  revalidatePath('/dashboard/appointments')
  revalidatePath('/dashboard')
}

export async function deleteAppointment(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  await prisma.appointment.deleteMany({
    where: { id, userId: session.user.id },
  })

  revalidatePath('/dashboard/appointments')
  revalidatePath('/dashboard')
}
