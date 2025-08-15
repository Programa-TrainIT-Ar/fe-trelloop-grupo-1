export async function getAllTags(token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/tag/getTags`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error('No se pudieron obtener las etiquetas');
    }
    
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Error en getAllTags:', error);
    throw error;
  }
}

export async function createTag(name: string, token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/tag`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      throw new Error('No se pudo crear la etiqueta');
    }
    
    const data = await res.json();
    return data.tag;
  } catch (error) {
    console.error('Error en createTag:', error);
    throw error;
  }
}