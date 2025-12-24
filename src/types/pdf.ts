/**
 * Tipos TypeScript para el sistema de generación de PDFs
 * Centraliza todas las interfaces y tipos relacionados con PDFs
 */

import type {
  FieldMapping,
  CheckboxMapping,
  TemplateMapping,
} from '@/lib/pdf-generator';
import type { UnifiedPatientData } from '@/lib/pdf-field-maps';

/**
 * Tipos de plantillas disponibles
 */
export type TemplateType = 'pabellon' | 'consentimiento' | 'custom';

/**
 * Formato de salida del PDF
 */
export type PdfOutputFormat = 'pdf' | 'base64';

/**
 * Request para generar PDF
 */
export interface GeneratePdfRequest {
  templateType: TemplateType;
  templateName?: string; // Requerido si templateType === 'custom'
  patientData: UnifiedPatientData;
  format?: PdfOutputFormat;
  text?: Record<string, string>; // Para templates custom
  checkboxes?: Record<string, string | boolean>; // Para templates custom
}

/**
 * Response exitoso de generación de PDF
 */
export interface GeneratePdfSuccessResponse {
  success: true;
  data?: string; // Base64 del PDF (si format === 'base64')
  filename: string;
  size: number;
}

/**
 * Response de error en generación de PDF
 */
export interface GeneratePdfErrorResponse {
  success: false;
  error: string;
  details?: string;
}

/**
 * Response unificado
 */
export type GeneratePdfResponse =
  | GeneratePdfSuccessResponse
  | GeneratePdfErrorResponse;

/**
 * Información de una plantilla
 */
export interface TemplateInfo {
  id: string;
  name: string;
  filename: string;
  type: TemplateType;
  description?: string;
  fields?: string[];
}

/**
 * Datos del paciente para Solicitud de Pabellón
 */
export interface SolicitudPabellonData {
  // Datos personales
  nombrePaciente: string;
  rutPaciente: string;
  fechaNacimiento: string;
  telefonoPaciente: string;

  // Datos de cirugía
  fechaSolicitada: string;
  horario: string;
  diagnostico: string;
  cirugiaPropuesta: string;
  codigoCirugia?: string;
  duracionEstimada?: string;

  // Equipo médico
  cirujano: string;
  ayudante?: string;
  anestesista?: string;
  arsenalera?: string;

  // Datos clínicos
  puntajeETE?: string;
  prevision: string;

  // Opciones
  lateralidad?: 'derecha' | 'izquierda' | 'bilateral' | 'no aplica';
  alergiasLatex?: 'si' | 'no';
  biopsia?: 'no' | 'si' | 'diferida' | 'rapida';
  rayosX?: 'si' | 'no';
  convenio?: 'PAD' | 'GES' | 'CAE' | 'SIP' | 'LIBRE ELECCION';
}

/**
 * Datos del paciente para Consentimiento General
 */
export interface ConsentimientoGeneralData {
  // Datos personales
  nombre: string;
  apellidos: string;
  rut: string;
  edad: number;
  fechaNacimiento: string;

  // Datos médicos
  diagnostico: string;
  procedimiento: string;

  // Autorización
  nombreAutorizacion?: string;
  apellidosAutorizacion?: string;
  rutAutorizacion?: string;

  // Médico responsable
  medicoResponsable: string;
  medicoResponsableRut: string;

  // Fecha
  fecha: string;
}

/**
 * Opciones para cargar plantilla
 */
export interface LoadTemplateOptions {
  templatePath: string;
  fallbackPaths?: string[];
}

/**
 * Opciones para inyectar texto
 */
export interface InjectTextOptions {
  mappings: FieldMapping[];
  data: Record<string, string>;
  font?: string; // Nombre de fuente (StandardFonts)
}

/**
 * Opciones para inyectar checkboxes
 */
export interface InjectCheckboxesOptions {
  mappings: CheckboxMapping;
  data: Record<string, string | boolean>;
  checkboxChar?: string; // Carácter para marcar (default: 'X')
  checkboxSize?: number; // Tamaño de fuente (default: 12)
}

/**
 * Resultado de validación de coordenadas
 */
export interface CoordinateValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Configuración de coordenadas
 */
export interface CoordinateConfig {
  x: number;
  y: number;
  page?: number;
  fontSize?: number;
  maxWidth?: number;
}

/**
 * Evento de progreso de generación
 */
export interface PdfGenerationProgress {
  stage: 'loading' | 'injecting-text' | 'injecting-checkboxes' | 'saving' | 'complete';
  progress: number; // 0-100
  message?: string;
}

/**
 * Re-exportar tipos de pdf-generator para conveniencia
 */
export type {
  FieldMapping,
  CheckboxMapping,
  TemplateMapping,
} from '@/lib/pdf-generator';

export type {
  UnifiedPatientData,
} from '@/lib/pdf-field-maps';
