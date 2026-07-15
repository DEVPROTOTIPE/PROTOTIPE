#!/usr/bin/env node

/**
 * bootstrap-admin.js — SEC-013
 *
 * Crea el primer administrador y el documento config/settings usando el
 * Admin SDK de Firebase (bypassa firestore.rules por diseño), reemplazando
 * el helper isFirstStart() ya retirado de firestore.rules. Solo el fundador
 * ejecuta este script, localmente, con sus propias credenciales — nunca una IA.
 *
 * Requisitos previos (el fundador los provee, esta IA nunca los lee):
 *   - Variable de entorno GOOGLE_APPLICATION_CREDENTIALS apuntando a un
 *     archivo de service account JSON del proyecto Firebase real del cliente.
 *   - O ejecutar con `gcloud auth application-default login` ya autenticado.
 *
 * Uso:
 *   GOOGLE_APPLICATION_CREDENTIALS=./ruta/service-account.json \
 *     node scripts/bootstrap-admin.js --email admin@ejemplo.com --nombre "Nombre Admin"
 *
 *   Agrega --dry-run para ver qué haría sin escribir nada.
 */

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--email') {
      args.email = argv[i + 1];
      i += 1;
    } else if (arg === '--nombre') {
      args.nombre = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

async function main() {
  const { email, nombre, dryRun } = parseArgs(process.argv.slice(2));

  if (!email) {
    console.error('Uso: node scripts/bootstrap-admin.js --email <correo> --nombre "<nombre>" [--dry-run]');
    process.exitCode = 1;
    return;
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error(
      'Falta GOOGLE_APPLICATION_CREDENTIALS. Este script nunca debe correr sin credenciales explícitas del fundador.'
    );
    process.exitCode = 1;
    return;
  }

  const app = initializeApp({
    credential: applicationDefault(),
  });

  const auth = getAuth(app);
  const db = getFirestore(app);

  const settingsRef = db.collection('config').doc('settings');
  const settingsSnap = await settingsRef.get();

  if (settingsSnap.exists) {
    console.error(
      'config/settings ya existe: este proyecto ya pasó por el bootstrap inicial. ' +
        'Si necesitas agregar OTRO administrador, hazlo desde el panel admin ya existente, no con este script.'
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Bootstrap SEC-013 ${dryRun ? '(dry-run, no se escribe nada)' : ''}`);
  console.log(`  - Buscar/crear usuario de Firebase Auth: ${email}`);
  console.log('  - Crear users/{uid} con role: "admin"');
  console.log('  - Crear config/settings con valores iniciales por defecto');

  if (dryRun) {
    return;
  }

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
    console.log(`Usuario ya existía en Firebase Auth (uid=${userRecord.uid}), reutilizando.`);
  } catch (err) {
    if (err.code !== 'auth/user-not-found') throw err;
    userRecord = await auth.createUser({ email, emailVerified: false });
    console.log(`Usuario creado en Firebase Auth (uid=${userRecord.uid}).`);
    console.log('Envía al administrador un enlace de restablecimiento de contraseña antes de que inicie sesión:');
    console.log(`  ${await auth.generatePasswordResetLink(email)}`);
  }

  await db.collection('users').doc(userRecord.uid).set(
    {
      role: 'admin',
      nombre: nombre || 'Administrador',
      email,
      activo: true,
      creadoPorBootstrap: true,
      creadoEn: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await settingsRef.set({
    bootstrapCompletado: true,
    bootstrapEn: FieldValue.serverTimestamp(),
  });

  console.log('Bootstrap completado. isFirstStart() ya no existe en firestore.rules: este fue el único punto de entrada.');
}

main().catch((err) => {
  console.error('Bootstrap falló:', err);
  process.exitCode = 1;
});
