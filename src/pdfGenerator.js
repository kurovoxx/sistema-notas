import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import logoJpg from './logos.jpg';

export async function generateStudentReport(pdfData) {
  const {
    nombre_alumno,
    curso,
    año,
    informe_periodo,
    materias_data, // Expected to be an array of arrays like: [["Subject Name", N1, N2,... Prom], ...]
    observaciones,
    promedio_final,
    subjects_for_pdf // This is the new explicit list of subjects for the current course
  } = pdfData;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const margin = 40;
  let y = height - margin;

  const drawTextLine = (text, currentY, fontSize = 12, isBold = false, options = {}) => {
    page.drawText(text, {
      x: margin,
      y: currentY,
      size: fontSize,
      font: isBold ? boldFont : font,
      color: rgb(0, 0, 0),
      ...options,
    });
    return currentY - (fontSize + (isBold ? 4 : 2)); // Adjust spacing based on font size/boldness
  };

  // Draw cell function for table
  const drawCell = (text, x, cellY, cellWidth, cellHeight, isBold = false, isHeader = false, align = 'left') => {
    page.drawRectangle({
      x,
      y: cellY - cellHeight,
      width: cellWidth,
      height: cellHeight,
      borderColor: rgb(0.7, 0.7, 0.7),
      borderWidth: 0.5,
      ...(isHeader && { color: rgb(0.9, 0.9, 0.9) }) // Light gray background for headers
    });

    const textContent = String(text === null || text === undefined ? '' : text);
    const textWidth = (isBold ? boldFont : font).widthOfTextAtSize(textContent, 10);
    let textX = x + 2; // Default left padding
    if (align === 'center') {
        textX = x + (cellWidth - textWidth) / 2;
    } else if (align === 'right') {
        textX = x + cellWidth - textWidth - 2;
    }

    page.drawText(textContent, {
      x: textX,
      y: cellY - cellHeight / 2 - (10 / 2) + 2, // Vertically center text (approx)
      size: 10,
      font: isBold ? boldFont : font,
    });
  };


  // 1. Agregar logo (asuming it's already working)
  try {
    const logoImageBytes = await fetch(logoJpg).then(res => res.arrayBuffer());
    const logoImage = await pdfDoc.embedJpg(logoImageBytes);
    const logoDims = logoImage.scale(0.25);
    page.drawImage(logoImage, {
      x: width - margin - logoDims.width,
      y: height - margin - logoDims.height,
      width: logoDims.width,
      height: logoDims.height
    });
  } catch (e) {
    console.error("Error loading logo for PDF:", e);
    // Continue without logo if it fails
  }


  // Encabezado
  y = drawTextLine('Liceo Agrícola San Sebastián', y, 14, true);
  y = drawTextLine('Comuna de Perquenco', y);
  y = drawTextLine('Fono: 4524537002', y);
  y -= 15; // Extra space

  y = drawTextLine(`INFORME DE NOTAS ${ (informe_periodo || '').toUpperCase()} SEMESTRE`, y, 14, true);
  y -= 10;

  y = drawTextLine(`ALUMNO/A: ${nombre_alumno || 'N/A'}`, y);
  y = drawTextLine(`PROFESORA JEFE: JOAN ESPINOZA TORRES`, y); // Consider making this dynamic if needed
  y = drawTextLine(`CURSO: ${curso || 'N/A'}   AÑO: ${año || 'N/A'}`, y);
  y -= 15;


  // Tabla de notas con cuadrícula
  const headers = ['ASIGNATURAS', 'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'PROMEDIO'];
  // Adjust first column width, make others more uniform for notes
  const firstColWidth = 150;
  const noteColWidth = (width - 2 * margin - firstColWidth - 60) / 7; // 60 for promedio, 7 note columns
  const promColWidth = 60;
  const colWidths = [firstColWidth, ...Array(7).fill(noteColWidth), promColWidth];

  const startX = margin;
  const rowHeight = 20;
  // let tableCurrentY = y; // Use a separate Y for table content

  // Calcular posiciones X de cada columna
  const colPositions = colWidths.reduce((acc, w, i) => {
    acc.push((i === 0 ? startX : acc[i-1] + colWidths[i-1]));
    return acc;
  }, []);

  // Encabezados de la tabla
  headers.forEach((header, i) => {
      drawCell(header, colPositions[i], y, colWidths[i], rowHeight, true, true, (i === 0 ? 'left' : 'center'));
  });
  y -= rowHeight;

  // Filas de materias - using subjects_for_pdf to iterate
  if (subjects_for_pdf && subjects_for_pdf.length > 0 && materias_data) {
    subjects_for_pdf.forEach(subjectName => {
      // Find the corresponding row in materias_data
      // Assuming materias_data[0] is subject name, and it matches subjectName
      const subjectRowData = materias_data.find(row => row && row[0] === subjectName);

      if (y - rowHeight < margin + 50) { // Check for page break (50 for footer/firmas)
        page.addPage([595.28, 841.89]);
        y = height - margin;
         // Redraw headers on new page
        headers.forEach((header, i) => {
            drawCell(header, colPositions[i], y, colWidths[i], rowHeight, true, true, (i === 0 ? 'left' : 'center'));
        });
        y -= rowHeight;
      }

      if (subjectRowData) {
        drawCell(subjectRowData[0], colPositions[0], y, colWidths[0], rowHeight, true, false, 'left'); // Subject name bold
        for (let i = 1; i < headers.length; i++) { // N1 to Promedio
          let val = subjectRowData[i];
          if (val === null || val === undefined || val === '') {
            val = '';
          } else if (!isNaN(val) && String(val).trim() !== '') { // Check if it's a number-like string
            const num = parseFloat(val); // Use parseFloat for potential decimals from calculation
            if (num === 0 && headers[i] !== 'PROMEDIO') { // Allow 0 for promedio if it's calculated as 0
              val = '';
            } else {
              // If it's already a final average (e.g., 68), format it. If it's a raw note (e.g. 70 for 7.0), format
              // Assuming materias_data contains calculated averages (like 68 for 6.8)
              // And individual notes are also scaled by 10 (e.g. 70 for 7.0)
              val = (num / 10).toFixed(1).replace('.', ',');
            }
          } else {
            val = String(val).toUpperCase(); // Keep non-numeric as is (e.g., "AD", "EX")
          }
          drawCell(val, colPositions[i], y, colWidths[i], rowHeight, false, false, 'center');
        }
      } else {
        // Draw an empty row for this subject if no data found, or log error
        drawCell(subjectName, colPositions[0], y, colWidths[0], rowHeight, true, false, 'left');
        for (let i = 1; i < headers.length; i++) {
          drawCell('', colPositions[i], y, colWidths[i], rowHeight, false, false, 'center');
        }
        console.warn(`No data found in materias_data for subject: ${subjectName}`);
      }
      y -= rowHeight;
    });
  } else {
     if (y - rowHeight < margin + 50) { page.addPage([595.28, 841.89]); y = height - margin; }
     drawCell("No hay asignaturas definidas para este curso.", colPositions[0], y, colWidths.reduce((a,b) => a+b, 0), rowHeight, true, false, 'center');
     y -= rowHeight;
  }


  // Fila de promedio final
  if (y - rowHeight < margin + 50) { page.addPage([595.28, 841.89]); y = height - margin; }
  drawCell('PROMEDIO FINAL', colPositions[0], y, colWidths[0], rowHeight, true, false, 'left');
  for (let i = 1; i < headers.length - 1; i++) { // Empty cells before the actual average
      drawCell('', colPositions[i], y, colWidths[i], rowHeight);
  }
  let finalAvg = (promedio_final === '0' || promedio_final === null || promedio_final === undefined || promedio_final === '')
                 ? ''
                 : (parseFloat(promedio_final) / 10).toFixed(1).replace('.', ',');
  drawCell(finalAvg, colPositions[headers.length - 1], y, colWidths[headers.length - 1], rowHeight, true, false, 'center');
  y -= (rowHeight + 15); // Extra space after table


  // Observaciones
  if (y - 80 < margin) { page.addPage([595.28, 841.89]); y = height - margin; } // Check space for observations + signature
  y = drawTextLine('Observaciones:', y, 12, true);

  // Basic multi-line for observations
  const obsText = observaciones || 'Sin observaciones.';
  const maxObsWidth = width - 2 * margin;
  const obsLines = [];
  let currentObsLine = '';
  obsText.split(' ').forEach(word => {
    if (font.widthOfTextAtSize(currentObsLine + word + ' ', 10) < maxObsWidth) {
      currentObsLine += word + ' ';
    } else {
      obsLines.push(currentObsLine.trim());
      currentObsLine = word + ' ';
    }
  });
  obsLines.push(currentObsLine.trim());

  obsLines.forEach(line => {
    if (y - 12 < margin + 30) { page.addPage([595.28, 841.89]); y = height - margin; }
    y = drawTextLine(line, y, 10);
  });
  y -= 20; // Space after observations


  // Firmas
  if (y - 50 < margin) { page.addPage([595.28, 841.89]); y = height - margin; }
  y = drawTextLine('Álvaro Guzmán Ibáñez', y, 12, true);
  y = drawTextLine('Director', y, 12);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
