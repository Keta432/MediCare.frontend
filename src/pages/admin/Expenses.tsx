import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaFileCsv, FaSortAmountDown, FaSortAmountUp, FaMoneyBillWave, FaPills, FaBullhorn, FaCalendar, FaSearch, FaTimes, FaEye, FaHospital, FaFilter, FaDownload, FaFileExport, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import api from '../../config/axios';

interface Expense {
  _id: string;
  category: 'medicine' | 'marketing' | 'equipment' | 'utilities' | 'staff' | 'other';
  amount: number;
  description: string;
  date: string;
  createdBy?: {
    _id: string;
    name: string;
  };
  vendorName?: string;
  receiptUrl?: string;
  paymentMethod?: 'cash' | 'credit' | 'bank' | 'upi' | 'other';
  status?: 'pending' | 'completed' | 'rejected';
  billImage?: string;
  hospitalId?: string;
  hospitalName?: string;
}

const categories = [
  { value: 'medicine', label: 'Medicine', icon: FaPills },
  { value: 'marketing', label: 'Marketing', icon: FaBullhorn },
  { value: 'equipment', label: 'Equipment', icon: FaMoneyBillWave },
  { value: 'utilities', label: 'Utilities', icon: FaMoneyBillWave },
  { value: 'staff', label: 'Staff', icon: FaMoneyBillWave },
  { value: 'other', label: 'Other', icon: FaMoneyBillWave }
];

interface ExpenseFormData {
  category: 'medicine' | 'marketing' | 'equipment' | 'utilities' | 'staff' | 'other';
  amount: string;
  description: string;
  date: string;
  vendorName: string;
  paymentMethod?: 'cash' | 'credit' | 'bank' | 'upi' | 'other';
  billImage?: File | null;
  hospitalId?: string;
  status?: 'pending' | 'completed' | 'rejected';
}

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: ExpenseFormData;
  setFormData: React.Dispatch<React.SetStateAction<ExpenseFormData>>;
  editMode: boolean;
  hospitals: {_id: string, name: string}[];
}

interface Hospital {
  _id: string;
  name: string;
}

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({ isOpen, onClose, onSubmit, formData, setFormData, editMode, hospitals }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, billImage: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClickOutside}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h3 className="text-lg font-medium text-gray-800">
            {editMode ? 'Edit Expense' : 'Add New Expense'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount*</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date*</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor/Supplier</label>
              <input
                type="text"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="Vendor name (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital*</label>
              <select
                name="hospitalId"
                value={formData.hospitalId || ''}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                required
              >
                <option value="">Select Hospital</option>
                {hospitals.map(hospital => (
                  <option key={hospital._id} value={hospital._id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status || 'pending'}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="Enter expense details"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod || 'cash'}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="cash">Cash</option>
                <option value="credit">Credit Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill Image</label>
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {editMode ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminExpenses = () => {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState('date');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({ 
    start: format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [formData, setFormData] = useState<ExpenseFormData>({
    category: 'medicine',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    vendorName: '',
    hospitalId: '',
  });

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/expenses', {
        params: {
          startDate: dateRange.start,
          endDate: dateRange.end,
          hospital: selectedHospital !== 'all' ? selectedHospital : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined
        }
      });
      
      if (Array.isArray(response.data)) {
        setExpenses(response.data);
      } else {
        console.error('Unexpected API response format:', response.data);
        toast.error('Failed to load expense data');
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedHospital, selectedStatus]);

  const fetchHospitals = useCallback(async () => {
    try {
      const response = await api.get('/api/hospitals');
      if (Array.isArray(response.data)) {
        setHospitals(response.data.map(hospital => ({
          _id: hospital._id,
          name: hospital.name
        })));
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast.error('Failed to load hospitals');
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
    fetchExpenses();
  }, [fetchExpenses, fetchHospitals]);

  useEffect(() => {
    // Apply filters to expenses whenever expenses or filter settings change
    let filtered = [...expenses];
    
    // Search term filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(search) || 
        expense.vendorName?.toLowerCase().includes(search) || 
        expense.category.toLowerCase().includes(search)
      );
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }
    
    // Hospital filter
    if (selectedHospital !== 'all') {
      filtered = filtered.filter(expense => expense.hospitalId === selectedHospital);
    }
    
    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(expense => expense.status === selectedStatus);
    }
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      // Default sort by date
      return sortOrder === 'asc' ? 
        new Date(a.date).getTime() - new Date(b.date).getTime() : 
        new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    setFilteredExpenses(filtered);
  }, [expenses, searchTerm, categoryFilter, sortOrder, sortBy, selectedHospital, selectedStatus]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('category', formData.category);
    formDataToSend.append('amount', formData.amount);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('date', formData.date);
    
    if (formData.vendorName) {
      formDataToSend.append('vendorName', formData.vendorName);
    }
    
    if (formData.paymentMethod) {
      formDataToSend.append('paymentMethod', formData.paymentMethod);
    }
    
    if (formData.hospitalId) {
      formDataToSend.append('hospitalId', formData.hospitalId);
    }
    
    if (formData.status) {
      formDataToSend.append('status', formData.status);
    }
    
    if (formData.billImage) {
      formDataToSend.append('billImage', formData.billImage);
    }
    
    try {
      if (editingExpense) {
        // Update existing expense
        await api.put(`/api/expenses/${editingExpense._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Expense updated successfully');
      } else {
        // Create new expense
        await api.post('/api/expenses', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Expense added successfully');
      }
      
      resetForm();
      setModalOpen(false);
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error(editingExpense ? 'Failed to update expense' : 'Failed to add expense');
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description,
      date: format(new Date(expense.date), 'yyyy-MM-dd'),
      vendorName: expense.vendorName || '',
      paymentMethod: expense.paymentMethod,
      hospitalId: expense.hospitalId || '',
      status: expense.status,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });
      
      if (result.isConfirmed) {
        await api.delete(`/api/expenses/${id}`);
        toast.success('Expense deleted successfully');
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'medicine',
      amount: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      vendorName: '',
      hospitalId: '',
    });
    setEditingExpense(null);
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    const Icon = cat ? cat.icon : FaMoneyBillWave;
    return <Icon className="text-blue-500" />;
  };

  const calculateTotal = () => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2);
  };

  const calculateTotalByCategory = (category: string) => {
    return filteredExpenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0)
      .toFixed(2);
  };

  const exportToCsv = () => {
    if (filteredExpenses.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const headers = ['Date', 'Category', 'Amount', 'Description', 'Vendor', 'Payment Method', 'Status', 'Hospital'];
    
    const csvData = filteredExpenses.map(expense => [
      format(new Date(expense.date), 'yyyy-MM-dd'),
      expense.category,
      expense.amount.toString(),
      expense.description,
      expense.vendorName || '',
      expense.paymentMethod || '',
      expense.status || '',
      expense.hospitalName || '',
    ]);
    
    csvData.unshift(headers);
    
    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b border-gray-200 bg-blue-50">
        <h1 className="text-xl font-semibold text-gray-800">Expense Management</h1>
        <p className="text-sm text-gray-600">Track and manage expenses across all hospitals</p>
      </div>

      {/* Filters and Controls */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="block w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="block w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => fetchExpenses()}
              className="mt-6 px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Apply Filter
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                resetForm();
                setModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 transition-colors flex items-center gap-1 border border-blue-200"
            >
              <FaPlus className="text-xs" />
              <span>Add Expense</span>
            </button>
            <button
              onClick={exportToCsv}
              className="px-4 py-2 bg-green-50 text-green-600 rounded-md text-sm hover:bg-green-100 transition-colors flex items-center gap-1 border border-green-200"
            >
              <FaFileCsv className="text-xs" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex-1 flex flex-wrap gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="block flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm appearance-none bg-white"
            >
              <option value="all">All Hospitals</option>
              {hospitals.map(hospital => (
                <option key={hospital._id} value={hospital._id}>{hospital.name}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm appearance-none bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expense Summary */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <h3 className="text-sm font-medium text-gray-700">Total Expenses</h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">${calculateTotal()}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <h3 className="text-sm font-medium text-gray-700">Medicine</h3>
            <p className="text-2xl font-bold text-green-600 mt-1">${calculateTotalByCategory('medicine')}</p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
            <h3 className="text-sm font-medium text-gray-700">Equipment</h3>
            <p className="text-2xl font-bold text-indigo-600 mt-1">${calculateTotalByCategory('equipment')}</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
            <h3 className="text-sm font-medium text-gray-700">Marketing</h3>
            <p className="text-2xl font-bold text-orange-600 mt-1">${calculateTotalByCategory('marketing')}</p>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-500">No expenses found matching your filters.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {sortBy === 'date' && (sortOrder === 'asc' ? 
                      <FaSortAmountUp className="ml-1 text-blue-500" /> : 
                      <FaSortAmountDown className="ml-1 text-blue-500" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center">
                    Amount
                    {sortBy === 'amount' && (sortOrder === 'asc' ? 
                      <FaSortAmountUp className="ml-1 text-blue-500" /> : 
                      <FaSortAmountDown className="ml-1 text-blue-500" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hospital
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(expense.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="mr-2">
                        {getCategoryIcon(expense.category)}
                      </div>
                      <span className="text-sm text-gray-900 capitalize">
                        {expense.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${expense.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.hospitalName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {expense.status === 'completed' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    ) : expense.status === 'rejected' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Rejected
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleEdit(expense)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(expense._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Expense Modal */}
      <ExpenseFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editMode={!!editingExpense}
        hospitals={hospitals}
      />
    </div>
  );
};

export default AdminExpenses; 