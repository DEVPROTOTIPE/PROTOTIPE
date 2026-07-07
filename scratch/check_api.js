
async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/roadmap/git-status');
    const data = await res.json();
    console.log("=== GIT MODIFIED FILES ===");
    console.log(data);
  } catch (err) {
    console.error("Error al consultar la API:", err.message);
  }
}

test();
