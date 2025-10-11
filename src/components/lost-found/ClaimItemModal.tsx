import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import type { LostItem } from '@/types';

interface ClaimItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: LostItem | null;
  onSubmit: (description: string, details: string) => void;
}

const ClaimItemModal: React.FC<ClaimItemModalProps> = React.memo(({
  isOpen,
  onClose,
  item,
  onSubmit
}) => {
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(description, details);
      setDescription('');
      setDetails('');
      onClose();
    } catch (error) {
      console.error('Error submitting claim:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Claim Lost Item">
      {item && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Item Details</h4>
            <p className="text-sm text-gray-600">{item.description}</p>
            <p className="text-xs text-gray-500 mt-1">Found at: {item.location}</p>
          </div>

          <Input
            label="Describe your lost item"
            placeholder="Provide a detailed description of your lost item..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Color, brand, unique marks, when/where you lost it..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              Your claim will be reviewed by an administrator. You'll be notified once the verification is complete.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Submit Claim
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
});

ClaimItemModal.displayName = 'ClaimItemModal';

export default ClaimItemModal;