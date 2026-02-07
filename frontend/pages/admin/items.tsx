import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import Link from 'next/link';

export default function AdminItems() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    rarity: 'STALKER',
    basePrice: 0,
    icon: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
      router.push('/');
      return;
    }
    fetchItems();
  }, [isAuthenticated, user, router]);

  const fetchItems = async () => {
    try {
      const { data } = await api.get('/api/admin/items');
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('category', formData.category);
      submitData.append('rarity', formData.rarity);
      submitData.append('basePrice', formData.basePrice.toString());
      
      if (selectedFile) {
        submitData.append('icon', selectedFile);
      } else if (formData.icon) {
        submitData.append('icon', formData.icon);
      }

      if (editingItem) {
        await api.patch(`/api/admin/items/${editingItem.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/api/admin/items', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({ name: '', category: '', rarity: 'STALKER', basePrice: 0, icon: '' });
      setSelectedFile(null);
      setPreviewUrl('');
      fetchItems();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Ошибка сохранения');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      rarity: item.rarity,
      basePrice: item.basePrice,
      icon: item.icon,
    });
    setPreviewUrl(item.icon);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить предмет?')) return;
    try {
      await api.delete(`/api/admin/items/${id}`);
      fetchItems();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Ошибка удаления');
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      STALKER: 'from-blue-500 to-blue-600',
      VETERAN: 'from-purple-500 to-purple-600',
      MASTER: 'from-orange-500 to-orange-600',
      LEGENDARY: 'from-yellow-500 to-yellow-600',
    };
    return colors[rarity] || 'from-gray-500 to-gray-600';
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-muted-foreground hover:text-foreground transition mb-2 inline-block">
              ← Назад к панели
            </Link>
            <h1 className="text-4xl font-bold">Управление предметами</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingItem(null);
              setFormData({ name: '', category: '', rarity: 'STALKER', basePrice: 0, icon: '' });
              setSelectedFile(null);
              setPreviewUrl('');
              setShowModal(true);
            }}
            className="btn-primary"
          >
            Создать предмет
          </motion.button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item: any) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl p-6"
              >
                <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${getRarityColor(item.rarity)} mb-4 flex items-center justify-center`}>
                  {item.icon ? (
                    <img src={item.icon} alt={item.name} className="w-20 h-20 object-contain" />
                  ) : (
                    <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-1 truncate">{item.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">{item.category}</p>
                <p className="text-sm text-muted-foreground mb-3">{item.rarity}</p>
                <p className="text-lg font-bold text-primary mb-4">{item.basePrice} ₽</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90 transition"
                  >
                    Удалить
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold mb-6">
                  {editingItem ? 'Редактировать предмет' : 'Создать предмет'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Название</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full glass px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Название предмета"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Категория</label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full glass px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Оружие, Броня, и т.д."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Редкость</label>
                    <select
                      value={formData.rarity}
                      onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                      className="w-full glass px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="STALKER">Сталкерское</option>
                      <option value="VETERAN">Ветеранское</option>
                      <option value="MASTER">Мастерское</option>
                      <option value="LEGENDARY">Легендарное</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Цена (₽)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                      className="w-full glass px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="100.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Картинка</label>
                    <div className="space-y-3">
                      <div>
                        <label className="block w-full cursor-pointer">
                          <div className="glass px-4 py-3 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 transition text-center">
                            <svg className="w-8 h-8 mx-auto mb-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm text-muted-foreground">
                              {selectedFile ? selectedFile.name : 'Выберите файл или перетащите сюда'}
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="text-center text-sm text-muted-foreground">или</div>
                      <input
                        type="url"
                        value={formData.icon}
                        onChange={(e) => {
                          setFormData({ ...formData, icon: e.target.value });
                          setPreviewUrl(e.target.value);
                          setSelectedFile(null);
                        }}
                        className="w-full glass px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="https://example.com/image.png"
                      />
                      <p className="text-xs text-muted-foreground">
                        Загрузите файл или вставьте прямую ссылку на изображение
                      </p>
                    </div>
                  </div>
                  {previewUrl && (
                    <div className="glass rounded-xl p-4">
                      <p className="text-sm font-medium mb-2">Предпросмотр:</p>
                      <div className={`w-32 h-32 mx-auto rounded-xl bg-gradient-to-br ${getRarityColor(formData.rarity)} flex items-center justify-center`}>
                        <img src={previewUrl} alt="Preview" className="w-24 h-24 object-contain" />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 btn-secondary"
                    >
                      Отмена
                    </button>
                    <button type="submit" className="flex-1 btn-primary">
                      {editingItem ? 'Сохранить' : 'Создать'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
