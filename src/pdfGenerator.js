import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateStudentReport(pdfData) {
  const {
    nombre_alumno,
    curso,
    año,
    informe_periodo,
    materias_data,
    observaciones,
    promedio_final
  } = pdfData;

  // Crear documento PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 en puntos
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const margin = 40;
  let y = height - margin;

  const drawText = (text, x, y, fontSize = 12, bold = false, options = {}) => {
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font: bold ? boldFont : font,
      color: rgb(0, 0, 0),
      ...options,
    });
  };

  // Encabezado
  drawText('Liceo Agrícola San Sebastián', margin, y, 14, true);
  y -= 18;
  drawText('Comuna de Perquenco', margin, y);
  y -= 14;
  drawText('Fono: 4524537002', margin, y);
  y -= 30;

  // Título
  drawText(`INFORME DE NOTAS ${informe_periodo.toUpperCase()} SEMESTRE`, margin, y, 14, true);
  y -= 25;

  // Datos del estudiante
  drawText(`ALUMNO/A: ${nombre_alumno}`, margin, y);
  y -= 16;
  drawText(`PROFESORA JEFE: JOAN ESPINOZA TORRES`, margin, y);
  y -= 16;
  drawText(`CURSO: ${curso}   AÑO: ${año}`, margin, y);
  y -= 25;

  // Tabla de notas
  const headers = ['ASIGNATURAS', 'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'PROMEDIO'];
  const colWidths = [100, 40, 40, 40, 40, 40, 40, 40, 60];
  const startX = margin;
  let colX = startX;
  const rowHeight = 20;

  // Dibujar encabezados
  headers.forEach((header, i) => {
    drawText(header, colX + 2, y, 10, true);
    colX += colWidths[i];
  });
  y -= rowHeight;

  // Dibujar filas
  materias_data.forEach(fila => {
    colX = startX;
    fila.forEach((item, i) => {
      drawText(item || '', colX + 2, y, 10);
      colX += colWidths[i];
    });
    y -= rowHeight;
  });

  // Fila de promedio final
  colX = startX;
  drawText('PROMEDIO FINAL', colX + 2, y, 10, true);
  colX += colWidths[0] + colWidths.slice(1, 8).reduce((a, b) => a + b, 0);
  drawText(promedio_final, colX + 2, y, 10, true);
  y -= 30;

  // Observaciones
  drawText('Observaciones:', margin, y, 12, true);
  y -= 16;
  drawText(observaciones || 'Sin observaciones', margin, y, 10);
  y -= 40;

  // Firma
  drawText('Álvaro Guzmán Ibáñez', margin, y, 12, true);
  y -= 16;
  drawText('Director', margin, y, 12);
  y -= 10;

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
