import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Types para el generador de PDFs
 */
export interface FieldMapping {
  field: string;      // nombre del campo: 'nombre', 'rut', 'diagnostico'
  x: number;          // coordenada X
  y: number;          // coordenada Y
  fontSize?: number;  // default 12
  maxWidth?: number;  // para wrap de texto largo
}

export interface PatientData {
  nombreCompleto: string;
  rut: string;
  fechaNac?: string;
  prevision: string;
  antecedentes?: string;
}

export interface AttentionData {
  fecha: string;
  diagnostico: string;
  tratamiento?: string;
  indicaciones?: string;
  clinicaNombre: string;
}

/**
 * Carga un PDF template desde public/plantillas/
 * @param templatePath - Ruta relativa al template (ej: 'receta.pdf')
 * @returns PDFDocument cargado
 */
export async function loadPdfTemplate(templatePath: string): Promise<PDFDocument> {
  try {
    // Construir ruta completa al template
    const fullPath = path.join(process.cwd(), 'public', 'plantillas', templatePath);

    // Verificar que el archivo existe
    await fs.access(fullPath);

    // Leer el archivo
    const templateBytes = await fs.readFile(fullPath);

    // Cargar el PDF
    const pdfDoc = await PDFDocument.load(templateBytes);

    return pdfDoc;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error cargando template PDF: ${error.message}`);
    }
    throw new Error('Error desconocido cargando template PDF');
  }
}

/**
 * Inyecta texto en coordenadas X,Y especificas del PDF
 * @param pdf - Documento PDF donde inyectar
 * @param mappings - Array de mapeos de campos a coordenadas
 * @param data - Datos a inyectar en formato key-value
 * @returns PDFDocument modificado
 */
export async function injectText(
  pdf: PDFDocument,
  mappings: FieldMapping[],
  data: Record<string, string>
): Promise<PDFDocument> {
  try {
    // Obtener la primera página (se puede extender para múltiples páginas)
    const pages = pdf.getPages();
    if (pages.length === 0) {
      throw new Error('El PDF no tiene páginas');
    }

    const firstPage = pages[0];
    const { height } = firstPage.getSize();

    // Cargar fuente estándar
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    // Procesar cada mapping
    for (const mapping of mappings) {
      const value = data[mapping.field];

      // Skip si no hay valor para este campo
      if (!value || value.trim() === '') {
        continue;
      }

      const fontSize = mapping.fontSize || 12;
      const maxWidth = mapping.maxWidth;

      // Convertir coordenada Y (PDF usa origen inferior izquierdo)
      // Si Y viene del "top", convertir: Y_pdf = height - Y_input
      const yPosition = mapping.y;

      if (maxWidth && maxWidth > 0) {
        // Texto con word wrap
        const words = value.split(' ');
        let line = '';
        let yOffset = 0;

        for (const word of words) {
          const testLine = line + (line ? ' ' : '') + word;
          const textWidth = font.widthOfTextAtSize(testLine, fontSize);

          if (textWidth > maxWidth && line !== '') {
            // Dibujar línea actual
            firstPage.drawText(line, {
              x: mapping.x,
              y: yPosition - yOffset,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0),
            });

            line = word;
            yOffset += fontSize + 2; // Espaciado entre líneas
          } else {
            line = testLine;
          }
        }

        // Dibujar última línea
        if (line) {
          firstPage.drawText(line, {
            x: mapping.x,
            y: yPosition - yOffset,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
        }
      } else {
        // Texto simple sin wrap
        firstPage.drawText(value, {
          x: mapping.x,
          y: yPosition,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
      }
    }

    return pdf;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error inyectando texto en PDF: ${error.message}`);
    }
    throw new Error('Error desconocido inyectando texto en PDF');
  }
}

/**
 * Genera un documento PDF completo
 * @param templatePath - Ruta al template PDF
 * @param mappings - Mapeos de campos
 * @param patientData - Datos del paciente
 * @param attentionData - Datos de la atención
 * @returns PDF como Uint8Array
 */
export async function generateDocument(
  templatePath: string,
  mappings: FieldMapping[],
  patientData: PatientData,
  attentionData: AttentionData
): Promise<Uint8Array> {
  try {
    // Cargar template
    const pdfDoc = await loadPdfTemplate(templatePath);

    // Preparar datos combinados
    const combinedData: Record<string, string> = {
      // Datos del paciente
      nombreCompleto: patientData.nombreCompleto,
      rut: patientData.rut,
      fechaNac: patientData.fechaNac || '',
      prevision: patientData.prevision,
      antecedentes: patientData.antecedentes || '',

      // Datos de la atención
      fecha: attentionData.fecha,
      diagnostico: attentionData.diagnostico,
      tratamiento: attentionData.tratamiento || '',
      indicaciones: attentionData.indicaciones || '',
      clinicaNombre: attentionData.clinicaNombre,
    };

    // Inyectar texto
    await injectText(pdfDoc, mappings, combinedData);

    // Serializar a bytes
    const pdfBytes = await pdfDoc.save();

    return pdfBytes;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error generando documento PDF: ${error.message}`);
    }
    throw new Error('Error desconocido generando documento PDF');
  }
}

/**
 * Crea un PDF de ejemplo simple para testing (sin template)
 * Util para validar que pdf-lib funciona correctamente
 * @returns PDF de ejemplo como Uint8Array
 */
export async function createSamplePdf(): Promise<Uint8Array> {
  try {
    // Crear documento nuevo
    const pdfDoc = await PDFDocument.create();

    // Agregar página
    const page = pdfDoc.addPage([595, 842]); // Tamaño A4
    const { width, height } = page.getSize();

    // Cargar fuentes
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Título
    page.drawText('PDF de Ejemplo - NeoroData', {
      x: 50,
      y: height - 50,
      size: 20,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    // Línea separadora
    page.drawLine({
      start: { x: 50, y: height - 70 },
      end: { x: width - 50, y: height - 70 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    // Información de prueba
    const testData = [
      { label: 'Paciente:', value: 'Juan Pérez González' },
      { label: 'RUT:', value: '12.345.678-9' },
      { label: 'Fecha:', value: new Date().toLocaleDateString('es-CL') },
      { label: 'Previsión:', value: 'FONASA' },
      { label: 'Diagnóstico:', value: 'Examen de rutina' },
    ];

    let yPosition = height - 110;

    for (const item of testData) {
      // Label en negrita
      page.drawText(item.label, {
        x: 50,
        y: yPosition,
        size: 12,
        font: fontBold,
        color: rgb(0, 0, 0),
      });

      // Valor en regular
      page.drawText(item.value, {
        x: 150,
        y: yPosition,
        size: 12,
        font: fontRegular,
        color: rgb(0, 0, 0),
      });

      yPosition -= 25;
    }

    // Texto de ejemplo con wrap
    yPosition -= 20;
    page.drawText('Indicaciones:', {
      x: 50,
      y: yPosition,
      size: 12,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20;
    const sampleText = 'Este es un PDF de ejemplo generado con pdf-lib. ' +
      'El motor de generación de PDFs está funcionando correctamente. ' +
      'Se pueden inyectar textos en posiciones específicas y crear documentos desde templates.';

    // Word wrap manual simple
    const maxWidth = width - 100;
    const words = sampleText.split(' ');
    let line = '';

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const textWidth = fontRegular.widthOfTextAtSize(testLine, 10);

      if (textWidth > maxWidth && line !== '') {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 10,
          font: fontRegular,
          color: rgb(0, 0, 0),
        });

        line = word;
        yPosition -= 15;
      } else {
        line = testLine;
      }
    }

    // Última línea
    if (line) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 10,
        font: fontRegular,
        color: rgb(0, 0, 0),
      });
    }

    // Footer
    page.drawText('Generado por NeoroData PDF Engine', {
      x: 50,
      y: 30,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Serializar
    const pdfBytes = await pdfDoc.save();

    return pdfBytes;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error creando PDF de ejemplo: ${error.message}`);
    }
    throw new Error('Error desconocido creando PDF de ejemplo');
  }
}

/**
 * Utilidad: Guarda un PDF en disco (útil para desarrollo/testing)
 * @param pdfBytes - Bytes del PDF
 * @param outputPath - Ruta donde guardar el archivo
 */
export async function savePdfToFile(pdfBytes: Uint8Array, outputPath: string): Promise<void> {
  try {
    await fs.writeFile(outputPath, pdfBytes);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error guardando PDF: ${error.message}`);
    }
    throw new Error('Error desconocido guardando PDF');
  }
}

/**
 * Utilidad: Convierte un PDF a base64 (útil para enviar por API)
 * @param pdfBytes - Bytes del PDF
 * @returns String base64
 */
export function pdfToBase64(pdfBytes: Uint8Array): string {
  return Buffer.from(pdfBytes).toString('base64');
}

/**
 * Utilidad: Obtiene información básica de un PDF
 * @param pdfBytes - Bytes del PDF
 * @returns Información del PDF
 */
export async function getPdfInfo(pdfBytes: Uint8Array): Promise<{
  pageCount: number;
  title?: string;
  author?: string;
  creator?: string;
}> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pageCount = pdfDoc.getPageCount();
    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    const creator = pdfDoc.getCreator();

    return {
      pageCount,
      title,
      author,
      creator,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error obteniendo información del PDF: ${error.message}`);
    }
    throw new Error('Error desconocido obteniendo información del PDF');
  }
}
