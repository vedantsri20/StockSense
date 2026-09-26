import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  Boxes,
  ExternalLink,
} from 'lucide-react';
import productService from '../services/productService';
import warehouseService from '../services/warehouseService';
import categoryService from '../services/categoryService';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedWarehouse, setSelectedWarehouse] = useState(searchParams.get('warehouse') || 'all');
  const [selectedStockStatus, setSelectedStockStatus] = useState(searchParams.get('stockStatus') || 'all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialForm = {
    name: '',
    sku: '',
    category: '',
    unitOfMeasure: 'Units',
    initialStock: 0,
    price: '',
    reorderLevel: 5,
    supplier: '',
    warehouse: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const { success, error, warning } = useToast();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, whRes, catRes] = await Promise.all([
        productService.getProducts({
          search: searchTerm,
          category: selectedCategory,
          warehouse: selectedWarehouse,
          stockStatus: selectedStockStatus,
        }),
        warehouseService.getWarehouses(),
        categoryService.getCategories(),
      ]);

      if (prodRes.success) setProducts(prodRes.data);
      if (whRes.success) setWarehouses(whRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (err) {
      error(err.message || 'Unable to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, selectedCategory, selectedWarehouse, selectedStockStatus]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create Product Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await productService.createProduct(formData);
      success('Product created successfully');
      setIsAddModalOpen(false);
      setFormData(initialForm);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (product) => {
    setActiveProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unitOfMeasure: product.unitOfMeasure,
      price: product.price,
      reorderLevel: product.reorderLevel,
      supplier: product.supplier || '',
      status: product.status,
    });
    setIsEditModalOpen(true);
  };

  // Edit Product Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await productService.updateProduct(activeProduct._id, formData);
      success('Product updated successfully');
      setIsEditModalOpen(false);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to update product.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Product Submit
  const handleDeleteSubmit = async () => {
    if (!activeProduct) return;
    setSubmitting(true);
    try {
      await productService.deleteProduct(activeProduct._id);
      success('Product deleted successfully');
      setIsDeleteModalOpen(false);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to delete product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Products Catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage multi-warehouse inventory items, pricing, SKUs, and reorder levels
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
          Add Product
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Product Name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Warehouse */}
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>

          {/* Stock Status */}
          <select
            value={selectedStockStatus}
            onChange={(e) => setSelectedStockStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock (&gt; Reorder)</option>
            <option value="low_stock">Low Stock (≤ Reorder)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <LoadingSpinner message="Loading products catalog..." />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try modifying your search or filters, or add your first product."
          actionText="Add Product"
          onAction={() => {
            setFormData(initialForm);
            setIsAddModalOpen(true);
          }}
        />
      ) : (
        <Table
          headers={[
            'Product',
            'SKU',
            'Category',
            'Unit',
            'Available Stock',
            'Reorder Level',
            'Price (₹)',
            'Status',
            { label: 'Actions', align: 'right' },
          ]}
        >
          {products.map((p) => (
            <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
              {/* Name */}
              <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <button
                      onClick={() => navigate(`/products/${p._id}`)}
                      className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors text-left"
                    >
                      {p.name}
                    </button>
                    {p.supplier && (
                      <p className="text-[10px] text-slate-400">Supplier: {p.supplier}</p>
                    )}
                  </div>
                </div>
              </td>

              {/* SKU */}
              <td className="px-4 py-3.5 whitespace-nowrap">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                  {p.sku}
                </span>
              </td>

              {/* Category */}
              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                {p.category}
              </td>

              {/* Unit */}
              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                {p.unitOfMeasure}
              </td>

              {/* Stock */}
              <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{p.totalStock}</span>
                  <Badge status={p.computedStatus} />
                </div>
              </td>

              {/* Reorder Level */}
              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                {p.reorderLevel}
              </td>

              {/* Price */}
              <td className="px-4 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-800">
                ₹{p.price?.toLocaleString('en-IN')}
              </td>

              {/* Status */}
              <td className="px-4 py-3.5 whitespace-nowrap">
                <Badge status={p.status} />
              </td>

              {/* Actions */}
              <td className="px-4 py-3.5 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => navigate(`/products/${p._id}`)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="View Product Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    title="Edit Product"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveProduct(p);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Inventory Product"
        subtitle="Create an item record with SKU, reorder thresholds, and initial stock"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              name="name"
              placeholder="e.g. Ergonomic Keyboard"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <Input
              label="SKU (Unique Code)"
              name="sku"
              placeholder="e.g. KB-1002"
              value={formData.sku}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              options={categories.map((c) => ({ value: c.name, label: c.name }))}
              required
            />
            <Input
              label="Unit of Measure"
              name="unitOfMeasure"
              placeholder="Units, Pcs, Box, Kg..."
              value={formData.unitOfMeasure}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Price (₹)"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Reorder Level"
              name="reorderLevel"
              type="number"
              min="0"
              value={formData.reorderLevel}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Initial Stock"
              name="initialStock"
              type="number"
              min="0"
              value={formData.initialStock}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Primary Warehouse"
              name="warehouse"
              value={formData.warehouse}
              onChange={handleInputChange}
              options={warehouses.map((w) => ({ value: w._id, label: `${w.name} (${w.code})` }))}
              helperText="Initial stock will be deposited into this warehouse"
            />
            <Input
              label="Primary Supplier"
              name="supplier"
              placeholder="Supplier or manufacturer name"
              value={formData.supplier}
              onChange={handleInputChange}
            />
          </div>

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
              Create Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product"
        subtitle={`Updating details for ${activeProduct?.name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <Input
              label="SKU"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              options={categories.map((c) => ({ value: c.name, label: c.name }))}
              required
            />
            <Input
              label="Unit of Measure"
              name="unitOfMeasure"
              value={formData.unitOfMeasure}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Price (₹)"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Reorder Level"
              name="reorderLevel"
              type="number"
              min="0"
              value={formData.reorderLevel}
              onChange={handleInputChange}
              required
            />
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              placeholder=""
              options={[
                { value: 'active', label: 'Active' },
                { value: 'archived', label: 'Archived' },
              ]}
              required
            />
          </div>

          <Input
            label="Supplier"
            name="supplier"
            value={formData.supplier}
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
        title="Confirm Product Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete{' '}
            <span className="font-bold text-slate-900">{activeProduct?.name}</span> ({activeProduct?.sku})?
            This will also delete all associated warehouse stock records.
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
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
