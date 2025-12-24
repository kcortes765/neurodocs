/**
 * Script para generar PDFs de prueba
 * Permite validar las coordenadas de los campos mapeados
 *
 * Uso:
 *   npx tsx scripts/generate-test-pdfs.ts
 */

import { generarYGuardarSolicitud, generarYGuardarConsentimiento, generarPdfPrueba } from '../src/lib/pdf-examples';
import { savePdfToFile } from '../src/lib/pdf-generator';
import path from 'path';
import * as fs from 'fs';

async function main() {
  console.log('🚀 Generando PDFs de prueba...\n');

  // Crear directorio de salida
  const outputDir = path.join(process.cwd(), 'test-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Directorio creado: ${outputDir}\n`);
  }

  try {
    // 1. Generar solicitud de pabellón
    console.log('📄 Generando solicitud de pabellón...');
    await generarYGuardarSolicitud(path.join(outputDir, 'solicitud-test.pdf'));
    console.log('   ✅ solicitud-test.pdf generado\n');

    // 2. Generar consentimiento general
    console.log('📄 Generando consentimiento general...');
    await generarYGuardarConsentimiento(path.join(outputDir, 'consentimiento-test.pdf'));
    console.log('   ✅ consentimiento-test.pdf generado\n');

    // 3. Generar PDF de prueba con datos de validación
    console.log('📄 Generando PDF de prueba (validación de coordenadas)...');
    const pdfPrueba = await generarPdfPrueba();
    await savePdfToFile(pdfPrueba, path.join(outputDir, 'solicitud-validacion.pdf'));
    console.log('   ✅ solicitud-validacion.pdf generado\n');

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✨ PDFs generados exitosamente en:');
    console.log(`   ${outputDir}`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📋 Archivos generados:');
    console.log('   1. solicitud-test.pdf        - Solicitud con datos reales');
    console.log('   2. consentimiento-test.pdf   - Consentimiento con datos reales');
    console.log('   3. solicitud-validacion.pdf  - Solicitud con datos de prueba');
    console.log('');
    console.log('🔍 Siguiente paso:');
    console.log('   Abre los PDFs y verifica que los campos estén correctamente posicionados.');
    console.log('   Si es necesario, ajusta las coordenadas en src/lib/pdf-field-maps.ts');
    console.log('');

  } catch (error) {
    console.error('❌ Error generando PDFs:', error);
    if (error instanceof Error) {
      console.error('   Mensaje:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
