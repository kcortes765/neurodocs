import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Carga el logo de la aplicación para incrustar en PDFs
 */
async function loadLogo(): Promise<Uint8Array | null> {
  const logoPath = path.join(process.cwd(), 'public', 'logo.jpg');
  try {
    const logoBytes = await fs.readFile(logoPath);
    return logoBytes;
  } catch {
    console.warn('Logo no encontrado en:', logoPath);
    return null;
  }
}

/**
 * Types para el generador de PDFs
 */
export interface FieldMapping {
  field: string;      // nombre del campo: 'nombre', 'rut', 'diagnostico'
  x: number;          // coordenada X
  y: number;          // coordenada Y
  fontSize?: number;  // default 12
  maxWidth?: number;  // para wrap de texto largo
  page?: number;      // número de página (0-indexed), default 0
}

export interface CheckboxCoordinate {
  x: number;
  y: number;
  page?: number;
}

export interface CheckboxMapping {
  [field: string]: CheckboxCoordinate | Record<string, CheckboxCoordinate>;
}

export interface TemplateMapping {
  text?: FieldMapping[];
  checkboxes?: CheckboxMapping;
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
    const candidates: string[] = [];
    const primaryPath = path.join(process.cwd(), 'public', 'plantillas', templatePath);
    candidates.push(primaryPath);

    if (process.env.TEMPLATES_DIR) {
      candidates.push(path.join(process.env.TEMPLATES_DIR, templatePath));
    }

    const fallbackPath = path.resolve(process.cwd(), '..', 'plantillas', templatePath);
    candidates.push(fallbackPath);

    let fullPath: string | null = null;

    for (const candidate of candidates) {
      try {
        await fs.access(candidate);
        fullPath = candidate;
        break;
      } catch {
        // seguir buscando
      }
    }

    if (!fullPath) {
      throw new Error(`Template no encontrado. Rutas: ${candidates.join(', ')}`);
    }

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
    // Obtener todas las páginas
    const pages = pdf.getPages();
    if (pages.length === 0) {
      throw new Error('El PDF no tiene páginas');
    }

    // Cargar fuente estándar
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    // Procesar cada mapping
    for (const mapping of mappings) {
      const value = data[mapping.field];

      // Skip si no hay valor para este campo
      if (!value || value.trim() === '') {
        continue;
      }

      const fontSize = mapping.fontSize || 12;
      const maxWidth = mapping.maxWidth;
      const pageIndex = mapping.page || 0;

      // Validar que la página existe
      if (pageIndex >= pages.length) {
        console.warn(`Página ${pageIndex} no existe para campo ${mapping.field}. PDF tiene ${pages.length} páginas.`);
        continue;
      }

      const targetPage = pages[pageIndex];

      // Convertir coordenada Y (PDF usa origen inferior izquierdo)
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
            targetPage.drawText(line, {
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
          targetPage.drawText(line, {
            x: mapping.x,
            y: yPosition - yOffset,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
        }
      } else {
        // Texto simple sin wrap
        targetPage.drawText(value, {
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
 * Inyecta checkboxes en coordenadas X,Y
 * @param pdf - Documento PDF donde inyectar
 * @param mappings - Mapeo de campos a coordenadas
 * @param data - Datos booleanos o valores seleccionados
 * @returns PDFDocument modificado
 */
export async function injectCheckboxes(
  pdf: PDFDocument,
  mappings: CheckboxMapping,
  data: Record<string, string | boolean>
): Promise<PDFDocument> {
  try {
    const pages = pdf.getPages();
    if (pages.length === 0) {
      throw new Error('El PDF no tiene paginas');
    }

    const font = await pdf.embedFont(StandardFonts.HelveticaBold);

    const normalizeKey = (value: string) => value.trim().toLowerCase();

    // Helper function to check if mapping is a direct coordinate
    const isDirectCoordinate = (m: unknown): m is CheckboxCoordinate => {
      return typeof m === 'object' && m !== null && 'x' in m && 'y' in m &&
             typeof (m as CheckboxCoordinate).x === 'number' &&
             typeof (m as CheckboxCoordinate).y === 'number';
    };

    for (const [field, mapping] of Object.entries(mappings)) {
      const value = data[field];
      if (value === undefined || value === null || value === '') {
        continue;
      }

      // Check if this is a direct coordinate (single checkbox)
      if (isDirectCoordinate(mapping)) {
        if (value === true || value === 'true' || value === 'si') {
          const pageIndex = mapping.page || 0;
          if (pageIndex >= pages.length) {
            console.warn(`Página ${pageIndex} no existe para checkbox ${field}.`);
            continue;
          }
          const targetPage = pages[pageIndex];
          targetPage.drawText('X', {
            x: mapping.x,
            y: mapping.y,
            size: 12,
            font,
            color: rgb(0, 0, 0),
          });
        }
        continue;
      }

      // Otherwise it's a record of options
      const options = mapping as Record<string, CheckboxCoordinate>;
      let key: string | undefined;

      if (typeof value === 'boolean') {
        key = value ? 'si' : 'no';
        if (!options[key]) {
          key = value ? 'true' : 'false';
        }
      } else {
        const normalized = normalizeKey(String(value));
        key = Object.keys(options).find(
          (option) => normalizeKey(option) === normalized
        );
      }

      if (!key || !options[key]) {
        continue;
      }

      const { x, y, page: pageIndex = 0 } = options[key];
      if (pageIndex >= pages.length) {
        console.warn(`Página ${pageIndex} no existe para checkbox ${field}:${key}.`);
        continue;
      }
      const targetPage = pages[pageIndex];
      targetPage.drawText('X', {
        x,
        y,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
    }

    return pdf;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error inyectando checkboxes en PDF: ${error.message}`);
    }
    throw new Error('Error desconocido inyectando checkboxes en PDF');
  }
}

/**
 * Genera un documento PDF usando un mapeo combinado
 */
export async function generateDocumentFromMapping(
  templatePath: string,
  mapping: TemplateMapping,
  textData: Record<string, string>,
  checkboxData: Record<string, string | boolean> = {}
): Promise<Uint8Array> {
  const pdfDoc = await loadPdfTemplate(templatePath);
  if (mapping.text && mapping.text.length > 0) {
    await injectText(pdfDoc, mapping.text, textData);
  }
  if (mapping.checkboxes && Object.keys(mapping.checkboxes).length > 0) {
    await injectCheckboxes(pdfDoc, mapping.checkboxes, checkboxData);
  }
  return pdfDoc.save();
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
    page.drawText('PDF de Ejemplo - NeuroMedic', {
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
    page.drawText('Generado por NeuroMedic', {
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
 * Genera un PDF genérico con todos los datos del paciente/evento
 * Se usa cuando no hay plantilla específica o siempre para mostrar los datos
 */
export async function createGenericDocument(
  tipo: string,
  data: Record<string, string>
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let y = height - 50;

    // Logo en la parte superior
    const logoBytes = await loadLogo();
    if (logoBytes) {
      try {
        const logoImage = await pdfDoc.embedJpg(logoBytes);
        const logoWidth = 150;
        const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
        page.drawImage(logoImage, {
          x: (width - logoWidth) / 2,
          y: height - logoHeight - 30,
          width: logoWidth,
          height: logoHeight,
        });
        y = height - logoHeight - 50;
      } catch {
        console.warn('Error incrustando logo en PDF');
      }
    }

    // Encabezado
    page.drawText('DOCUMENTO MÉDICO', {
      x: 50, y, size: 18, font: fontBold, color: rgb(0, 0, 0),
    });
    y -= 25;

    page.drawText(`Tipo: ${tipo}`, {
      x: 50, y, size: 14, font: fontBold, color: rgb(0.3, 0.3, 0.3),
    });
    y -= 15;

    page.drawLine({
      start: { x: 50, y }, end: { x: width - 50, y },
      thickness: 2, color: rgb(0.2, 0.4, 0.8),
    });
    y -= 30;

    // Sección Paciente
    page.drawText('DATOS DEL PACIENTE', {
      x: 50, y, size: 12, font: fontBold, color: rgb(0.2, 0.4, 0.8),
    });
    y -= 20;

    const pacienteFields = [
      ['Nombre', data.nombreCompleto || ''],
      ['RUT', data.rut || ''],
      ['Fecha Nacimiento', data.fechaNac || ''],
      ['Previsión', data.prevision || data.isapre || ''],
    ];

    for (const [label, value] of pacienteFields) {
      if (value) {
        page.drawText(`${label}:`, { x: 50, y, size: 11, font: fontBold, color: rgb(0, 0, 0) });
        page.drawText(value, { x: 170, y, size: 11, font: fontRegular, color: rgb(0, 0, 0) });
        y -= 18;
      }
    }

    y -= 15;
    page.drawLine({
      start: { x: 50, y }, end: { x: width - 50, y },
      thickness: 1, color: rgb(0.8, 0.8, 0.8),
    });
    y -= 20;

    // Sección Clínica
    if (data.clinica || data.direccionClinica) {
      page.drawText('ESTABLECIMIENTO', {
        x: 50, y, size: 12, font: fontBold, color: rgb(0.2, 0.4, 0.8),
      });
      y -= 20;

      if (data.clinica) {
        page.drawText('Clínica:', { x: 50, y, size: 11, font: fontBold, color: rgb(0, 0, 0) });
        page.drawText(data.clinica, { x: 170, y, size: 11, font: fontRegular, color: rgb(0, 0, 0) });
        y -= 18;
      }
      if (data.direccionClinica) {
        page.drawText('Dirección:', { x: 50, y, size: 11, font: fontBold, color: rgb(0, 0, 0) });
        page.drawText(data.direccionClinica, { x: 170, y, size: 11, font: fontRegular, color: rgb(0, 0, 0) });
        y -= 18;
      }

      y -= 15;
      page.drawLine({
        start: { x: 50, y }, end: { x: width - 50, y },
        thickness: 1, color: rgb(0.8, 0.8, 0.8),
      });
      y -= 20;
    }

    // Sección Diagnóstico/Procedimiento
    page.drawText('INFORMACIÓN MÉDICA', {
      x: 50, y, size: 12, font: fontBold, color: rgb(0.2, 0.4, 0.8),
    });
    y -= 20;

    const medicoFields = [
      ['Diagnóstico', data.diagnostico || ''],
      ['Código CIE-10', data.codigoCie10 || ''],
      ['Procedimiento', data.procedimiento || ''],
      ['Código FONASA', data.codigoFonasa || ''],
      ['Lateralidad', data.lateralidad || ''],
      ['Fecha Cirugía', data.fechaCirugia || ''],
      ['Tratamiento', data.tratamiento || ''],
    ];

    for (const [label, value] of medicoFields) {
      if (value) {
        page.drawText(`${label}:`, { x: 50, y, size: 11, font: fontBold, color: rgb(0, 0, 0) });
        // Wrap largo texto
        if (value.length > 60) {
          const lines = wrapText(value, fontRegular, 11, width - 220);
          for (const line of lines) {
            page.drawText(line, { x: 170, y, size: 11, font: fontRegular, color: rgb(0, 0, 0) });
            y -= 15;
          }
        } else {
          page.drawText(value, { x: 170, y, size: 11, font: fontRegular, color: rgb(0, 0, 0) });
          y -= 18;
        }
      }
    }

    // Equipo médico (si hay)
    if (data.cirujano || data.anestesista) {
      y -= 15;
      page.drawLine({
        start: { x: 50, y }, end: { x: width - 50, y },
        thickness: 1, color: rgb(0.8, 0.8, 0.8),
      });
      y -= 20;

      page.drawText('EQUIPO MÉDICO', {
        x: 50, y, size: 12, font: fontBold, color: rgb(0.2, 0.4, 0.8),
      });
      y -= 20;

      const equipoFields = [
        ['Cirujano', data.cirujano || ''],
        ['RUT Cirujano', data.rutCirujano || ''],
        ['Anestesista', data.anestesista || ''],
        ['Arsenalera', data.arsenalera || ''],
        ['Ayudante 1', data.ayudante1 || ''],
        ['Ayudante 2', data.ayudante2 || ''],
      ];

      for (const [label, value] of equipoFields) {
        if (value) {
          page.drawText(`${label}:`, { x: 50, y, size: 11, font: fontBold, color: rgb(0, 0, 0) });
          page.drawText(value, { x: 170, y, size: 11, font: fontRegular, color: rgb(0, 0, 0) });
          y -= 18;
        }
      }
    }

    // Opciones clínicas
    const opciones = [];
    if (data.alergiaLatex === 'Si') opciones.push('Alergia Látex');
    if (data.requiereBiopsia === 'Si') opciones.push('Requiere Biopsia');
    if (data.requiereRayos === 'Si') opciones.push('Requiere Rayos X');

    if (opciones.length > 0) {
      y -= 10;
      page.drawText('Alertas:', { x: 50, y, size: 11, font: fontBold, color: rgb(0.8, 0, 0) });
      page.drawText(opciones.join(' | '), { x: 130, y, size: 11, font: fontRegular, color: rgb(0.8, 0, 0) });
      y -= 18;
    }

    // Riesgos (si consentimiento)
    if (data.riesgos) {
      y -= 15;
      page.drawLine({
        start: { x: 50, y }, end: { x: width - 50, y },
        thickness: 1, color: rgb(0.8, 0.8, 0.8),
      });
      y -= 20;

      page.drawText('RIESGOS Y COMPLICACIONES', {
        x: 50, y, size: 12, font: fontBold, color: rgb(0.2, 0.4, 0.8),
      });
      y -= 20;

      const riesgosLines = wrapText(data.riesgos, fontRegular, 10, width - 100);
      for (const line of riesgosLines) {
        page.drawText(line, { x: 50, y, size: 10, font: fontRegular, color: rgb(0, 0, 0) });
        y -= 14;
      }
    }

    // Footer
    page.drawText(`Generado: ${data.fechaActual || new Date().toLocaleDateString('es-CL')}`, {
      x: 50, y: 40, size: 9, font: fontRegular, color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText('NeuroMedic - Neurocirujanos', {
      x: 50, y: 25, size: 9, font: fontRegular, color: rgb(0.5, 0.5, 0.5),
    });

    return pdfDoc.save();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error creando documento genérico: ${error.message}`);
    }
    throw new Error('Error desconocido creando documento genérico');
  }
}

// Helper para wrap de texto
function wrapText(text: string, font: import('pdf-lib').PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const textWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (textWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
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
