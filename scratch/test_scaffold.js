async function run() {
  try {
    const res = await fetch('http://localhost:3001/api/integrity/scaffold-sandbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        technicalName: 'TestValidationComponent',
        fullName: 'Componente de Validación de Test'
      })
    });
    const data = await res.json();
    console.log("=== API RESPONSE ===");
    console.log(data);
  } catch (err) {
    console.error("Fallo al conectar con la API:", err.message);
  }
}

run();
