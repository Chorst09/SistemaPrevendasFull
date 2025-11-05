import { NextRequest, NextResponse } from 'next/server';
import { ReportGenerationService } from '@/lib/services/report-generation-service';
import { ReportConfig } from '@/components/service-desk-pricing/reports/ReportGenerator';

const reportService = ReportGenerationService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const config: ReportConfig = await request.json();

    if (!config || !config.name) {
      return NextResponse.json(
        { error: 'Valid config with name is required' },
        { status: 400 }
      );
    }

    // Ensure the config has an ID
    if (!config.id) {
      config.id = crypto.randomUUID();
    }

    await reportService.saveTemplate(config);

    return NextResponse.json({
      success: true,
      template: {
        id: config.id,
        name: config.name,
        description: config.description,
        type: config.type,
        format: config.format
      }
    });
  } catch (error) {
    console.error('Error saving template:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const templates = await reportService.getTemplates();
    
    return NextResponse.json({
      success: true,
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        type: template.type,
        format: template.format,
        sections: template.sections.map(section => ({
          id: section.id,
          name: section.name,
          type: section.type,
          enabled: section.enabled
        }))
      }))
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const deleted = await reportService.deleteTemplate(templateId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}