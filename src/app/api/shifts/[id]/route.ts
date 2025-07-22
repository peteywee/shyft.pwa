
import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function PUT( req: Request, { params }: { params: { id:string } } ) {
  const body = await req.json()
  await db.collection('shifts').doc(params.id).set(body, { merge: true })
  return NextResponse.json({ ok: true })
}

export async function DELETE( _req: Request, { params }: { params: { id: string } } ) {
  await db.collection('shifts').doc(params.id).delete()
  return NextResponse.json({ ok: true })
}
