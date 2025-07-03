import { jsPDF } from 'jspdf';

// Convierte una imagen (url o base64) a base64 para jsPDF si quieres logo
async function getBase64ImageFromUrl(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateStudentReport({
  nombreAlumno,
  curso,
  año,
  semestre,
  materiasData,
  observaciones,
  promedioFinal,
  logoUrl // opcional: URL o base64 del logo
}) {
  const doc = new jsPDF();

  // Logo opcional
  if (logoUrl) {
    try {
      const imgData = await getBase64ImageFromUrl(logoUrl);
      doc.addImage(imgData, 'JPEG', 160, 10, 30, 30);
    } catch (e) {
      console.error('No se pudo cargar logo:', e);
    }
  }

  doc.setFontSize(12);
  doc.text('Liceo Agrícola San Sebastián', 20, 20);
  doc.text('Comuna de Perquenco', 20, 27);
  doc.text('Fono: 4524537002', 20, 34);

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`INFORME DE NOTAS ${semestre.toUpperCase()} SEMESTRE`, 105, 50, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`ALUMNO/A: ${nombreAlumno}`, 20, 60);
  doc.text(`PROFESORA JEFE: JOAN ESPINOZA TORRES`, 20, 68);
  doc.text(`CURSO: ${curso}`, 20, 76);
  doc.text(`AÑO: ${año}`, 100, 76);

  // Tabla de notas
  const startY = 90;
  const rowHeight = 8;
  const colWidths = [40, 20, 20, 20, 20, 20, 20, 20, 25];
  const headers = ['ASIGNATURAS', 'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'PROMEDIO'];

  doc.setFont(undefined, 'bold');
  headers.forEach((h, i) =>
    doc.text(h, colWidths.slice(0, i).reduce((a, b) => a + b, 20) + 2, startY)
  );

  doc.setFont(undefined, 'normal');
  materiasData.forEach((fila, rowIndex) => {
    fila.forEach((celda, colIndex) => {
      doc.text(
        String(celda),
        colWidths.slice(0, colIndex).reduce((a, b) => a + b, 20) + 2,
        startY + rowHeight * (rowIndex + 1)
      );
    });
  });

  // Promedio final
  doc.setFont(undefined, 'bold');
  const pfY = startY + rowHeight * (materiasData.length + 1);
  doc.text('PROMEDIO FINAL', 20 + 2, pfY);
  doc.text(
    String(promedioFinal),
    colWidths.slice(0, 8).reduce((a, b) => a + b, 20) + 2,
    pfY
  );

  // Observaciones
  doc.setFont(undefined, 'bold');
  const obsStart = pfY + 15;
  doc.text('Observaciones:', 20, obsStart);

  doc.setFont(undefined, 'normal');
  const splitObs = doc.splitTextToSize(observaciones || 'Sin observaciones', 170);
  doc.text(splitObs, 20, obsStart + 7);

  // Firma
  const bottomY = 280;
  doc.setFontSize(12);
  doc.text('Álvaro Guzmán Ibáñez', 105, bottomY, { align: 'center' });
  doc.text('Director', 105, bottomY + 6, { align: 'center' });

  return doc.output('blob');
}
