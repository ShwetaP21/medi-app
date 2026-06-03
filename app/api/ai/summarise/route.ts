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
    const { documentId, imageUrl } = await req.json()

    if (!documentId || !imageUrl) {
      return NextResponse.json({ error: 'documentId and imageUrl are required' }, { status: 400 })
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
              image_url: { url: imageUrl },
            },
            {
              type: 'text',
              text: `You are a medical document analysis assistant.

FIRST — determine if this image is a medical document (lab report, blood test, pathology report, prescription, discharge summary, diagnostic report, or similar). 

If it is NOT a medical document, respond with ONLY this exact JSON:
{"isMedical": false, "message": "This does not appear to be a medical report. Please upload a lab report, blood test, prescription, or other medical document."}

If it IS a medical document, respond with ONLY this exact JSON (no markdown, no extra text):
{
  "isMedical": true,
  "summary": "2-3 sentence overall summary of the report",
  "findings": [
    {"test": "test name", "value": "result value", "unit": "unit", "referenceRange": "normal range", "status": "NORMAL or LOW or HIGH or CRITICAL"}
  ],
  "patientAdvice": "What the patient should know in simple language",
  "warnings": "Any critical values or urgent follow-ups needed, or null if none",
  "disclaimer": "⚠️ Disclaimer that this is not medical advice and they should consult their doctor"
}`,
            },
          ],
        },
      ],
      max_tokens: 1024,
      temperature: 0.1,
    })

    const rawText = completion.choices[0]?.message?.content || ''

    let parsed: any
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found')
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json(
        { error: 'Could not parse AI response. Please try again.' },
        { status: 500 }
      )
    }

    if (!parsed.isMedical) {
      return NextResponse.json(
        { error: parsed.message, notMedical: true },
        { status: 422 }
      )
    }

    const formattedSummary = `${parsed.summary}

KEY FINDINGS:
${parsed.findings?.map((f: any) =>
  `• ${f.test}: ${f.value} ${f.unit || ''} (Ref: ${f.referenceRange || 'N/A'}) — ${f.status}`
).join('\n') || 'No structured findings available'}

WHAT YOU SHOULD KNOW:
${parsed.patientAdvice}

${parsed.warnings ? `⚠️ IMPORTANT: ${parsed.warnings}\n\n` : ''}${parsed.disclaimer}`

    await prisma.document.update({
      where: { id: documentId },
      data: { summary: formattedSummary },
    })

    return NextResponse.json({ summary: formattedSummary })
  } catch (error: any) {
    console.error('Groq AI error:', error)
    return NextResponse.json(
      { error: 'Failed to analyse document. Please try again.' },
      { status: 500 }
    )
  }
}