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

export async function getCardById(cardId: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_API}/card/getCard/${cardId}`;
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      throw new Error(`No se pudo obtener la tarjeta: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error en getCardById:', error);
    throw error;
  }
}

export async function updateCardById(cardId: string, cardData: any, token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/card/updateCard/${cardId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cardData),
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: No se pudo actualizar la tarjeta`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error en updateCardById:', error);
    throw error;
  }
}

export async function deleteCardById(cardId: string, token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/card/deleteCard/${cardId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('No se pudo eliminar la tarjeta');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error en deleteCardById:', error);
    throw error;
  }
}

export async function getCardMembers(cardId: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_API}/card/getMembers/${cardId}`;
  console.log('Obteniendo miembros de tarjeta:', { cardId, url });
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Respuesta getCardMembers:', res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error(`Error ${res.status}: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('Miembros obtenidos:', data);
    return data;
  } catch (error) {
    console.error('Error en getCardMembers:', error);
    throw error;
  }
}

export async function addCardMember(cardId: string, userId: number, token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/card/addMembers/${cardId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      throw new Error('No se pudo agregar el miembro');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error en addCardMember:', error);
    throw error;
  }
}

export async function removeCardMember(cardId: string, userId: number, token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/card/removeMember/${cardId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      throw new Error('No se pudo eliminar el miembro');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error en removeCardMember:', error);
    throw error;
  }
}

export async function searchUsersByEmail(email: string, token: string) {
  try {
    const url = `${process.env.NEXT_PUBLIC_API}/board/users/search?q=${encodeURIComponent(email)}`;
    console.log('URL de búsqueda:', url);
    console.log('Email a buscar:', email);
    console.log('Token completo:', token);
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Status de respuesta:', res.status);
    console.log('Response OK:', res.ok);

    if (res.status === 401) {
      console.error('Token expirado o inválido');
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error del servidor:', errorText);
      throw new Error(`Error ${res.status}: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('Datos recibidos:', data);
    return data.users || [];
  } catch (error) {
    console.error('Error en searchUsersByEmail:', error);
    throw error;
  }
}