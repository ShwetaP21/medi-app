'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import {
  healthRecordSchema
} from '@/lib/validations'


export async function createHealthRecord(formData: {
  title: string
  type: string
  description: string
  diagnosis?: string
  doctorName?: string
  visitDate: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const parsed = healthRecordSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const record = await prisma.healthRecord.create({
    data: {
      ...parsed.data,
      visitDate: new Date(parsed.data.visitDate),
      userId: session.user.id,
    },
  })

  revalidatePath('/dashboard/records')
  revalidatePath('/dashboard')
  return record
}

export async function updateHealthRecord(
  id: string,
  formData: {
    title: string
    type: string
    description: string
    diagnosis?: string
    doctorName?: string
    visitDate: string
  }
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const parsed = healthRecordSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const updated = await prisma.healthRecord.updateMany({
    where: { id, userId: session.user.id },
    data: {
      ...parsed.data,
      visitDate: new Date(parsed.data.visitDate),
    },
  })

  if (updated.count === 0) throw new Error('Record not found')

  revalidatePath('/dashboard/records')
  revalidatePath('/dashboard')
}

export async function deleteHealthRecord(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  await prisma.healthRecord.deleteMany({
    where: { id, userId: session.user.id },
  })

  revalidatePath('/dashboard/records')
  revalidatePath('/dashboard')
}


