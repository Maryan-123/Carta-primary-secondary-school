import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { DollarSign, FileText, Landmark, Plus, Receipt, Trash2, Wallet } from 'lucide-react';
import { axiosClient } from '../api';
import { useUIStore } from '../store';

interface ApiStudent {
  id: number;
  admission_number: string;
  first_name: string;
  last_name: string;
}

interface ApiFeeType {
  id: number;
  name: string;
  description?: string | null;
  is_active?: boolean;
}

interface ApiFeeStructure {
  id: number;
  fee_type_name?: string;
  classroom_name?: string;
  academic_year_name?: string;
  term_name?: string;
  amount: number;
  due_date?: string | null;
}

interface ApiInvoice {
  id: number;
  student_id: number;
  invoice_number: string;
  admission_number?: string;
  first_name?: string;
  last_name?: string;
  invoice_date?: string;
  due_date?: string | null;
  total_amount?: number;
  final_amount?: number;
  paid_amount?: number;
  balance_amount?: number;
  status?: string;
}

interface ApiPayment {
  id: number;
  invoice_id: number;
  invoice_number?: string;
  student_id: number;
  receipt_number?: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string | null;
}

interface ApiExpense {
  id: number;
  expense_category: string;
  description: string;
  amount: number;
  expense_date: string;
  payment_method: string;
}

interface ApiIncome {
  id: number;
  income_category: string;
  description: string;
  amount: number;
  income_date: string;
  payment_method: string;
}

interface ApiAcademicYear {
  id: number;
  name: string;
}

interface ApiTerm {
  id: number;
  name: string;
}

interface ApiClassroom {
  id: number;
  name: string;
}

const today = new Date().toISOString().slice(0, 10);

const formatCurrency = (value: unknown) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0) || 0);

const formatDate = (value?: string | null) => (value ? String(value).slice(0, 10) : 'N/A');

export default function BillingFinance() {
  const { activeTab, openConfirm } = useUIStore();
  const isFinanceTab = activeTab === 'finance';
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [feeTypes, setFeeTypes] = useState<ApiFeeType[]>([]);
  const [feeStructures, setFeeStructures] = useState<ApiFeeStructure[]>([]);
  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [expenses, setExpenses] = useState<ApiExpense[]>([]);
  const [income, setIncome] = useState<ApiIncome[]>([]);
  const [classrooms, setClassrooms] = useState<ApiClassroom[]>([]);
  const [academicYears, setAcademicYears] = useState<ApiAcademicYear[]>([]);
  const [terms, setTerms] = useState<ApiTerm[]>([]);
  const [currentAcademicYearId, setCurrentAcademicYearId] = useState<number | null>(null);
  const [currentTermId, setCurrentTermId] = useState<number | null>(null);

  const [showFeeTypeForm, setShowFeeTypeForm] = useState(false);
  const [showStructureForm, setShowStructureForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showLedgerForm, setShowLedgerForm] = useState(false);

  const [feeTypeName, setFeeTypeName] = useState('');
  const [feeTypeDescription, setFeeTypeDescription] = useState('');

  const [structureClassroomId, setStructureClassroomId] = useState('');
  const [structureFeeTypeId, setStructureFeeTypeId] = useState('');
  const [structureAcademicYearId, setStructureAcademicYearId] = useState('');
  const [structureTermId, setStructureTermId] = useState('');
  const [structureAmount, setStructureAmount] = useState('0');
  const [structureDueDate, setStructureDueDate] = useState('');

  const [invoiceStudentId, setInvoiceStudentId] = useState('');
  const [invoiceFeeTypeId, setInvoiceFeeTypeId] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [invoiceDiscount, setInvoiceDiscount] = useState('0');

  const [paymentInvoiceId, setPaymentInvoiceId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK' | 'MOBILE_MONEY' | 'CHEQUE'>('CASH');
  const [paymentReference, setPaymentReference] = useState('');

  const [ledgerType, setLedgerType] = useState<'income' | 'expense'>('expense');
  const [ledgerCategory, setLedgerCategory] = useState('');
  const [ledgerDescription, setLedgerDescription] = useState('');
  const [ledgerAmount, setLedgerAmount] = useState('');
  const [ledgerDate, setLedgerDate] = useState(today);
  const [ledgerMethod, setLedgerMethod] = useState<'CASH' | 'BANK' | 'MOBILE_MONEY' | 'CHEQUE'>('CASH');
  const [ledgerReference, setLedgerReference] = useState('');
  const [feeTypeFilter, setFeeTypeFilter] = useState('');
  const [structureFilter, setStructureFilter] = useState('');
  const [invoiceFilter, setInvoiceFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [ledgerFilter, setLedgerFilter] = useState('');

  const loadData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [
        studentsResponse,
        feeTypesResponse,
        structuresResponse,
        invoicesResponse,
        paymentsResponse,
        expensesResponse,
        incomeResponse,
        classroomsResponse,
        academicYearsResponse,
        currentAcademicYearResponse,
        termsResponse,
        currentTermResponse,
      ] = await Promise.all([
        axiosClient.get('/students'),
        axiosClient.get('/fee-types'),
        axiosClient.get('/fee-structures'),
        axiosClient.get('/invoices'),
        axiosClient.get('/payments'),
        axiosClient.get('/expenses'),
        axiosClient.get('/income'),
        axiosClient.get('/classrooms'),
        axiosClient.get('/academic-years'),
        axiosClient.get('/academic-years/current').catch(() => ({ data: { data: null } })),
        axiosClient.get('/terms'),
        axiosClient.get('/terms/current').catch(() => ({ data: { data: null } })),
      ]);

      setStudents(studentsResponse.data?.data || []);
      setFeeTypes(feeTypesResponse.data?.data || []);
      setFeeStructures(structuresResponse.data?.data || []);
      setInvoices(invoicesResponse.data?.data || []);
      setPayments(paymentsResponse.data?.data || []);
      setExpenses(expensesResponse.data?.data || []);
      setIncome(incomeResponse.data?.data || []);
      setClassrooms(classroomsResponse.data?.data || []);
      setAcademicYears(academicYearsResponse.data?.data || []);
      setTerms(termsResponse.data?.data || []);
      setCurrentAcademicYearId(currentAcademicYearResponse.data?.data?.id ?? null);
      setCurrentTermId(currentTermResponse.data?.data?.id ?? null);
      setStructureAcademicYearId(String(currentAcademicYearResponse.data?.data?.id ?? ''));
      setStructureTermId(String(currentTermResponse.data?.data?.id ?? ''));
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Unable to load finance data from the backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const selectedFeeType = useMemo(
    () => feeTypes.find((item) => String(item.id) === invoiceFeeTypeId),
    [feeTypes, invoiceFeeTypeId],
  );

  const selectedInvoice = useMemo(
    () => invoices.find((item) => String(item.id) === paymentInvoiceId),
    [invoices, paymentInvoiceId],
  );

  const financeSummary = useMemo(() => {
    const totalInvoiced = invoices.reduce((sum, item) => sum + Number(item.final_amount ?? item.total_amount ?? 0), 0);
    const totalPaid = payments.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
    const outstanding = invoices.reduce((sum, item) => sum + Number(item.balance_amount ?? 0), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
    const totalIncome = income.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);

    return {
      totalInvoiced,
      totalPaid,
      outstanding,
      totalExpenses,
      totalIncome,
      netCash: totalPaid + totalIncome - totalExpenses,
    };
  }, [expenses, income, invoices, payments]);

  const filteredFeeTypes = useMemo(
    () =>
      feeTypes.filter((item) =>
        `${item.name} ${item.description || ''}`.toLowerCase().includes(feeTypeFilter.toLowerCase()),
      ),
    [feeTypeFilter, feeTypes],
  );

  const filteredFeeStructures = useMemo(
    () =>
      feeStructures.filter((item) =>
        `${item.fee_type_name || ''} ${item.classroom_name || ''} ${item.academic_year_name || ''} ${item.term_name || ''}`
          .toLowerCase()
          .includes(structureFilter.toLowerCase()),
      ),
    [feeStructures, structureFilter],
  );

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((item) =>
        `${item.invoice_number} ${item.admission_number || ''} ${item.first_name || ''} ${item.last_name || ''} ${item.status || ''}`
          .toLowerCase()
          .includes(invoiceFilter.toLowerCase()),
      ),
    [invoiceFilter, invoices],
  );

  const filteredPayments = useMemo(
    () =>
      payments.filter((item) =>
        `${item.invoice_number || ''} ${item.receipt_number || ''} ${item.payment_method || ''} ${item.reference_number || ''}`
          .toLowerCase()
          .includes(paymentFilter.toLowerCase()),
      ),
    [paymentFilter, payments],
  );

  const filteredIncome = useMemo(
    () =>
      income.filter((item) =>
        `${item.income_category} ${item.description} ${item.payment_method}`.toLowerCase().includes(ledgerFilter.toLowerCase()),
      ),
    [income, ledgerFilter],
  );

  const filteredExpenses = useMemo(
    () =>
      expenses.filter((item) =>
        `${item.expense_category} ${item.description} ${item.payment_method}`.toLowerCase().includes(ledgerFilter.toLowerCase()),
      ),
    [expenses, ledgerFilter],
  );

  const handleCreateFeeType = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axiosClient.post('/fee-types', {
        name: feeTypeName,
        description: feeTypeDescription || undefined,
        isActive: true,
      });
      toast.success('Fee type created successfully.');
      setFeeTypeName('');
      setFeeTypeDescription('');
      setShowFeeTypeForm(false);
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to create fee type.');
    }
  };

  const handleCreateFeeStructure = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axiosClient.post('/fee-structures', {
        academicYearId: Number(structureAcademicYearId || currentAcademicYearId),
        termId: Number(structureTermId || currentTermId),
        classroomId: Number(structureClassroomId),
        feeTypeId: Number(structureFeeTypeId),
        amount: Number(structureAmount),
        dueDate: structureDueDate || undefined,
      });
      toast.success('Fee structure created successfully.');
      setStructureClassroomId('');
      setStructureFeeTypeId('');
      setStructureAmount('0');
      setStructureDueDate('');
      setShowStructureForm(false);
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to create fee structure.');
    }
  };

  const handleCreateInvoice = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFeeType) {
      toast.error('Select a fee type first.');
      return;
    }

    const feeStructureMatch = feeStructures.find(
      (item) =>
        item.fee_type_name?.toLowerCase() === selectedFeeType.name.toLowerCase() &&
        (!currentTermId || String(item.term_name || '').length > 0),
    );
    const amount = Number(feeStructureMatch?.amount ?? 0);

    if (!amount) {
      toast.error('Create a fee structure for this fee type before raising invoices.');
      return;
    }

    try {
      await axiosClient.post('/invoices', {
        studentId: Number(invoiceStudentId),
        academicYearId: Number(currentAcademicYearId),
        termId: Number(currentTermId),
        invoiceDate: today,
        dueDate: invoiceDueDate || undefined,
        discountAmount: Number(invoiceDiscount || 0),
        items: [
          {
            feeTypeId: Number(invoiceFeeTypeId),
            amount,
            discountAmount: Number(invoiceDiscount || 0),
            description: selectedFeeType.name,
          },
        ],
      });
      toast.success('Invoice created successfully.');
      setInvoiceStudentId('');
      setInvoiceFeeTypeId('');
      setInvoiceDueDate('');
      setInvoiceDiscount('0');
      setShowInvoiceForm(false);
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to create invoice.');
    }
  };

  const handleCreatePayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedInvoice) {
      toast.error('Select an invoice first.');
      return;
    }

    try {
      await axiosClient.post('/payments', {
        invoiceId: Number(selectedInvoice.id),
        studentId: Number(selectedInvoice.student_id),
        paymentDate,
        amount: Number(paymentAmount),
        paymentMethod,
        referenceNumber: paymentReference || undefined,
      });
      toast.success('Payment recorded successfully.');
      setPaymentInvoiceId('');
      setPaymentAmount('');
      setPaymentReference('');
      setPaymentMethod('CASH');
      setPaymentDate(today);
      setShowPaymentForm(false);
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to record payment.');
    }
  };

  const handleCreateLedgerEntry = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      amount: Number(ledgerAmount),
      description: ledgerDescription,
      paymentMethod: ledgerMethod,
      referenceNumber: ledgerReference || undefined,
      ...(ledgerType === 'income'
        ? {
            incomeCategory: ledgerCategory,
            incomeDate: ledgerDate,
          }
        : {
            expenseCategory: ledgerCategory,
            expenseDate: ledgerDate,
          }),
    };

    try {
      if (ledgerType === 'income') {
        await axiosClient.post('/income', payload);
      } else {
        await axiosClient.post('/expenses', payload);
      }
      toast.success(ledgerType === 'income' ? 'Income recorded successfully.' : 'Expense recorded successfully.');
      setLedgerCategory('');
      setLedgerDescription('');
      setLedgerAmount('');
      setLedgerReference('');
      setLedgerDate(today);
      setShowLedgerForm(false);
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to save ledger entry.');
    }
  };

  const handleDeleteFeeType = async (id: number) => {
    const confirmed = await openConfirm({
      title: 'Delete fee type?',
      message: 'Are you sure you want to remove this fee type?',
      confirmLabel: 'Delete',
    });
    if (!confirmed) return;

    try {
      await axiosClient.delete(`/fee-types/${id}`);
      toast.success('Fee type deleted successfully.');
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to delete fee type.');
    }
  };

  const handleDeleteFeeStructure = async (id: number) => {
    const confirmed = await openConfirm({
      title: 'Delete fee structure?',
      message: 'Are you sure you want to remove this fee structure?',
      confirmLabel: 'Delete',
    });
    if (!confirmed) return;

    try {
      await axiosClient.delete(`/fee-structures/${id}`);
      toast.success('Fee structure deleted successfully.');
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to delete fee structure.');
    }
  };

  const handleDeleteLedgerEntry = async (type: 'income' | 'expense', id: number) => {
    const confirmed = await openConfirm({
      title: `Delete ${type} entry?`,
      message: `Are you sure you want to delete this ${type} record?`,
      confirmLabel: 'Delete',
    });
    if (!confirmed) return;

    try {
      await axiosClient.delete(type === 'income' ? `/income/${id}` : `/expenses/${id}`);
      toast.success(`${type === 'income' ? 'Income' : 'Expense'} deleted successfully.`);
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Unable to delete ${type} record.`);
    }
  };

  const handleCancelInvoice = async (id: number) => {
    const confirmed = await openConfirm({
      title: 'Cancel invoice?',
      message: 'Are you sure you want to cancel this invoice?',
      confirmLabel: 'Cancel Invoice',
      tone: 'primary',
    });
    if (!confirmed) return;

    try {
      await axiosClient.post(`/invoices/${id}/cancel`);
      toast.success('Invoice cancelled successfully.');
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to cancel invoice.');
    }
  };

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading finance records...</div>;
  }

  return (
    <div id="billing-finance-view" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h1 className="text-base font-black text-slate-800">{isFinanceTab ? 'Finance Ledger' : 'Fee Billing & Receipts'}</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          {isFinanceTab
            ? 'Track real income, expenses, and cash movement from the backend database.'
            : 'Manage fee types, fee structures, student invoices, and payment receipts using real database records.'}
        </p>
      </div>

      <div className="space-y-6 p-6">
        {errorMessage ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{errorMessage}</div> : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-blue-700">Total Invoiced</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(financeSummary.totalInvoiced)}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Payments Collected</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(financeSummary.totalPaid)}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Outstanding Balance</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(financeSummary.outstanding)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-600">Net Cash Position</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(financeSummary.netCash)}</p>
          </div>
        </div>

        {!isFinanceTab ? (
          <>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowFeeTypeForm((value) => !value)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700">
                <Plus className="mr-1 inline h-4 w-4" />
                New Fee Type
              </button>
              <button onClick={() => setShowStructureForm((value) => !value)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700">
                <Plus className="mr-1 inline h-4 w-4" />
                New Fee Structure
              </button>
              <button onClick={() => setShowInvoiceForm((value) => !value)} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white">
                <FileText className="mr-1 inline h-4 w-4" />
                Create Invoice
              </button>
              <button onClick={() => setShowPaymentForm((value) => !value)} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white">
                <Receipt className="mr-1 inline h-4 w-4" />
                Record Payment
              </button>
            </div>

            {showFeeTypeForm ? (
              <form onSubmit={handleCreateFeeType} className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                <input className="rounded border bg-white px-3 py-2 text-xs" placeholder="Fee type name" value={feeTypeName} onChange={(event) => setFeeTypeName(event.target.value)} />
                <input className="rounded border bg-white px-3 py-2 text-xs" placeholder="Description" value={feeTypeDescription} onChange={(event) => setFeeTypeDescription(event.target.value)} />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowFeeTypeForm(false)} className="rounded border bg-white px-3 py-2 text-xs font-bold text-slate-600">Cancel</button>
                  <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white">Create</button>
                </div>
              </form>
            ) : null}

            {showStructureForm ? (
              <form onSubmit={handleCreateFeeStructure} className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3 xl:grid-cols-6">
                <select className="rounded border bg-white px-3 py-2 text-xs" value={structureAcademicYearId} onChange={(event) => setStructureAcademicYearId(event.target.value)}>
                  <option value="">Academic year</option>
                  {academicYears.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <select className="rounded border bg-white px-3 py-2 text-xs" value={structureTermId} onChange={(event) => setStructureTermId(event.target.value)}>
                  <option value="">Term</option>
                  {terms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <select className="rounded border bg-white px-3 py-2 text-xs" value={structureClassroomId} onChange={(event) => setStructureClassroomId(event.target.value)}>
                  <option value="">Classroom</option>
                  {classrooms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <select className="rounded border bg-white px-3 py-2 text-xs" value={structureFeeTypeId} onChange={(event) => setStructureFeeTypeId(event.target.value)}>
                  <option value="">Fee type</option>
                  {feeTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <input type="number" min="0" className="rounded border bg-white px-3 py-2 text-xs" placeholder="Amount" value={structureAmount} onChange={(event) => setStructureAmount(event.target.value)} />
                <input type="date" className="rounded border bg-white px-3 py-2 text-xs" value={structureDueDate} onChange={(event) => setStructureDueDate(event.target.value)} />
                <div className="md:col-span-3 xl:col-span-6 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowStructureForm(false)} className="rounded border bg-white px-3 py-2 text-xs font-bold text-slate-600">Cancel</button>
                  <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white">Create Structure</button>
                </div>
              </form>
            ) : null}

            {showInvoiceForm ? (
              <form onSubmit={handleCreateInvoice} className="grid grid-cols-1 gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 md:grid-cols-4">
                <select className="rounded border bg-white px-3 py-2 text-xs" value={invoiceStudentId} onChange={(event) => setInvoiceStudentId(event.target.value)}>
                  <option value="">Student</option>
                  {students.map((item) => <option key={item.id} value={item.id}>{item.admission_number} - {item.first_name} {item.last_name}</option>)}
                </select>
                <select className="rounded border bg-white px-3 py-2 text-xs" value={invoiceFeeTypeId} onChange={(event) => setInvoiceFeeTypeId(event.target.value)}>
                  <option value="">Fee type</option>
                  {feeTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <input type="date" className="rounded border bg-white px-3 py-2 text-xs" value={invoiceDueDate} onChange={(event) => setInvoiceDueDate(event.target.value)} />
                <input type="number" min="0" className="rounded border bg-white px-3 py-2 text-xs" placeholder="Discount" value={invoiceDiscount} onChange={(event) => setInvoiceDiscount(event.target.value)} />
                <div className="md:col-span-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowInvoiceForm(false)} className="rounded border bg-white px-3 py-2 text-xs font-bold text-slate-600">Cancel</button>
                  <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white">Create Invoice</button>
                </div>
              </form>
            ) : null}

            {showPaymentForm ? (
              <form onSubmit={handleCreatePayment} className="grid grid-cols-1 gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 md:grid-cols-5">
                <select className="rounded border bg-white px-3 py-2 text-xs" value={paymentInvoiceId} onChange={(event) => setPaymentInvoiceId(event.target.value)}>
                  <option value="">Invoice</option>
                  {invoices.filter((item) => String(item.status || '').toUpperCase() !== 'CANCELLED').map((item) => (
                    <option key={item.id} value={item.id}>{item.invoice_number} - {item.first_name} {item.last_name}</option>
                  ))}
                </select>
                <input type="number" min="0" className="rounded border bg-white px-3 py-2 text-xs" placeholder="Amount" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} />
                <input type="date" className="rounded border bg-white px-3 py-2 text-xs" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} />
                <select className="rounded border bg-white px-3 py-2 text-xs" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as 'CASH' | 'BANK' | 'MOBILE_MONEY' | 'CHEQUE')}>
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
                <input className="rounded border bg-white px-3 py-2 text-xs" placeholder="Reference number" value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} />
                <div className="md:col-span-5 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowPaymentForm(false)} className="rounded border bg-white px-3 py-2 text-xs font-bold text-slate-600">Cancel</button>
                  <button type="submit" className="rounded bg-emerald-600 px-4 py-2 text-xs font-bold text-white">Record Payment</button>
                </div>
              </form>
            ) : null}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200">
                <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-800">Fee Types</div>
                <div className="border-b border-slate-100 px-4 py-3">
                  <input className="w-full rounded border bg-white px-3 py-2 text-xs" placeholder="Filter fee types" value={feeTypeFilter} onChange={(event) => setFeeTypeFilter(event.target.value)} />
                </div>
                <div className="divide-y divide-slate-100">
                  {filteredFeeTypes.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-slate-500">{item.description || 'No description'}</p>
                      </div>
                      <button title="Delete fee type" onClick={() => void handleDeleteFeeType(item.id)} className="rounded border border-rose-200 bg-rose-50 p-2 text-rose-700">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200">
                <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-800">Fee Structures</div>
                <div className="border-b border-slate-100 px-4 py-3">
                  <input className="w-full rounded border bg-white px-3 py-2 text-xs" placeholder="Filter fee structures" value={structureFilter} onChange={(event) => setStructureFilter(event.target.value)} />
                </div>
                <div className="divide-y divide-slate-100">
                  {filteredFeeStructures.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{item.fee_type_name} - {item.classroom_name}</p>
                        <p className="text-slate-500">{item.academic_year_name} / {item.term_name} / {formatCurrency(item.amount)}</p>
                      </div>
                      <button title="Delete fee structure" onClick={() => void handleDeleteFeeStructure(item.id)} className="rounded border border-rose-200 bg-rose-50 p-2 text-rose-700">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-100 px-4 py-3">
                <input className="w-full rounded border bg-white px-3 py-2 text-xs" placeholder="Filter invoices by student, invoice number, or status" value={invoiceFilter} onChange={(event) => setInvoiceFilter(event.target.value)} />
              </div>
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Issued</th>
                    <th className="px-4 py-3">Final Amount</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3">Balance</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredInvoices.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{item.invoice_number}</td>
                      <td className="px-4 py-3">{item.first_name} {item.last_name}</td>
                      <td className="px-4 py-3">{formatDate(item.invoice_date)}</td>
                      <td className="px-4 py-3">{formatCurrency(item.final_amount ?? item.total_amount)}</td>
                      <td className="px-4 py-3 text-emerald-700">{formatCurrency(item.paid_amount)}</td>
                      <td className="px-4 py-3 text-rose-700">{formatCurrency(item.balance_amount)}</td>
                      <td className="px-4 py-3">{item.status || 'UNKNOWN'}</td>
                      <td className="px-4 py-3 text-right">
                        {String(item.status || '').toUpperCase() !== 'CANCELLED' ? (
                          <button onClick={() => void handleCancelInvoice(item.id)} className="rounded border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-700">
                            Cancel
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-100 px-4 py-3">
                <input className="w-full rounded border bg-white px-3 py-2 text-xs" placeholder="Filter payments by receipt, invoice, method, or reference" value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} />
              </div>
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Receipt</th>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredPayments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{item.receipt_number || `PAY-${item.id}`}</td>
                      <td className="px-4 py-3">{item.invoice_number || item.invoice_id}</td>
                      <td className="px-4 py-3">{item.payment_method}</td>
                      <td className="px-4 py-3">{formatDate(item.payment_date)}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setLedgerType('income')} className={`rounded-lg px-4 py-2 text-xs font-bold ${ledgerType === 'income' ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white text-slate-700'}`}>
                <Wallet className="mr-1 inline h-4 w-4" />
                Income
              </button>
              <button onClick={() => setLedgerType('expense')} className={`rounded-lg px-4 py-2 text-xs font-bold ${ledgerType === 'expense' ? 'bg-rose-600 text-white' : 'border border-slate-300 bg-white text-slate-700'}`}>
                <Landmark className="mr-1 inline h-4 w-4" />
                Expense
              </button>
              <button onClick={() => setShowLedgerForm((value) => !value)} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white">
                <Plus className="mr-1 inline h-4 w-4" />
                New Ledger Entry
              </button>
            </div>

            {showLedgerForm ? (
              <form onSubmit={handleCreateLedgerEntry} className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-5">
                <input className="rounded border bg-white px-3 py-2 text-xs" placeholder={ledgerType === 'income' ? 'Income category' : 'Expense category'} value={ledgerCategory} onChange={(event) => setLedgerCategory(event.target.value)} />
                <input className="rounded border bg-white px-3 py-2 text-xs" placeholder="Description" value={ledgerDescription} onChange={(event) => setLedgerDescription(event.target.value)} />
                <input type="number" min="0" className="rounded border bg-white px-3 py-2 text-xs" placeholder="Amount" value={ledgerAmount} onChange={(event) => setLedgerAmount(event.target.value)} />
                <input type="date" className="rounded border bg-white px-3 py-2 text-xs" value={ledgerDate} onChange={(event) => setLedgerDate(event.target.value)} />
                <select className="rounded border bg-white px-3 py-2 text-xs" value={ledgerMethod} onChange={(event) => setLedgerMethod(event.target.value as 'CASH' | 'BANK' | 'MOBILE_MONEY' | 'CHEQUE')}>
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
                <input className="md:col-span-3 rounded border bg-white px-3 py-2 text-xs" placeholder="Reference number" value={ledgerReference} onChange={(event) => setLedgerReference(event.target.value)} />
                <div className="md:col-span-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowLedgerForm(false)} className="rounded border bg-white px-3 py-2 text-xs font-bold text-slate-600">Cancel</button>
                  <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white">Save Entry</button>
                </div>
              </form>
            ) : null}

            <input className="w-full rounded border bg-white px-3 py-2 text-xs" placeholder="Filter income and expenses by category, description, or method" value={ledgerFilter} onChange={(event) => setLedgerFilter(event.target.value)} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-800">Income Records</div>
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredIncome.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{item.income_category}</div>
                          <div className="text-slate-500">{item.description}</div>
                        </td>
                        <td className="px-4 py-3">{formatDate(item.income_date)}</td>
                        <td className="px-4 py-3 font-bold text-emerald-700">{formatCurrency(item.amount)}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => void handleDeleteLedgerEntry('income', item.id)} className="rounded border border-rose-200 bg-rose-50 p-2 text-rose-700">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-800">Expense Records</div>
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredExpenses.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{item.expense_category}</div>
                          <div className="text-slate-500">{item.description}</div>
                        </td>
                        <td className="px-4 py-3">{formatDate(item.expense_date)}</td>
                        <td className="px-4 py-3 font-bold text-rose-700">{formatCurrency(item.amount)}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => void handleDeleteLedgerEntry('expense', item.id)} className="rounded border border-rose-200 bg-rose-50 p-2 text-rose-700">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-100 px-4 py-3">
                <input className="w-full rounded border bg-white px-3 py-2 text-xs" placeholder="Filter payment receipts" value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} />
              </div>
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Receipt</th>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredPayments.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{item.receipt_number || `PAY-${item.id}`}</td>
                      <td className="px-4 py-3">{item.invoice_number || item.invoice_id}</td>
                      <td className="px-4 py-3">{formatDate(item.payment_date)}</td>
                      <td className="px-4 py-3">{item.payment_method}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
