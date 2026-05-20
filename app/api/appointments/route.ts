import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { appointmentSchema } from '@/lib/validations'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appointments = await prisma.appointment.findMany({
    where: { userId: session.user.id },
    orderBy: { appointmentDate: 'asc' },
  })

  return NextResponse.json(appointments)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = appointmentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        ...parsed.data,
        appointmentDate: new Date(parsed.data.appointmentDate),
        userId: session.user.id,
      },
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
