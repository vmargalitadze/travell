/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createRule, updateRule, deleteRule, getRulesByPackage } from "@/lib/actions/rules";
import { X, Save, Loader2, X as XIcon, Plus, Trash2, Edit } from "lucide-react";

interface RuleFormProps {
  packageId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function RuleForm({ packageId,  onCancel }: RuleFormProps) {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRuleText, setNewRuleText] = useState("");

  const loadRules = useCallback(async () => {
    try {
      const result = await getRulesByPackage(packageId);
      if (result.success) {
        setRules(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load rules:", error);
    }
  }, [packageId]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const handleAddRule = async () => {
    if (!newRuleText.trim()) return;
    
    setLoading(true);
    setError("");

    try {
      const result = await createRule({ text: newRuleText.trim(), packageId });
      if (result.success) {
        setNewRuleText("");
        setShowAddForm(false);
        loadRules();
      } else {
        setError(result.error || "Failed to add rule");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRule = async (ruleId: number, newText: string) => {
    if (!newText.trim()) return;
    
    setLoading(true);
    setError("");

    try {
      const result = await updateRule({ id: ruleId, text: newText.trim(), packageId });
      if (result.success) {
        loadRules();
      } else {
        setError(result.error || "Failed to update rule");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    
    setLoading(true);
    setError("");

    try {
      const result = await deleteRule(ruleId);
      if (result.success) {
        loadRules();
      } else {
        setError(result.error || "Failed to delete rule");
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
            <div className="p-2 bg-orange-100 rounded-lg">
              <XIcon className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Manage Rules</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Add New Rule */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Rule</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Rule
              </button>
            </div>

            {showAddForm && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rule Text *
                  </label>
                  <textarea
                    value={newRuleText}
                    onChange={(e) => setNewRuleText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., No smoking allowed, Children must be accompanied by adults"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddRule}
                    disabled={loading || !newRuleText.trim()}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Add Rule
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewRuleText("");
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Existing Rules */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Rules</h3>
            {rules.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No rules added yet.</p>
            ) : (
              <div className="space-y-4">
                {rules.map((rule) => (
                  <RuleItem
                    key={rule.id}
                    rule={rule}
                    onUpdate={handleUpdateRule}
                    onDelete={handleDeleteRule}
                    loading={loading}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <button
              onClick={onCancel}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual Rule Item Component
function RuleItem({ rule, onUpdate, onDelete, loading }: {
  rule: any;
  onUpdate: (id: number, text: string) => void;
  onDelete: (id: number) => void;
  loading: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(rule.text);

  const handleSave = () => {
    if (editText.trim() && editText !== rule.text) {
      onUpdate(rule.id, editText);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(rule.text);
    setIsEditing(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-3 py-1 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start">
          <p className="text-gray-900 flex-1">{rule.text}</p>
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(rule.id)}
              disabled={loading}
              className="text-red-600 hover:text-red-900 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 