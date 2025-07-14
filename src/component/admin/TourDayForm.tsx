/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { createTourDay, updateTourDay } from "@/lib/actions/tourDays";
import { X, Save, Loader2, Calendar } from "lucide-react";

interface TourDayFormProps {
  tourDay?: any;
  packageId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TourDayForm({ tourDay: tourDayData, packageId, onSuccess, onCancel }: TourDayFormProps) {

  const [formData, setFormData] = useState({
    dayNumber: tourDayData?.dayNumber || 1,
    title: tourDayData?.title || "",
    activities: tourDayData?.activities || [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = tourDayData?.id 
        ? await updateTourDay({ ...formData, id: tourDayData.id, packageId })
        : await createTourDay({ ...formData, packageId });

      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || "Failed to save tour day");
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

  const handleActivitiesChange = (value: string) => {
    // Split by newlines and filter out empty lines
    const activities = value.split('\n').filter(activity => activity.trim());
    setFormData(prev => ({
      ...prev,
      activities
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {tourDayData?.id ? "Edit Tour Day" : "Add Tour Day"}
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

          {/* Day Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Day Number *
            </label>
            <input
              type="number"
              min="1"
              value={formData.dayNumber}
              onChange={(e) => handleInputChange("dayNumber", parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="1"
              required
            />
          </div>

          {/* Day Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Day Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Welcome to Edinburgh"
              required
            />
          </div>



          {/* Activities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activities *
            </label>
            <textarea
              value={formData.activities.join('\n')}
              onChange={(e) => handleActivitiesChange(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter activities (one per line):

Example:
Arrival in Istanbul and transfer to hotel
Visit Sultanahmet Square
Blue Mosque (Sultan Ahmed Mosque)
Hagia Sophia
Basilica Cistern
Stroll through Hippodrome of Constantinople
Welcome dinner at a traditional Turkish restaurant"
              required
            />
            <div className="mt-2 text-xs text-gray-500">
              <p>• Enter each activity on a new line</p>
              <p>• Empty lines will be automatically removed</p>
            </div>
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
                  {tourDayData?.id ? "Update Tour Day" : "Add Tour Day"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 