// Script de debugging para verificar autenticación
// Ejecutar en la consola del navegador

function debugAuth() {
  // 1. Verificar localStorage
  const authStorage = localStorage.getItem('auth-storage');
  console.log('Auth storage:', authStorage);
  
  if (authStorage) {
    const authData = JSON.parse(authStorage);
    console.log('Auth data:', authData);
    
    const token = authData?.state?.accessToken;
    console.log('Token:', token ? 'Presente' : 'Ausente');
    
    if (token) {
      // 2. Decodificar JWT
      try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        console.log('JWT decodificado:', decoded);
        console.log('User ID en JWT:', decoded.sub || decoded.user_id || decoded.identity);
        console.log('Expira en:', new Date(decoded.exp * 1000));
      } catch (error) {
        console.error('Error al decodificar JWT:', error);
      }
    }
  }
}

// Ejecutar la función
debugAuth();