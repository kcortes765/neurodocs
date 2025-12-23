/**
 * Generador de datos sintéticos para aplicación médica neurológica chilena
 */

import { generateValidRut, formatRut } from './rut';

// Nombres masculinos chilenos comunes
const NOMBRES_MASCULINOS = [
  'Juan', 'Pedro', 'Carlos', 'Luis', 'Jorge', 'Miguel', 'José',
  'Francisco', 'Andrés', 'Diego', 'Sebastián', 'Matías', 'Felipe',
  'Cristián', 'Gonzalo', 'Roberto', 'Alejandro', 'Ricardo', 'Rodrigo', 'Marcelo'
];

// Nombres femeninos chilenos comunes
const NOMBRES_FEMENINOS = [
  'María', 'Carmen', 'Rosa', 'Ana', 'Patricia', 'Gloria', 'Isabel',
  'Claudia', 'Margarita', 'Carolina', 'Francisca', 'Gabriela', 'Paulina',
  'Verónica', 'Andrea', 'Mónica', 'Cecilia', 'Daniela', 'Alejandra', 'Lorena'
];

// Apellidos chilenos comunes
const APELLIDOS = [
  'González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras',
  'Silva', 'Martínez', 'Sepúlveda', 'Morales', 'Rodríguez', 'López',
  'Fuentes', 'Hernández', 'Torres', 'Araya', 'Flores', 'Espinoza', 'Valenzuela',
  'Castillo', 'Núñez', 'Tapia', 'Reyes', 'Gutiérrez', 'Ramírez', 'Figueroa',
  'Carrasco', 'Vargas', 'Jara'
];

// Patologías neurológicas
const PATOLOGIAS = [
  'Cefalea tensional',
  'Migraña crónica',
  'Epilepsia focal',
  'Epilepsia generalizada',
  'Enfermedad de Parkinson',
  'Esclerosis múltiple',
  'Neuropatía diabética',
  'Accidente cerebrovascular isquémico',
  'Hemorragia intracerebral',
  'Tumor cerebral (glioblastoma)',
  'Meningioma',
  'Neuralgia del trigémino',
  'Hernia discal lumbar',
  'Estenosis de canal lumbar',
  'Hidrocefalia normotensiva',
  'Traumatismo encefalocraneano',
  'Síndrome de Guillain-Barré',
  'Miastenia gravis',
  'Demencia tipo Alzheimer',
  'Demencia vascular'
];

// Diagnósticos comunes en neurocirugía
const DIAGNOSTICOS = [
  'Hernia discal L4-L5',
  'Hernia discal L5-S1',
  'Hernia discal cervical C5-C6',
  'Estenosis de canal lumbar multinivel',
  'Tumor cerebral hemisferio derecho',
  'Meningioma parasagital',
  'Hematoma subdural crónico',
  'Aneurisma cerebral no roto',
  'Malformación arteriovenosa',
  'Hidrocefalia obstructiva',
  'Quiste aracnoideo',
  'Neuralgia del trigémino refractaria',
  'Fracturas vertebrales múltiples',
  'Compresión medular',
  'Espondilolistesis degenerativa'
];

// Tratamientos y medicamentos neurológicos
const TRATAMIENTOS = [
  'Pregabalina 75mg',
  'Pregabalina 150mg',
  'Gabapentina 300mg',
  'Gabapentina 600mg',
  'Carbamazepina 200mg',
  'Levetiracetam 500mg',
  'Levetiracetam 1000mg',
  'Ácido valproico 500mg',
  'Topiramato 50mg',
  'Lamotrigina 100mg',
  'Amitriptilina 25mg',
  'Duloxetina 60mg',
  'Tramadol 50mg',
  'Clonazepam 0.5mg',
  'Clonazepam 2mg',
  'Diclofenaco 100mg',
  'Paracetamol 1g',
  'Metamizol 1g',
  'Dexametasona 4mg',
  'Prednisona 20mg',
  'Fenitoína 100mg',
  'Baclofeno 10mg',
  'Tizanidina 2mg',
  'Levodopa/Carbidopa 250/25mg',
  'Rivastigmina 4.6mg',
  'Memantina 10mg'
];

// ISAPREs chilenas
const ISAPRES = [
  'FONASA',
  'Isapre Banmédica',
  'Isapre Colmena',
  'Isapre Consalud',
  'Isapre Cruz Blanca',
  'Isapre Nueva Masvida',
  'Isapre Vida Tres'
];

// Regiones de Chile
const REGIONES = [
  'Región Metropolitana',
  'Región de Valparaíso',
  'Región del Biobío',
  'Región de La Araucanía',
  'Región de Los Lagos',
  'Región de Antofagasta',
  'Región de Coquimbo',
  'Región del Maule',
  "Región de O'Higgins",
  'Región de Tarapacá',
  'Región de Atacama',
  'Región de Aysén',
  'Región de Magallanes',
  'Región de Arica y Parinacota',
  'Región de Los Ríos',
  'Región de Ñuble'
];

// Comunas principales
const COMUNAS = [
  'Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'La Florida',
  'Maipú', 'Puente Alto', 'San Bernardo', 'Viña del Mar', 'Valparaíso',
  'Concepción', 'Talcahuano', 'Temuco', 'Puerto Montt', 'Antofagasta',
  'La Serena', 'Coquimbo', 'Rancagua', 'Talca', 'Arica', 'Iquique',
  'Peñalolén', 'La Reina', 'Macul', 'Estación Central'
];

/**
 * Genera un género aleatorio
 */
function randomGender(): 'M' | 'F' {
  return Math.random() < 0.5 ? 'M' : 'F';
}

/**
 * Genera un nombre completo aleatorio basado en el género
 */
function randomName(gender: 'M' | 'F'): { nombre: string; apellidoPaterno: string; apellidoMaterno: string } {
  const nombres = gender === 'M' ? NOMBRES_MASCULINOS : NOMBRES_FEMENINOS;
  const nombre = nombres[Math.floor(Math.random() * nombres.length)];
  const apellidoPaterno = APELLIDOS[Math.floor(Math.random() * APELLIDOS.length)];
  const apellidoMaterno = APELLIDOS[Math.floor(Math.random() * APELLIDOS.length)];

  return { nombre, apellidoPaterno, apellidoMaterno };
}

/**
 * Genera una fecha de nacimiento aleatoria
 * @param minAge - Edad mínima
 * @param maxAge - Edad máxima
 */
function randomBirthDate(minAge: number = 18, maxAge: number = 85): Date {
  const today = new Date();
  const birthYear = today.getFullYear() - Math.floor(Math.random() * (maxAge - minAge + 1)) - minAge;
  const birthMonth = Math.floor(Math.random() * 12);
  const birthDay = Math.floor(Math.random() * 28) + 1; // Evitar problemas con febrero

  return new Date(birthYear, birthMonth, birthDay);
}

/**
 * Genera un email ficticio
 */
function randomEmail(nombre: string, apellido: string): string {
  const dominios = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];
  const dominio = dominios[Math.floor(Math.random() * dominios.length)];
  const nombreLimpio = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const apellidoLimpio = apellido.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  return `${nombreLimpio}.${apellidoLimpio}${Math.floor(Math.random() * 999)}@${dominio}`;
}

/**
 * Genera un teléfono chileno ficticio
 */
function randomPhone(): string {
  // Formato: +56 9 XXXX XXXX
  const numero = Math.floor(Math.random() * 90000000) + 10000000;
  return `+56 9 ${numero}`;
}

/**
 * Selecciona un elemento aleatorio de un array
 */
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Selecciona múltiples elementos aleatorios de un array
 */
function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Genera una fecha aleatoria en un rango
 */
function randomDate(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
}

/**
 * Genera un paciente ficticio completo
 */
export function generatePatient() {
  const gender = randomGender();
  const { nombre, apellidoPaterno, apellidoMaterno } = randomName(gender);
  const rut = generateValidRut();
  const fechaNacimiento = randomBirthDate();

  return {
    rut,
    rutFormateado: formatRut(rut),
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    nombreCompleto: `${nombre} ${apellidoPaterno} ${apellidoMaterno}`,
    fechaNacimiento: fechaNacimiento.toISOString().split('T')[0],
    genero: gender,
    email: randomEmail(nombre, apellidoPaterno),
    telefono: randomPhone(),
    prevision: randomElement(ISAPRES),
    region: randomElement(REGIONES),
    comuna: randomElement(COMUNAS),
    direccion: `${randomElement(['Av.', 'Calle', 'Pasaje'])} ${randomElement(APELLIDOS)} ${Math.floor(Math.random() * 9999) + 1}`,
    patologiaPrincipal: randomElement(PATOLOGIAS),
    diagnosticos: randomElements(DIAGNOSTICOS, Math.floor(Math.random() * 3) + 1),
  };
}

/**
 * Genera una atención médica ficticia
 */
export function generateAttention(patientId: string, clinicId: string) {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const fechaAtencion = randomDate(threeMonthsAgo, now);

  const tiposAtencion = ['Consulta', 'Control', 'Urgencia', 'Procedimiento'];
  const estados = ['Completada', 'Agendada', 'En curso'];

  return {
    patientId,
    clinicId,
    fecha: fechaAtencion.toISOString().split('T')[0],
    hora: `${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:${randomElement(['00', '15', '30', '45'])}`,
    tipo: randomElement(tiposAtencion),
    estado: randomElement(estados),
    motivoConsulta: randomElement(PATOLOGIAS),
    diagnostico: randomElement(DIAGNOSTICOS),
    tratamiento: randomElements(TRATAMIENTOS, Math.floor(Math.random() * 4) + 1),
    observaciones: `Paciente refiere ${randomElement(['mejoría', 'dolor persistente', 'episodios frecuentes', 'síntomas controlados'])}`,
  };
}

/**
 * Genera un lote de pacientes ficticios
 */
export function generateBatch(count: number) {
  const patients = [];

  for (let i = 0; i < count; i++) {
    patients.push(generatePatient());
  }

  return patients;
}

/**
 * Genera un conjunto completo de datos sintéticos (pacientes + atenciones)
 */
export function generateCompleteDataset(patientCount: number, attentionsPerPatient: number = 3) {
  const patients = generateBatch(patientCount);
  const attentions: Array<ReturnType<typeof generateAttention>> = [];

  // Generar ID de clínica ficticio
  const clinicId = `CLI-${Math.floor(Math.random() * 1000)}`;

  patients.forEach((patient, index) => {
    const patientId = `PAT-${String(index + 1).padStart(6, '0')}`;

    for (let i = 0; i < attentionsPerPatient; i++) {
      attentions.push(generateAttention(patientId, clinicId));
    }
  });

  return {
    patients,
    attentions,
    metadata: {
      generatedAt: new Date().toISOString(),
      patientCount: patients.length,
      attentionCount: attentions.length,
    }
  };
}

// Exportar arrays de datos para uso directo si es necesario
export {
  NOMBRES_MASCULINOS,
  NOMBRES_FEMENINOS,
  APELLIDOS,
  PATOLOGIAS,
  DIAGNOSTICOS,
  TRATAMIENTOS,
  ISAPRES,
  REGIONES,
  COMUNAS
};
