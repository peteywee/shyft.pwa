
import { NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase-admin';
import type { User } from '@/types';

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

    const userData: Partial<User> = await request.json();

    if (userData.id) {
      const { id, ...dataToUpdate } = userData;
      const userRef = db.doc(`users/${id}`);
      await userRef.set(dataToUpdate, { merge: true });
      return NextResponse.json({ success: true, id });
    } else {
       if (!userData.email) {
        return new NextResponse(JSON.stringify({ error: 'Email is required for new users' }), { status: 400 });
      }
      const newUserRef = await db.collection('users').add(userData);
      return NextResponse.json({ success: true, id: newUserRef.id });
    }

  } catch (error) {
    console.error('Error in users API route:', error);
     if (error instanceof Error && 'code' in error) {
      const firebaseError = error as { code: string; message: string };
      if (firebaseError.code === 'auth/id-token-expired') {
          return new NextResponse(JSON.stringify({ error: 'ID token has expired' }), { status: 401 });
      }
    }
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
