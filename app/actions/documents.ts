'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { DocumentType } from '@prisma/client'

export async function createDocument(data: {
  title: string
  type: DocumentType   
  fileUrl: string
  mimeType?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const document = await prisma.document.create({
    data: {
      ...data,
      userId: session.user.id,
    },
  })

  revalidatePath('/dashboard/documents')
  return document
}

export async function deleteDocument(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  await prisma.document.deleteMany({
    where: { id, userId: session.user.id },
  })

  revalidatePath('/dashboard/documents')
}

export async function updateDocumentSummary(id: string, summary: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  await prisma.document.updateMany({
    where: { id, userId: session.user.id },
    data: { summary },
  })

  revalidatePath('/dashboard/documents')
}