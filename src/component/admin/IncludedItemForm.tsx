/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { createIncludedItem, updateIncludedItem } from "@/lib/actions/includedItems";
import { X, Save, Loader2, Check } from "lucide-react";

interface IncludedItemFormProps {
  item?: any;
  packageId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function IncludedItemForm({ item: itemData, packageId, onSuccess, onCancel }: IncludedItemFormProps) {
  const [formData, setFormData] = useState({
    text: itemData?.text || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = itemData?.id 
        ? await updateIncludedItem({ ...formData, id: itemData.id, packageId })
        : await createIncludedItem({ ...formData, packageId });

      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || "Failed to save included item");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {itemData?.id ? "Edit Included Item" : "Add Included Item"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Item Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Included Item *
            </label>
            <input
              type="text"
              value={formData.text}
              onChange={(e) => handleInputChange("text", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., 3 Nights Accommodation, Airport Transfers"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {itemData?.id ? "Update Item" : "Add Item"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 