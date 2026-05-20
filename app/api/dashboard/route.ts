import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const [
      totalRecords,
      upcomingAppointments,
      activeMedications,
      totalDocuments,
      recentRecords,
      nextAppointment,
    ] = await Promise.all([
      prisma.healthRecord.count({ where: { userId } }),
      prisma.appointment.count({
        where: { userId, status: 'UPCOMING', appointmentDate: { gte: new Date() } },
      }),
      prisma.medication.count({ where: { userId, isActive: true } }),
      prisma.document.count({ where: { userId } }),
      prisma.healthRecord.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.appointment.findFirst({
        where: { userId, status: 'UPCOMING', appointmentDate: { gte: new Date() } },
        orderBy: { appointmentDate: 'asc' },
      }),
    ])

    return NextResponse.json({
      stats: {
        totalRecords,
        upcomingAppointments,
        activeMedications,
        totalDocuments,
      },
      recentRecords,
      nextAppointment,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      {
        stats: { totalRecords: 0, upcomingAppointments: 0, activeMedications: 0, totalDocuments: 0 },
        recentRecords: [],
        nextAppointment: null,
      },
      { status: 200 } 
    )
  }
}