/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPackage, updatePackage } from "@/lib/actions/packages";
import { CATEGORIES } from "@/lib/Validation";
import { getAllLocations } from "@/lib/actions/locations";

import { getTourDaysByPackage, deleteTourDay, createTourDay } from "@/lib/actions/tourDays";
import { getIncludedItemsByPackage, deleteIncludedItem, createIncludedItem } from "@/lib/actions/includedItems";
import { getNotIncludedItemsByPackage, deleteNotIncludedItem, createNotIncludedItem } from "@/lib/actions/notIncludedItems";
import { getRulesByPackage, deleteRule, createRule } from "@/lib/actions/rules";

import CloudinaryUploader from "../CloudinaryUploader";
import TourDayForm from "./TourDayForm";
import IncludedItemForm from "./IncludedItemForm";
import NotIncludedItemForm from "./NotIncludedItemForm";
import RuleForm from "./RuleForm";
import DateRangePicker from "./DateRangePicker";
import { X, Save, Loader2, Calendar, Plus, Edit, Trash2, Check, Shield } from "lucide-react";

interface PackageFormProps {
  package?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PackageForm({ package: packageData, onSuccess, onCancel }: PackageFormProps) {
  const [formData, setFormData] = useState({
    title: packageData?.title || "",
    description: packageData?.description || "",
    price: packageData?.price || "",
    salePrice: packageData?.salePrice || "",
    duration: packageData?.duration || "",
    startDate: packageData?.startDate ? new Date(packageData.startDate).toISOString().split('T')[0] : "",
    endDate: packageData?.endDate ? new Date(packageData.endDate).toISOString().split('T')[0] : "",
    maxPeople: packageData?.maxPeople || "",
    category: packageData?.category || "Cultural",
    popular: packageData?.popular || false,
    byBus: packageData?.byBus || false,
    byPlane: packageData?.byPlane || false,
    locationId: packageData?.locationId || "",
    gallery: packageData?.gallery?.map((img: any) => img.url) || [],
  });

  // Temporary storage for new items (for packages being created)
  const [tempIncludedItems, setTempIncludedItems] = useState<string[]>([]);
  const [tempNotIncludedItems, setTempNotIncludedItems] = useState<string[]>([]);
  const [tempRules, setTempRules] = useState<string[]>([]);
  const [tempTourDays, setTempTourDays] = useState<Array<{dayNumber: number, title: string, activities: string[]}>>([]);
  const [showTempTourDayForm, setShowTempTourDayForm] = useState(false);
  const [tempTourDayForm, setTempTourDayForm] = useState({
    title: "",
    activities: ""
  });
  const [showTempIncludedItemForm, setShowTempIncludedItemForm] = useState(false);
  const [showTempNotIncludedItemForm, setShowTempNotIncludedItemForm] = useState(false);
  const [showTempRuleForm, setShowTempRuleForm] = useState(false);
  const [tempIncludedItemForm, setTempIncludedItemForm] = useState("");
  const [tempNotIncludedItemForm, setTempNotIncludedItemForm] = useState("");
  const [tempRuleForm, setTempRuleForm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locations, setLocations] = useState<any[]>([]);

  const [tourDays, setTourDays] = useState<any[]>([]);
  const [showTourDayForm, setShowTourDayForm] = useState(false);
  const [selectedTourDay, setSelectedTourDay] = useState<any>(null);
  const [includedItems, setIncludedItems] = useState<any[]>([]);
  const [notIncludedItems, setNotIncludedItems] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [showIncludedItemForm, setShowIncludedItemForm] = useState(false);
  const [showNotIncludedItemForm, setShowNotIncludedItemForm] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [selectedIncludedItem, setSelectedIncludedItem] = useState<any>(null);
  const [selectedNotIncludedItem, setSelectedNotIncludedItem] = useState<any>(null);
  
  // Package dates state
  const [packageDates, setPackageDates] = useState<Array<{startDate: string, endDate: string, maxPeople: number}>>([]);
  const [showDateForm, setShowDateForm] = useState(false);
  const [tempDateForm, setTempDateForm] = useState({startDate: "", endDate: "", maxPeople: 1});

  useEffect(() => {
    // Load dropdown data
    const loadData = async () => {
      try {
        const locationsRes = await getAllLocations();

        if (locationsRes.success && locationsRes.data) setLocations(locationsRes.data);
      } catch {
        console.error("Error loading form data");
      }
    };

    loadData();
  }, []);

  const loadTourDays = useCallback(async () => {
    if (!packageData?.id) return;
    
    try {
      const result = await getTourDaysByPackage(packageData.id);
      if (result.success && result.data) {
        setTourDays(result.data);
      }
    } catch (error) {
      console.error("Error loading tour days:", error);
    }
  }, [packageData?.id]);

  const loadIncludedItems = useCallback(async () => {
    if (!packageData?.id) return;
    
    try {
      const result = await getIncludedItemsByPackage(packageData.id);
      if (result.success && result.data) {
        setIncludedItems(result.data);
      }
    } catch (error) {
      console.error("Error loading included items:", error);
    }
  }, [packageData?.id]);

  const loadNotIncludedItems = useCallback(async () => {
    if (!packageData?.id) return;
    
    try {
      const result = await getNotIncludedItemsByPackage(packageData.id);
      if (result.success && result.data) {
        setNotIncludedItems(result.data);
      }
    } catch (error) {
      console.error("Error loading not included items:", error);
    }
  }, [packageData?.id]);

  const loadRules = useCallback(async () => {
    if (!packageData?.id) return;
    
    try {
      const result = await getRulesByPackage(packageData.id);
      if (result.success && result.data) {
        setRules(result.data);
      }
    } catch (error) {
      console.error("Error loading rules:", error);
    }
  }, [packageData?.id]);

  // Load tour days when package data changes
  useEffect(() => {
    if (packageData?.id) {
      loadTourDays();
      loadIncludedItems();
      loadNotIncludedItems();
      loadRules();
    }
  }, [packageData?.id, loadTourDays, loadIncludedItems, loadNotIncludedItems, loadRules]);

  const handleTourDaySuccess = () => {
    setShowTourDayForm(false);
    setSelectedTourDay(null);
    loadTourDays();
  };

  const handleIncludedItemSuccess = () => {
    setShowIncludedItemForm(false);
    setSelectedIncludedItem(null);
    loadIncludedItems();
  };

  const handleNotIncludedItemSuccess = () => {
    setShowNotIncludedItemForm(false);
    setSelectedNotIncludedItem(null);
    loadNotIncludedItems();
  };

  const handleRuleSuccess = () => {
    setShowRuleForm(false);
    loadRules();
  };

  // Functions for temporary items (new packages)
  const addTempIncludedItem = () => {
    setShowTempIncludedItemForm(true);
    setTempIncludedItemForm("");
  };

  const handleTempIncludedItemSubmit = () => {
    if (tempIncludedItemForm.trim()) {
      setTempIncludedItems(prev => [...prev, tempIncludedItemForm.trim()]);
      setShowTempIncludedItemForm(false);
      setTempIncludedItemForm("");
    }
  };

  const cancelTempIncludedItem = () => {
    setShowTempIncludedItemForm(false);
    setTempIncludedItemForm("");
  };

  const removeTempIncludedItem = (index: number) => {
    setTempIncludedItems(prev => prev.filter((_, i) => i !== index));
  };

  const addTempNotIncludedItem = () => {
    setShowTempNotIncludedItemForm(true);
    setTempNotIncludedItemForm("");
  };

  const handleTempNotIncludedItemSubmit = () => {
    if (tempNotIncludedItemForm.trim()) {
      setTempNotIncludedItems(prev => [...prev, tempNotIncludedItemForm.trim()]);
      setShowTempNotIncludedItemForm(false);
      setTempNotIncludedItemForm("");
    }
  };

  const cancelTempNotIncludedItem = () => {
    setShowTempNotIncludedItemForm(false);
    setTempNotIncludedItemForm("");
  };

  const removeTempNotIncludedItem = (index: number) => {
    setTempNotIncludedItems(prev => prev.filter((_, i) => i !== index));
  };

  const addTempRule = () => {
    setShowTempRuleForm(true);
    setTempRuleForm("");
  };

  const handleTempRuleSubmit = () => {
    if (tempRuleForm.trim()) {
      setTempRules(prev => [...prev, tempRuleForm.trim()]);
      setShowTempRuleForm(false);
      setTempRuleForm("");
    }
  };

  const cancelTempRule = () => {
    setShowTempRuleForm(false);
    setTempRuleForm("");
  };

  const removeTempRule = (index: number) => {
    setTempRules(prev => prev.filter((_, i) => i !== index));
  };

  // Functions for temporary tour days (new packages)
  const addTempTourDay = () => {
    setShowTempTourDayForm(true);
    setTempTourDayForm({ title: "", activities: "" });
  };

  const handleTempTourDaySubmit = () => {
    if (tempTourDayForm.title.trim() && tempTourDayForm.activities.trim()) {
      const dayNumber = tempTourDays.length + 1;
      const activities = tempTourDayForm.activities.split('\n').filter(activity => activity.trim());
      
      setTempTourDays(prev => [...prev, {
        dayNumber,
        title: tempTourDayForm.title.trim(),
        activities: activities
      }]);
      
      setShowTempTourDayForm(false);
      setTempTourDayForm({ title: "", activities: "" });
    }
  };

  const cancelTempTourDay = () => {
    setShowTempTourDayForm(false);
    setTempTourDayForm({ title: "", activities: "" });
  };

  const removeTempTourDay = (index: number) => {
    setTempTourDays(prev => prev.filter((_, i) => i !== index));
  };

  // Package dates functions
  const addPackageDate = () => {
    setShowDateForm(true);
    setTempDateForm({startDate: "", endDate: "", maxPeople: 1});
  };

  const handlePackageDateSubmit = () => {
    if (tempDateForm.startDate && tempDateForm.endDate) {
      setPackageDates(prev => [...prev, {...tempDateForm}]);
      setShowDateForm(false);
      setTempDateForm({startDate: "", endDate: "", maxPeople: 1});
    }
  };

  const cancelPackageDate = () => {
    setShowDateForm(false);
    setTempDateForm({startDate: "", endDate: "", maxPeople: 1});
  };

  const removePackageDate = (index: number) => {
    setPackageDates(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteTourDay = async (tourDayId: number) => {
    if (confirm("Are you sure you want to delete this tour day?")) {
      try {
        const result = await deleteTourDay(tourDayId);
        if (result.success) {
          loadTourDays();
        }
      } catch (error) {
        console.error("Error deleting tour day:", error);
      }
    }
  };

  const handleDeleteIncludedItem = async (itemId: number) => {
    if (confirm("Are you sure you want to delete this included item?")) {
      try {
        const result = await deleteIncludedItem(itemId);
        if (result.success) {
          loadIncludedItems();
        }
      } catch (error) {
        console.error("Error deleting included item:", error);
      }
    }
  };

  const handleDeleteNotIncludedItem = async (itemId: number) => {
    if (confirm("Are you sure you want to delete this not included item?")) {
      try {
        const result = await deleteNotIncludedItem(itemId);
        if (result.success) {
          loadNotIncludedItems();
        }
      } catch (error) {
        console.error("Error deleting not included item:", error);
      }
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (confirm("Are you sure you want to delete this rule?")) {
      try {
        const result = await deleteRule(ruleId);
        if (result.success) {
          loadRules();
        }
      } catch (error) {
        console.error("Error deleting rule:", error);
      }
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData = {
        ...formData,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        // For bus tours, duration and maxPeople are not used (they're defined per date)
        // For other tours, use the form values
        duration: formData.byBus && packageDates.length > 0 ? "" : formData.duration,
        maxPeople: formData.byBus ? 0 : Number(formData.maxPeople),
        locationId: Number(formData.locationId),
      };

      console.log("Submitting package data:", submitData);
      
      const result = packageData?.id 
        ? await updatePackage({ ...submitData, id: packageData.id })
        : await createPackage(submitData);

      if (result.success) {
        // If this is a new package, create the temporary included and not included items
        if (!packageData?.id && result.data?.id) {
          const newPackageId = result.data.id;
          
          // Create tour days
          for (const tourDay of tempTourDays) {
            await createTourDay({
              dayNumber: tourDay.dayNumber,
              title: tourDay.title,
              activities: tourDay.activities,
              packageId: newPackageId
            });
          }
          
          // Create included items
          for (const text of tempIncludedItems) {
            await createIncludedItem({ text, packageId: newPackageId });
          }
          
          // Create not included items
          for (const text of tempNotIncludedItems) {
            await createNotIncludedItem({ text, packageId: newPackageId });
          }
          
          // Create rules
          for (const text of tempRules) {
            await createRule({ text, packageId: newPackageId });
          }

          // Create package dates for bus tours
          if (formData.byBus && packageDates.length > 0) {
            await fetch(`/api/packages/${newPackageId}/dates`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ dates: packageDates }),
            });
          }

          // Create gallery images
          if (formData.gallery && formData.gallery.length > 0) {
            for (const imageUrl of formData.gallery) {
              await fetch('/api/gallery-images', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  url: imageUrl,
                  packageId: newPackageId,
                }),
              });
            }
          }
        } else if (packageData?.id) {
          // Handle updates for existing packages
          const packageId = packageData.id;
          
          // Create new gallery images (if any were added)
          const existingUrls = packageData.gallery?.map((img: any) => img.url) || [];
          const newUrls = formData.gallery.filter((url: string) => !existingUrls.includes(url));
          
          if (newUrls.length > 0) {
            for (const imageUrl of newUrls) {
              await fetch('/api/gallery-images', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  url: imageUrl,
                  packageId: packageId,
                }),
              });
            }
          }
        }
        
        onSuccess?.();
      } else {
        setError(result.error || "Failed to save package");
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
      <div className="bg-white mt-15 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {packageData?.id ? "Edit Package" : "Create New Package"}
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter package title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Price (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => handleInputChange("salePrice", e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {(!formData.byBus || packageDates.length === 0) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration *
                </label>
                <DateRangePicker
                  value={formData.duration}
                  onChange={(value, startDate, endDate) => {
                    handleInputChange("duration", value);
                    if (startDate) handleInputChange("startDate", startDate.toISOString().split('T')[0]);
                    if (endDate) handleInputChange("endDate", endDate.toISOString().split('T')[0]);
                  }}
                  placeholder="Select date range to calculate duration"
                />
                {formData.byBus && packageDates.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Duration will be calculated from Package Dates when you add them below.
                  </p>
                )}
              </div>
            )}

            {!formData.byBus && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max People *
              </label>
              <input
                type="number"
                value={formData.maxPeople}
                onChange={(e) => handleInputChange("maxPeople", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10"
                min="1"
                required
              />
                <p className="text-sm text-gray-500 mt-1">
                  For bus tours, max people are defined per date in the Package Dates section below.
                </p>
            </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter package description..."
              required
            />
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <select
                value={formData.locationId}
                onChange={(e) => handleInputChange("locationId", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a location</option>
                {locations.map((location: any) => (
                  <option key={location.id} value={location.id}>
                    {location.name} - {location.city}, {location.country}
                  </option>
                ))}
              </select>
            </div>



            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.popular}
                  onChange={(e) => handleInputChange("popular", e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Mark as Popular Package
                </span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.byBus}
                  onChange={(e) => handleInputChange("byBus", e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  By Bus
                </span>
              </label>
            </div>
          </div>

          {/* Package Dates for Bus Tours */}
          {formData.byBus && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Package Dates
                </label>
                <button
                  type="button"
                  onClick={addPackageDate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Add Date
                </button>
              </div>

              {/* Date Form */}
              {showDateForm && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={tempDateForm.startDate}
                        onChange={(e) => setTempDateForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={tempDateForm.endDate}
                        onChange={(e) => setTempDateForm(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max People *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={tempDateForm.maxPeople}
                        onChange={(e) => setTempDateForm(prev => ({ ...prev, maxPeople: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={handlePackageDateSubmit}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Add Date
                    </button>
                    <button
                      type="button"
                      onClick={cancelPackageDate}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Display Package Dates */}
              {packageDates.length > 0 && (
                <div className="space-y-2 mb-4">
                  {packageDates.map((date, index) => (
                    <div key={index} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-700">
                        {new Date(date.startDate).toLocaleDateString()} - {new Date(date.endDate).toLocaleDateString()}
                      </span>
                        <span className="text-sm text-gray-500">
                          Max: {date.maxPeople} people
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePackageDate(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.byPlane}
                  onChange={(e) => handleInputChange("byPlane", e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  By Plane
                </span>
              </label>
            </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gallery Images
            </label>
            <CloudinaryUploader
              value={formData.gallery}
              onChange={(urls: string[]) => handleInputChange("gallery", urls)}
              maxFiles={10}
              allowEdit={true}
              allowDelete={true}
              existingImages={packageData?.gallery || []}
              onDeleteImage={async (imageId: number) => {
                try {
                  const response = await fetch(`/api/gallery-images?id=${imageId}`, {
                    method: 'DELETE',
                  });
                  if (!response.ok) {
                    throw new Error('Failed to delete image');
                  }
                } catch (error) {
                  console.error('Error deleting image:', error);
                  throw error;
                }
              }}
            />
          </div>

          {/* Tour Plan */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Tour Plan
              </label>
              {packageData?.id ? (
                <button
                  type="button"
                  onClick={() => setShowTourDayForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Tour Day
                </button>
              ) : (
                <button
                  type="button"
                  onClick={addTempTourDay}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Tour Day
                </button>
              )}
            </div>

            {/* Temporary Tour Day Form for new packages */}
            {!packageData?.id && showTempTourDayForm && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day Title *
                    </label>
                    <input
                      type="text"
                      value={tempTourDayForm.title}
                      onChange={(e) => setTempTourDayForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Arrival & Old City Exploration"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activities *
                    </label>
                    <textarea
                      value={tempTourDayForm.activities}
                      onChange={(e) => setTempTourDayForm(prev => ({ ...prev, activities: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter activities (one per line):

Example:
Arrival in Istanbul and transfer to hotel
Visit Sultanahmet Square
Blue Mosque (Sultan Ahmed Mosque)
Hagia Sophia
Basilica Cistern
Stroll through Hippodrome of Constantinople
Welcome dinner at a traditional Turkish restaurant"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleTempTourDaySubmit}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Add Day
                    </button>
                    <button
                      type="button"
                      onClick={cancelTempTourDay}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show existing tour days for existing packages */}
            {packageData?.id && tourDays.length > 0 && (
              <div className="space-y-4">
                {tourDays.map((tourDay: any) => (
                  <div key={tourDay.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                            Day {tourDay.dayNumber}
                          </span>
                          <h4 className="font-medium text-gray-900">{tourDay.title}</h4>
                        </div>
                        {/* Remove description for existing tour days */}
                        {tourDay.activities && Array.isArray(tourDay.activities) && tourDay.activities.length > 0 && (
                          <div className="text-xs text-gray-500">
                            <strong>Activities:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              {tourDay.activities.map((activity: string, index: number) => (
                                <li key={index}>{activity.trim()}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTourDay(tourDay);
                            setShowTourDayForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTourDay(tourDay.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Show temporary tour days for new packages */}
            {!packageData?.id && tempTourDays.length > 0 && (
              <div className="space-y-4">
                {tempTourDays.map((tourDay, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                            Day {tourDay.dayNumber}
                          </span>
                          <h4 className="font-medium text-gray-900">{tourDay.title}</h4>
                        </div>
                        {/* Remove description for temp tour days */}
                        {tourDay.activities && tourDay.activities.length > 0 && (
                          <div className="text-xs text-gray-500">
                            <strong>Activities:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              {tourDay.activities.map((activity: string, index: number) => (
                                <li key={index}>{activity.trim()}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTempTourDay(index)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Show empty state */}
            {((packageData?.id && tourDays.length === 0) || (!packageData?.id && tempTourDays.length === 0)) && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tour days added yet</p>
                <p className="text-sm text-gray-400">Click &quot;Add Tour Day&quot; to create your tour itinerary</p>
              </div>
            )}
          </div>

          {/* Included Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Included Items
              </label>
              {packageData?.id ? (
                <button
                  type="button"
                  onClick={() => setShowIncludedItemForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Included Item
                </button>
              ) : (
                                  <button
                    type="button"
                    onClick={addTempIncludedItem}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Included Item
                  </button>
              )}
            </div>

            {/* Temporary Included Item Form for new packages */}
            {!packageData?.id && showTempIncludedItemForm && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Included Item *
                    </label>
                    <input
                      type="text"
                      value={tempIncludedItemForm}
                      onChange={(e) => setTempIncludedItemForm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Professional Tour Guide, 3 Nights Accommodation, 2 Meals / day"
                      onKeyPress={(e) => e.key === 'Enter' && handleTempIncludedItemSubmit()}
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleTempIncludedItemSubmit}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Add Item
                    </button>
                    <button
                      type="button"
                      onClick={cancelTempIncludedItem}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show existing items for existing packages */}
            {packageData?.id && includedItems.length > 0 && (
              <div className="space-y-2">
                {includedItems.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{item.text}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedIncludedItem(item);
                          setShowIncludedItemForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteIncludedItem(item.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Show temporary items for new packages */}
            {!packageData?.id && tempIncludedItems.length > 0 && (
              <div className="space-y-2">
                {tempIncludedItems.map((text, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{text}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTempIncludedItem(index)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Show empty state */}
            {((packageData?.id && includedItems.length === 0) || (!packageData?.id && tempIncludedItems.length === 0)) && (
              <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                <Check className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No included items added yet</p>
                <p className="text-sm text-gray-400">Click &quot;Add Included Item&quot; to add what&apos;s included</p>
              </div>
            )}
          </div>

          {/* Not Included Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Not Included Items
              </label>
              {packageData?.id ? (
                <button
                  type="button"
                  onClick={() => setShowNotIncludedItemForm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Not Included Item
                </button>
              ) : (
                                  <button
                    type="button"
                    onClick={addTempNotIncludedItem}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Not Included Item
                  </button>
              )}
            </div>

            {/* Temporary Not Included Item Form for new packages */}
            {!packageData?.id && showTempNotIncludedItemForm && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Not Included Item *
                    </label>
                    <input
                      type="text"
                      value={tempNotIncludedItemForm}
                      onChange={(e) => setTempNotIncludedItemForm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="e.g., International flights, Personal expenses, Travel insurance"
                      onKeyPress={(e) => e.key === 'Enter' && handleTempNotIncludedItemSubmit()}
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleTempNotIncludedItemSubmit}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Add Item
                    </button>
                    <button
                      type="button"
                      onClick={cancelTempNotIncludedItem}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show existing items for existing packages */}
            {packageData?.id && notIncludedItems.length > 0 && (
              <div className="space-y-2">
                {notIncludedItems.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-gray-700">{item.text}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNotIncludedItem(item);
                          setShowNotIncludedItemForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNotIncludedItem(item.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Show temporary items for new packages */}
            {!packageData?.id && tempNotIncludedItems.length > 0 && (
              <div className="space-y-2">
                {tempNotIncludedItems.map((text, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-gray-700">{text}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTempNotIncludedItem(index)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Show empty state */}
            {((packageData?.id && notIncludedItems.length === 0) || (!packageData?.id && tempNotIncludedItems.length === 0)) && (
              <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                <X className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No not included items added yet</p>
                <p className="text-sm text-gray-400">Click Add Not Included Item to add what&apos;s not included</p>
              </div>
            )}
          </div>

          {/* Rules */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Rules
              </label>
              {packageData?.id ? (
                <button
                  type="button"
                  onClick={() => setShowRuleForm(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Rule
                </button>
              ) : (
                <button
                  type="button"
                  onClick={addTempRule}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Rule
                </button>
              )}
            </div>

            {/* Temporary Rule Form for new packages */}
            {!packageData?.id && showTempRuleForm && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rule *
                    </label>
                    <textarea
                      value={tempRuleForm}
                      onChange={(e) => setTempRuleForm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., No smoking allowed, Children must be accompanied by adults"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleTempRuleSubmit}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Add Rule
                    </button>
                    <button
                      type="button"
                      onClick={cancelTempRule}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show existing rules for existing packages */}
            {packageData?.id && rules.length > 0 && (
              <div className="space-y-2">
                {rules.map((rule: any) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-700">{rule.text}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowRuleForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Show temporary rules for new packages */}
            {!packageData?.id && tempRules.length > 0 && (
              <div className="space-y-2">
                {tempRules.map((text, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-700">{text}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTempRule(index)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Show empty state */}
            {((packageData?.id && rules.length === 0) || (!packageData?.id && tempRules.length === 0)) && (
              <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No rules added yet</p>
                <p className="text-sm text-gray-400">Click Add Rule to add package rules</p>
              </div>
            )}
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
                  {packageData?.id ? "Update Package" : "Create Package"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tour Day Form Modal */}
      {showTourDayForm && (
        <TourDayForm
          tourDay={selectedTourDay}
          packageId={packageData.id}
          onSuccess={handleTourDaySuccess}
          onCancel={() => {
            setShowTourDayForm(false);
            setSelectedTourDay(null);
          }}
        />
      )}

      {/* Included Item Form Modal */}
      {showIncludedItemForm && (
        <IncludedItemForm
          item={selectedIncludedItem}
          packageId={packageData.id}
          onSuccess={handleIncludedItemSuccess}
          onCancel={() => {
            setShowIncludedItemForm(false);
            setSelectedIncludedItem(null);
          }}
        />
      )}

      {/* Not Included Item Form Modal */}
      {showNotIncludedItemForm && (
        <NotIncludedItemForm
          item={selectedNotIncludedItem}
          packageId={packageData.id}
          onSuccess={handleNotIncludedItemSuccess}
          onCancel={() => {
            setShowNotIncludedItemForm(false);
            setSelectedNotIncludedItem(null);
          }}
        />
      )}

      {/* Rule Form Modal */}
      {showRuleForm && (
        <RuleForm
          packageId={packageData.id}
          onSuccess={handleRuleSuccess}
          onCancel={() => {
            setShowRuleForm(false);
          }}
        />
      )}
    </div>
  );
} 