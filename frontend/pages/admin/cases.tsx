import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/api';
import { getImageUrl } from '../../lib/imageUrl';
import Link from 'next/link';
import { ToastContainer } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';

interface Item {
  id: string;
  name: string;
  category: string;
  rarity: string;
  basePrice: number;
  icon: string;
}

interface CaseItem {
  id: string;
  itemId: string;
  dropChance: number;
  item: Item;
}

interface Case {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  icon: string;
  isActive: boolean;
  items: CaseItem[];
}

export default function AdminCases() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [cases, setCases] = useState<Case[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [showItemsModal, setShowItemsModal] = useState<Case | null>(null);
  const { toasts, removeToast, success: showSuccess, error: showError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '0',
    icon: '',
    isActive: true,
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
      router.push('/');
      return;
    }
    fetchData();
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    try {
      const [casesRes, itemsRes] = await Promise.all([
        api.get('/api/admin/cases'),
        api.get('/api/admin/items'),
      ]);
      setCases(casesRes.data);
      setAllItems(itemsRes.data);
    } catch (error) {
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('discount', formData.discount);
    data.append('isActive', formData.isActive.toString());
    
    if (iconFile) {
      data.append('icon', iconFile);
    } else if (formData.icon) {
      data.append('icon', formData.icon);
    }

    try {
      if (editingCase) {
        await api.patch(`/api/admin/cases/${editingCase.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showSuccess('Кейс обновлен');
      } else {
        await api.post('/api/admin/cases', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showSuccess('Кейс создан');
      }
      
      resetForm();
      fetchData();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Ошибка сохранения кейса');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discount: '0',
      icon: '',
      isActive: true,
    });
    setIconFile(null);
    setIconPreview('');
    setShowCreateModal(false);
    setEditingCase(null);
  };

  const handleEdit = (caseData: Case) => {
    setEditingCase(caseData);
    setFormData({
      name: caseData.name,
      description: caseData.description || '',
      price: caseData.price.toString(),
      discount: caseData.discount.toString(),
      icon: caseData.icon || '',
      isActive: caseData.isActive,
    });
    setIconPreview(caseData.icon || '');
    setShowCreateModal(true);
  };

  const handleDelete = async (caseId: string) => {
    if (!confirm('Удалить кейс? Это действие нельзя отменить.')) return;
    
    try {
      await api.delete(`/api/admin/cases/${caseId}`);
      showSuccess('Кейс удален');
      fetchData();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Ошибка удаления кейса');
    }
  };

  const handleAddItem = async (caseId: string, itemId: string, dropChance: number) => {
    try {
      await api.post(`/api/admin/cases/${caseId}/items`, { itemId, dropChance });
      showSuccess('Предмет добавлен в кейс');
      fetchData();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Ошибка добавления предмета');
    }
  };

  const handleRemoveItem = async (caseId: string, itemId: string) => {
    try {
      await api.delete(`/api/admin/cases/${caseId}/items/${itemId}`);
      showSuccess('Предмет удален из кейса');
      fetchData();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Ошибка удаления предмета');
    }
  };

  const handleUpdateChance = async (caseId: string, itemId: string, dropChance: number) => {
    try {
      await api.patch(`/api/admin/cases/${caseId}/items/${itemId}`, { dropChance });
      showSuccess('Шанс обновлен');
      fetchData();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Ошибка обновления шанса');
    }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return null;
  }

  return (
    <div className="py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-muted-foreground hover:text-foreground transition mb-2 inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Назад к админке
              </Link>
              <h1 className="text-4xl font-bold mb-2">Управление кейсами</h1>
              <p className="text-muted-foreground">Всего кейсов: {cases.length}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 rounded-xl font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Создать кейс
            </motion.button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cases.map((c, i) => (
                <CaseCard
                  key={c.id}
                  caseData={c}
                  index={i}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onManageItems={setShowItemsModal}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <CreateCaseModal
        show={showCreateModal}
        onClose={resetForm}
        formData={formData}
        setFormData={setFormData}
        iconPreview={iconPreview}
        onIconChange={handleIconChange}
        onSubmit={handleSubmit}
        isEditing={!!editingCase}
      />

      <ManageItemsModal
        caseData={showItemsModal}
        onClose={() => setShowItemsModal(null)}
        allItems={allItems}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onUpdateChance={handleUpdateChance}
      />
    </div>
  );
}

function CaseCard({ caseData, index, onEdit, onDelete, onManageItems }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass rounded-2xl p-6"
    >
      {caseData.icon && (
        <div className="mb-4 h-32 rounded-xl overflow-hidden bg-background/50">
          <img 
            src={getImageUrl(caseData.icon)} 
            alt={caseData.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23333" width="200" height="200"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">{caseData.name}</h3>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          caseData.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
        }`}>
          {caseData.isActive ? 'Активен' : 'Неактивен'}
        </div>
      </div>
      
      {caseData.description && (
        <p className="text-sm text-muted-foreground mb-4">{caseData.description}</p>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-muted-foreground">Цена</div>
          <div className="text-2xl font-bold text-primary">{caseData.price.toFixed(2)} ₽</div>
        </div>
        {caseData.discount > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{caseData.discount}%
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        Предметов: {caseData.items?.length || 0}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onManageItems(caseData)}
          className="px-3 py-2 bg-blue-500/10 text-blue-500 rounded-xl text-sm font-semibold hover:bg-blue-500/20 transition"
        >
          Предметы
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onEdit(caseData)}
          className="px-3 py-2 bg-yellow-500/10 text-yellow-500 rounded-xl text-sm font-semibold hover:bg-yellow-500/20 transition"
        >
          Изменить
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onDelete(caseData.id)}
          className="px-3 py-2 bg-red-500/10 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-500/20 transition"
        >
          Удалить
        </motion.button>
      </div>
    </motion.div>
  );
}

function CreateCaseModal({ show, onClose, formData, setFormData, iconPreview, onIconChange, onSubmit, isEditing }: any) {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">{isEditing ? 'Редактировать кейс' : 'Создать кейс'}</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Название</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Цена (₽)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Скидка (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Иконка кейса</label>
              <div className="flex items-center gap-4">
                {iconPreview && (
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-background/50">
                    <img 
                      src={iconPreview.startsWith('data:') ? iconPreview : getImageUrl(iconPreview)} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                )}
                <label className="flex-1 px-4 py-3 bg-background/50 border border-border rounded-xl cursor-pointer hover:bg-background/70 transition text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onIconChange}
                    className="hidden"
                  />
                  <span className="text-sm text-muted-foreground">Выбрать файл</span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Или введите URL изображения:</p>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="https://example.com/image.png"
                className="w-full px-4 py-2 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary mt-2"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-border"
              />
              <label htmlFor="isActive" className="text-sm font-semibold cursor-pointer">
                Активен
              </label>
            </div>

            <div className="flex gap-4">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 rounded-xl font-semibold"
              >
                {isEditing ? 'Сохранить' : 'Создать'}
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-6 py-3 bg-background/50 rounded-xl font-semibold"
              >
                Отмена
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ManageItemsModal({ caseData, onClose, allItems, onAddItem, onRemoveItem, onUpdateChance }: any) {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [dropChance, setDropChance] = useState('10');
  const [editingChances, setEditingChances] = useState<Record<string, string>>({});

  if (!caseData) return null;

  const caseItemIds = new Set(caseData.items.map((ci: CaseItem) => ci.itemId));
  const availableItems = allItems.filter((item: Item) => !caseItemIds.has(item.id));

  const handleAdd = () => {
    if (!selectedItemId || !dropChance) return;
    onAddItem(caseData.id, selectedItemId, parseFloat(dropChance));
    setSelectedItemId('');
    setDropChance('10');
  };

  const handleUpdateChance = (itemId: string) => {
    const newChance = editingChances[itemId];
    if (newChance) {
      onUpdateChance(caseData.id, itemId, parseFloat(newChance));
      setEditingChances({ ...editingChances, [itemId]: '' });
    }
  };

  const totalChance = caseData.items.reduce((sum: number, ci: CaseItem) => sum + ci.dropChance, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">{caseData.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Всего шансов: {totalChance.toFixed(2)}%
              </p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-8 p-6 bg-background/50 rounded-xl">
            <h3 className="text-lg font-bold mb-4">Добавить предмет</h3>
            <div className="flex gap-4">
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="flex-1 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Выберите предмет</option>
                {availableItems.map((item: Item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.rarity}) - {item.basePrice}₽
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={dropChance}
                onChange={(e) => setDropChance(e.target.value)}
                placeholder="Шанс %"
                className="w-32 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                disabled={!selectedItemId}
                className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Добавить
              </motion.button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Предметы в кейсе ({caseData.items.length})</h3>
            <div className="space-y-3">
              {caseData.items.map((ci: CaseItem) => (
                <div key={ci.id} className="flex items-center gap-4 p-4 bg-background/30 rounded-xl">
                  {ci.item.icon && (
                    <img 
                      src={getImageUrl(ci.item.icon)} 
                      alt={ci.item.name} 
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">{ci.item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {ci.item.rarity} • {ci.item.basePrice}₽
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={editingChances[ci.itemId] !== undefined ? editingChances[ci.itemId] : ci.dropChance}
                      onChange={(e) => setEditingChances({ ...editingChances, [ci.itemId]: e.target.value })}
                      className="w-24 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                    {editingChances[ci.itemId] !== undefined && editingChances[ci.itemId] !== ci.dropChance.toString() && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleUpdateChance(ci.itemId)}
                        className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onRemoveItem(caseData.id, ci.itemId)}
                      className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
