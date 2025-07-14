'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import CloudinaryUploader from '../CloudinaryUploader';

interface GalleryImageFormProps {
  packageId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function GalleryImageForm({ packageId, onSuccess, onCancel }: GalleryImageFormProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/gallery-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          packageId,
        }),
      });

      if (response.ok) {
        setUrl('');
        onSuccess?.();
        router.refresh();
      } else {
        console.error('Failed to create gallery image');
      }
    } catch (error) {
      console.error('Error creating gallery image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (uploadedUrls: string[]) => {
    setUrl(uploadedUrls[0] || '');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Add Gallery Image
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gallery Images *
          </label>
          <CloudinaryUploader 
            onChange={handleImageUpload}
            value={url ? [url] : []}
            maxFiles={5}
            className="border-gray-200"
            allowEdit={true}
            allowDelete={true}
            allowReorder={false}
          />
        </div>

        {url && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Image URL"
            />
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!url || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Adding...' : 'Add Image'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
} 