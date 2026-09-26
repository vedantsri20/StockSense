import React, { useState, useEffect } from 'react';
import {
  Warehouse,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  User,
  Boxes,
} from 'lucide-react';
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

export const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeWarehouse, setActiveWarehouse] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    name: '',
    code: '',
    location: '',
    manager: '',
    status: 'active',
  };
  const [formData, setFormData] = useState(initialForm);

  const { success, error } = useToast();

  const loadWarehouses = async () => {
    setLoading(true);
    try {
      const res = await warehouseService.getWarehouses();
      if (res.success) setWarehouses(res.data);
    } catch (err) {
      error(err.message || 'Unable to load warehouses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await warehouseService.createWarehouse(formData);
      success('Warehouse facility added successfully');
      setIsAddModalOpen(false);
      setFormData(initialForm);
      loadWarehouses();
    } catch (err) {
      error(err.message || 'Failed to create warehouse.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (wh) => {
    setActiveWarehouse(wh);
    setFormData({
      name: wh.name,
      code: wh.code,
      location: wh.location,
      manager: wh.manager || '',
      status: wh.status,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await warehouseService.updateWarehouse(activeWarehouse._id, formData);
      success('Warehouse facility updated successfully');
      setIsEditModalOpen(false);
      loadWarehouses();
    } catch (err) {
      error(err.message || 'Failed to update warehouse.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!activeWarehouse) return;
    setSubmitting(true);
    try {
      await warehouseService.deleteWarehouse(activeWarehouse._id);
      success('Warehouse facility deleted successfully');
      setIsDeleteModalOpen(false);
      loadWarehouses();
    } catch (err) {
      error(err.message || 'Failed to delete warehouse. Ensure it has no active stock.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Warehouse Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure multi-location facilities, storage hubs, and site managers
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
          Add Warehouse
        </Button>
      </div>

      {/* Warehouses Table */}
      {loading ? (
        <LoadingSpinner message="Loading storage facilities..." />
      ) : warehouses.length === 0 ? (
        <EmptyState
          title="No warehouses configured"
          description="Register your first storage warehouse to start tracking inventory by location."
          actionText="Add Warehouse"
          onAction={() => {
            setFormData(initialForm);
            setIsAddModalOpen(true);
          }}
        />
      ) : (
        <Table
          headers={[
            'Facility Name',
            'Code',
            'Physical Location',
            'Facility Manager',
            'Stock Stored',
            'Status',
            { label: 'Actions', align: 'right' },
          ]}
        >
          {warehouses.map((wh) => (
            <tr key={wh._id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    <Warehouse className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">{wh.name}</span>
                </div>
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-800">
                  {wh.code}
                </span>
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{wh.location}</span>
                </div>
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-700">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{wh.manager || 'Unassigned'}</span>
                </div>
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="text-xs font-bold text-slate-900">
                  {wh.totalUnits || 0} Units
                </div>
                <div className="text-[10px] text-slate-500">
                  {wh.uniqueProductsCount || 0} unique SKUs
                </div>
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap">
                <Badge status={wh.status} />
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => openEditModal(wh)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    title="Edit Facility"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveWarehouse(wh);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Facility"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Add Warehouse Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Storage Facility"
        subtitle="Create a new physical warehouse or storage room"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Warehouse Name"
              name="name"
              placeholder="e.g. Main Warehouse"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Facility Code"
              name="code"
              placeholder="e.g. WH-NORTH"
              value={formData.code}
              onChange={handleInputChange}
              required
            />
          </div>

          <Input
            label="Physical Address / Location"
            name="location"
            placeholder="e.g. Sector 62, Industrial Area"
            value={formData.location}
            onChange={handleInputChange}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Facility Manager"
              name="manager"
              placeholder="Manager name"
              value={formData.manager}
              onChange={handleInputChange}
            />
            <Select
              label="Operating Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              placeholder=""
              options={[
                { value: 'active', label: 'Active Facility' },
                { value: 'inactive', label: 'Inactive Facility' },
              ]}
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
              Add Warehouse
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Warehouse Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Warehouse Facility"
        subtitle={`Updating information for ${activeWarehouse?.name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Warehouse Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Facility Code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              required
            />
          </div>

          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Manager"
              name="manager"
              value={formData.manager}
              onChange={handleInputChange}
            />
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              placeholder=""
              options={[
                { value: 'active', label: 'Active Facility' },
                { value: 'inactive', label: 'Inactive Facility' },
              ]}
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
        title="Confirm Facility Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete{' '}
            <span className="font-bold text-slate-900">{activeWarehouse?.name}</span>?
            Facilities with active stored inventory cannot be deleted.
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
              Delete Facility
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Warehouses;
