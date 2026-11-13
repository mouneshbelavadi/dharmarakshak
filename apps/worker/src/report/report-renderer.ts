import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import {
  CaseReport,
  OFFICIAL_LEGAL_ASSISTANCE_DISCLAIMER,
} from '@dharmaraksha/shared-contracts';
import { fontResolver } from './font-resolver.js';

export class ReportRenderer {
  /**
   * Generates a versioned, accessible PDF report from validated persisted findings.
   * Runs outside the HTTP request path to avoid blocking request threads.
   */
  public async generatePdfReport(
    report: CaseReport,
    outputPath: string
  ): Promise<{ fileSizeBytes: number; sha256: string }> {
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    return new Promise<{ fileSizeBytes: number; sha256: string }>((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4',
        autoFirstPage: true,
        bufferPages: true,
        info: {
          Title: `DHARMARAKSHA Case Report - Case ${report.caseId} (Snapshot v${report.snapshotVersion})`,
          Author: 'DHARMARAKSHA Indian Legal Assistance System',
          Subject: 'Preliminary AI-Assisted Document Understanding & Review',
          Keywords: 'DHARMARAKSHA, Legal, India, Review, Tribunal, Analysis',
        },
      });

      const writeStream = fs.createWriteStream(outputPath);
      const hash = crypto.createHash('sha256');

      doc.on('data', (chunk) => hash.update(chunk));
      doc.pipe(writeStream);

      // Register cross-platform fonts
      const fonts = fontResolver.registerFonts(doc);

      // --- PAGE 1: TITLE, METADATA & DISCLAIMER ---
      doc.font(fonts.bold).fontSize(22).fillColor('#0f172a').text('DHARMARAKSHA', { align: 'center' });
      doc
        .font(fonts.regular)
        .fontSize(11)
        .fillColor('#475569')
        .text('Indian Legal-Document Assistance System • Preliminary Case Review', { align: 'center' });
      doc.moveDown(0.8);

      // Header Meta Table
      const startY = doc.y;
      doc.rect(40, startY, 515, 65).fillAndStroke('#f8fafc', '#cbd5e1');
      doc.fillColor('#0f172a').font(fonts.bold).fontSize(9);
      doc.text(`CASE ID:`, 50, startY + 10);
      doc.font(fonts.regular).text(report.caseId, 120, startY + 10);

      doc.font(fonts.bold).text(`SNAPSHOT:`, 50, startY + 25);
      doc.font(fonts.regular).text(`Version ${report.snapshotVersion}`, 120, startY + 25);

      doc.font(fonts.bold).text(`LANGUAGE:`, 50, startY + 40);
      doc.font(fonts.regular).text(report.reportLanguage.toUpperCase(), 120, startY + 40);

      doc.font(fonts.bold).text(`DATE:`, 300, startY + 10);
      doc.font(fonts.regular).text(new Date(report.generatedAt).toLocaleString('en-IN'), 370, startY + 10);

      doc.font(fonts.bold).text(`REPORT TYPE:`, 300, startY + 25);
      const typeColor = report.reportType === 'full_verified' ? '#047857' : '#b45309';
      doc.font(fonts.bold).fillColor(typeColor).text(report.reportType.toUpperCase(), 385, startY + 25);

      doc.font(fonts.bold).fillColor('#0f172a').text(`SCOPE:`, 300, startY + 40);
      doc.font(fonts.regular).text(report.reviewedScope.mode === 'all' ? 'All Submitted Documents' : `${report.reviewedScope.documentIds.length} Selected Docs`, 370, startY + 40);

      doc.y = startY + 75;
      doc.moveDown(0.5);

      // Mandatory Disclaimer Box
      const discY = doc.y;
      doc.rect(40, discY, 515, 55).fillAndStroke('#fffbeb', '#fcd34d');
      doc.font(fonts.bold).fontSize(8.5).fillColor('#92400e').text('STATUTORY PRELIMINARY ASSISTANCE DISCLAIMER', 50, discY + 8);
      doc
        .font(fonts.regular)
        .fontSize(7.5)
        .fillColor('#78350f')
        .text(OFFICIAL_LEGAL_ASSISTANCE_DISCLAIMER, 50, discY + 20, { width: 495, align: 'justify' });

      doc.y = discY + 65;
      doc.moveDown(0.8);

      // --- SECTION 1: DOCUMENT INVENTORY ---
      doc.font(fonts.bold).fontSize(12).fillColor('#1e293b').text('1. Case Document Inventory');
      doc.moveDown(0.3);

      doc.font(fonts.bold).fontSize(8).fillColor('#334155');
      const invHeadY = doc.y;
      doc.rect(40, invHeadY, 515, 18).fillAndStroke('#e2e8f0', '#cbd5e1');
      doc.fillColor('#0f172a');
      doc.text('TITLE', 48, invHeadY + 5);
      doc.text('CATEGORY', 180, invHeadY + 5);
      doc.text('PAGES', 290, invHeadY + 5);
      doc.text('LANGUAGE', 340, invHeadY + 5);
      doc.text('STATUS / PRE-HASH', 410, invHeadY + 5);

      let itemY = invHeadY + 18;
      for (const item of report.documentInventory) {
        doc.rect(40, itemY, 515, 20).fillAndStroke('#ffffff', '#e2e8f0');
        doc.font(fonts.bold).fontSize(8).fillColor('#0f172a').text(item.title, 48, itemY + 5, { width: 125, lineBreak: false });
        doc.font(fonts.regular).fontSize(7.5).fillColor('#475569');
        doc.text(item.category.replace(/_/g, ' '), 180, itemY + 5);
        doc.text(`${item.pageCount} page(s)`, 290, itemY + 5);
        doc.text(item.language, 340, itemY + 5);
        const hashDisplay = item.sha256PreHash ? `${item.sha256PreHash.substring(0, 10)}...` : (item.isAnnexure ? 'Annexure link' : 'Verified');
        doc.text(hashDisplay, 410, itemY + 5);
        itemY += 20;
      }
      doc.y = itemY + 10;
      doc.moveDown(0.8);

      // --- SECTION 2: EXECUTIVE SUMMARY ---
      doc.font(fonts.bold).fontSize(12).fillColor('#1e293b').text('2. Executive Summary & Review Findings');
      doc.moveDown(0.3);
      doc
        .font(fonts.regular)
        .fontSize(9)
        .fillColor('#1e293b')
        .text(report.executiveSummary, { align: 'justify', lineGap: 2 });
      doc.moveDown(0.8);

      // --- SECTION 3: MATERIAL OBLIGATIONS ---
      if (doc.y > 620) {
        doc.addPage();
      }
      doc.font(fonts.bold).fontSize(12).fillColor('#1e293b').text('3. Material Contractual Obligations');
      doc.moveDown(0.3);

      if (report.materialObligations.length === 0) {
        doc.font(fonts.regular).fontSize(8.5).fillColor('#64748b').text('No primary obligations were extracted for this document category.');
      } else {
        for (const obl of report.materialObligations) {
          if (doc.y > 700) doc.addPage();
          const oblBoxY = doc.y;
          doc.rect(40, oblBoxY, 515, 42).fillAndStroke('#f8fafc', '#e2e8f0');
          doc.font(fonts.bold).fontSize(9).fillColor('#0f172a').text(`• ${obl.title}`, 48, oblBoxY + 6);
          doc.font(fonts.bold).fontSize(7.5).fillColor(obl.severity === 'critical' ? '#dc2626' : '#2563eb');
          doc.text(`[${obl.severity.toUpperCase()}]`, 480, oblBoxY + 6);

          doc.font(fonts.regular).fontSize(8).fillColor('#334155').text(`"${obl.verbatimClause}"`, 55, oblBoxY + 20, { width: 430, lineBreak: false });
          doc.font(fonts.regular).fontSize(7).fillColor('#64748b').text(`Anchor: ${obl.sourceAnchor.clauseReference || obl.sourceAnchor.documentTitle || 'Agreement'} (Page ${obl.sourceAnchor.pageNumber || 1})`, 55, oblBoxY + 31);
          doc.y = oblBoxY + 48;
        }
      }
      doc.moveDown(0.8);

      // --- SECTION 4: PRESERVED ADVERSARIAL DISAGREEMENTS ---
      if (doc.y > 600) doc.addPage();
      doc.font(fonts.bold).fontSize(12).fillColor('#1e293b').text('4. Adversarial Challenges & Preserved Dissent');
      doc.moveDown(0.3);

      if (report.adversarialDissents.length === 0) {
        doc.font(fonts.regular).fontSize(8.5).fillColor('#64748b').text('No unresolved adversarial contradictions were recorded.');
      } else {
        for (const diss of report.adversarialDissents) {
          if (doc.y > 680) doc.addPage();
          const dissBoxY = doc.y;
          doc.rect(40, dissBoxY, 515, 52).fillAndStroke('#fef2f2', '#fecaca');
          doc.font(fonts.bold).fontSize(8.5).fillColor('#991b1b').text(`Topic: ${diss.topic}`, 48, dissBoxY + 6);
          if (diss.statutoryReference) {
            doc.font(fonts.regular).fontSize(7.5).fillColor('#7f1d1d').text(`Authority: ${diss.statutoryReference}`, 300, dissBoxY + 6);
          }
          doc.font(fonts.regular).fontSize(7.5).fillColor('#450a0a').text(`Holder (D01): ${diss.holderPerspective}`, 55, dissBoxY + 20, { width: 490, lineBreak: false });
          doc.font(fonts.regular).fontSize(7.5).fillColor('#450a0a').text(`Counterparty (D02): ${diss.counterpartyPerspective}`, 55, dissBoxY + 31, { width: 490, lineBreak: false });
          doc.font(fonts.bold).fontSize(7).fillColor('#b91c1c').text(`Impact: ${diss.impactAssessment}`, 55, dissBoxY + 42, { width: 490, lineBreak: false });
          doc.y = dissBoxY + 58;
        }
      }
      doc.moveDown(0.8);

      // --- SECTION 5: UNRESOLVED QUESTIONS & MISSING ATTACHMENTS ---
      if (doc.y > 620) doc.addPage();
      doc.font(fonts.bold).fontSize(12).fillColor('#1e293b').text('5. Unresolved Questions & Evidence Gaps');
      doc.moveDown(0.3);

      if (report.unresolvedQuestions.length === 0) {
        doc.font(fonts.regular).fontSize(8.5).fillColor('#64748b').text('All required evidentiary matters were resolved from submitted pages.');
      } else {
        for (const q of report.unresolvedQuestions) {
          if (doc.y > 700) doc.addPage();
          const qBoxY = doc.y;
          doc.rect(40, qBoxY, 515, 34).fillAndStroke('#f8fafc', '#cbd5e1');
          doc.font(fonts.bold).fontSize(8).fillColor('#0f172a').text(`[${q.targetParty.toUpperCase()}] ${q.questionText}`, 48, qBoxY + 6, { width: 495 });
          doc.font(fonts.regular).fontSize(7.5).fillColor('#475569').text(`Reason: ${q.reason}${q.missingDocumentRef ? ` (Missing: ${q.missingDocumentRef})` : ''}`, 48, qBoxY + 19, { width: 495 });
          doc.y = qBoxY + 38;
        }
      }
      doc.moveDown(0.8);

      // --- SECTION 6: COVERAGE SUMMARY & SKIPPED ROLES ---
      if (doc.y > 640) doc.addPage();
      doc.font(fonts.bold).fontSize(12).fillColor('#1e293b').text('6. Chamber Coverage & Specialist Attribution');
      doc.moveDown(0.3);

      const covY = doc.y;
      doc.rect(40, covY, 515, 45).fillAndStroke('#f1f5f9', '#cbd5e1');
      doc.font(fonts.bold).fontSize(8).fillColor('#0f172a').text(`Specialists Assigned: ${report.coverage.totalSpecialistsAssigned} of 50`, 50, covY + 8);
      doc.font(fonts.regular).fontSize(7.5).fillColor('#475569').text(`Active Roles: ${report.coverage.assignedRoles.slice(0, 10).join(', ')}${report.coverage.assignedRoles.length > 10 ? '...' : ''}`, 50, covY + 20, { width: 495 });
      doc.font(fonts.regular).fontSize(7.5).fillColor('#64748b').text(`Skipped/Unassigned: ${report.coverage.skippedRoles.length} roles (unrelated to document category)`, 50, covY + 32, { width: 495 });
      doc.y = covY + 52;
      doc.moveDown(0.8);

      // --- SECTION 7: VERBATIM EVIDENCE PROVENANCE & SOURCE LINKS ---
      if (doc.y > 620) doc.addPage();
      doc.font(fonts.bold).fontSize(12).fillColor('#1e293b').text('7. Verbatim Evidence Provenance');
      doc.moveDown(0.3);

      for (const ev of report.evidenceReferences) {
        if (doc.y > 700) doc.addPage();
        const evBoxY = doc.y;
        doc.rect(40, evBoxY, 515, 36).fillAndStroke('#ffffff', '#e2e8f0');
        doc.font(fonts.bold).fontSize(8).fillColor('#1d4ed8').text(`${ev.documentTitle || 'Document'} — Page ${ev.pageNumber || 1} (${ev.clauseReference || 'General Clause'})`, 48, evBoxY + 5);
        doc.font(fonts.regular).fontSize(7.5).fillColor('#334155').text(`"${ev.excerpt}"`, 48, evBoxY + 18, { width: 495, lineBreak: false });
        doc.y = evBoxY + 40;
      }

      // --- FOOTER AND PAGE NUMBERING ---
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc
          .font(fonts.regular)
          .fontSize(7)
          .fillColor('#94a3b8')
          .text(
            `DHARMARAKSHA Case ${report.caseId} • Snapshot v${report.snapshotVersion} • Page ${i + 1} of ${totalPages} • Preliminary Legal Assistance Synthesis`,
            40,
            800,
            { align: 'center', width: 515 }
          );
      }

      doc.end();

      writeStream.on('finish', () => {
        const stats = fs.statSync(outputPath);
        const finalHash = hash.digest('hex');
        resolve({
          fileSizeBytes: stats.size,
          sha256: finalHash,
        });
      });

      writeStream.on('error', (err) => reject(err));
    });
  }

  /**
   * Renders concise, accessible HTML results for immediate reading/listening on phones
   * without requiring a desktop PDF viewer.
   */
  public renderReportHtml(report: CaseReport): string {
    const isPartial = report.reportType === 'partial_analysis';

    const inventoryRows = report.documentInventory
      .map(
        (doc) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${this.escape(doc.title)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${this.escape(doc.category.replace(/_/g, ' '))}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${doc.pageCount} pg</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${this.escape(doc.language)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 11px;">${doc.sha256PreHash ? doc.sha256PreHash.substring(0, 10) + '...' : 'Verified'}</td>
      </tr>`
      )
      .join('');

    const obligationsRows = report.materialObligations
      .map(
        (obl) => `
      <div style="background: #f8fafc; border-left: 4px solid ${obl.severity === 'critical' ? '#dc2626' : '#2563eb'}; padding: 12px; margin-bottom: 8px; border-radius: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #0f172a;">${this.escape(obl.title)}</strong>
          <span style="font-size: 11px; font-weight: 700; color: ${obl.severity === 'critical' ? '#dc2626' : '#2563eb'};">[${obl.severity.toUpperCase()}]</span>
        </div>
        <p style="margin: 6px 0; font-style: italic; color: #334155; font-size: 13px;">"${this.escape(obl.verbatimClause)}"</p>
        <span style="font-size: 11px; color: #64748b;">Source: ${this.escape(obl.sourceAnchor.documentTitle || 'Document')} (Page ${obl.sourceAnchor.pageNumber || 1}, ${this.escape(obl.sourceAnchor.clauseReference || '')})</span>
      </div>`
      )
      .join('');

    const dissentRows = report.adversarialDissents
      .map(
        (d) => `
      <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 12px; margin-bottom: 8px; border-radius: 4px;">
        <div style="font-weight: 700; color: #991b1b; margin-bottom: 4px;">${this.escape(d.topic)}</div>
        <div style="font-size: 12px; color: #7f1d1d; margin-bottom: 4px;"><strong>Document-Holder (D01):</strong> ${this.escape(d.holderPerspective)}</div>
        <div style="font-size: 12px; color: #7f1d1d; margin-bottom: 4px;"><strong>Counterparty (D02):</strong> ${this.escape(d.counterpartyPerspective)}</div>
        <div style="font-size: 11px; color: #b91c1c;"><strong>Impact:</strong> ${this.escape(d.impactAssessment)}</div>
      </div>`
      )
      .join('');

    const unresolvedRows = report.unresolvedQuestions
      .map(
        (q) => `
      <li style="margin-bottom: 6px; font-size: 13px; color: #334155;">
        <strong>[${this.escape(q.targetParty.toUpperCase())}]</strong> ${this.escape(q.questionText)}
        <span style="font-size: 11px; color: #64748b;">— Reason: ${this.escape(q.reason)}</span>
      </li>`
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DHARMARAKSHA Case Report - Case ${report.caseId} (Snapshot v${report.snapshotVersion})</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #0f172a;
      max-width: 860px;
      margin: 0 auto;
      padding: 24px;
      background: #ffffff;
    }
    h1 { font-size: 24px; margin-bottom: 4px; color: #0f172a; }
    h2 { font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; color: #1e293b; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; }
    .badge-verified { background: #d1fae5; color: #065f46; }
    .badge-partial { background: #fef3c7; color: #92400e; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 6px; margin: 16px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; }
    .disclaimer-box { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 6px; padding: 12px; margin: 16px 0; font-size: 12px; color: #92400e; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
    th { text-align: left; padding: 8px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; }
    @media print {
      .page-break { page-break-after: always; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <div>
      <h1>DHARMARAKSHA Case Report</h1>
      <p style="color: #64748b; font-size: 13px; margin: 0;">Preliminary AI-Assisted Document Understanding & Review</p>
    </div>
    <div>
      <span class="badge ${isPartial ? 'badge-partial' : 'badge-verified'}">
        ${isPartial ? 'PARTIAL ANALYSIS' : 'TRIBUNAL VERIFIED'}
      </span>
    </div>
  </div>

  <div class="meta-box">
    <div><strong>Case ID:</strong> ${this.escape(report.caseId)}</div>
    <div><strong>Date:</strong> ${new Date(report.generatedAt).toLocaleString('en-IN')}</div>
    <div><strong>Snapshot:</strong> Version ${report.snapshotVersion}</div>
    <div><strong>Language:</strong> ${this.escape(report.reportLanguage.toUpperCase())}</div>
    <div><strong>Scope:</strong> ${report.reviewedScope.mode === 'all' ? 'All Submitted Documents' : 'Targeted Documents'}</div>
    <div><strong>Specialists:</strong> ${report.coverage.totalSpecialistsAssigned} of 50 Assigned</div>
  </div>

  <div class="disclaimer-box">
    <strong>STATUTORY LEGAL ASSISTANCE DISCLAIMER:</strong><br>
    ${this.escape(report.statutoryDisclaimer)}
  </div>

  <h2>1. Case Document Inventory</h2>
  <table>
    <thead>
      <tr>
        <th>Document Title</th>
        <th>Category</th>
        <th>Pages</th>
        <th>Language</th>
        <th>Status / Pre-Hash</th>
      </tr>
    </thead>
    <tbody>
      ${inventoryRows}
    </tbody>
  </table>

  <h2>2. Executive Summary</h2>
  <div style="background: #f8fafc; border-left: 4px solid #0f172a; padding: 12px; border-radius: 4px; font-size: 14px; color: #1e293b;">
    ${this.escape(report.executiveSummary)}
  </div>

  <div class="page-break"></div>

  <h2>3. Material Contractual Obligations</h2>
  <div>
    ${obligationsRows || '<p style="color: #64748b;">No contractual obligations extracted.</p>'}
  </div>

  <h2>4. Preserved Adversarial Disagreements</h2>
  <div>
    ${dissentRows || '<p style="color: #64748b;">No unresolved adversarial disagreements recorded.</p>'}
  </div>

  <h2>5. Unresolved Questions & Missing Attachments</h2>
  <ul>
    ${unresolvedRows || '<li style="color: #64748b;">No outstanding evidentiary questions.</li>'}
  </ul>

  <h2>6. Specialist Bench Attribution</h2>
  <p style="font-size: 13px; color: #475569;">
    <strong>Assigned Roles:</strong> ${report.coverage.assignedRoles.join(', ')}<br>
    <strong>Skipped Roles:</strong> ${report.coverage.skippedRoles.length} roles (unrelated to active document categories)
  </p>

  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
    DHARMARAKSHA Case ${this.escape(report.caseId)} • Snapshot v${report.snapshotVersion} • Generated at ${new Date(report.generatedAt).toISOString()}
  </div>
</body>
</html>`;
  }

  private escape(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

export const reportRenderer = new ReportRenderer();
