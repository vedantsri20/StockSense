import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowUpFromLine,
  Plus,
  Search,
  CheckCircle2,
  Box,
  Truck,
  Ban,
  AlertTriangle,
} from 'lucide-react';
import deliveryService from '../services/deliveryService';
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

export const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validatingId, setValidatingId] = useState(null);

  const initialForm = {
    customer: '',
    warehouse: '',
    product: searchParams.get('productId') || '',
    quantity: 1,
    deliveryDate: new Date().toISOString().slice(0, 10),
    notes: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const { success, error, warning } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [delRes, prodRes, whRes] = await Promise.all([
        deliveryService.getDeliveries({
          status: selectedStatus,
          warehouse: selectedWarehouse,
          search: searchTerm,
        }),
        productService.getProducts(),
        warehouseService.getWarehouses(),
      ]);

      if (delRes.success) setDeliveries(delRes.data);
      if (prodRes.success) setProducts(prodRes.data);
      if (whRes.success) setWarehouses(whRes.data);
    } catch (err) {
      error(err.message || 'Failed to load delivery orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, selectedStatus, selectedWarehouse]);

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
    setSubmitting(true);
    try {
      await deliveryService.createDelivery(formData);
      success('Delivery order created successfully');
      setIsCreateModalOpen(false);
      setFormData(initialForm);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to create delivery order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidate = async (id) => {
    setValidatingId(id);
    try {
      await deliveryService.validateDelivery(id);
      success('Delivery validated successfully.');
      loadData();
    } catch (err) {
      if (err.message.includes('Insufficient stock')) {
        warning('Insufficient stock available.');
      } else {
        error(err.message || 'Validation failed.');
      }
    } finally {
      setValidatingId(null);
    }
  };

  const handleStatusTransition = async (id, newStatus) => {
    try {
      await deliveryService.updateDelivery(id, { status: newStatus });
      success(`Delivery order progressed to: ${newStatus}`);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to update order status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Delivery Orders</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Process outbound sales shipments with stock verification and pick/pack workflows
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
          Create Delivery Order
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Delivery ID or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Waiting">Waiting (Picked)</option>
            <option value="Ready">Ready (Packed)</option>
            <option value="Done">Done (Dispatched)</option>
            <option value="Canceled">Canceled</option>
          </select>

          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Source Warehouses</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Deliveries Table */}
      {loading ? (
        <LoadingSpinner message="Loading delivery orders..." />
      ) : deliveries.length === 0 ? (
        <EmptyState
          title="No delivery orders found"
          description="Create a delivery order to fulfill customer requests from available stock."
          actionText="Create Delivery Order"
          onAction={() => {
            setFormData(initialForm);
            setIsCreateModalOpen(true);
          }}
        />
      ) : (
        <Table
          headers={[
            'Delivery ID',
            'Customer',
            'Source Warehouse',
            'Product',
            'Quantity',
            'Delivery Date',
            'Status',
            { label: 'Workflow (Pick > Pack > Validate)', align: 'right' },
          ]}
        >
          {deliveries.map((del) => (
            <tr key={del._id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-bold text-slate-900">
                {del.deliveryId}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-800">
                {del.customer}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                {del.warehouse?.name || 'Main Warehouse'}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="text-xs font-bold text-slate-900">
                  {del.product?.name || 'Unknown Product'}
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  {del.product?.sku}
                </div>
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-xs font-bold text-rose-600">
                -{del.quantity} {del.product?.unitOfMeasure || 'units'}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500 font-mono">
                {new Date(del.deliveryDate).toLocaleDateString()}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap">
                <Badge status={del.status} />
              </td>

              {/* Workflow Actions */}
              <td className="px-4 py-3.5 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {del.status === 'Draft' && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStatusTransition(del._id, 'Waiting')}
                        icon={Box}
                      >
                        Pick
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        loading={validatingId === del._id}
                        onClick={() => handleValidate(del._id)}
                      >
                        Validate
                      </Button>
                    </>
                  )}

                  {del.status === 'Waiting' && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStatusTransition(del._id, 'Ready')}
                        icon={Truck}
                      >
                        Pack
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        loading={validatingId === del._id}
                        onClick={() => handleValidate(del._id)}
                      >
                        Validate
                      </Button>
                    </>
                  )}

                  {del.status === 'Ready' && (
                    <Button
                      variant="primary"
                      size="sm"
                      loading={validatingId === del._id}
                      onClick={() => handleValidate(del._id)}
                      icon={CheckCircle2}
                    >
                      Validate Delivery
                    </Button>
                  )}

                  {del.status === 'Done' && (
                    <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Dispatched
                    </span>
                  )}

                  {del.status !== 'Done' && del.status !== 'Canceled' && (
                    <button
                      onClick={() => handleStatusTransition(del._id, 'Canceled')}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                      title="Cancel Delivery"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Create Delivery Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Outbound Delivery Order"
        subtitle="Reserve and dispatch merchandise to a customer destination"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Customer / Client"
            name="customer"
            placeholder="e.g. Apex Corporation"
            value={formData.customer}
            onChange={handleInputChange}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Source Warehouse"
              name="warehouse"
              value={formData.warehouse}
              onChange={handleInputChange}
              options={warehouses.map((w) => ({ value: w._id, label: `${w.name} (${w.code})` }))}
              required
            />
            <Select
              label="Product"
              name="product"
              value={formData.product}
              onChange={handleInputChange}
              options={products.map((p) => ({ value: p._id, label: `${p.name} (${p.sku}) - Avail: ${p.totalStock}` }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Quantity to Deliver"
              name="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Delivery Date"
              name="deliveryDate"
              type="date"
              value={formData.deliveryDate}
              onChange={handleInputChange}
            />
          </div>

          <Input
            label="Notes / Shipping Instructions"
            name="notes"
            placeholder="Delivery address or special dispatch remarks"
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
              Create Delivery
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Deliveries;
