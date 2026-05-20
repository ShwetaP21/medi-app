import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { healthRecordSchema } from '@/lib/validations'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const records = await prisma.healthRecord.findMany({
    where: { userId: session.user.id },
    orderBy: { visitDate: 'desc' },
  })

  return NextResponse.json(records)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = healthRecordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const record = await prisma.healthRecord.create({
      data: {
        ...parsed.data,
        visitDate: new Date(parsed.data.visitDate),
        userId: session.user.id,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Create record error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
