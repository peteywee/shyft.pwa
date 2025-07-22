import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const body = await req.json();

    // Your logic to update the shift with the given id and body...
    
    console.log(`Updating shift ${id} with:`, body);

    return NextResponse.json({ message: 'Shift updated successfully', id }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error updating shift' }, { status: 500 });
  }
}
