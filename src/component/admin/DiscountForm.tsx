'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Save, Loader2, Percent } from 'lucide-react';
import { 
  type DiscountFormData, 
  type FormErrors,
  validateDiscountForm,
  validateField,
  discountSchema 
} from '@/lib/validation/admin';

interface DiscountFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function DiscountForm({ onSuccess, onCancel }: DiscountFormProps) {
  const [formData, setFormData] = useState<DiscountFormData>({
    code: '',
    amount: 0,
    expiresAt: '',
  });

  const [errors, setErrors] = useState<FormErrors<DiscountFormData>>({});
  const [touched, setTouched] = useState<Record<keyof DiscountFormData, boolean>>({
    code: false,
    amount: false,
    expiresAt: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Real-time field validation
  const validateFieldOnChange = (field: keyof DiscountFormData, value: string | number) => {
    if (touched[field]) {
      const validation = validateField(discountSchema, field, value);
      setErrors(prev => ({
        ...prev,
        [field]: validation.isValid ? undefined : validation.error
      }));
    }
  };

  const handleInputChange = (field: keyof DiscountFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateFieldOnChange(field, value);
  };

  const handleBlur = (field: keyof DiscountFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateFieldOnChange(field, formData[field]);
  };

  const getFieldError = (field: keyof DiscountFormData) => {
    return touched[field] && errors[field] ? errors[field] : "";
  };

  const getFieldClassName = (field: keyof DiscountFormData) => {
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
      code: true,
      amount: true,
      expiresAt: true
    });

    // Validate entire form
    const validation = validateDiscountForm(formData);
    
    if (!validation.success) {
      setErrors(validation.errors as FormErrors<DiscountFormData>);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/discounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: formData.code,
          amount: formData.amount,
          expiresAt: new Date(formData.expiresAt).toISOString(),
        }),
      });

      if (response.ok) {
        setFormData({
          code: '',
          amount: 0,
          expiresAt: '',
        });
        setErrors({});
        setTouched({
          code: false,
          amount: false,
          expiresAt: false
        });
        onSuccess?.();
        router.refresh();
      } else {
        console.error('Failed to create discount');
      }
    } catch (error) {
      console.error('Error creating discount:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Percent className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Create New Discount
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Code *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
              onBlur={() => handleBlur("code")}
              className={getFieldClassName("code")}
              placeholder="e.g., SUMMER2024, WELCOME10"
              required
            />
            {getFieldError("code") && (
              <p className="text-red-500 text-sm mt-1">{getFieldError("code")}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Use uppercase letters, numbers, hyphens, and underscores only
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Amount (₾) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">₾</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", parseFloat(e.target.value) || 0)}
                onBlur={() => handleBlur("amount")}
                className={getFieldClassName("amount")}
                style={{ paddingLeft: '2rem' }}
                placeholder="0.00"
                required
              />
            </div>
            {getFieldError("amount") && (
              <p className="text-red-500 text-sm mt-1">{getFieldError("amount")}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expires At *
            </label>
            <input
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => handleInputChange("expiresAt", e.target.value)}
              onBlur={() => handleBlur("expiresAt")}
              className={getFieldClassName("expiresAt")}
              required
            />
            {getFieldError("expiresAt") && (
              <p className="text-red-500 text-sm mt-1">{getFieldError("expiresAt")}</p>
            )}
          </div>

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
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Discount
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 