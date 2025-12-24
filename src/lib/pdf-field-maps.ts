/**
 * Mapeos de coordenadas para plantillas PDF
 *
 * IMPORTANTE:
 * - PDF usa sistema de coordenadas con origen en esquina INFERIOR IZQUIERDA
 * - Tamaño A4: 595x842 puntos (ancho x alto)
 * - X aumenta hacia la derecha (0 = izquierda, 595 = derecha)
 * - Y aumenta hacia arriba (0 = abajo, 842 = arriba)
 *
 * Para convertir desde "distancia desde arriba":
 * Y_pdf = 842 - distancia_desde_arriba
 */

import { TemplateMapping, FieldMapping, CheckboxMapping } from './pdf-generator';

// =============================================================================
// SOLICITUD DE PABELLON - CLINICA BUPA ANTOFAGASTA
// =============================================================================

/**
 * Plantilla: solicitud_de_pabellon__2_.pdf
 * Clínica Bupa Antofagasta
 */
export const SOLICITUD_PABELLON_BUPA: TemplateMapping = {
  text: [
    // --- DATOS DEL PACIENTE ---
    {
      field: 'nombrePaciente',
      x: 120,
      y: 760, // ~80px desde arriba
      fontSize: 10,
      maxWidth: 250,
    },
    {
      field: 'rutPaciente',
      x: 400,
      y: 760,
      fontSize: 10,
    },
    {
      field: 'fechaNacimiento',
      x: 120,
      y: 740, // ~100px desde arriba
      fontSize: 10,
    },
    {
      field: 'telefonoPaciente',
      x: 300,
      y: 740,
      fontSize: 10,
    },

    // --- DATOS DE LA CIRUGIA ---
    {
      field: 'fechaSolicitada',
      x: 120,
      y: 700, // ~140px desde arriba
      fontSize: 10,
    },
    {
      field: 'horario',
      x: 300,
      y: 700,
      fontSize: 10,
    },
    {
      field: 'diagnostico',
      x: 120,
      y: 660, // ~180px desde arriba
      fontSize: 9,
      maxWidth: 400,
    },
    {
      field: 'cirugiaPropuesta',
      x: 120,
      y: 620, // ~220px desde arriba
      fontSize: 9,
      maxWidth: 400,
    },
    {
      field: 'codigoCirugia',
      x: 120,
      y: 600,
      fontSize: 9,
    },
    {
      field: 'duracionEstimada',
      x: 350,
      y: 600,
      fontSize: 9,
    },

    // --- DATOS CLINICOS ---
    {
      field: 'puntajeETE',
      x: 450,
      y: 560, // ~280px desde arriba
      fontSize: 10,
    },

    // --- EQUIPO MEDICO ---
    {
      field: 'cirujano',
      x: 120,
      y: 480, // ~360px desde arriba
      fontSize: 10,
      maxWidth: 200,
    },
    {
      field: 'ayudante',
      x: 120,
      y: 460,
      fontSize: 10,
      maxWidth: 200,
    },
    {
      field: 'anestesista',
      x: 120,
      y: 440,
      fontSize: 10,
      maxWidth: 200,
    },
    {
      field: 'arsenalera',
      x: 120,
      y: 420,
      fontSize: 10,
      maxWidth: 200,
    },

    // --- PREVISION ---
    {
      field: 'prevision',
      x: 120,
      y: 380, // ~460px desde arriba
      fontSize: 10,
    },
  ],

  checkboxes: {
    // --- LATERALIDAD ---
    lateralidad: {
      derecha: { x: 120, y: 580 },
      izquierda: { x: 200, y: 580 },
      bilateral: { x: 280, y: 580 },
      'no aplica': { x: 360, y: 580 },
    },

    // --- ALERGIAS LATEX ---
    alergiasLatex: {
      si: { x: 120, y: 560 },
      no: { x: 180, y: 560 },
    },

    // --- BIOPSIA ---
    biopsia: {
      no: { x: 120, y: 540 },
      si: { x: 160, y: 540 },
      diferida: { x: 200, y: 540 },
      rapida: { x: 260, y: 540 },
    },

    // --- RAYOS X ---
    rayosX: {
      si: { x: 120, y: 520 },
      no: { x: 180, y: 520 },
    },

    // --- CONVENIO ---
    convenio: {
      PAD: { x: 120, y: 360 },
      GES: { x: 180, y: 360 },
      CAE: { x: 240, y: 360 },
      SIP: { x: 300, y: 360 },
      'LIBRE ELECCION': { x: 360, y: 360 },
    },
  },
};

// =============================================================================
// CONSENTIMIENTO GENERAL - CLINICA BUPA ANTOFAGASTA
// =============================================================================

/**
 * Plantilla: cba_consentimiento_general.pdf
 * 3 páginas - Campos en página 1 y 3
 */
export const CONSENTIMIENTO_GENERAL_BUPA: TemplateMapping = {
  text: [
    // --- PAGINA 1: DATOS DEL PACIENTE ---
    {
      field: 'nombrePaciente',
      x: 180,
      y: 750, // ~90px desde arriba
      fontSize: 11,
      maxWidth: 300,
    },
    {
      field: 'apellidosPaciente',
      x: 180,
      y: 730,
      fontSize: 11,
      maxWidth: 300,
    },
    {
      field: 'rutPaciente',
      x: 180,
      y: 710,
      fontSize: 11,
    },
    {
      field: 'edadPaciente',
      x: 180,
      y: 690,
      fontSize: 11,
    },
    {
      field: 'fechaNacimiento',
      x: 300,
      y: 690,
      fontSize: 11,
    },
    {
      field: 'diagnostico',
      x: 180,
      y: 650, // ~190px desde arriba
      fontSize: 10,
      maxWidth: 350,
    },
    {
      field: 'procedimiento',
      x: 180,
      y: 610, // ~230px desde arriba
      fontSize: 10,
      maxWidth: 350,
    },

    // --- PAGINA 3: AUTORIZACION ---
    {
      field: 'nombreAutorizacion',
      x: 180,
      y: 400, // Coordenada estimada en página 3
      fontSize: 11,
      maxWidth: 300,
      page: 2, // Página 3 (0-indexed)
    },
    {
      field: 'apellidosAutorizacion',
      x: 180,
      y: 380,
      fontSize: 11,
      maxWidth: 300,
      page: 2,
    },
    {
      field: 'rutAutorizacion',
      x: 180,
      y: 360,
      fontSize: 11,
      page: 2,
    },
    {
      field: 'medicoResponsableNombre',
      x: 180,
      y: 280, // Zona de médico responsable
      fontSize: 11,
      maxWidth: 250,
      page: 2,
    },
    {
      field: 'medicoResponsableRut',
      x: 180,
      y: 260,
      fontSize: 11,
      page: 2,
    },
    {
      field: 'fechaConsentimiento',
      x: 180,
      y: 200,
      fontSize: 10,
      page: 2,
    },
  ],

  checkboxes: {
    // El consentimiento general típicamente no tiene checkboxes
    // sino campos de firma que se manejan de forma diferente
  },
};

// =============================================================================
// MAPEOS UNIFICADOS DE CAMPOS
// =============================================================================

/**
 * Mapeo unificado de nombres de campos del sistema a campos de plantillas
 * Esto permite usar nombres consistentes en el sistema y mapearlos a diferentes plantillas
 */
export interface UnifiedPatientData {
  // Datos personales
  nombreCompleto?: string;
  nombre?: string;
  apellidos?: string;
  rut?: string;
  fechaNacimiento?: string;
  edad?: number;
  telefono?: string;

  // Datos médicos
  diagnostico?: string;
  procedimiento?: string;
  cirugiaPropuesta?: string;
  codigoCirugia?: string;
  duracionEstimada?: string;

  // Datos de atención
  fechaSolicitada?: string;
  fecha?: string;
  horario?: string;
  puntajeETE?: string;

  // Equipo médico
  cirujano?: string;
  ayudante?: string;
  anestesista?: string;
  arsenalera?: string;
  medicoResponsable?: string;
  medicoResponsableRut?: string;

  // Previsión y convenios
  prevision?: string;
  convenio?: string;

  // Opciones clínicas
  lateralidad?: 'derecha' | 'izquierda' | 'bilateral' | 'no aplica';
  alergiasLatex?: 'si' | 'no';
  biopsia?: 'no' | 'si' | 'diferida' | 'rapida';
  rayosX?: 'si' | 'no';
}

/**
 * Convierte datos unificados al formato esperado por el mapeo de solicitud de pabellón
 */
export function toSolicitudPabellonData(data: UnifiedPatientData): {
  text: Record<string, string>;
  checkboxes: Record<string, string | boolean>;
} {
  return {
    text: {
      nombrePaciente: data.nombreCompleto || `${data.nombre || ''} ${data.apellidos || ''}`.trim(),
      rutPaciente: data.rut || '',
      fechaNacimiento: data.fechaNacimiento || '',
      telefonoPaciente: data.telefono || '',
      fechaSolicitada: data.fechaSolicitada || data.fecha || '',
      horario: data.horario || '',
      diagnostico: data.diagnostico || '',
      cirugiaPropuesta: data.cirugiaPropuesta || data.procedimiento || '',
      codigoCirugia: data.codigoCirugia || '',
      duracionEstimada: data.duracionEstimada || '',
      puntajeETE: data.puntajeETE || '',
      cirujano: data.cirujano || '',
      ayudante: data.ayudante || '',
      anestesista: data.anestesista || '',
      arsenalera: data.arsenalera || '',
      prevision: data.prevision || '',
    },
    checkboxes: {
      lateralidad: data.lateralidad || '',
      alergiasLatex: data.alergiasLatex || '',
      biopsia: data.biopsia || '',
      rayosX: data.rayosX || '',
      convenio: data.convenio || '',
    },
  };
}

/**
 * Convierte datos unificados al formato esperado por el mapeo de consentimiento general
 */
export function toConsentimientoGeneralData(data: UnifiedPatientData): {
  text: Record<string, string>;
  checkboxes: Record<string, string | boolean>;
} {
  return {
    text: {
      nombrePaciente: data.nombre || data.nombreCompleto?.split(' ')[0] || '',
      apellidosPaciente: data.apellidos || data.nombreCompleto?.split(' ').slice(1).join(' ') || '',
      rutPaciente: data.rut || '',
      edadPaciente: data.edad?.toString() || '',
      fechaNacimiento: data.fechaNacimiento || '',
      diagnostico: data.diagnostico || '',
      procedimiento: data.procedimiento || data.cirugiaPropuesta || '',
      nombreAutorizacion: data.nombre || '',
      apellidosAutorizacion: data.apellidos || '',
      rutAutorizacion: data.rut || '',
      medicoResponsableNombre: data.medicoResponsable || data.cirujano || '',
      medicoResponsableRut: data.medicoResponsableRut || '',
      fechaConsentimiento: data.fecha || data.fechaSolicitada || '',
    },
    checkboxes: {},
  };
}

// =============================================================================
// INDICE DE PLANTILLAS
// =============================================================================

/**
 * Índice de todas las plantillas disponibles con sus mapeos
 */
export const TEMPLATE_MAPPINGS: Record<string, TemplateMapping> = {
  'solicitud_de_pabellon__2_.pdf': SOLICITUD_PABELLON_BUPA,
  'pabellon/bupa.pdf': SOLICITUD_PABELLON_BUPA,
  'cba_consentimiento_general.pdf': CONSENTIMIENTO_GENERAL_BUPA,
  'consentimiento/bupa.pdf': CONSENTIMIENTO_GENERAL_BUPA,
};

/**
 * Obtiene el mapeo para una plantilla específica
 * @param templateName - Nombre de la plantilla
 * @returns Mapeo de la plantilla o undefined si no existe
 */
export function getTemplateMapping(templateName: string): TemplateMapping | undefined {
  return TEMPLATE_MAPPINGS[templateName];
}

/**
 * Lista todas las plantillas disponibles
 */
export function listAvailableTemplates(): string[] {
  return Object.keys(TEMPLATE_MAPPINGS);
}
