import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../hooks/useToast';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onAvatarUpdate: (avatar: string | null) => void;
}

export default function AvatarUpload({ currentAvatar, onAvatarUpdate }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success: showSuccess, error: showError } = useToast();
  const { accessToken } = useAuthStore();

  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'video/mp4'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const getAvatarUrl = (filename: string | null | undefined) => {
    if (!filename) return null;
    return `http://localhost:4000/uploads/avatars/${filename}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!ALLOWED_TYPES.includes(file.type)) {
      showError('Недопустимый формат файла. Разрешены: PNG, JPG, JPEG, WEBP, GIF, MP4');
      return;
    }

    // Проверка размера файла
    if (file.size > MAX_SIZE) {
      showError('Файл слишком большой. Максимальный размер: 10MB');
      return;
    }

    // Определяем тип файла
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setFileType(type);

    // Создаем превью
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Загружаем файл
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    if (!accessToken) {
      showError('Необходимо авторизоваться');
      console.error('No access token found');
      return;
    }

    console.log('Uploading with token:', accessToken?.substring(0, 20) + '...');
    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('http://localhost:4000/api/users/avatar/upload', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка загрузки');
      }

      const data = await response.json();
      onAvatarUpdate(data.avatar);
      showSuccess('Аватар успешно загружен!');
      setPreview(null);
    } catch (error: any) {
      showError(error.message || 'Ошибка загрузки аватара');
      setPreview(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!accessToken) {
      showError('Необходимо авторизоваться');
      return;
    }

    if (!confirm('Вы уверены, что хотите удалить аватар?')) return;

    setIsUploading(true);
    try {
      const response = await fetch('http://localhost:4000/api/users/avatar/delete', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления');
      }

      onAvatarUpdate(null);
      showSuccess('Аватар успешно удален');
    } catch (error) {
      showError('Ошибка удаления аватара');
    } finally {
      setIsUploading(false);
    }
  };

  const currentAvatarUrl = getAvatarUrl(currentAvatar);
  const currentFileType = currentAvatar?.endsWith('.mp4') ? 'video' : 'image';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Превью аватара */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden glass border-4 border-primary/20">
          <AnimatePresence mode="wait">
            {preview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                {fileType === 'video' ? (
                  <video
                    src={preview}
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </motion.div>
            ) : currentAvatarUrl ? (
              <motion.div
                key="current"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                {currentFileType === 'video' ? (
                  <video
                    src={currentAvatarUrl}
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={currentAvatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20"
              >
                <svg
                  className="w-16 h-16 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Индикатор загрузки */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {/* Кнопки управления */}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.gif,.mp4"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="btn-primary px-6 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentAvatar ? 'Изменить аватар' : 'Загрузить аватар'}
        </motion.button>

        {currentAvatar && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            disabled={isUploading}
            className="px-6 py-2 text-sm rounded-lg font-medium text-destructive hover:bg-destructive/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Удалить
          </motion.button>
        )}
      </div>

      {/* Подсказка */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Поддерживаемые форматы: PNG, JPG, JPEG, WEBP, GIF, MP4
        <br />
        Максимальный размер: 10MB
      </p>
    </div>
  );
}
