import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  Plus,
  CheckCircle2,
  Calculator,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import adjustmentService from '../services/adjustmentService';
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

export const Adjustments = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validatingId, setValidatingId] = useState(null);

  // Form State
  const initialForm = {
    product: searchParams.get('productId') || '',
    warehouse: '',
    physicalQuantity: '',
    reason: 'Routine Physical Stocktake Audit',
    notes: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [currentSystemQty, setCurrentSystemQty] = useState(0);

  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [adjRes, prodRes, whRes] = await Promise.all([
        adjustmentService.getAdjustments(),
        productService.getProducts(),
        warehouseService.getWarehouses(),
      ]);

      if (adjRes.success) setAdjustments(adjRes.data);
      if (prodRes.success) setProducts(prodRes.data);
      if (whRes.success) setWarehouses(whRes.data);
    } catch (err) {
      error(err.message || 'Failed to load adjustments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchParams.get('productId')) {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  // When Product or Warehouse changes in form, look up current system quantity
  useEffect(() => {
    if (formData.product && formData.warehouse) {
      const selectedProd = products.find((p) => p._id === formData.product);
      if (selectedProd && selectedProd.warehouseStocks) {
        const ws = selectedProd.warehouseStocks.find(
          (s) => s.warehouse && s.warehouse._id.toString() === formData.warehouse
        );
        setCurrentSystemQty(ws ? ws.quantity : 0);
      } else {
        setCurrentSystemQty(0);
      }
    } else {
      setCurrentSystemQty(0);
    }
  }, [formData.product, formData.warehouse, products]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculatedDifference =
    formData.physicalQuantity !== ''
      ? Number(formData.physicalQuantity) - currentSystemQty
      : 0;

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (formData.physicalQuantity === '') {
      error('Please enter the physical count quantity');
      return;
    }

    setSubmitting(true);
    try {
      const created = await adjustmentService.createAdjustment({
        product: formData.product,
        warehouse: formData.warehouse,
        physicalQuantity: Number(formData.physicalQuantity),
        reason: formData.reason,
        notes: formData.notes,
      });

      // Automatically validate immediately to finalize reconciliation
      if (created.success && created.data?._id) {
        await adjustmentService.validateAdjustment(created.data._id);
        success('Adjustment created and validated! Stock updated.');
      } else {
        success('Adjustment record created.');
      }

      setIsModalOpen(false);
      setFormData(initialForm);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to create adjustment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidate = async (id) => {
    setValidatingId(id);
    try {
      await adjustmentService.validateAdjustment(id);
      success('Adjustment validated and stock updated.');
      loadData();
    } catch (err) {
      error(err.message || 'Validation failed.');
    } finally {
      setValidatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Adjustments</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Reconcile physical stock counts against system quantities and track write-offs or audits
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData(initialForm);
            setIsModalOpen(true);
          }}
          variant="primary"
          icon={Plus}
        >
          New Stock Adjustment
        </Button>
      </div>

      {/* Adjustments Table */}
      {loading ? (
        <LoadingSpinner message="Loading stock adjustment audits..." />
      ) : adjustments.length === 0 ? (
        <EmptyState
          title="No adjustments recorded"
          description="Perform a physical stock count reconciliation to adjust inventory levels."
          actionText="New Stock Adjustment"
          onAction={() => {
            setFormData(initialForm);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <Table
          headers={[
            'Adjustment ID',
            'Product / SKU',
            'Warehouse',
            'System Qty',
            'Physical Count',
            'Difference (Delta)',
            'Reason',
            'Status',
            { label: 'Action', align: 'right' },
          ]}
        >
          {adjustments.map((adj) => (
            <tr key={adj._id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-bold text-slate-900">
                {adj.adjustmentId}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="text-xs font-bold text-slate-900">
                  {adj.product?.name || 'Product'}
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  {adj.product?.sku}
                </div>
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                {adj.warehouse?.name || 'Warehouse'}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-xs font-mono text-slate-500">
                {adj.systemQuantity}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-xs font-mono font-bold text-slate-900">
                {adj.physicalQuantity}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-bold">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                    adj.difference < 0
                      ? 'bg-rose-50 text-rose-700'
                      : adj.difference > 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {adj.difference > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : adj.difference < 0 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : null}
                  {adj.difference > 0 ? `+${adj.difference}` : adj.difference}
                </span>
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                {adj.reason}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap">
                <Badge status={adj.status} />
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-right">
                {adj.status === 'Draft' ? (
                  <Button
                    variant="success"
                    size="sm"
                    loading={validatingId === adj._id}
                    onClick={() => handleValidate(adj._id)}
                    icon={CheckCircle2}
                  >
                    Validate
                  </Button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Applied
                  </span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* New Adjustment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Physical Inventory Adjustment"
        subtitle="Reconcile physical floor counts against active database ledger"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Product to Reconcile"
              name="product"
              value={formData.product}
              onChange={handleInputChange}
              options={products.map((p) => ({ value: p._id, label: `${p.name} (${p.sku})` }))}
              required
            />
            <Select
              label="Warehouse Location"
              name="warehouse"
              value={formData.warehouse}
              onChange={handleInputChange}
              options={warehouses.map((w) => ({ value: w._id, label: `${w.name} (${w.code})` }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Physical Count Counted"
              name="physicalQuantity"
              type="number"
              min="0"
              placeholder="e.g. 47"
              value={formData.physicalQuantity}
              onChange={handleInputChange}
              required
            />
            <Select
              label="Adjustment Reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder=""
              options={[
                { value: 'Routine Physical Stocktake Audit', label: 'Routine Physical Stocktake Audit' },
                { value: 'Damaged / Expired Goods Written Off', label: 'Damaged / Expired Goods Written Off' },
                { value: 'Shrinkage / Loss Reconciliation', label: 'Shrinkage / Loss Reconciliation' },
                { value: 'Unrecorded Physical Stock Found', label: 'Unrecorded Physical Stock Found' },
              ]}
              required
            />
          </div>

          {/* Automatic Calculation Card */}
          {formData.product && formData.warehouse && formData.physicalQuantity !== '' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-2 border-b border-slate-200">
                <span>Before (System Count)</span>
                <span>Physical Count</span>
                <span>Difference (Adjustment)</span>
                <span>After (Final Stock)</span>
              </div>
              <div className="flex items-center justify-between text-sm font-mono font-bold text-slate-900 pt-1">
                <span>{currentSystemQty}</span>
                <span className="text-blue-600">{formData.physicalQuantity}</span>
                <span
                  className={`${
                    calculatedDifference < 0
                      ? 'text-rose-600'
                      : calculatedDifference > 0
                      ? 'text-emerald-600'
                      : 'text-slate-600'
                  }`}
                >
                  {calculatedDifference >= 0 ? `+${calculatedDifference}` : calculatedDifference}
                </span>
                <span className="text-emerald-700">{formData.physicalQuantity}</span>
              </div>
            </div>
          )}

          <Input
            label="Audit Notes"
            name="notes"
            placeholder="Audit batch number or inspector notes"
            value={formData.notes}
            onChange={handleInputChange}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              Save & Apply Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Adjustments;
