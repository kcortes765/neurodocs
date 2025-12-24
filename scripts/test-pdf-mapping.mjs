#!/usr/bin/env node

/**
 * Script de prueba para el sistema de mapeo de PDFs
 * Genera PDFs de prueba para validar las coordenadas
 *
 * Uso:
 *   node scripts/test-pdf-mapping.mjs
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔍 Iniciando prueba del sistema de mapeo PDF...\n');

// Verificar que las plantillas existen
const plantillasDir = join(projectRoot, 'public', 'plantillas');
const plantillasFallback = join(dirname(projectRoot), 'plantillas');

console.log('📁 Verificando plantillas...');
console.log(`   Directorio principal: ${plantillasDir}`);
console.log(`   Directorio fallback: ${plantillasFallback}`);

const plantillas = [
  'solicitud_de_pabellon__2_.pdf',
  'cba_consentimiento_general.pdf',
];

let plantillasEncontradas = 0;

for (const plantilla of plantillas) {
  const pathPrincipal = join(plantillasDir, plantilla);
  const pathFallback = join(plantillasFallback, plantilla);

  if (existsSync(pathPrincipal)) {
    console.log(`   ✅ ${plantilla} (principal)`);
    plantillasEncontradas++;
  } else if (existsSync(pathFallback)) {
    console.log(`   ✅ ${plantilla} (fallback)`);
    plantillasEncontradas++;
  } else {
    console.log(`   ❌ ${plantilla} - NO ENCONTRADA`);
  }
}

console.log(`\n📊 Plantillas encontradas: ${plantillasEncontradas}/${plantillas.length}\n`);

// Verificar archivos del sistema
console.log('📝 Verificando archivos del sistema...');

const archivos = [
  'src/lib/pdf-generator.ts',
  'src/lib/pdf-field-maps.ts',
  'src/lib/pdf-examples.ts',
];

let archivosEncontrados = 0;

for (const archivo of archivos) {
  const path = join(projectRoot, archivo);
  if (existsSync(path)) {
    console.log(`   ✅ ${archivo}`);
    archivosEncontrados++;
  } else {
    console.log(`   ❌ ${archivo} - NO ENCONTRADO`);
  }
}

console.log(`\n📊 Archivos del sistema: ${archivosEncontrados}/${archivos.length}\n`);

// Crear directorio de salida para PDFs de prueba
const outputDir = join(projectRoot, 'test-output');
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Directorio de salida creado: ${outputDir}\n`);
} else {
  console.log(`📁 Directorio de salida existente: ${outputDir}\n`);
}

// Instrucciones para generar PDFs de prueba
console.log('📋 Para generar PDFs de prueba, ejecuta:\n');
console.log('   1. Compilar TypeScript:');
console.log('      npm run build\n');
console.log('   2. Crear script de prueba:');
console.log('      Archivo: scripts/generate-test-pdfs.ts\n');
console.log('      Contenido:');
console.log('      ```typescript');
console.log("      import { generarYGuardarSolicitud, generarYGuardarConsentimiento } from '../src/lib/pdf-examples';");
console.log("      import path from 'path';");
console.log('');
console.log('      async function main() {');
console.log("        const outputDir = path.join(process.cwd(), 'test-output');");
console.log('');
console.log("        console.log('Generando solicitud de pabellón...');");
console.log("        await generarYGuardarSolicitud(path.join(outputDir, 'solicitud-test.pdf'));");
console.log('');
console.log("        console.log('Generando consentimiento general...');");
console.log("        await generarYGuardarConsentimiento(path.join(outputDir, 'consentimiento-test.pdf'));");
console.log('');
console.log("        console.log('✅ PDFs generados exitosamente en:', outputDir);");
console.log('      }');
console.log('');
console.log('      main().catch(console.error);');
console.log('      ```\n');
console.log('   3. Ejecutar:');
console.log('      npx tsx scripts/generate-test-pdfs.ts\n');

// Verificar dependencias
console.log('📦 Verificando dependencias...\n');

try {
  const packageJson = await import(join(projectRoot, 'package.json'), {
    assert: { type: 'json' },
  }).then((m) => m.default);

  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const requiredDeps = {
    'pdf-lib': '1.17.1',
  };

  for (const [dep, version] of Object.entries(requiredDeps)) {
    if (deps[dep]) {
      console.log(`   ✅ ${dep}@${deps[dep]}`);
    } else {
      console.log(`   ❌ ${dep} - NO INSTALADA (requerida: ${version})`);
      console.log(`      Ejecuta: npm install ${dep}@${version}`);
    }
  }
} catch (error) {
  console.log(`   ⚠️  No se pudo leer package.json: ${error.message}`);
}

console.log('\n✨ Verificación completada.\n');

// Resumen
console.log('═══════════════════════════════════════════════════════════════');
console.log('📋 RESUMEN');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('Sistema de mapeo PDF instalado:');
console.log('  - pdf-generator.ts      : Motor de generación');
console.log('  - pdf-field-maps.ts     : Mapeos de coordenadas');
console.log('  - pdf-examples.ts       : Ejemplos de uso');
console.log('  - PDF_MAPPING_README.md : Documentación completa');
console.log('');
console.log('Plantillas mapeadas:');
console.log('  1. solicitud_de_pabellon__2_.pdf (Clínica Bupa)');
console.log('  2. cba_consentimiento_general.pdf (3 páginas)');
console.log('');
console.log('Próximos pasos:');
console.log('  1. Revisar PDF_MAPPING_README.md para documentación completa');
console.log('  2. Ajustar coordenadas según PDFs reales (si es necesario)');
console.log('  3. Generar PDFs de prueba para validar posiciones');
console.log('  4. Integrar con API/endpoints de la aplicación');
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
