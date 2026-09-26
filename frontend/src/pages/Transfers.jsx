import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowLeftRight,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Ban,
  ArrowRight,
} from 'lucide-react';
import transferService from '../services/transferService';
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

export const Transfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [selectedSource, setSelectedSource] = useState('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validatingId, setValidatingId] = useState(null);

  const initialForm = {
    sourceWarehouse: '',
    destinationWarehouse: '',
    product: searchParams.get('productId') || '',
    quantity: 1,
    scheduledDate: new Date().toISOString().slice(0, 10),
    notes: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [trfRes, prodRes, whRes] = await Promise.all([
        transferService.getTransfers({
          status: selectedStatus,
          sourceWarehouse: selectedSource,
        }),
        productService.getProducts(),
        warehouseService.getWarehouses(),
      ]);

      if (trfRes.success) setTransfers(trfRes.data);
      if (prodRes.success) setProducts(prodRes.data);
      if (whRes.success) setWarehouses(whRes.data);
    } catch (err) {
      error(err.message || 'Failed to load internal transfers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus, selectedSource]);

  useEffect(() => {
    if (searchParams.get('productId')) {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (formData.sourceWarehouse === formData.destinationWarehouse) {
      error('Source and destination warehouses cannot be the same.');
      return;
    }

    setSubmitting(true);
    try {
      await transferService.createTransfer(formData);
      success('Internal transfer scheduled successfully');
      setIsCreateModalOpen(false);
      setFormData(initialForm);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to schedule transfer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidate = async (id) => {
    setValidatingId(id);
    try {
      await transferService.validateTransfer(id);
      success('Transfer validated successfully. Stock rebalanced.');
      loadData();
    } catch (err) {
      error(err.message || 'Validation failed. Check source stock balance.');
    } finally {
      setValidatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Internal Transfers</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Shift inventory between facilities and rebalance warehouse stocks without altering global assets
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData(initialForm);
            setIsCreateModalOpen(true);
          }}
          variant="primary"
          icon={Plus}
        >
          Schedule Transfer
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Transfer Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Done">Done (Completed)</option>
          <option value="Canceled">Canceled</option>
        </select>

        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Source Facilities</option>
          {warehouses.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* Transfers Table */}
      {loading ? (
        <LoadingSpinner message="Loading internal transfers..." />
      ) : transfers.length === 0 ? (
        <EmptyState
          title="No transfers found"
          description="Schedule an internal transfer to move products between warehouses."
          actionText="Schedule Transfer"
          onAction={() => {
            setFormData(initialForm);
            setIsCreateModalOpen(true);
          }}
        />
      ) : (
        <Table
          headers={[
            'Transfer ID',
            'Route (Source → Destination)',
            'Product / SKU',
            'Quantity',
            'Scheduled Date',
            'Status',
            { label: 'Validation', align: 'right' },
          ]}
        >
          {transfers.map((trf) => (
            <tr key={trf._id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-bold text-slate-900">
                {trf.transferId}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <span>{trf.sourceWarehouse?.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-blue-700">{trf.destinationWarehouse?.name}</span>
                </div>
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="text-xs font-bold text-slate-900">
                  {trf.product?.name || 'Product'}
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  {trf.product?.sku}
                </div>
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-xs font-bold text-slate-900">
                {trf.quantity} {trf.product?.unitOfMeasure || 'units'}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500 font-mono">
                {new Date(trf.scheduledDate).toLocaleDateString()}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap">
                <Badge status={trf.status} />
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-right">
                {trf.status === 'Scheduled' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    loading={validatingId === trf._id}
                    onClick={() => handleValidate(trf._id)}
                    icon={CheckCircle2}
                  >
                    Validate Transfer
                  </Button>
                ) : trf.status === 'Done' ? (
                  <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Rebalanced
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Canceled</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Schedule Transfer Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule Internal Transfer"
        subtitle="Transfer physical stock from one warehouse location to another"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Source Warehouse"
              name="sourceWarehouse"
              value={formData.sourceWarehouse}
              onChange={handleInputChange}
              options={warehouses.map((w) => ({ value: w._id, label: `${w.name} (${w.code})` }))}
              required
            />
            <Select
              label="Destination Warehouse"
              name="destinationWarehouse"
              value={formData.destinationWarehouse}
              onChange={handleInputChange}
              options={warehouses.map((w) => ({ value: w._id, label: `${w.name} (${w.code})` }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Product"
              name="product"
              value={formData.product}
              onChange={handleInputChange}
              options={products.map((p) => ({ value: p._id, label: `${p.name} (${p.sku})` }))}
              required
            />
            <Input
              label="Quantity to Move"
              name="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={handleInputChange}
              required
            />
          </div>

          <Input
            label="Scheduled Date"
            name="scheduledDate"
            type="date"
            value={formData.scheduledDate}
            onChange={handleInputChange}
          />

          <Input
            label="Reason / Notes"
            name="notes"
            placeholder="e.g. Floor replenishment or rebalance request"
            value={formData.notes}
            onChange={handleInputChange}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              Schedule Transfer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Transfers;
