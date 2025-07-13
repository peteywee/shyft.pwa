
import { NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase-admin';
import type { Shift } from '@/types';

export async function POST(request: Request) {
  try {
    const idToken = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized: No token provided' }), { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    
    if (decodedToken.role !== 'management') {
         return new NextResponse(JSON.stringify({ error: 'Forbidden: Insufficient permissions' }), { status: 403 });
    }

    const shiftData: Shift = await request.json();
    
    if (shiftData.id) {
      const shiftRef = db.doc(`shifts/${shiftData.id}`);
      await shiftRef.set(shiftData, { merge: true });
      return NextResponse.json({ success: true, id: shiftData.id });
    } else {
      const newShiftRef = await db.collection('shifts').add(shiftData);
      return NextResponse.json({ success: true, id: newShiftRef.id });
    }

  } catch (error) {
    console.error('Error in shifts API route:', error);
    if (error instanceof Error && 'code' in error) {
      const firebaseError = error as { code: string; message: string };
      if (firebaseError.code === 'auth/id-token-expired') {
          return new NextResponse(JSON.stringify({ error: 'ID token has expired' }), { status: 401 });
      }
      if (firebaseError.code === 'auth/argument-error') {
          return new NextResponse(JSON.stringify({ error: 'Invalid token provided' }), { status: 401 });
      }
    }
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
