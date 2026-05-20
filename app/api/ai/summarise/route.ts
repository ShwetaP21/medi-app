import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { documentId, imageBase64, mimeType } = await req.json()

    if (!documentId || !imageBase64) {
      return NextResponse.json({ error: 'documentId and imageBase64 are required' }, { status: 400 })
    }

    const document = await prisma.document.findFirst({
      where: { id: documentId, userId: session.user.id },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`,
              },
            },
            {
              type: 'text',
              text: `You are a helpful medical assistant. A patient has uploaded a medical lab report image.

Please analyze this lab report and provide:
1. A brief 2-3 sentence overall summary
2. Key findings — list each test, its value, and whether it is NORMAL, LOW, or HIGH compared to the reference range shown
3. What the patient should know or follow up on
4. Any important warnings for critically abnormal values

Use simple language a non-medical person can understand. Be compassionate. Always recommend consulting a doctor.

IMPORTANT: This is for informational purposes only and is NOT medical advice.`,
            },
          ],
        },
      ],
      max_tokens: 1024,
      temperature: 0.3,
    })

    const summary = completion.choices[0]?.message?.content || 'Could not generate summary.'

    await prisma.document.update({
      where: { id: documentId },
      data: { summary },
    })

    return NextResponse.json({ summary })
  } catch (error: any) {
    console.error('Groq AI error:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary. Check your GROQ_API_KEY.' },
      { status: 500 }
    )
  }
}