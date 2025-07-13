
import { NextResponse } from 'next/server';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase-admin'; // Use admin SDK for backend operations
import { auth } from 'firebase-admin';

export async function POST(request: Request) {
  try {
    const idToken = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Verify the user's token to ensure they are authenticated
    const decodedToken = await auth().verifyIdToken(idToken);
    const userUid = decodedToken.uid;
    
    // Check for management role from the custom claims on the token
    // For this to work, you must set custom claims when a user's role is set to 'management'
    if (decodedToken.role !== 'management') {
         return new NextResponse(JSON.stringify({ error: 'Forbidden: Insufficient permissions' }), { status: 403 });
    }

    const shiftData = await request.json();
    
    if (shiftData.id) {
      // Update existing shift
      const shiftRef = doc(db, 'shifts', shiftData.id);
      await setDoc(shiftRef, shiftData, { merge: true });
      return NextResponse.json({ success: true, id: shiftData.id });
    } else {
      // Create new shift
      const newShiftRef = await addDoc(collection(db, 'shifts'), shiftData);
      return NextResponse.json({ success: true, id: newShiftRef.id });
    }

  } catch (error) {
    console.error('Error in shifts API route:', error);
    if (error instanceof Error && 'code' in error && (error as any).code === 'auth/id-token-expired') {
        return new NextResponse(JSON.stringify({ error: 'ID token has expired' }), { status: 401 });
    }
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
