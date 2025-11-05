import { NextRequest, NextResponse } from 'next/server';
import { prismaDataService } from '@/lib/services/prisma-data-service';
import { connectDB } from '@/lib/prisma';

// GET /api/projects - List user projects
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // TODO: Get userId from session/auth
    const userId = 'temp-user-id'; // Replace with actual auth
    
    const result = await prismaDataService.listProjects(userId, page, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const data = await request.json();
    
    // TODO: Get userId from session/auth
    const userId = 'temp-user-id'; // Replace with actual auth
    
    const project = await prismaDataService.createProject(userId, data);
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/projects:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}