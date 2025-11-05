import { NextRequest, NextResponse } from 'next/server';
import { ReportGenerationService } from '@/lib/services/report-generation-service';
import { ReportConfig } from '@/components/service-desk-pricing/reports/ReportGenerator';
import { ServiceDeskData } from '@/lib/types/service-desk-pricing';

const reportService = ReportGenerationService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config, data }: { config: ReportConfig; data: ServiceDeskData } = body;

    if (!config || !data) {
      return NextResponse.json(
        { error: 'Config and data are required' },
        { status: 400 }
      );
    }

    const report = await reportService.generateReport(config, data);

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        status: report.status,
        generatedAt: report.generatedAt,
        fileUrl: report.fileUrl,
        fileSize: report.fileSize,
        config: {
          name: report.config.name,
          type: report.config.type,
          format: report.config.format
        }
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');

    if (reportId) {
      const report = await reportService.getReport(reportId);
      if (!report) {
        return NextResponse.json(
          { error: 'Report not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        report: {
          id: report.id,
          status: report.status,
          generatedAt: report.generatedAt,
          fileUrl: report.fileUrl,
          fileSize: report.fileSize,
          error: report.error,
          config: {
            name: report.config.name,
            description: report.config.description,
            type: report.config.type,
            format: report.config.format
          }
        }
      });
    } else {
      const reports = await reportService.listReports();
      return NextResponse.json({
        success: true,
        reports: reports.map(report => ({
          id: report.id,
          status: report.status,
          generatedAt: report.generatedAt,
          fileUrl: report.fileUrl,
          fileSize: report.fileSize,
          config: {
            name: report.config.name,
            description: report.config.description,
            type: report.config.type,
            format: report.config.format
          }
        }))
      });
    }
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch reports',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    const deleted = await reportService.deleteReport(reportId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}