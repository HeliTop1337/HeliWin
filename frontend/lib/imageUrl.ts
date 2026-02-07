export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  
  // Если это уже полный URL (http/https), возвращаем как есть
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Если путь начинается с /uploads/, добавляем базовый URL бэкенда
  if (path.startsWith('/uploads/')) {
    return `http://localhost:4000${path}`;
  }
  
  // Если путь не начинается со слеша, добавляем его
  if (!path.startsWith('/')) {
    return `http://localhost:4000/uploads/${path}`;
  }
  
  return `http://localhost:4000${path}`;
}
