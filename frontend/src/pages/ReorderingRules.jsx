import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import reorderingRuleService from '../services/reorderingRuleService';
import productService from '../services/productService';
import warehouseService from '../services/warehouseService';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export const ReorderingRules = () => {
  const [rules, setRules] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeRule, setActiveRule] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    product: '',
    warehouse: '',
    minQuantity: 5,
    maxQuantity: 100,
    reorderQuantity: 20,
  };
  const [formData, setFormData] = useState(initialForm);

  const { success, error } = useToast();

  const loadRules = async () => {
    setLoading(true);
    try {
      const [ruleRes, prodRes, whRes] = await Promise.all([
        reorderingRuleService.getRules(),
        productService.getProducts(),
        warehouseService.getWarehouses(),
      ]);

      if (ruleRes.success) setRules(ruleRes.data);
      if (prodRes.success) setProducts(prodRes.data);
      if (whRes.success) setWarehouses(whRes.data);
    } catch (err) {
      error(err.message || 'Unable to load reordering rules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await reorderingRuleService.createRule(formData);
      success('Reordering rule created successfully');
      setIsAddModalOpen(false);
      setFormData(initialForm);
      loadRules();
    } catch (err) {
      error(err.message || 'Failed to create rule.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (rule) => {
    setActiveRule(rule);
    setFormData({
      product: rule.product?._id,
      warehouse: rule.warehouse?._id,
      minQuantity: rule.minQuantity,
      maxQuantity: rule.maxQuantity,
      reorderQuantity: rule.reorderQuantity,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await reorderingRuleService.updateRule(activeRule._id, {
        minQuantity: formData.minQuantity,
        maxQuantity: formData.maxQuantity,
        reorderQuantity: formData.reorderQuantity,
      });
      success('Reordering rule updated successfully');
      setIsEditModalOpen(false);
      loadRules();
    } catch (err) {
      error(err.message || 'Failed to update rule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!activeRule) return;
    setSubmitting(true);
    try {
      await reorderingRuleService.deleteRule(activeRule._id);
      success('Reordering rule deleted successfully');
      setIsDeleteModalOpen(false);
      loadRules();
    } catch (err) {
      error(err.message || 'Failed to delete rule.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Reordering Rules & Thresholds
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Define minimum safety stocks and auto-reorder trigger amounts per facility
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
          Add Reorder Rule
        </Button>
      </div>

      {/* Rules Table */}
      {loading ? (
        <LoadingSpinner message="Evaluating warehouse safety thresholds..." />
      ) : rules.length === 0 ? (
        <EmptyState
          title="No reordering rules configured"
          description="Establish minimum and maximum stock boundaries to alert your team when inventory runs low."
          actionText="Add Reorder Rule"
          onAction={() => {
            setFormData(initialForm);
            setIsAddModalOpen(true);
          }}
        />
      ) : (
        <Table
          headers={[
            'Product / SKU',
            'Warehouse',
            'Current Stock',
            'Min Threshold',
            'Max Capacity',
            'Reorder Quantity',
            'Alert Status',
            { label: 'Actions', align: 'right' },
          ]}
        >
          {rules.map((rule) => (
            <tr key={rule._id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="text-xs font-bold text-slate-900">{rule.product?.name}</div>
                <div className="font-mono text-[10px] text-slate-500">{rule.product?.sku}</div>
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-700">
                {rule.warehouse?.name}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-bold text-slate-900">
                {rule.currentStock} {rule.product?.unitOfMeasure || 'units'}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-slate-600">
                {rule.minQuantity}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-slate-600">
                {rule.maxQuantity}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-bold text-blue-600">
                +{rule.reorderQuantity}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap">
                {rule.isTriggered ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Trigger
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
                  </span>
                )}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => openEditModal(rule)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    title="Edit Rule"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveRule(rule);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Add Rule Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Reordering Rule"
        subtitle="Specify minimum threshold and purchase reorder quantities"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Product"
              name="product"
              value={formData.product}
              onChange={handleInputChange}
              options={products.map((p) => ({ value: p._id, label: `${p.name} (${p.sku})` }))}
              required
            />
            <Select
              label="Warehouse Facility"
              name="warehouse"
              value={formData.warehouse}
              onChange={handleInputChange}
              options={warehouses.map((w) => ({ value: w._id, label: `${w.name} (${w.code})` }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Min Threshold (Alert)"
              name="minQuantity"
              type="number"
              min="0"
              value={formData.minQuantity}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Max Capacity"
              name="maxQuantity"
              type="number"
              min="0"
              value={formData.maxQuantity}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Reorder Quantity"
              name="reorderQuantity"
              type="number"
              min="1"
              value={formData.reorderQuantity}
              onChange={handleInputChange}
              required
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
              Set Reorder Rule
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Rule Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Reordering Rule"
        subtitle={`Updating thresholds for ${activeRule?.product?.name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Min Threshold"
              name="minQuantity"
              type="number"
              min="0"
              value={formData.minQuantity}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Max Capacity"
              name="maxQuantity"
              type="number"
              min="0"
              value={formData.maxQuantity}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Reorder Quantity"
              name="reorderQuantity"
              type="number"
              min="1"
              value={formData.reorderQuantity}
              onChange={handleInputChange}
              required
            />
          </div>

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
        title="Confirm Rule Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to remove the reordering rule for{' '}
            <span className="font-bold text-slate-900">{activeRule?.product?.name}</span>?
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
              Delete Rule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReorderingRules;
