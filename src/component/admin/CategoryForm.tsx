
"use client";

import React from "react";
import { CATEGORIES } from "@/lib/Validation";
import { X, Tag } from "lucide-react";

interface CategoryFormProps {
  onCancel?: () => void;
}

export default function CategoryForm({ onCancel }: CategoryFormProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Tag className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Available Categories
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories List */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Categories are predefined and cannot be modified. When creating packages, you can select from these available categories:
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((category) => (
              <div
                key={category}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-center font-medium text-gray-700"
              >
                {category}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 p-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 