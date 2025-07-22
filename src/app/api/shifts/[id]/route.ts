
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { Shift } from '@/types';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const shiftData: Omit<Shift, 'id'> = await request.json();
    
    // Convert string dates to Firestore Timestamps
    const updatedShift = {
      ...shiftData,
      startTime: Timestamp.fromDate(new Date(shiftData.startTime)),
      endTime: Timestamp.fromDate(new Date(shiftData.endTime)),
    };

    await db.collection('shifts').doc(params.id).update(updatedShift);
    return NextResponse.json({ id: params.id, ...shiftData });
  } catch (error) {
    console.error('Error updating shift:', error);
    return NextResponse.json(
      { message: 'Error updating shift' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.collection('shifts').doc(params.id).delete();
    return NextResponse.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift:', error);
    return NextResponse.json(
      { message: 'Error deleting shift' },
      { status: 500 }
    );
  }
}
