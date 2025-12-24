/**
 * Utilidades adicionales para el sistema de PDFs
 * Funciones helper para validación, debugging y operaciones comunes
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { FieldMapping, CheckboxMapping, TemplateMapping } from './pdf-generator';
import type { CoordinateValidationResult, CoordinateConfig } from '@/types/pdf';

/**
 * Valida que las coordenadas estén dentro del rango válido para un PDF A4
 */
export function validateCoordinates(
  x: number,
  y: number,
  pageWidth: number = 595,
  pageHeight: number = 842
): CoordinateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar X
  if (x < 0) {
    errors.push(`X negativa: ${x}. Debe ser >= 0`);
  } else if (x > pageWidth) {
    errors.push(`X fuera de rango: ${x}. Debe ser <= ${pageWidth}`);
  } else if (x < 20) {
    warnings.push(`X muy cerca del borde izquierdo: ${x}. Considere >= 20`);
  } else if (x > pageWidth - 20) {
    warnings.push(`X muy cerca del borde derecho: ${x}. Considere <= ${pageWidth - 20}`);
  }

  // Validar Y
  if (y < 0) {
    errors.push(`Y negativa: ${y}. Debe ser >= 0`);
  } else if (y > pageHeight) {
    errors.push(`Y fuera de rango: ${y}. Debe ser <= ${pageHeight}`);
  } else if (y < 20) {
    warnings.push(`Y muy cerca del borde inferior: ${y}. Considere >= 20`);
  } else if (y > pageHeight - 20) {
    warnings.push(`Y muy cerca del borde superior: ${y}. Considere <= ${pageHeight - 20}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Valida todos los campos de un mapeo de plantilla
 */
export function validateTemplateMapping(mapping: TemplateMapping): CoordinateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar campos de texto
  if (mapping.text) {
    mapping.text.forEach((field, index) => {
      const validation = validateCoordinates(field.x, field.y);
      validation.errors.forEach(error => {
        errors.push(`Campo de texto [${index}] "${field.field}": ${error}`);
      });
      validation.warnings.forEach(warning => {
        warnings.push(`Campo de texto [${index}] "${field.field}": ${warning}`);
      });
    });
  }

  // Validar checkboxes
  if (mapping.checkboxes) {
    Object.entries(mapping.checkboxes).forEach(([field, checkboxDef]) => {
      if ('x' in checkboxDef && 'y' in checkboxDef) {
        // Checkbox simple
        const validation = validateCoordinates(checkboxDef.x, checkboxDef.y);
        validation.errors.forEach(error => {
          errors.push(`Checkbox "${field}": ${error}`);
        });
        validation.warnings.forEach(warning => {
          warnings.push(`Checkbox "${field}": ${warning}`);
        });
      } else {
        // Checkbox con opciones
        Object.entries(checkboxDef).forEach(([option, coords]) => {
          if ('x' in coords && 'y' in coords) {
            const validation = validateCoordinates(coords.x, coords.y);
            validation.errors.forEach(error => {
              errors.push(`Checkbox "${field}" opción "${option}": ${error}`);
            });
            validation.warnings.forEach(warning => {
              warnings.push(`Checkbox "${field}" opción "${option}": ${warning}`);
            });
          }
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Convierte distancia desde arriba a coordenada Y del PDF
 */
export function fromTop(distanceFromTop: number, pageHeight: number = 842): number {
  return pageHeight - distanceFromTop;
}

/**
 * Convierte coordenada Y del PDF a distancia desde arriba
 */
export function toTop(y: number, pageHeight: number = 842): number {
  return pageHeight - y;
}

/**
 * Calcula el ancho de un texto con una fuente y tamaño específicos
 */
export async function getTextWidth(
  text: string,
  fontSize: number = 12,
  fontName: StandardFonts = StandardFonts.Helvetica
): Promise<number> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(fontName);
  return font.widthOfTextAtSize(text, fontSize);
}

/**
 * Calcula cuántas líneas ocupará un texto con word wrap
 */
export async function calculateTextLines(
  text: string,
  maxWidth: number,
  fontSize: number = 12,
  fontName: StandardFonts = StandardFonts.Helvetica
): Promise<{ lineCount: number; lines: string[] }> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(fontName);

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const textWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (textWidth > maxWidth && currentLine !== '') {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return {
    lineCount: lines.length,
    lines,
  };
}

/**
 * Genera un PDF de prueba con una cuadrícula de coordenadas
 * Útil para identificar las coordenadas exactas de los campos
 */
export async function generateCoordinateGrid(
  pageWidth: number = 595,
  pageHeight: number = 842,
  gridSpacing: number = 50
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 8;

  // Líneas verticales
  for (let x = 0; x <= pageWidth; x += gridSpacing) {
    page.drawLine({
      start: { x, y: 0 },
      end: { x, y: pageHeight },
      thickness: x % (gridSpacing * 2) === 0 ? 1 : 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });

    // Etiquetas X
    if (x % (gridSpacing * 2) === 0) {
      page.drawText(`${x}`, {
        x: x + 2,
        y: 5,
        size: fontSize,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
  }

  // Líneas horizontales
  for (let y = 0; y <= pageHeight; y += gridSpacing) {
    page.drawLine({
      start: { x: 0, y },
      end: { x: pageWidth, y },
      thickness: y % (gridSpacing * 2) === 0 ? 1 : 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });

    // Etiquetas Y
    if (y % (gridSpacing * 2) === 0) {
      page.drawText(`${y}`, {
        x: 5,
        y: y + 2,
        size: fontSize,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
  }

  // Título
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  page.drawText('Cuadrícula de Coordenadas PDF', {
    x: pageWidth / 2 - 100,
    y: pageHeight - 30,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // Leyenda
  page.drawText(`Tamaño: ${pageWidth} x ${pageHeight} pts`, {
    x: 50,
    y: pageHeight - 60,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });
  page.drawText(`Espaciado: ${gridSpacing} pts`, {
    x: 50,
    y: pageHeight - 75,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });
  page.drawText('Origen (0,0) = Esquina inferior izquierda', {
    x: 50,
    y: pageHeight - 90,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });

  // Marcar origen
  page.drawCircle({
    x: 0,
    y: 0,
    size: 10,
    color: rgb(1, 0, 0),
  });
  page.drawText('(0,0)', {
    x: 5,
    y: 5,
    size: 10,
    font: boldFont,
    color: rgb(1, 0, 0),
  });

  // Marcar esquinas
  const corners = [
    { x: pageWidth, y: 0, label: `(${pageWidth},0)` },
    { x: 0, y: pageHeight, label: `(0,${pageHeight})` },
    { x: pageWidth, y: pageHeight, label: `(${pageWidth},${pageHeight})` },
  ];

  for (const corner of corners) {
    page.drawCircle({
      x: corner.x,
      y: corner.y,
      size: 10,
      color: rgb(1, 0, 0),
    });
  }

  return pdfDoc.save();
}

/**
 * Genera un PDF de prueba mostrando todos los campos de un mapeo
 * Útil para visualizar dónde aparecerá cada campo
 */
export async function generateMappingPreview(
  mapping: TemplateMapping,
  pageWidth: number = 595,
  pageHeight: number = 842
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Título
  page.drawText('Vista Previa de Mapeo de Campos', {
    x: 50,
    y: pageHeight - 30,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // Dibujar campos de texto
  if (mapping.text) {
    mapping.text.forEach((field) => {
      const targetPage = field.page === undefined ? page : pdfDoc.getPages()[field.page];
      if (!targetPage) return;

      // Marcar posición con un punto
      targetPage.drawCircle({
        x: field.x,
        y: field.y,
        size: 3,
        color: rgb(0, 0, 1),
      });

      // Mostrar nombre del campo
      targetPage.drawText(`[${field.field}]`, {
        x: field.x,
        y: field.y,
        size: field.fontSize || 12,
        font,
        color: rgb(0, 0, 1),
      });

      // Mostrar coordenadas
      targetPage.drawText(`(${field.x},${field.y})`, {
        x: field.x,
        y: field.y - 12,
        size: 8,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    });
  }

  // Dibujar checkboxes
  if (mapping.checkboxes) {
    Object.entries(mapping.checkboxes).forEach(([field, checkboxDef]) => {
      if ('x' in checkboxDef && 'y' in checkboxDef) {
        // Checkbox simple
        const targetPage = checkboxDef.page === undefined ? page : pdfDoc.getPages()[checkboxDef.page];
        if (!targetPage) return;

        targetPage.drawRectangle({
          x: checkboxDef.x - 2,
          y: checkboxDef.y - 2,
          width: 12,
          height: 12,
          borderColor: rgb(1, 0, 0),
          borderWidth: 1,
        });
        targetPage.drawText(`[${field}]`, {
          x: checkboxDef.x + 15,
          y: checkboxDef.y,
          size: 8,
          font,
          color: rgb(1, 0, 0),
        });
      } else {
        // Checkbox con opciones
        Object.entries(checkboxDef).forEach(([option, coords]) => {
          if ('x' in coords && 'y' in coords) {
            const targetPage = coords.page === undefined ? page : pdfDoc.getPages()[coords.page];
            if (!targetPage) return;

            targetPage.drawRectangle({
              x: coords.x - 2,
              y: coords.y - 2,
              width: 12,
              height: 12,
              borderColor: rgb(1, 0, 0),
              borderWidth: 1,
            });
            targetPage.drawText(`[${field}:${option}]`, {
              x: coords.x + 15,
              y: coords.y,
              size: 8,
              font,
              color: rgb(1, 0, 0),
            });
          }
        });
      }
    });
  }

  return pdfDoc.save();
}

/**
 * Formatea un RUT chileno
 */
export function formatRut(rut: string): string {
  // Eliminar puntos y guiones existentes
  const cleaned = rut.replace(/[.-]/g, '');

  // Separar número y dígito verificador
  const dv = cleaned.slice(-1);
  const number = cleaned.slice(0, -1);

  // Formatear con puntos
  const formatted = number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${formatted}-${dv}`;
}

/**
 * Valida formato de RUT chileno
 */
export function validateRut(rut: string): boolean {
  const cleaned = rut.replace(/[.-]/g, '');
  if (cleaned.length < 2) return false;

  const dv = cleaned.slice(-1).toLowerCase();
  const number = parseInt(cleaned.slice(0, -1), 10);

  if (isNaN(number)) return false;

  let sum = 0;
  let multiplier = 2;

  for (let i = number.toString().length - 1; i >= 0; i--) {
    sum += parseInt(number.toString()[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const calculatedDv = 11 - (sum % 11);
  const expectedDv = calculatedDv === 11 ? '0' : calculatedDv === 10 ? 'k' : calculatedDv.toString();

  return dv === expectedDv;
}

/**
 * Formatea una fecha en formato chileno (DD/MM/YYYY)
 */
export function formatDateCL(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formatea un teléfono chileno
 */
export function formatPhoneCL(phone: string): string {
  // Eliminar espacios, guiones y paréntesis
  const cleaned = phone.replace(/[\s()-]/g, '');

  // Si comienza con +56, formatear como +56 9 1234 5678
  if (cleaned.startsWith('+56') || cleaned.startsWith('56')) {
    const number = cleaned.replace(/^\+?56/, '');
    if (number.length === 9) {
      return `+56 ${number[0]} ${number.slice(1, 5)} ${number.slice(5)}`;
    }
  }

  // Si es un número de 9 dígitos, asumir que es celular
  if (cleaned.length === 9 && cleaned.startsWith('9')) {
    return `+56 ${cleaned[0]} ${cleaned.slice(1, 5)} ${cleaned.slice(5)}`;
  }

  return phone;
}
