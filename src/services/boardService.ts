export async function getBoardById(boardId: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_API}/board/getBoard/${boardId}`;
  
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!res.ok) {
    throw new Error(`No se pudo obtener el tablero: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  console.log('Respuesta completa de la API:', data);
  return data;
}

export async function updateBoardById(boardId: string, data: any, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/board/updateBoard/${boardId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('No se pudo actualizar el tablero');
  return await res.json();
}

export async function deleteBoardById(boardId: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/board/deleteBoard/${boardId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('No se pudo eliminar el tablero');
  return await res.json();
}