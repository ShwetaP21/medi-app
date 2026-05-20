import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { uploadedAt: 'desc' },
  })

  return NextResponse.json(documents)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, type, fileUrl, fileSize, mimeType } = body

    if (!title || !type || !fileUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const document = await prisma.document.create({
      data: {
        title,
        type,
        fileUrl,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
