"use client";

import React, { useState, useEffect, useCallback } from "react";


interface PackageDate {
  id?: number;
  startDate: string;
  endDate: string;
  maxPeople: number;
}

interface PackageDateFormProps {
  packageId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PackageDateForm({ packageId, onClose, onSuccess }: PackageDateFormProps) {

  const [dates, setDates] = useState<PackageDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadPackageDates = useCallback(async () => {
    try {
      const response = await fetch(`/api/packages/${packageId}/dates`);
      if (response.ok) {
        const data = await response.json();
        setDates(data.dates || []);
      } else {
        console.error("Failed to load package dates:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to load package dates:", error);
    }
  }, [packageId]);

  useEffect(() => {
    loadPackageDates();
  }, [loadPackageDates]);

  const addDate = () => {
    setDates([...dates, { startDate: "", endDate: "", maxPeople: 1 }]);
  };

  const removeDate = (index: number) => {
    setDates(dates.filter((_, i) => i !== index));
  };

  const updateDate = (index: number, field: keyof PackageDate, value: string | number) => {
    const newDates = [...dates];
    newDates[index] = { ...newDates[index], [field]: value };
    setDates(newDates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate dates
    const validDates = dates.filter(date => 
      date.startDate && date.endDate && date.maxPeople > 0
    );

    if (validDates.length === 0) {
      setError("Please add at least one valid date");
      setLoading(false);
      return;
    }

    // Validate that end date is after start date
    for (const date of validDates) {
      if (new Date(date.endDate) <= new Date(date.startDate)) {
        setError("End date must be after start date");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`/api/packages/${packageId}/dates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dates: validDates }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to save dates");
      }
    } catch (error) {
      console.error("Failed to save dates:", error);
      setError("Failed to save dates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Package Dates</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {dates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No dates added yet. Click Add Date to get started.</p>
              </div>
            )}
            {dates.map((date, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={date.startDate}
                      onChange={(e) => updateDate(index, "startDate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={date.endDate}
                      onChange={(e) => updateDate(index, "endDate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max People
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={date.maxPeople}
                      onChange={(e) => updateDate(index, "maxPeople", parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDate(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addDate}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium"
            >
              + Add Date
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Dates"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 