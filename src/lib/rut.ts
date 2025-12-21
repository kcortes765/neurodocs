/**
 * Utilidades para trabajar con RUT chileno
 * El RUT (Rol Único Tributario) es el identificador único de personas en Chile
 */

/**
 * Calcula el dígito verificador de un RUT
 * @param rutNumber - Número del RUT sin dígito verificador
 * @returns El dígito verificador (0-9 o K)
 */
export function calculateDv(rutNumber: number): string {
  let suma = 0;
  let multiplicador = 2;

  // Convertir a string y recorrer de derecha a izquierda
  const rutStr = rutNumber.toString();

  for (let i = rutStr.length - 1; i >= 0; i--) {
    suma += parseInt(rutStr[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  const dv = 11 - resto;

  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return dv.toString();
}

/**
 * Limpia un RUT removiendo puntos, guiones y espacios
 * @param rut - RUT a limpiar
 * @returns RUT sin formato
 */
export function cleanRut(rut: string): string {
  return rut.replace(/[.\s-]/g, '').toUpperCase();
}

/**
 * Valida un RUT chileno usando el algoritmo de módulo 11
 * @param rut - RUT a validar (puede incluir formato con puntos y guión)
 * @returns true si el RUT es válido, false en caso contrario
 */
export function validateRut(rut: string): boolean {
  if (!rut || typeof rut !== 'string') {
    return false;
  }

  // Limpiar el RUT
  const cleanedRut = cleanRut(rut);

  // Validar formato básico (mínimo 2 caracteres: número + DV)
  if (cleanedRut.length < 2) {
    return false;
  }

  // Separar número y dígito verificador
  const rutBody = cleanedRut.slice(0, -1);
  const dvProvided = cleanedRut.slice(-1);

  // Validar que el cuerpo del RUT sea numérico
  if (!/^\d+$/.test(rutBody)) {
    return false;
  }

  const rutNumber = parseInt(rutBody, 10);

  // Validar rango (RUT debe estar entre 1.000.000 y 99.999.999 aproximadamente)
  if (rutNumber < 100000 || rutNumber > 99999999) {
    return false;
  }

  // Calcular dígito verificador esperado
  const dvCalculated = calculateDv(rutNumber);

  // Comparar
  return dvProvided === dvCalculated;
}

/**
 * Formatea un RUT al formato estándar chileno XX.XXX.XXX-X
 * @param rut - RUT a formatear (con o sin formato)
 * @returns RUT formateado
 */
export function formatRut(rut: string): string {
  // Limpiar el RUT primero
  const cleanedRut = cleanRut(rut);

  if (cleanedRut.length < 2) {
    return rut; // Retornar original si no es válido
  }

  // Separar cuerpo y dígito verificador
  const rutBody = cleanedRut.slice(0, -1);
  const dv = cleanedRut.slice(-1);

  // Formatear el cuerpo con puntos (separador de miles)
  let formattedBody = '';
  let counter = 0;

  for (let i = rutBody.length - 1; i >= 0; i--) {
    if (counter === 3) {
      formattedBody = '.' + formattedBody;
      counter = 0;
    }
    formattedBody = rutBody[i] + formattedBody;
    counter++;
  }

  return `${formattedBody}-${dv}`;
}

/**
 * Genera un RUT válido aleatorio (útil para datos sintéticos)
 * @returns RUT válido en formato sin puntos ni guión
 */
export function generateValidRut(): string {
  // Generar número aleatorio entre 5.000.000 y 25.999.999
  // (rango común de RUTs de personas en Chile)
  const min = 5000000;
  const max = 25999999;
  const rutNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  // Calcular dígito verificador
  const dv = calculateDv(rutNumber);

  return `${rutNumber}${dv}`;
}

/**
 * Genera un RUT válido aleatorio con formato
 * @returns RUT válido formateado (XX.XXX.XXX-X)
 */
export function generateFormattedRut(): string {
  const rut = generateValidRut();
  return formatRut(rut);
}
