import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaFileCsv, FaSortAmountDown, FaSortAmountUp, FaMoneyBillWave, FaPills, FaBullhorn, FaCalendar, FaSearch, FaTimes, FaEye, FaCheckCircle } from 'react-icons/fa';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import StaffLayout from '../../layouts/StaffLayout';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

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
}

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: ExpenseFormData;
  setFormData: React.Dispatch<React.SetStateAction<ExpenseFormData>>;
  editMode: boolean;
}

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({ isOpen, onClose, onSubmit, formData, setFormData, editMode }) => {
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                placeholder="Vendor name (optional)"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
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
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-600 hover:file:bg-teal-100"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Upload a clear image of the bill (Max size: 10MB)</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition-colors text-sm"
            >
              {editMode ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StaffExpenses = () => {
  const { token, user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'ascending' | 'descending'}>({
    key: 'date',
    direction: 'descending'
  });
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{
    startDate: string,
    endDate: string
  }>({
    startDate: format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successNotification, setSuccessNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });
  
  const initialFormState: ExpenseFormData = {
    category: 'medicine',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    vendorName: '',
    paymentMethod: 'cash',
    billImage: null
  };
  
  const [formData, setFormData] = useState<ExpenseFormData>(initialFormState);
  const [editMode, setEditMode] = useState(false);
  const [currentExpenseId, setCurrentExpenseId] = useState<string | null>(null);

  const showSuccessNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setSuccessNotification({
      show: true,
      message,
      type
    });
    
    setTimeout(() => {
      setSuccessNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const fetchExpenses = React.useCallback(async () => {
    if (!user?.hospital) {
      setLoading(false);
      setExpenses([]);
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await api.get<{ expenses: Expense[] }>(`/api/expenses`, {
        params: {
          category: filterCategory !== 'all' ? filterCategory : undefined,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          hospitalId: user.hospital,
          timestamp: new Date().getTime()
        }
      });
      
      if (response.data && Array.isArray(response.data.expenses)) {
        setExpenses(response.data.expenses);
      } else {
        console.warn('Unexpected response format:', response.data);
        setExpenses([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to fetch expenses');
      setExpenses([]);
      setLoading(false);
    }
  }, [token, filterCategory, dateRange, user?.hospital]);

  useEffect(() => {
    fetchExpenses();
  }, [token, filterCategory, dateRange, fetchExpenses]);

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedExpenses = [...expenses].sort((a, b) => {
    if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'ascending' 
        ? a.amount - b.amount
        : b.amount - a.amount;
    }
    
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'ascending' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    
    if (sortConfig.key === 'category') {
      return sortConfig.direction === 'ascending' 
        ? a.category.localeCompare(b.category)
        : b.category.localeCompare(a.category);
    }
    
    return 0;
  });

  const filteredExpenses = sortedExpenses.filter(expense => {
    const matchesSearch = 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.vendorName && expense.vendorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    
    const expenseDate = new Date(expense.date);
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    endDate.setHours(23, 59, 59, 999);
    
    const matchesDateRange = expenseDate >= startDate && expenseDate <= endDate;
    
    return matchesSearch && matchesCategory && matchesDateRange;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('category', formData.category);
      formDataToSend.append('amount', formData.amount.toString());
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', formData.date);
      if (formData.vendorName) formDataToSend.append('vendorName', formData.vendorName);
      if (formData.paymentMethod) formDataToSend.append('paymentMethod', formData.paymentMethod);
      if (formData.billImage) formDataToSend.append('files', formData.billImage);
      if (user?.hospital) formDataToSend.append('hospitalId', user.hospital);

      if (editMode && currentExpenseId) {
        toast.loading('Updating expense...');
        const response = await api.put(
          `/api/expenses/${currentExpenseId}`,
          formDataToSend,
          { 
            headers: { 
              'Content-Type': 'multipart/form-data'
            } 
          }
        );
        
        if (response.data && response.data.expense) {
          setExpenses(prev => 
            prev.map(exp => exp._id === currentExpenseId ? response.data.expense : exp)
          );
        } else {
          fetchExpenses();
        }
        
        toast.dismiss();
        showSuccessNotification('Expense updated successfully');
      } else {
        toast.loading('Saving expense...');
        const response = await api.post(
          `/api/expenses`,
          formDataToSend,
          { 
            headers: { 
              'Content-Type': 'multipart/form-data'
            } 
          }
        );
        
        if (response.data && response.data.expense) {
          setExpenses(prev => [response.data.expense, ...prev]);
        } else {
          fetchExpenses();
        }
        
        toast.dismiss();
        showSuccessNotification('Expense recorded successfully');
      }
      
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.dismiss();
      showSuccessNotification('Failed to save expense', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description,
      date: expense.date,
      vendorName: expense.vendorName || '',
      paymentMethod: expense.paymentMethod || 'cash',
      billImage: null
    });
    setCurrentExpenseId(expense._id);
    setEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this expense!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          toast.loading('Deleting expense...');
          
          const response = await api.delete(`/api/expenses/${id}`);
          
          toast.dismiss();
          showSuccessNotification(response.data.message || 'Expense deleted successfully');
          
          setExpenses(expenses.filter((expense) => expense._id !== id));
        } catch (error) {
          toast.dismiss();
          showSuccessNotification('Failed to delete expense', 'error');
          console.error('Error deleting expense:', error);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditMode(false);
    setCurrentExpenseId(null);
  };

  const getCategoryIcon = (category: string) => {
    const foundCategory = categories.find(cat => cat.value === category);
    const Icon = foundCategory?.icon || FaMoneyBillWave;
    return <Icon className="w-4 h-4" />;
  };

  const calculateTotal = () => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2);
  };

  const calculateTotalByCategory = (category: string) => {
    return expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0)
      .toFixed(2);
  };

  const exportToCsv = () => {
    if (filteredExpenses.length === 0) {
      toast.error('No expenses to export');
      return;
    }
    
    const headers = ['Date', 'Category', 'Description', 'Vendor', 'Payment Method', 'Amount'];
    const rowData = filteredExpenses.map((exp: Expense) => [
      format(new Date(exp.date), 'yyyy-MM-dd'),
      exp.category,
      exp.description,
      exp.vendorName || '-',
      exp.paymentMethod || '-',
      exp.amount.toFixed(2)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rowData.map((row: string[]) => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    const dateRangeStr = `${dateRange.startDate}_to_${dateRange.endDate}`;
    a.setAttribute('download', `expenses-${dateRangeStr}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success(`Exported ${filteredExpenses.length} expenses`);
  };

  // New function to export custom date range
  const exportCustomDateRangeCsv = async () => {
    try {
      setLoading(true);
      toast.loading('Fetching expenses for export...');
      
      if (!user?.hospital) {
        toast.error('No hospital assigned');
        return;
      }
      
      // Get data directly from the API for the specified date range
      const response = await api.get<{ expenses: Expense[] }>(`/api/expenses`, {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          hospitalId: user.hospital,
          timestamp: new Date().getTime()
        }
      });
      
      toast.dismiss();
      
      if (!response.data || !response.data.expenses || !Array.isArray(response.data.expenses)) {
        toast.error('No data available to export');
        return;
      }
      
      const expensesToExport = response.data.expenses;
      
      if (expensesToExport.length === 0) {
        toast.error('No expenses found for the selected date range');
        return;
      }
      
      const exportHeaders = ['Date', 'Category', 'Description', 'Vendor', 'Payment Method', 'Amount'];
      const exportRows = expensesToExport.map((exp: Expense) => [
        format(new Date(exp.date), 'yyyy-MM-dd'),
        exp.category,
        exp.description,
        exp.vendorName || '-',
        exp.paymentMethod || '-',
        exp.amount.toFixed(2)
      ]);
      
      const csvContent = [
        exportHeaders.join(','),
        ...exportRows.map((row: string[]) => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      const dateRangeStr = `${dateRange.startDate}_to_${dateRange.endDate}`;
      a.setAttribute('download', `expenses-${dateRangeStr}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success(`Exported ${expensesToExport.length} expenses`);
    } catch (error) {
      console.error('Error exporting expenses:', error);
      toast.error('Failed to export expenses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StaffLayout>
      <div className="space-y-5">
        {successNotification.show && (
          <div 
            className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 flex items-center rounded-md shadow-lg px-4 py-3 text-white ${
              successNotification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            <div className="mr-3">
              {successNotification.type === 'success' ? (
                <FaCheckCircle className="w-5 h-5" />
              ) : (
                <FaTimes className="w-5 h-5" />
              )}
            </div>
            <p>{successNotification.message}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h1 className="text-lg font-medium text-gray-800 flex items-center">
                <FaMoneyBillWave className="mr-2 text-teal-500" /> Clinic Expenses
              </h1>
              <p className="text-xs text-gray-500 mt-1">Manage and track clinic expenses like medicine and marketing</p>
            </div>
            {user?.hospital && (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="bg-teal-50 text-teal-600 border border-teal-200 px-3 py-1.5 rounded-md hover:bg-teal-100 transition-colors text-xs shadow-sm flex items-center"
              >
                <FaPlus className="mr-1" /> Add Expense
              </button>
              
              <button
                onClick={exportToCsv}
                className="bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-xs shadow-sm flex items-center"
              >
                <FaFileCsv className="mr-1" /> Export CSV
              </button>

              <button
                onClick={exportCustomDateRangeCsv}
                className="bg-green-50 text-green-600 border border-green-200 px-3 py-1.5 rounded-md hover:bg-green-100 transition-colors text-xs shadow-sm flex items-center"
              >
                <FaFileCsv className="mr-1" /> Export Date Range
              </button>
            </div>
            )}
          </div>
        </div>

        {!user?.hospital && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaTimes className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">No Hospital Assigned</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>You currently don't have a hospital assigned to your account. Please contact an administrator to get assigned to a hospital before accessing expense data.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <ExpenseFormModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          editMode={editMode}
        />

        {user?.hospital && (
          <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-teal-300 hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Expenses</p>
                <p className="text-lg font-medium text-gray-800">${calculateTotal()}</p>
              </div>
              <div className="bg-teal-100 p-2 rounded-full text-teal-500">
                <FaMoneyBillWave className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-300 hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Medicine Expenses</p>
                <p className="text-lg font-medium text-gray-800">${calculateTotalByCategory('medicine')}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full text-blue-500">
                <FaPills className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-amber-300 hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Marketing Expenses</p>
                <p className="text-lg font-medium text-gray-800">${calculateTotalByCategory('marketing')}</p>
              </div>
              <div className="bg-amber-100 p-2 rounded-full text-amber-500">
                <FaBullhorn className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search expenses..."
                  className="pl-8 block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  className="pl-8 block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                />
                <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                  className="pl-8 block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                />
                <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('date')} 
                      className="flex items-center space-x-1 focus:outline-none"
                    >
                      <span>Date</span>
                      {sortConfig.key === 'date' && (
                        sortConfig.direction === 'ascending' 
                          ? <FaSortAmountUp className="h-3 w-3 text-gray-400" />
                          : <FaSortAmountDown className="h-3 w-3 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('category')} 
                      className="flex items-center space-x-1 focus:outline-none"
                    >
                      <span>Category</span>
                      {sortConfig.key === 'category' && (
                        sortConfig.direction === 'ascending' 
                          ? <FaSortAmountUp className="h-3 w-3 text-gray-400" />
                          : <FaSortAmountDown className="h-3 w-3 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Type
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      onClick={() => handleSort('amount')} 
                      className="flex items-center space-x-1 focus:outline-none"
                    >
                      <span>Amount</span>
                      {sortConfig.key === 'amount' && (
                        sortConfig.direction === 'ascending' 
                          ? <FaSortAmountUp className="h-3 w-3 text-gray-400" />
                          : <FaSortAmountDown className="h-3 w-3 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill Image
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">
                      <div className="flex justify-center items-center">
                        <div className="w-6 h-6 border-2 border-teal-300 border-t-teal-500 rounded-full animate-spin mr-2"></div>
                        Loading expenses...
                      </div>
                    </td>
                  </tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">
                      No expenses found. {searchTerm && 'Try adjusting your search.'}
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="mr-2 text-gray-500">
                            {getCategoryIcon(expense.category)}
                          </span>
                          <span className="capitalize">{expense.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {expense.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {expense.vendorName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {expense.paymentMethod ? (
                          <span className="capitalize">{expense.paymentMethod}</span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        ${expense.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {expense.billImage ? (
                          <button
                            onClick={() => {
                              Swal.fire({
                                title: 'Bill Image',
                                imageUrl: expense.billImage,
                                imageAlt: 'Bill Image',
                                width: 800,
                                confirmButtonText: 'Close',
                                confirmButtonColor: '#14b8a6'
                              });
                            }}
                            className="text-teal-600 hover:text-teal-800 transition-colors"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense._id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}
      </div>
    </StaffLayout>
  );
};

export default StaffExpenses;