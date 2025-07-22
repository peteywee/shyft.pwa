
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userData = await request.json();
    await db.collection('users').doc(params.id).update(userData);
    return NextResponse.json({ id: params.id, ...userData });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Error updating user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.collection('users').doc(params.id).delete();
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Error deleting user' },
      { status: 500 }
    );
  }
}
