import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import cloudinary from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { imageBase64, mimeType, fileName } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const result = await cloudinary.uploader.upload(
      `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`,
      {
        folder: `medivault/${session.user.id}`,
        resource_type: 'image',
        public_id: `${Date.now()}_${fileName?.replace(/\.[^.]+$/, '') || 'document'}`,
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      }
    )

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    })
  } catch (error: any) {
    console.error('Cloudinary upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}