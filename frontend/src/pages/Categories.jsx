import React, { useState, useEffect } from 'react';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Package,
} from 'lucide-react';
import categoryService from '../services/categoryService';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = { name: '', description: '' };
  const [formData, setFormData] = useState(initialForm);

  const { success, error } = useToast();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories();
      if (res.success) setCategories(res.data);
    } catch (err) {
      error(err.message || 'Unable to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await categoryService.createCategory(formData);
      success('Category added successfully');
      setIsAddModalOpen(false);
      setFormData(initialForm);
      loadCategories();
    } catch (err) {
      error(err.message || 'Failed to create category.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (cat) => {
    setActiveCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await categoryService.updateCategory(activeCategory._id, formData);
      success('Category updated successfully');
      setIsEditModalOpen(false);
      loadCategories();
    } catch (err) {
      error(err.message || 'Failed to update category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!activeCategory) return;
    setSubmitting(true);
    try {
      await categoryService.deleteCategory(activeCategory._id);
      success('Category deleted successfully');
      setIsDeleteModalOpen(false);
      loadCategories();
    } catch (err) {
      error(err.message || 'Failed to delete category.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Product Categories</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize inventory items into logical classification tiers
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData(initialForm);
            setIsAddModalOpen(true);
          }}
          variant="primary"
          icon={Plus}
        >
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      {loading ? (
        <LoadingSpinner message="Loading product categories..." />
      ) : categories.length === 0 ? (
        <EmptyState
          title="No categories defined"
          description="Create categories like Electronics, Furniture, etc., to segment your products."
          actionText="Add Category"
          onAction={() => {
            setFormData(initialForm);
            setIsAddModalOpen(true);
          }}
        />
      ) : (
        <Table
          headers={[
            'Category Name',
            'Description',
            'Associated Products',
            { label: 'Actions', align: 'right' },
          ]}
        >
          {categories.map((cat) => (
            <tr key={cat._id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    <Tags className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                </div>
              </td>

              <td className="px-4 py-3.5 text-xs text-slate-600 max-w-md truncate">
                {cat.description || '—'}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  <Package className="w-3.5 h-3.5" />
                  {cat.productCount || 0} Products
                </span>
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveCategory(cat);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Product Category"
        subtitle="Create an inventory classification group"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Category Name"
            name="name"
            placeholder="e.g. Raw Materials"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Description"
            name="description"
            placeholder="Brief explanation of items in this classification"
            value={formData.description}
            onChange={handleInputChange}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              Add Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Category"
        subtitle={`Updating details for ${activeCategory?.name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Category Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete category{' '}
            <span className="font-bold text-slate-900">{activeCategory?.name}</span>?
            Categories currently linked to products cannot be deleted.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteSubmit}
              loading={submitting}
            >
              Delete Category
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
