import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { healthRecordSchema } from '@/lib/validations'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const record = await prisma.healthRecord.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(record)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = healthRecordSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    )
  }

  const record = await prisma.healthRecord.updateMany({
    where: { id, userId: session.user.id },
    data: {
      ...parsed.data,
      visitDate: new Date(parsed.data.visitDate),
    },
  })

  if (record.count === 0)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ success: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const deleted = await prisma.healthRecord.deleteMany({
    where: { id, userId: session.user.id },
  })

  if (deleted.count === 0)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ success: true })
}
