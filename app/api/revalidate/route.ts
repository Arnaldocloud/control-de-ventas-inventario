import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path') || '/'
  
  revalidatePath(path)
  return NextResponse.json({ revalidated: true, now: Date.now() })
}
