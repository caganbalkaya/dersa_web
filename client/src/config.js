// Merkezi API URL — tüm fetch ve socket.io çağrıları buradan alır
// Production'da .env dosyasındaki VITE_API_URL değiştirilir, başka hiçbir dosyaya dokunulmaz
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
