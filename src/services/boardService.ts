import { id, is } from "date-fns/locale";

// Función para decodificar JWT (solo para debugging)
function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    console.log('JWT decodificado:', decoded);
    return decoded;
  } catch (error) {
    console.error('Error al decodificar JWT:', error);
    return null;
  }
}

export async function getBoardById(boardId: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_API}/board/getBoard/${boardId}`;
  console.log('URL de la API:', url);
  console.log('Token:', token ? 'Token presente' : 'Token ausente');
  
  // Decodificar JWT para ver el user_id
  const jwtPayload = decodeJWT(token);
  console.log('User ID del JWT:', jwtPayload?.sub || jwtPayload?.user_id || jwtPayload?.identity);
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('Status de respuesta:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error del servidor:', errorText);
      throw new Error(`No se pudo obtener el tablero: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('Respuesta completa de la API:', data);
    console.log('User ID del tablero:', data?.userId);
    console.log('Estructura del tablero:', Object.keys(data || {}));
    
    // Comparar user_id del JWT con userId del tablero
    const jwtUserId = jwtPayload?.sub || jwtPayload?.user_id || jwtPayload?.identity;
    console.log('Comparación: JWT user_id ="' + jwtUserId + '" vs Tablero userId=' + data?.userId);
    console.log('Son iguales?', jwtUserId == data?.userId, '(comparación flexible)');
    console.log('Son estrictamente iguales?', jwtUserId === data?.userId, '(comparación estricta)');
    
    return data;
  } catch (error) {
    console.error('Error en getBoardById:', error);
    throw error;
  }
}

export async function updateBoardById(boardId: string, data: any, token: string) {
  console.log('Actualizando tablero:', boardId);
  console.log('Datos a enviar:', data);
  
  // Decodificar JWT para comparar user_id
  const jwtPayload = decodeJWT(token);
  console.log('User ID del JWT en update:', jwtPayload?.sub || jwtPayload?.user_id || jwtPayload?.identity);
  
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('isPublic', data.isPublic ? 'true' : 'false');
  
  // Agregar userId para debugging (temporal)
  const jwtUserId = jwtPayload?.sub || jwtPayload?.user_id || jwtPayload?.identity;
  console.log('Enviando userId en FormData:', jwtUserId);
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/board/updateBoard/${boardId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  console.log('Status de actualización:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Error del servidor:', errorText);
    
    if (res.status === 403) {
      throw new Error('No tienes permisos para editar este tablero. Solo el creador puede editarlo.');
    }
    throw new Error(`Error ${res.status}: No se pudo actualizar el tablero`);
  }
  return await res.json();
}

export async function deleteBoardById(boardId: string | number, token: string) {
  const idNum = Number (boardId);
  if (isNaN(idNum)) {
    throw new Error('El ID del tablero debe ser un número válido');
  }
  try {
    console.log('Eliminando tablero ID:', boardId);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/board/deleteBoard/${boardId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Status de eliminación:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error del servidor:', errorText);
      
      if (res.status === 403) {
        throw new Error('No tienes permisos para eliminar este tablero.');
      }
      if (res.status === 500) {
        throw new Error('Error interno del servidor. Revisa los logs del backend.');
      }
      throw new Error(`Error ${res.status}: No se pudo eliminar el tablero`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error en deleteBoardById:', error);
    throw error;
  }
}