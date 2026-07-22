import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { BarChart3, BookOpen, ClipboardCheck, DollarSign, ShieldAlert, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { axiosClient } from '../api';

type ReportKey =
  | 'student-enrollment'
  | 'student-attendance'
  | 'fee-collection'
  | 'outstanding-fees'
  | 'income-expenses'
  | 'discipline';

interface ReportOption {
  key: ReportKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const reportOptions: ReportOption[] = [
  {
    key: 'student-enrollment',
    label: 'Student Enrollment',
    icon: Users,
    description: 'Current active enrollments by class and academic year.',
  },
  {
    key: 'student-attendance',
    label: 'Student Attendance',
    icon: ClipboardCheck,
    description: 'Attendance status history for classroom reporting.',
  },
  {
    key: 'fee-collection',
    label: 'Fee Collection',
    icon: DollarSign,
    description: 'Recorded fee payments and collection activity.',
  },
  {
    key: 'outstanding-fees',
    label: 'Outstanding Fees',
    icon: BarChart3,
    description: 'Unpaid and partially paid student invoices.',
  },
  {
    key: 'income-expenses',
    label: 'Income & Expenses',
    icon: BookOpen,
    description: 'Cashflow summary from recorded income and expenses.',
  },
  {
    key: 'discipline',
    label: 'Discipline Report',
    icon: ShieldAlert,
    description: 'Student discipline incidents and current status.',
  },
];

const formatCurrency = (value: unknown) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
};

const formatDate = (value: unknown) => {
  if (!value) return 'N/A';
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
};

const prettifyLabel = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const pickColumns = (rows: Array<Record<string, unknown>>, limit = 6) => {
  if (!rows.length) return [];
  return Object.keys(rows[0]).slice(0, limit);
};

const formatCellValue = (column: string, value: unknown) => {
  if (column.toLowerCase().includes('date')) {
    return formatDate(value);
  }
  if (
    column.toLowerCase().includes('amount') ||
    column.toLowerCase().includes('balance') ||
    column.toLowerCase().includes('total')
  ) {
    return formatCurrency(value);
  }
  return value === null || value === undefined || value === '' ? 'N/A' : String(value);
};

export default function Reports() {
  const [activeReport, setActiveReport] = useState<ReportKey>('student-enrollment');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [summary, setSummary] = useState<Array<{ label: string; value: string }>>([]);
  const [reportFilter, setReportFilter] = useState('');

  const selectedReport = reportOptions.find((item) => item.key === activeReport) ?? reportOptions[0];

  const loadReport = async (reportKey: ReportKey) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await axiosClient.get(`/reports/${reportKey}`);
      const payload = response.data?.data;

      if (reportKey === 'income-expenses') {
        const income = Array.isArray(payload?.income) ? payload.income : [];
        const expenses = Array.isArray(payload?.expenses) ? payload.expenses : [];
        const combined = [
          ...income.map((item: Record<string, unknown>) => ({ type: 'INCOME', ...item })),
          ...expenses.map((item: Record<string, unknown>) => ({ type: 'EXPENSE', ...item })),
        ].sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')));

        const totalIncome = income.reduce((sum: number, item: Record<string, unknown>) => sum + Number(item.amount ?? 0), 0);
        const totalExpenses = expenses.reduce((sum: number, item: Record<string, unknown>) => sum + Number(item.amount ?? 0), 0);

        setRows(combined);
        setSummary([
          { label: 'Income Entries', value: String(income.length) },
          { label: 'Expense Entries', value: String(expenses.length) },
          { label: 'Total Income', value: formatCurrency(totalIncome) },
          { label: 'Total Expenses', value: formatCurrency(totalExpenses) },
          { label: 'Net Balance', value: formatCurrency(totalIncome - totalExpenses) },
        ]);
      } else {
        const nextRows = Array.isArray(payload) ? payload : [];
        setRows(nextRows);

        const nextSummary: Array<{ label: string; value: string }> = [
          { label: 'Records', value: String(nextRows.length) },
        ];

        if (reportKey === 'fee-collection') {
          const total = nextRows.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
          nextSummary.push({ label: 'Collected Total', value: formatCurrency(total) });
        }

        if (reportKey === 'outstanding-fees') {
          const outstanding = nextRows.reduce(
            (sum, item) => sum + Number(item.balance_amount ?? item.final_amount ?? 0),
            0,
          );
          nextSummary.push({ label: 'Outstanding Total', value: formatCurrency(outstanding) });
        }

        if (reportKey === 'student-attendance') {
          const absentCount = nextRows.filter((item) => String(item.status ?? '').toUpperCase() === 'ABSENT').length;
          nextSummary.push({ label: 'Absent Records', value: String(absentCount) });
        }

        if (reportKey === 'discipline') {
          const openCount = nextRows.filter((item) => String(item.status ?? '').toUpperCase() !== 'RESOLVED').length;
          nextSummary.push({ label: 'Open Cases', value: String(openCount) });
        }

        setSummary(nextSummary);
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Unable to load reports.';
      setErrorMessage(message);
      toast.error(message);
      setRows([]);
      setSummary([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReport(activeReport);
  }, [activeReport]);

  const filteredRows = useMemo(() => {
    const search = reportFilter.trim().toLowerCase();
    if (!search) return rows;

    return rows.filter((row) =>
      Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(search)),
    );
  }, [rows, reportFilter]);

  const columns = useMemo(() => pickColumns(filteredRows), [filteredRows]);
  const exportRows = useMemo(
    () =>
      filteredRows.map((row) =>
        columns.reduce<Record<string, string>>((acc, column) => {
          acc[prettifyLabel(column)] = formatCellValue(column, row[column]);
          return acc;
        }, {}),
      ),
    [columns, filteredRows],
  );

  const handleExportExcel = () => {
    if (!exportRows.length) {
      toast.error('No report data available to export.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, selectedReport.label.slice(0, 31));
    const fileName = `${selectedReport.key}-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('Excel report downloaded successfully.');
  };

  const handleExportPdf = () => {
    if (!exportRows.length) {
      toast.error('No report data available to export.');
      return;
    }

    const doc = new jsPDF({
      orientation: columns.length > 5 ? 'landscape' : 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    doc.setFontSize(18);
    doc.text(selectedReport.label, 40, 42);
    doc.setFontSize(10);
    doc.setTextColor(90, 103, 122);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 40, 60);

    autoTable(doc, {
      startY: 78,
      head: [columns.map((column) => prettifyLabel(column))],
      body: filteredRows.map((row) => columns.map((column) => formatCellValue(column, row[column]))),
      styles: {
        fontSize: 8,
        cellPadding: 6,
      },
      headStyles: {
        fillColor: [26, 70, 253],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 28, right: 28 },
    });

    const fileName = `${selectedReport.key}-report-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
    toast.success('PDF report downloaded successfully.');
  };

  return (
    <div id="reports-view" className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4 bg-slate-50 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-base font-black text-slate-800">Administrative Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real database reports for enrollment, attendance, finance, and discipline.</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {reportOptions.map((option) => {
            const Icon = option.icon;
            const isActive = option.key === activeReport;
            return (
              <button
                key={option.key}
                onClick={() => setActiveReport(option.key)}
                className={`rounded-2xl border p-4 text-left transition ${isActive ? 'border-blue-200 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{option.label}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{option.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f6faff_55%,#eefaf4_100%)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-600">{selectedReport.label}</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Report Snapshot</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportExcel}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
              >
                Download Excel
              </button>
              <button
                onClick={handleExportPdf}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
              >
                Download PDF
              </button>
              <button
                onClick={() => void loadReport(activeReport)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Refresh Report
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            {summary.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-xl font-black text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-black text-slate-900">{selectedReport.label} Records</h3>
          </div>
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
              placeholder="Filter current report records"
              value={reportFilter}
              onChange={(event) => setReportFilter(event.target.value)}
            />
          </div>

          {loading ? (
            <div className="px-5 py-10 text-sm text-slate-500">Loading report data...</div>
          ) : errorMessage ? (
            <div className="px-5 py-10 text-sm font-semibold text-rose-700">{errorMessage}</div>
          ) : !filteredRows.length ? (
            <div className="px-5 py-10 text-sm text-slate-500">No records found for this report.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    {columns.map((column) => (
                      <th key={column} className="px-4 py-3 whitespace-nowrap">{prettifyLabel(column)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRows.slice(0, 100).map((row, index) => (
                    <tr key={`${activeReport}-${index}`} className="hover:bg-slate-50">
                      {columns.map((column) => {
                        const value = row[column];
                        const displayValue = formatCellValue(column, value);
                        return (
                          <td key={column} className="px-4 py-3 whitespace-nowrap text-slate-700">
                            {displayValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
