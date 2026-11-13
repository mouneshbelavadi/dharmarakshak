import { Router, Request, Response } from 'express';
import fs from 'fs';
import { requireCaseAccess } from '../auth/auth-service.js';
import { casesStore } from '../storage/case-store.js';
import { reportWorkerService, reportRenderer } from '@dharmaraksha/worker';
import { ReportType, ReportDeliveryRequest } from '@dharmaraksha/shared-contracts';

export const reportsRouter = Router();

/**
 * POST /cases/:id/reports/generate
 * Triggers versioned report generation for the case snapshot outside HTTP request path.
 */
reportsRouter.post('/cases/:id/reports/generate', requireCaseAccess, async (req: Request, res: Response) => {
  const caseId = req.params.id;
  const c = casesStore.get(caseId);
  if (!c) {
    return res.status(404).json({ error: 'CASE_NOT_FOUND', message: `Case ${caseId} does not exist.` });
  }

  const reportType: ReportType = req.body?.reportType || (c.status === 'review_complete' ? 'full_verified' : 'partial_analysis');
  const delivery: ReportDeliveryRequest | undefined = req.body?.delivery;

  try {
    const report = await reportWorkerService.generateCaseReport(c, {
      reportType,
      delivery,
    });

    res.status(202).json({
      success: true,
      reportId: report.reportId,
      snapshotVersion: report.snapshotVersion,
      status: report.status,
      reportType: report.reportType,
      fileSizeBytes: report.pdfFileSizeBytes,
      sha256: report.pdfSha256,
      downloadUrl: report.downloadUrl,
      htmlUrl: `/api/v1/cases/${c.caseId}/reports/html`,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'REPORT_GENERATION_FAILED', message: err.message });
  }
});

/**
 * GET /cases/:id/reports/status
 * Retrieves current report status and metadata for a case.
 */
reportsRouter.get('/cases/:id/reports/status', requireCaseAccess, (req: Request, res: Response) => {
  const caseId = req.params.id;
  const report = reportWorkerService.getLatestReportForCase(caseId);
  if (!report) {
    return res.status(404).json({ error: 'REPORT_NOT_FOUND', message: 'No report has been generated for this case.' });
  }

  res.status(200).json({
    reportId: report.reportId,
    caseId: report.caseId,
    snapshotVersion: report.snapshotVersion,
    status: report.status,
    reportType: report.reportType,
    generatedAt: report.generatedAt,
    fileSizeBytes: report.pdfFileSizeBytes,
    sha256: report.pdfSha256,
    downloadUrl: report.downloadUrl,
  });
});

/**
 * GET /cases/:id/reports/summary
 * Concise accessible JSON report summary for kiosk phone display.
 */
reportsRouter.get('/cases/:id/reports/summary', requireCaseAccess, (req: Request, res: Response) => {
  const caseId = req.params.id;
  const report = reportWorkerService.getLatestReportForCase(caseId);
  if (!report) {
    return res.status(404).json({ error: 'REPORT_NOT_FOUND', message: 'No report has been generated for this case.' });
  }

  res.status(200).json({
    reportId: report.reportId,
    caseId: report.caseId,
    snapshotVersion: report.snapshotVersion,
    reportType: report.reportType,
    documentCount: report.documentInventory.length,
    obligationsCount: report.materialObligations.length,
    dissentsCount: report.adversarialDissents.length,
    unresolvedQuestionsCount: report.unresolvedQuestions.length,
    specialistsAssigned: report.coverage.totalSpecialistsAssigned,
    downloadUrl: report.downloadUrl,
    statutoryDisclaimer: report.statutoryDisclaimer,
  });
});

/**
 * GET /cases/:id/reports/html
 * Renders concise accessible HTML results for immediate reading/listening on phones
 * without requiring a desktop PDF viewer.
 */
reportsRouter.get('/cases/:id/reports/html', requireCaseAccess, (req: Request, res: Response) => {
  const caseId = req.params.id;
  const report = reportWorkerService.getLatestReportForCase(caseId);
  if (!report) {
    return res.status(404).json({ error: 'REPORT_NOT_FOUND', message: 'No report generated yet.' });
  }

  const html = reportRenderer.renderReportHtml(report);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
});

/**
 * GET /cases/:id/reports/spoken-summary
 * Returns plain-language spoken script for phone text-to-speech / Sarvam audio.
 */
reportsRouter.get('/cases/:id/reports/spoken-summary', requireCaseAccess, (req: Request, res: Response) => {
  const caseId = req.params.id;
  const spoken = reportWorkerService.getSpokenSummary(caseId);
  if (!spoken) {
    return res.status(404).json({ error: 'SPOKEN_SUMMARY_NOT_FOUND', message: 'No spoken summary available.' });
  }

  res.status(200).json(spoken);
});

/**
 * GET /cases/:id/reports/:reportId/download
 * Authorized private streaming download of the versioned PDF report.
 * Protected by requireCaseAccess; card return or session expiry revokes access.
 */
reportsRouter.get('/cases/:id/reports/:reportId/download', requireCaseAccess, (req: Request, res: Response) => {
  const { id: caseId, reportId } = req.params;
  const report = reportWorkerService.getReport(reportId);

  if (!report || report.caseId !== caseId) {
    return res.status(404).json({ error: 'REPORT_NOT_FOUND', message: `Report ${reportId} not found.` });
  }

  if (!fs.existsSync(report.pdfStoragePath)) {
    return res.status(404).json({ error: 'PDF_FILE_NOT_FOUND', message: 'Report PDF file is missing from private storage.' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="DHARMARAKSHA_Report_${caseId}_v${report.snapshotVersion}.pdf"`);
  res.setHeader('X-Report-Sha256', report.pdfSha256);
  res.setHeader('X-Report-Version', report.snapshotVersion.toString());

  const fileStream = fs.createReadStream(report.pdfStoragePath);
  fileStream.pipe(res);
});

/**
 * POST /cases/:id/reports/deliver
 * Requests delivery of report via Telegram, Google Drive, or Gmail.
 * A disconnected external service does not block local PDF download.
 */
reportsRouter.post('/cases/:id/reports/deliver', requireCaseAccess, async (req: Request, res: Response) => {
  const caseId = req.params.id;
  const report = reportWorkerService.getLatestReportForCase(caseId);

  if (!report) {
    return res.status(404).json({ error: 'REPORT_NOT_FOUND', message: 'No report available for delivery.' });
  }

  const deliveryRequest: ReportDeliveryRequest = req.body;
  if (!deliveryRequest || !deliveryRequest.channel || !deliveryRequest.destination) {
    return res.status(400).json({ error: 'INVALID_DELIVERY_REQUEST', message: 'Channel and destination are required.' });
  }

  const result = await reportWorkerService.deliverReport(report, deliveryRequest);

  // Return status; disconnected service does not prevent report download
  res.status(200).json({
    success: result.status === 'delivered',
    deliveryStatus: result.status,
    channel: result.channel,
    destination: result.destination,
    details: result.details,
    localDownloadUrl: report.downloadUrl,
  });
});
