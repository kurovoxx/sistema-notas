import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import logoJpg from './logos.jpg'; // Asegúrate de importar el logo correctamente (usa Vite o Webpack)

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

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
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

  // 1. Agregar logo
  const logoImageBytes = await fetch(logoJpg).then(res => res.arrayBuffer());
  const logoImage = await pdfDoc.embedJpg(logoImageBytes);
  const logoDims = logoImage.scale(0.25);
  page.drawImage(logoImage, {
    x: width - margin - logoDims.width,
    y: height - margin - logoDims.height,
    width: logoDims.width,
    height: logoDims.height
  });

  // Encabezado
  drawText('Liceo Agrícola San Sebastián', margin, y, 14, true);
  y -= 18;
  drawText('Comuna de Perquenco', margin, y);
  y -= 14;
  drawText('Fono: 4524537002', margin, y);
  y -= 30;

  drawText(`INFORME DE NOTAS ${informe_periodo.toUpperCase()} SEMESTRE`, margin, y, 14, true);
  y -= 25;

  drawText(`ALUMNO/A: ${nombre_alumno}`, margin, y);
  y -= 16;
  drawText(`PROFESORA JEFE: JOAN ESPINOZA TORRES`, margin, y);
  y -= 16;
  drawText(`CURSO: ${curso}   AÑO: ${año}`, margin, y);
  y -= 25;

// Tabla de notas con cuadrícula
const headers = ['ASIGNATURAS', 'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'PROMEDIO'];
const colWidths = [100, 40, 40, 40, 40, 40, 40, 40, 60];
const startX = margin;
const rowHeight = 20;
const tableTopY = y;

// Calcular posiciones X de cada columna
const colPositions = colWidths.reduce((acc, w, i) => {
  acc.push((acc[i - 1] ?? startX) + (i === 0 ? 0 : colWidths[i - 1]));
  return acc;
}, []);

// Función para dibujar celda
const drawCell = (text, colIndex, rowY, bold = false) => {
  const x = colPositions[colIndex];
  const w = colWidths[colIndex];

  // Borde de celda
  page.drawRectangle({
    x,
    y: rowY - rowHeight,
    width: w,
    height: rowHeight,
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 0.5,
  });

  // Texto centrado verticalmente (ajuste simple)
  const paddingLeft = 2;
  const textY = rowY - 14;
  drawText(text || '', x + paddingLeft, textY, 10, bold);
};

// Encabezados
headers.forEach((header, i) => drawCell(header, i, y, true));
y -= rowHeight;

// Filas de materias
materias_data.forEach(fila => {
  fila.forEach((item, i) => {
    let val = item;
    if (val === null || val === undefined || val === '') {
      val = '';
    } else if (!isNaN(val)) {
      const num = parseInt(val);
      if (num === 0) {
        val = '';
      } else {
        val = (num / 10).toFixed(1).replace('.', ',');
      }
    } else {
      val = String(val).toUpperCase(); // Dejar letras tal cual, como "AD" o "EX"
    }

    drawCell(val, i, y);
  });
  y -= rowHeight;
});

// Fila de promedio final
drawCell('PROMEDIO FINAL', 0, y, true);
for (let i = 1; i < 8; i++) drawCell('', i, y); // celdas vacías intermedias

let final = promedio_final === '0' ? '' : (parseInt(promedio_final) / 10).toFixed(1).replace('.', ',');
drawCell(final, 8, y, true);
y -= 30;


  // Observaciones
  drawText('Observaciones:', margin, y, 12, true);
  y -= 16;
  drawText(observaciones || 'Sin observaciones', margin, y, 10);
  y -= 40;

  drawText('Álvaro Guzmán Ibáñez', margin, y, 12, true);
  y -= 16;
  drawText('Director', margin, y, 12);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
