/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { createLocation, updateLocation } from "@/lib/actions/locations";
import { X, Save, Loader2, MapPin } from "lucide-react";
import { 
  type LocationFormData, 
  type FormErrors,
  validateLocationForm,
  validateField,
  locationSchema 
} from "@/lib/validation/admin";
import CloudinaryUploader from "@/component/CloudinaryUploader";

interface LocationFormProps {
  location?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function LocationForm({ location: locationData, onSuccess, onCancel }: LocationFormProps) {
  const [formData, setFormData] = useState<LocationFormData>({
    name: locationData?.name || "",
    country: locationData?.country || "",
    city: locationData?.city || "",
    image: locationData?.image || null,
  });

  const [errors, setErrors] = useState<FormErrors<LocationFormData>>({});
  const [touched, setTouched] = useState<Record<keyof LocationFormData, boolean>>({
    name: false,
    country: false,
    city: false,
    image: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Real-time field validation
  const validateFieldOnChange = (field: keyof LocationFormData, value: string) => {
    if (touched[field]) {
      const validation = validateField(locationSchema, field, value);
      setErrors(prev => ({
        ...prev,
        [field]: validation.isValid ? undefined : validation.error
      }));
    }
  };

  const handleInputChange = (field: keyof LocationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value || null }));
    validateFieldOnChange(field, value);
  };

  const handleBlur = (field: keyof LocationFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateFieldOnChange(field, formData[field] || "");
  };

  // Handle image upload
  const handleImageChange = (urls: string[]) => {
    const imageUrl = urls.length > 0 ? urls[0] : null;
    setFormData(prev => ({ ...prev, image: imageUrl }));
    setTouched(prev => ({ ...prev, image: true }));
  };

  const getFieldError = (field: keyof LocationFormData) => {
    return touched[field] && errors[field] ? errors[field] : "";
  };

  const getFieldClassName = (field: keyof LocationFormData) => {
    const baseClasses = "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    const hasError = getFieldError(field);
    
    if (hasError) {
      return `${baseClasses} border-red-500 focus:ring-red-500`;
    }
    return `${baseClasses} border-gray-300`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      country: true,
      city: true,
      image: true
    });

    // Validate entire form
    const validation = validateLocationForm(formData);
    
    if (!validation.success) {
      setErrors(validation.errors as FormErrors<LocationFormData>);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = locationData?.id 
        ? await updateLocation({ ...formData, id: locationData.id })
        : await createLocation(formData);

      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || "Failed to save location");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {locationData?.id ? "Edit Location" : "Create New Location"}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Text Fields */}
            <div className="space-y-6">
          {/* Location Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              className={getFieldClassName("name")}
              placeholder="e.g., Machu Picchu, Great Wall of China"
              required
            />
            {getFieldError("name") && (
              <p className="text-red-500 text-sm mt-1">{getFieldError("name")}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              onBlur={() => handleBlur("country")}
              className={getFieldClassName("country")}
              placeholder="e.g., Peru, China"
              required
            />
            {getFieldError("country") && (
              <p className="text-red-500 text-sm mt-1">{getFieldError("country")}</p>
            )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  onBlur={() => handleBlur("city")}
                  className={getFieldClassName("city")}
                  placeholder="e.g., Cusco, Beijing"
                  required
                />
                {getFieldError("city") && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError("city")}</p>
                )}
              </div>
            </div>

            {/* Right Column - Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Image
              </label>
              <CloudinaryUploader
                value={formData.image ? [formData.image] : []}
                onChange={handleImageChange}
                maxFiles={1}
                allowEdit={true}
                allowDelete={true}
                className="min-h-[300px]"
              />
              {getFieldError("image") && (
                <p className="text-red-500 text-sm mt-1">{getFieldError("image")}</p>
              )}
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
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {locationData?.id ? "Update Location" : "Create Location"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 