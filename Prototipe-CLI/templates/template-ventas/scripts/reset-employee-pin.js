#!/usr/bin/env node
/* eslint-env node */

/**
 * reset-employee-pin.js — SEC-015
 *
 * Cambia el PIN de un empleado que YA tiene cuenta de Firebase Auth
 * (authUid en employees/{id}), usando el Admin SDK. Necesario porque el
 * correo sintético del empleado (employee-<id>@internal.prototipe.local)
 * es fijo, y Firebase no permite recrear una cuenta con el mismo correo
 * desde el cliente — cambiar la contraseña de OTRA cuenta siempre requiere
 * Admin SDK, nunca el panel. Solo el fundador ejecuta este script,
 * localmente, con sus propias credenciales — nunca una IA.
 *
 * Para el PRIMER PIN de un empleado nuevo (sin authUid todavía), usa el
 * panel admin normal (EmployeeSettings) — ese caso sí es 100% client-side.
 *
 * Requisitos previos (el fundador los provee, esta IA nunca los lee):
 *   - Variable de entorno GOOGLE_APPLICATION_CREDENTIALS apuntando a un
 *     archivo de service account JSON del proyecto Firebase real del cliente.
 *
 * Uso:
 *   GOOGLE_APPLICATION_CREDENTIALS=./ruta/service-account.json \
 *     node scripts/reset-employee-pin.js --employee-id <id> --new-pin <6 dígitos>
 *
 *   Agrega --dry-run para ver qué haría sin escribir nada.
 */

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--employee-id') {
      args.employeeId = argv[i + 1];
      i += 1;
    } else if (arg === '--new-pin') {
      args.newPin = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

async function main() {
  const { employeeId, newPin, dryRun } = parseArgs(process.argv.slice(2));

  if (!employeeId || !newPin) {
    console.error(
      'Uso: node scripts/reset-employee-pin.js --employee-id <id> --new-pin <6 dígitos> [--dry-run]'
    );
    process.exitCode = 1;
    return;
  }

  if (!/^\d{6}$/.test(newPin)) {
    console.error('El nuevo PIN debe ser exactamente 6 dígitos numéricos (mismo formato que usa el panel).');
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

  const empRef = db.collection('employees').doc(employeeId);
  const empSnap = await empRef.get();

  if (!empSnap.exists) {
    console.error(`No existe employees/${employeeId}.`);
    process.exitCode = 1;
    return;
  }

  const { authUid, nombre } = empSnap.data();

  if (!authUid) {
    console.error(
      `employees/${employeeId} (${nombre || 'sin nombre'}) todavía no tiene cuenta de Auth. ` +
        'Para su PRIMER PIN usa el panel admin (EmployeeSettings), no este script.'
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Reset de PIN SEC-015 ${dryRun ? '(dry-run, no se escribe nada)' : ''}`);
  console.log(`  - Empleado: ${nombre || employeeId} (employeeId=${employeeId}, authUid=${authUid})`);
  console.log('  - Actualizar contraseña de la cuenta de Auth con el nuevo PIN');

  if (dryRun) {
    return;
  }

  await auth.updateUser(authUid, { password: newPin });

  console.log('PIN actualizado. El empleado ya puede iniciar sesión en /portal/auth con el nuevo PIN.');
}

main().catch((err) => {
  console.error('Reset de PIN falló:', err);
  process.exitCode = 1;
});
