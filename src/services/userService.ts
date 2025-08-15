export async function searchUsers(query: string, token: string) {
  try {
    // TEMPORAL: Usuarios de prueba hasta que agregues el endpoint
    const mockUsers = [
      { id: 1, first_name: 'Juan', last_name: 'Pérez', username: 'juan.perez' },
      { id: 2, first_name: 'María', last_name: 'García', username: 'maria.garcia' },
      { id: 3, first_name: 'Carlos', last_name: 'López', username: 'carlos.lopez' },
      { id: 4, first_name: 'Ana', last_name: 'Martínez', username: 'ana.martinez' },
      { id: 5, first_name: 'Luis', last_name: 'Rodríguez', username: 'luis.rodriguez' }
    ];
    
    // Filtrar usuarios por query
    if (!query.trim()) return mockUsers;
    
    const filtered = mockUsers.filter((user: any) => 
      user.first_name?.toLowerCase().includes(query.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(query.toLowerCase()) ||
      user.username?.toLowerCase().includes(query.toLowerCase())
    );
    
    return filtered;
  } catch (error) {
    console.error('Error en searchUsers:', error);
    throw error;
  }
}