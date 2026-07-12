async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/integrity/status');
    if (!res.ok) {
      console.error(`Error HTTP: ${res.status}`);
      return;
    }
    const data = await res.json();
    console.log('Success:', data.success);
    console.log('Roadmap Drifts:', data.roadmapDrifts?.length || 0);
    console.log('Code Drifts:', data.codeDrifts?.length || 0);
    console.log('Commit Drifts:', data.commitDrifts?.length || 0);
    if (data.commitDrifts?.length > 0) {
      console.log('IDs en Commit Drifts:', data.commitDrifts.map(d => d.id).join(', '));
    }
  } catch (err) {
    console.error('Error al conectar con el servidor:', err.message);
  }
}
test();
