const taskIds = [
  'CLI-406', 'BUG-405', 'CLI-404', 'BUG-404', 'CLI-403', 'CLI-402', 'CLI-401', 'CLI-400', 'CLI-399', 'CLI-398', 'CLI-397', 'CLI-396-HOTFIX', 'CLI-396', 'DOC-MEMBER-PROVISIONING', 'CLI-393', 'CLI-392-HOTFIX-ZOD', 'CLI-392', 'CLI-391', 'CLI-390-DYNAMIC-SOURCE', 'CLI-390', 'CLI-389-BENTO-MATCH', 'CLI-389', 'CLI-388', 'CLI-387', 'CLI-386', 'CLI-385', 'CLI-384', 'CLI-383', 'CLI-382', 'CLI-380', 'CLI-379', 'CLI-378'
];

async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/git/link-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ taskIds })
    });
    if (!res.ok) {
      console.error(`Error HTTP: ${res.status}`);
      return;
    }
    const data = await res.json();
    console.log('Link Success:', data.success);
    console.log('Message:', data.message);
  } catch (err) {
    console.error('Error al conectar con el servidor:', err.message);
  }
}
test();
