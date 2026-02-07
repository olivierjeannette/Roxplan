import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import type { PlanElement } from '@/types';

interface ExportOptions {
  format: 'png' | 'pdf';
  pixelRatio?: number;
  fileName?: string;
  includeTitle?: boolean;
  title?: string;
  includeLegend?: boolean;
  elements?: PlanElement[];
  pageSize?: 'a4' | 'a3' | 'custom';
}

/**
 * Export le canvas Konva en PNG via stage.toDataURL
 */
export async function exportCanvasPng(
  stageRef: { toDataURL: (config: { pixelRatio: number; mimeType?: string }) => string },
  options: ExportOptions
): Promise<void> {
  const pixelRatio = options.pixelRatio ?? 2;
  const dataUrl = stageRef.toDataURL({ pixelRatio, mimeType: 'image/png' });

  const link = document.createElement('a');
  link.download = `${options.fileName || 'plan'}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export le canvas Konva en PDF
 */
export async function exportCanvasPdf(
  stageRef: { toDataURL: (config: { pixelRatio: number; mimeType?: string }) => string },
  options: ExportOptions
): Promise<void> {
  const pixelRatio = options.pixelRatio ?? 3;
  const dataUrl = stageRef.toDataURL({ pixelRatio, mimeType: 'image/png' });

  // A4 paysage par defaut
  const isA3 = options.pageSize === 'a3';
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: isA3 ? 'a3' : 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Titre
  if (options.includeTitle && options.title) {
    pdf.setFontSize(18);
    pdf.text(options.title, pageWidth / 2, 15, { align: 'center' });
  }

  const imgY = options.includeTitle ? 20 : 5;
  const imgHeight = options.includeLegend ? pageHeight - imgY - 30 : pageHeight - imgY - 5;

  pdf.addImage(dataUrl, 'PNG', 5, imgY, pageWidth - 10, imgHeight);

  // Legende
  if (options.includeLegend && options.elements) {
    const stations = options.elements.filter((el) => el.type === 'station');
    if (stations.length > 0) {
      const legendY = pageHeight - 25;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Legende:', 10, legendY);
      pdf.setFont('helvetica', 'normal');

      stations.forEach((station, i) => {
        const x = 10 + (i % 4) * 65;
        const y = legendY + 5 + Math.floor(i / 4) * 5;
        const num = station.stationNumber ?? i + 1;
        pdf.text(`${num}. ${station.label}${station.reps ? ` (${station.reps})` : ''}`, x, y);
      });
    }
  }

  pdf.save(`${options.fileName || 'plan'}.pdf`);
}

/**
 * Genere un data URL thumbnail du canvas
 */
export function generateThumbnail(
  stageRef: { toDataURL: (config: { pixelRatio: number; mimeType?: string }) => string }
): string {
  return stageRef.toDataURL({ pixelRatio: 0.3, mimeType: 'image/jpeg' });
}
