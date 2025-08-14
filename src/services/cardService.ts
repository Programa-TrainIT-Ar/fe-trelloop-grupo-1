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