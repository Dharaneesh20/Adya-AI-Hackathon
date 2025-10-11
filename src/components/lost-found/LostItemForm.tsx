import React, { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { createLostItem } from '@/services/firestore';
import { uploadLostItemImage, resizeImage } from '@/services/storage';

interface LostItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LostItemForm: React.FC<LostItemFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: ''
  });

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Resize image to optimize storage
      const resizedFile = await resizeImage(file, 800, 600);
      setSelectedImage(resizedFile);
      setImagePreview(URL.createObjectURL(resizedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Create lost item record
      const itemResult = await createLostItem({
        ...formData,
        foundBy: user.uid,
        foundByName: user.displayName || user.email || 'Staff Member'
      });

      if (itemResult.success && selectedImage) {
        // Upload image
        const imageResult = await uploadLostItemImage(selectedImage, itemResult.id!);
        
        if (imageResult.success) {
          // Update item with image URL
          await updateDoc(doc(db, 'lostItems', itemResult.id!), {
            imageUrl: imageResult.url
          });
        }
      }

      onSuccess();
      onClose();
      setFormData({ title: '', description: '', location: '', category: '' });
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error submitting lost item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Report Found Item</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Photo *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Item preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload a photo</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageSelect}
                        required
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Title *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Blue Cotton T-Shirt"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description including color, brand, size, etc."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Where Found *
            </label>
            <Input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Laundry Room A, Washing Machine 3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select category</option>
              <option value="clothing">Clothing</option>
              <option value="accessories">Accessories</option>
              <option value="electronics">Electronics</option>
              <option value="documents">Documents</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
            >
              Report Item
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default LostItemForm;