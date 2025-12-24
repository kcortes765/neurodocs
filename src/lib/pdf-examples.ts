/**
 * Ejemplos de uso del sistema de generación de PDFs
 * Este archivo contiene ejemplos prácticos de cómo usar el generador de PDFs
 * con las plantillas mapeadas.
 */

import {
  generateDocumentFromMapping,
  savePdfToFile,
} from './pdf-generator';
import {
  SOLICITUD_PABELLON_BUPA,
  CONSENTIMIENTO_GENERAL_BUPA,
  UnifiedPatientData,
  toSolicitudPabellonData,
  toConsentimientoGeneralData,
  getTemplateMapping,
} from './pdf-field-maps';

// =============================================================================
// EJEMPLO 1: Generar Solicitud de Pabellón
// =============================================================================

export async function generarSolicitudPabellon(): Promise<Uint8Array> {
  // Datos del paciente unificados
  const patientData: UnifiedPatientData = {
    nombreCompleto: 'Juan Carlos Pérez González',
    rut: '12.345.678-9',
    fechaNacimiento: '15/03/1985',
    telefono: '+56 9 8765 4321',
    diagnostico: 'Hernia inguinal derecha no complicada',
    cirugiaPropuesta: 'Hernioplastia inguinal laparoscópica',
    codigoCirugia: 'CIR-2024-001',
    duracionEstimada: '90 minutos',
    fechaSolicitada: '25/12/2025',
    horario: '08:00',
    puntajeETE: '85',
    cirujano: 'Dr. Roberto Silva Muñoz',
    ayudante: 'Dr. María González Torres',
    anestesista: 'Dr. Carlos Fernández Rojas',
    arsenalera: 'Enf. Patricia López Vera',
    prevision: 'FONASA',
    convenio: 'PAD',
    lateralidad: 'derecha',
    alergiasLatex: 'no',
    biopsia: 'no',
    rayosX: 'no',
  };

  // Convertir a formato de solicitud de pabellón
  const { text, checkboxes } = toSolicitudPabellonData(patientData);

  // Generar PDF
  const pdfBytes = await generateDocumentFromMapping(
    'solicitud_de_pabellon__2_.pdf',
    SOLICITUD_PABELLON_BUPA,
    text,
    checkboxes
  );

  return pdfBytes;
}

// =============================================================================
// EJEMPLO 2: Generar Consentimiento General
// =============================================================================

export async function generarConsentimientoGeneral(): Promise<Uint8Array> {
  const patientData: UnifiedPatientData = {
    nombre: 'Juan Carlos',
    apellidos: 'Pérez González',
    rut: '12.345.678-9',
    edad: 39,
    fechaNacimiento: '15/03/1985',
    diagnostico: 'Hernia inguinal derecha no complicada',
    procedimiento: 'Hernioplastia inguinal laparoscópica',
    medicoResponsable: 'Dr. Roberto Silva Muñoz',
    medicoResponsableRut: '9.876.543-2',
    fecha: '25/12/2025',
  };

  const { text, checkboxes } = toConsentimientoGeneralData(patientData);

  const pdfBytes = await generateDocumentFromMapping(
    'cba_consentimiento_general.pdf',
    CONSENTIMIENTO_GENERAL_BUPA,
    text,
    checkboxes
  );

  return pdfBytes;
}

// =============================================================================
// EJEMPLO 3: Uso Dinámico con Selección de Plantilla
// =============================================================================

export async function generarDocumentoDinamico(
  templateName: string,
  patientData: UnifiedPatientData
): Promise<Uint8Array> {
  // Obtener mapeo de la plantilla
  const mapping = getTemplateMapping(templateName);
  if (!mapping) {
    throw new Error(`Plantilla no encontrada: ${templateName}`);
  }

  // Convertir datos según la plantilla
  let text: Record<string, string>;
  let checkboxes: Record<string, string | boolean>;

  if (templateName.includes('pabellon')) {
    const data = toSolicitudPabellonData(patientData);
    text = data.text;
    checkboxes = data.checkboxes;
  } else if (templateName.includes('consentimiento')) {
    const data = toConsentimientoGeneralData(patientData);
    text = data.text;
    checkboxes = data.checkboxes;
  } else {
    throw new Error(`Tipo de plantilla no soportado: ${templateName}`);
  }

  // Generar PDF
  return generateDocumentFromMapping(templateName, mapping, text, checkboxes);
}

// =============================================================================
// EJEMPLO 4: Guardar PDF en Disco (para testing/desarrollo)
// =============================================================================

export async function generarYGuardarSolicitud(outputPath: string): Promise<void> {
  const pdfBytes = await generarSolicitudPabellon();
  await savePdfToFile(pdfBytes, outputPath);
  console.log(`PDF guardado en: ${outputPath}`);
}

export async function generarYGuardarConsentimiento(outputPath: string): Promise<void> {
  const pdfBytes = await generarConsentimientoGeneral();
  await savePdfToFile(pdfBytes, outputPath);
  console.log(`PDF guardado en: ${outputPath}`);
}

// =============================================================================
// EJEMPLO 5: Integración con API/Endpoint
// =============================================================================

/**
 * Ejemplo de cómo integrar en un endpoint de API
 * Este sería el código dentro de un handler de Next.js o Express
 */
export async function handleGeneratePdf(
  templateType: 'pabellon' | 'consentimiento',
  patientData: UnifiedPatientData
): Promise<{ success: boolean; pdfBase64?: string; error?: string }> {
  try {
    let pdfBytes: Uint8Array;

    if (templateType === 'pabellon') {
      const { text, checkboxes } = toSolicitudPabellonData(patientData);
      pdfBytes = await generateDocumentFromMapping(
        'solicitud_de_pabellon__2_.pdf',
        SOLICITUD_PABELLON_BUPA,
        text,
        checkboxes
      );
    } else if (templateType === 'consentimiento') {
      const { text, checkboxes } = toConsentimientoGeneralData(patientData);
      pdfBytes = await generateDocumentFromMapping(
        'cba_consentimiento_general.pdf',
        CONSENTIMIENTO_GENERAL_BUPA,
        text,
        checkboxes
      );
    } else {
      return {
        success: false,
        error: 'Tipo de plantilla no válido',
      };
    }

    // Convertir a base64 para enviar por API
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    return {
      success: true,
      pdfBase64,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// =============================================================================
// EJEMPLO 6: Testing/Validación de Coordenadas
// =============================================================================

/**
 * Genera un PDF de prueba para validar las coordenadas de los campos
 * Útil para ajustar las posiciones antes de usar en producción
 */
export async function generarPdfPrueba(): Promise<Uint8Array> {
  const testData: UnifiedPatientData = {
    nombreCompleto: 'NOMBRE COMPLETO DE PRUEBA',
    rut: '11.111.111-1',
    fechaNacimiento: '01/01/2000',
    telefono: '+56912345678',
    diagnostico: 'DIAGNOSTICO DE PRUEBA MUY LARGO PARA VALIDAR WORD WRAP Y MAXWIDTH',
    cirugiaPropuesta: 'CIRUGIA DE PRUEBA',
    codigoCirugia: 'TEST-001',
    duracionEstimada: '120 min',
    fechaSolicitada: '31/12/2025',
    horario: '10:00',
    puntajeETE: '100',
    cirujano: 'Dr. Test Cirujano',
    ayudante: 'Dr. Test Ayudante',
    anestesista: 'Dr. Test Anestesista',
    arsenalera: 'Enf. Test Arsenalera',
    prevision: 'TEST',
    convenio: 'PAD',
    lateralidad: 'bilateral',
    alergiasLatex: 'si',
    biopsia: 'rapida',
    rayosX: 'si',
  };

  const { text, checkboxes } = toSolicitudPabellonData(testData);

  return generateDocumentFromMapping(
    'solicitud_de_pabellon__2_.pdf',
    SOLICITUD_PABELLON_BUPA,
    text,
    checkboxes
  );
}
