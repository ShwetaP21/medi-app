import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { documentId, text } = await req.json()

    if (!documentId || !text) {
      return NextResponse.json({ error: 'documentId and text are required' }, { status: 400 })
    }

    const document = await prisma.document.findFirst({
      where: { id: documentId, userId: session.user.id },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are a helpful medical assistant. A patient has uploaded a medical document and needs it explained in simple, plain language.

Please analyze the following medical document text and provide:
1. A brief 2-3 sentence overall summary
2. Key findings or values (if it's a lab report, highlight any abnormal values)
3. What the patient should know or follow up on
4. Any important warnings (e.g., critically abnormal values)

Use simple language a non-medical person can understand. Be compassionate and avoid causing unnecessary alarm. Always recommend the patient discuss results with their doctor.

IMPORTANT: This is for informational purposes only and is NOT medical advice.

Document text:
${text.slice(0, 3000)}`

    const result = await model.generateContent(prompt)
    const summary = result.response.text()

    await prisma.document.update({
      where: { id: documentId },
      data: { summary },
    })

    return NextResponse.json({ summary })
  } catch (error: any) {
    console.error('Gemini AI error:', error)
    return NextResponse.json({ error: 'Failed to generate summary. Check your GEMINI_API_KEY.' }, { status: 500 })
  }
}
