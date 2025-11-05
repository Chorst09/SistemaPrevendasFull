import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const jobPositions = await prisma.jobPosition.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      jobPositions
    });
  } catch (error) {
    console.error('Error fetching job positions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch job positions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, level, salary8h, salary6h, description } = body;

    if (!name || !salary8h) {
      return NextResponse.json(
        { error: 'Name and salary8h are required' },
        { status: 400 }
      );
    }

    const jobPosition = await prisma.jobPosition.create({
      data: {
        name,
        level,
        salary8h: parseFloat(salary8h),
        salary6h: salary6h ? parseFloat(salary6h) : null,
        description,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      jobPosition
    });
  } catch (error) {
    console.error('Error creating job position:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create job position',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, level, salary8h, salary6h, description, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const jobPosition = await prisma.jobPosition.update({
      where: { id },
      data: {
        name,
        level,
        salary8h: salary8h ? parseFloat(salary8h) : undefined,
        salary6h: salary6h ? parseFloat(salary6h) : null,
        description,
        isActive
      }
    });

    return NextResponse.json({
      success: true,
      jobPosition
    });
  } catch (error) {
    console.error('Error updating job position:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update job position',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    // Check if position is being used by any team members
    const teamMembersCount = await prisma.teamMember.count({
      where: { jobPositionId: id }
    });

    if (teamMembersCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete job position that is being used by team members' },
        { status: 400 }
      );
    }

    await prisma.jobPosition.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Job position deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job position:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete job position',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}