/**
 * Form component for adding/editing expenses
 */

import React, { useState, useEffect } from "react";
import { EXPENSE_CATEGORIES } from "../constants/categories";
import { ExpenseFormData } from "../types";
import { TextField, SelectBox, Button } from "../vibes";
import { useExpenseForm } from "../hooks/useExpenseForm";
import { fetchCategories, createCategory } from "../services/api";
import { COLORS } from "../constants/colors";

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Add Expense",
}: ExpenseFormProps) {
  const { formData, errors, isSubmitting, handleChange, handleSubmit } =
    useExpenseForm({
      initialData,
      onSubmit,
    });

  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryError, setNewCategoryError] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch {
      console.error("Failed to load categories");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setNewCategoryError("Category name is required");
      return;
    }
    setIsAddingCategory(true);
    setNewCategoryError("");
    try {
      const created = await createCategory(newCategoryName.trim());
      await loadCategories();
      handleChange("category", created.name);
      setNewCategoryName("");
      setShowAddCategory(false);
    } catch {
      setNewCategoryError("Failed to create category. It may already exist.");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  const addCategoryLinkStyle: React.CSSProperties = {
    marginTop: "0.25rem",
    background: "none",
    border: "none",
    color: COLORS.primary.p05,
    cursor: "pointer",
    fontSize: "0.85rem",
    padding: 0,
    textDecoration: "underline",
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: COLORS.background.main,
    borderRadius: "8px",
    padding: "1.5rem",
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    boxShadow: `0 20px 60px rgba(0, 0, 0, 0.3)`,
  };

  const modalTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "1.1rem",
    color: COLORS.text.primary,
  };

  const modalButtonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
  };

  const categoryOptions = [
    ...EXPENSE_CATEGORIES.map((category) => ({
      value: category,
      label: category,
    })),
    ...categories
      .filter((c) => !EXPENSE_CATEGORIES.includes(c.name as any))
      .map((c) => ({ value: c.name, label: c.name })),
  ];

  return (
    <>
      <form onSubmit={handleSubmit} style={formStyle}>
        <TextField
          label="Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
          error={errors.amount}
          fullWidth
          required
        />

        <TextField
          label="Description"
          type="text"
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          error={errors.description}
          fullWidth
          required
        />

        <div>
          <SelectBox
            label="Category"
            options={categoryOptions}
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
            error={errors.category}
            fullWidth
            required
          />
          <button
            type="button"
            onClick={() => setShowAddCategory(true)}
            style={addCategoryLinkStyle}
          >
            + Add new category
          </button>
        </div>

        <TextField
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => handleChange("date", e.target.value)}
          error={errors.date}
          fullWidth
          required
        />

        <div style={buttonGroupStyle}>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? "Submitting..." : submitLabel}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      {showAddCategory && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={modalTitleStyle}>Add New Category</h3>
            <TextField
              label="Category Name"
              type="text"
              placeholder="e.g. Healthcare"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                setNewCategoryError("");
              }}
              error={newCategoryError}
              fullWidth
              autoFocus
            />
            <div style={modalButtonGroupStyle}>
              <Button
                type="button"
                variant="primary"
                onClick={handleAddCategory}
                disabled={isAddingCategory}
                fullWidth
              >
                {isAddingCategory ? "Adding..." : "Add Category"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategoryName("");
                  setNewCategoryError("");
                }}
                disabled={isAddingCategory}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}