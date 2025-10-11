import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { LaundryRequest } from '@/types';

interface LaundryRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LaundryRequestForm: React.FC<LaundryRequestFormProps> = React.memo(({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<string[]>(['']);
  const [pickupDate, setPickupDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setItems([...items, '']);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      const filteredItems = items.filter(item => item.trim() !== '');
      
      const newRequest: Omit<LaundryRequest, 'id'> = {
        studentId: currentUser.uid,
        studentName: currentUser.name,
        items: filteredItems,
        status: 'pending',
        pickupDate: new Date(pickupDate),
        notes: notes.trim() || undefined,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'laundryRequests'), newRequest);
      
      // Reset form
      setItems(['']);
      setPickupDate('');
      setNotes('');
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating laundry request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Laundry Request" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Items for Laundry</label>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder="e.g., 2 shirts, 1 trouser"
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                  required={index === 0}
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-2 flex items-center text-sm text-primary-500 hover:text-primary-600"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </button>
        </div>

        <Input
          type="datetime-local"
          label="Pickup Date & Time"
          value={pickupDate}
          onChange={(e) => setPickupDate(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
          <textarea
            placeholder="Any special instructions or notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Request
          </Button>
        </div>
      </form>
    </Modal>
  );
});

LaundryRequestForm.displayName = 'LaundryRequestForm';

export default LaundryRequestForm;