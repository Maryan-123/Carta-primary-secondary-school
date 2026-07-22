import React from 'react';
import { ReceiptText, X } from 'lucide-react';

interface InvoiceItem {
  id?: number | string;
  fee_type_name?: string | null;
  description?: string | null;
  amount?: number | string | null;
  discount_amount?: number | string | null;
}

interface InvoiceData {
  id: number | string;
  invoice_number?: string | null;
  invoice_date?: string | null;
  due_date?: string | null;
  status?: string | null;
  total_amount?: number | string | null;
  discount_amount?: number | string | null;
  final_amount?: number | string | null;
  paid_amount?: number | string | null;
  balance_amount?: number | string | null;
  items?: InvoiceItem[];
}

interface InvoicePreviewModalProps {
  invoice: InvoiceData | null;
  ownerName?: string;
  onClose: () => void;
}

const formatMoney = (value: unknown) => Number(value ?? 0).toLocaleString();

export default function InvoicePreviewModal({ invoice, ownerName, onClose }: InvoicePreviewModalProps) {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-[32px] border border-[#dbe5ff] bg-[linear-gradient(180deg,#ffffff_0%,#f4f8ff_48%,#eef8f2_100%)] shadow-[0_34px_90px_rgba(15,23,42,0.28)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#dbe5ff] px-6 py-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d9e4ff] bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-[#123B8A]">
              <ReceiptText className="h-3.5 w-3.5" />
              Full Invoice
            </div>
            <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#102c63]">
              {invoice.invoice_number || `Invoice #${invoice.id}`}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {ownerName || 'Student Account'}{invoice.due_date ? ` | Due ${String(invoice.due_date).slice(0, 10)}` : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-96px)] overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-[#dbe5ff] bg-white/85 px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Invoice Date</p>
              <p className="mt-2 text-sm font-bold text-slate-900">{String(invoice.invoice_date || '').slice(0, 10) || '-'}</p>
            </div>
            <div className="rounded-2xl border border-[#dbe5ff] bg-white/85 px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Due Date</p>
              <p className="mt-2 text-sm font-bold text-slate-900">{String(invoice.due_date || '').slice(0, 10) || '-'}</p>
            </div>
            <div className="rounded-2xl border border-[#dbe5ff] bg-white/85 px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Status</p>
              <p className="mt-2 text-sm font-bold text-slate-900">{invoice.status || 'UNPAID'}</p>
            </div>
            <div className="rounded-2xl border border-[#dbe5ff] bg-white/85 px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Balance</p>
              <p className="mt-2 text-sm font-black text-[#123B8A]">{formatMoney(invoice.balance_amount ?? invoice.final_amount ?? invoice.total_amount)}</p>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-[#dbe5ff] bg-white/80 p-5">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-black uppercase tracking-[0.22em] text-[#123B8A]">Fee Breakdown</h4>
              <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#123B8A]">
                {Array.isArray(invoice.items) ? invoice.items.length : 0} items
              </span>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Fee Type</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">Discount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {Array.isArray(invoice.items) && invoice.items.length ? (
                    invoice.items.map((item) => (
                      <tr key={item.id ?? `${item.fee_type_name}-${item.description}`}>
                        <td className="px-4 py-3 font-bold text-slate-900">{item.fee_type_name || 'Fee item'}</td>
                        <td className="px-4 py-3 text-slate-600">{item.description || '-'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatMoney(item.amount)}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{formatMoney(item.discount_amount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                        No fee item details were added to this invoice.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Total Amount</p>
              <p className="mt-2 text-lg font-black text-slate-900">{formatMoney(invoice.total_amount)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Invoice Discount</p>
              <p className="mt-2 text-lg font-black text-slate-900">{formatMoney(invoice.discount_amount)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Final Amount</p>
              <p className="mt-2 text-lg font-black text-[#123B8A]">{formatMoney(invoice.final_amount ?? invoice.total_amount)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Paid Amount</p>
              <p className="mt-2 text-lg font-black text-[#0B8F5A]">{formatMoney(invoice.paid_amount)}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-[linear-gradient(135deg,#fff9eb_0%,#fff4d8_100%)] px-4 py-4 text-sm text-amber-900">
            Use this invoice number at the school finance office for payment recording. The portal will update automatically after the accountant posts the payment.
          </div>
        </div>
      </div>
    </div>
  );
}
