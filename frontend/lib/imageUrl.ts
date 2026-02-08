export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  
  // Если это уже полный URL (http/https), возвращаем как есть
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Если это эмодзи или короткая строка без расширения файла, возвращаем как есть
  if (path.length <= 3 || (!path.includes('.') && !path.startsWith('/'))) {
    return path;
  }
  
  // Если путь начинается с / и содержит расширение файла (например, .png, .jpg),
  // это статический файл из папки public - возвращаем как есть
  if (path.startsWith('/') && (path.includes('.png') || path.includes('.jpg') || path.includes('.jpeg') || path.includes('.webp') || path.includes('.gif'))) {
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
