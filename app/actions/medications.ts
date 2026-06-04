'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import {
  medicationSchema,
} from '@/lib/validations'
export async function createMedication(formData: {
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  prescribedBy?: string
  notes?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const parsed = medicationSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const medication = await prisma.medication.create({
    data: {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      userId: session.user.id,
    },
  })

  revalidatePath('/dashboard/medications')
  return medication
}

export async function updateMedication(
  id: string,
  formData: {
    name: string
    dosage: string
    frequency: string
    startDate: string
    endDate?: string
    prescribedBy?: string
    notes?: string
  }
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const parsed = medicationSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const updated = await prisma.medication.updateMany({
    where: { id, userId: session.user.id },
    data: {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
  })

  if (updated.count === 0) throw new Error('Medication not found')

  revalidatePath('/dashboard/medications')
}

export async function toggleMedicationActive(id: string, isActive: boolean) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  await prisma.medication.updateMany({
    where: { id, userId: session.user.id },
    data: { isActive },
  })

  revalidatePath('/dashboard/medications')
}

export async function deleteMedication(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  await prisma.medication.deleteMany({
    where: { id, userId: session.user.id },
  })

  revalidatePath('/dashboard/medications')
}