

export async function getBoardById(boardId: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/board/getBoard/${boardId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!res.ok) {
    throw new Error(`No se pudo obtener el tablero: ${res.status} ${res.statusText}`);
  }
  
  return await res.json();
}

export async function updateBoardById(boardId: string, data: any, token: string) {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('isPublic', data.isPublic ? 'true' : 'false');
  
  // Agregar etiquetas
  if (data.tags && Array.isArray(data.tags)) {
    data.tags.forEach(tag => {
      formData.append('tags', tag);
    });
  }
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/board/updateBoard/${boardId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!res.ok) {
    if (res.status === 403) {
      throw new Error('No tienes permisos para editar este tablero. Solo el creador puede editarlo.');
    }
    throw new Error(`Error ${res.status}: No se pudo actualizar el tablero`);
  }
  return await res.json();
}

export async function addMemberToBoard(boardId: string | number, userId: number, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/board/addMember/${boardId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ member_id: userId }),
  });

  if (!res.ok) {
    throw new Error('No se pudo agregar el miembro al tablero');
  }
  return await res.json();
}

export async function deleteBoardById(boardId: string | number, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/board/deleteBoard/${boardId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error('No tienes permisos para eliminar este tablero. Solo el creador puede eliminarlo.');
    }
    throw new Error('No se pudo eliminar el tablero');
  }
  return await res.json();
}

export async function removeMemberFromBoard(boardId: string | number, userId: number, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/board/removeMember`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      boardId: parseInt(boardId.toString()),
      userId: userId
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    if (res.status === 403) {
      throw new Error('No tienes permisos para eliminar miembros de este tablero.');
    }
    throw new Error('No se pudo eliminar el miembro del tablero');
  }
  return await res.json();
}