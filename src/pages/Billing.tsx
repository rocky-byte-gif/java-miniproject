import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  IndianRupee,
  Plus,
  Printer,
  QrCode,
  Receipt,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import {
  Badge,
  btn,
  Card,
  Field,
  input,
  Modal,
  PageHeader,
  select,
  StatCard,
  Table,
  td,
  useToast,
} from '../components/ui';
import {
  addBill,
  deleteBill,
  getPatient,
  money,
  patientName,
  setBillStatus,
  todayDate,
  useStore,
} from '../lib/store';
import type { Bill, BillCategory, BillItem, PaymentMethod } from '../types';

const defaultItem: BillItem = {
  id: 'bi-1',
  description: 'Specialist Consultation',
  category: 'Consultation',
  qty: 1,
  unitPrice: 500,
  amount: 500,
};

export default function Billing({ initialPatientId }: { initialPatientId?: string }) {
  const s = useStore();
  const { showToast } = useToast();
  const today = todayDate();

  // Modal: Create Invoice
  const [createOpen, setCreateOpen] = useState(false);
  const [patientId, setPatientId] = useState(initialPatientId || s.patients[0]?.id || '');
  const [items, setItems] = useState<BillItem[]>([defaultItem]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [invoiceNotes, setInvoiceNotes] = useState('');

  // Modal: Mark as Paid
  const [payTargetBill, setPayTargetBill] = useState<Bill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI / QR');
  const [transactionRef, setTransactionRef] = useState('');

  // Modal: Printable Official Invoice
  const [printInvoiceTarget, setPrintInvoiceTarget] = useState<Bill | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending'>('All');
  const [query, setQuery] = useState('');

  const subtotal = items.reduce((acc, it) => acc + it.amount, 0);
  const discountAmount = (subtotal * (discountPercent || 0)) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * (taxPercent || 0)) / 100;
  const grandTotal = Math.round(taxableAmount + taxAmount);

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `bi-${Date.now()}`,
        description: '',
        category: 'Pharmacy',
        qty: 1,
        unitPrice: 100,
        amount: 100,
      },
    ]);
  };

  const removeItemRow = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, patch: Partial<BillItem>) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const updated = { ...i, ...patch };
          updated.amount = updated.qty * updated.unitPrice;
          return updated;
        }
        return i;
      }),
    );
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      showToast('Select a patient first.', 'error');
      return;
    }
    const validItems = items.filter((i) => i.description.trim() !== '');
    if (validItems.length === 0) {
      showToast('Provide at least one item description.', 'error');
      return;
    }

    addBill({
      patientId,
      items: validItems,
      discountPercent,
      taxPercent,
      status: 'Pending',
      notes: invoiceNotes.trim() || undefined,
    });

    showToast(`Invoice generated successfully for ${patientName(s, patientId)}!`, 'success');
    setCreateOpen(false);
    setItems([defaultItem]);
    setDiscountPercent(0);
    setTaxPercent(0);
    setInvoiceNotes('');
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTargetBill) return;

    setBillStatus(
      payTargetBill.id,
      'Paid',
      paymentMethod,
      transactionRef.trim() || `TXN-${Date.now().toString().slice(-8)}`,
    );

    showToast(`Invoice ${payTargetBill.invoiceNumber} marked PAID via ${paymentMethod}!`, 'success');
    setPayTargetBill(null);
    setTransactionRef('');
  };

  // Metrics
  const totalBilled = s.bills.reduce((sum, b) => sum + b.total, 0);
  const totalPaid = s.bills.filter((b) => b.status === 'Paid').reduce((sum, b) => sum + b.total, 0);
  const totalPending = s.bills.filter((b) => b.status === 'Pending').reduce((sum, b) => sum + b.total, 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 100;

  // Filtered Bills
  const q = query.trim().toLowerCase();
  const filteredBills = s.bills.filter((b) => {
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesQuery =
      !q ||
      [b.invoiceNumber, patientName(s, b.patientId), b.patientId, b.paymentMethod ?? ''].some(
        (v) => v.toLowerCase().includes(q),
      );
    return matchesStatus && matchesQuery;
  });

  return (
    <>
      <PageHeader
        title="Billing, Invoices & Revenue"
        sub="Financial reconciliation, itemized tax invoices, and payment tracking"
        action={
          <button className={btn.primary} onClick={() => setCreateOpen(true)}>
            <Receipt size={16} /> Generate New Invoice
          </button>
        }
      />

      {/* Financial Metrics Strip */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="TOTAL INVOICED"
          value={money(totalBilled)}
          subvalue={`${s.bills.length} invoices generated`}
          icon={<Receipt size={22} />}
          color="cyan"
        />
        <StatCard
          title="REVENUE COLLECTED"
          value={money(totalPaid)}
          subvalue={`${s.bills.filter((b) => b.status === 'Paid').length} paid receipts`}
          icon={<IndianRupee size={22} />}
          trend={{ label: `${collectionRate}% efficiency`, positive: collectionRate >= 70 }}
          color="emerald"
        />
        <StatCard
          title="OUTSTANDING RECEIVABLES"
          value={money(totalPending)}
          subvalue={`${s.bills.filter((b) => b.status === 'Pending').length} pending payment`}
          icon={<Clock size={22} />}
          color="amber"
        />
        <StatCard
          title="COLLECTION RATE"
          value={`${collectionRate}%`}
          subvalue="Target rate > 85%"
          icon={<CheckCircle2 size={22} />}
          trend={{ label: 'Healthy cash flow', positive: true }}
          color="violet"
        />
      </div>

      {/* Invoices Ledger Table */}
      <Card
        title={`All Invoices & Receipts (${filteredBills.length})`}
        subtitle="Itemized billing statements, payment methods, and tax receipts"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className={`${input} !py-1.5 pl-9 text-xs sm:w-56`}
                placeholder="Search invoice #, patient..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              className={`${select} !w-auto !py-1.5 text-xs`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="All">All Invoices</option>
              <option value="Paid">Paid Only</option>
              <option value="Pending">Pending Only</option>
            </select>
          </div>
        }
      >
        <Table
          head={['Invoice #', 'Date', 'Patient Name', 'Line Items', 'Grand Total', 'Status', 'Payment Method', 'Actions']}
          empty="No billing records found."
        >
          {filteredBills.map((b) => (
            <tr key={b.id} className="transition duration-100 hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
              <td className={`${td} font-mono text-xs font-bold text-slate-900 dark:text-slate-100`}>
                {b.invoiceNumber}
              </td>
              <td className={`${td} font-mono text-xs text-slate-500`}>{b.date}</td>
              <td className={td}>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{patientName(s, b.patientId)}</span>
                <span className="block text-[11px] text-slate-400">{b.patientId}</span>
              </td>
              <td className={td}>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {b.items?.length || 1} line item(s)
                </div>
              </td>
              <td className={`${td} font-mono text-sm font-bold text-slate-900 dark:text-white`}>
                {money(b.total)}
              </td>
              <td className={td}>
                <Badge tone={b.status === 'Paid' ? 'green' : 'amber'}>{b.status}</Badge>
              </td>
              <td className={td}>
                {b.status === 'Paid' ? (
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {b.paymentMethod || 'Cash'}
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Awaiting Payment</span>
                )}
              </td>
              <td className={td}>
                <div className="flex items-center gap-1.5">
                  {b.status === 'Pending' ? (
                    <button
                      className={btn.success}
                      title="Collect Payment"
                      onClick={() => setPayTargetBill(b)}
                    >
                      <CreditCard size={14} /> Collect Payment
                    </button>
                  ) : (
                    <button
                      className={btn.ghost}
                      title="Revert to Pending"
                      onClick={() => {
                        if (confirm(`Revert Invoice ${b.invoiceNumber} back to Pending status?`)) {
                          setBillStatus(b.id, 'Pending');
                          showToast(`Invoice ${b.invoiceNumber} reverted to Pending.`);
                        }
                      }}
                    >
                      Revert
                    </button>
                  )}
                  <button
                    className={btn.ghost}
                    title="View & Print Official Receipt"
                    onClick={() => setPrintInvoiceTarget(b)}
                  >
                    <Printer size={14} /> Print
                  </button>
                  <button
                    className={btn.danger}
                    title="Delete Invoice"
                    onClick={() => {
                      if (confirm(`Delete invoice ${b.invoiceNumber}?`)) {
                        deleteBill(b.id);
                        showToast(`Deleted invoice ${b.invoiceNumber}.`, 'info');
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* MODAL 1: Create Itemized Invoice */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Generate Itemized Medical Invoice"
        icon={<Receipt size={20} />}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-5">
          <Field label="Select Patient" required>
            <select
              className={select}
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            >
              {s.patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id}) · {p.bloodGroup} · {p.phone}
                </option>
              ))}
            </select>
          </Field>

          {/* Itemized Line Items Table Builder */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Itemized Services & Charges
              </h4>
              <button
                type="button"
                className={`${btn.ghost} !py-1 text-xs`}
                onClick={addItemRow}
              >
                <Plus size={13} /> Add Charge Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-12 items-center">
                    <div className="sm:col-span-5">
                      <label className="text-[11px] text-slate-400 block mb-1">Description</label>
                      <input
                        className={input}
                        placeholder="Service or medicine description"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-[11px] text-slate-400 block mb-1">Category</label>
                      <select
                        className={select}
                        value={item.category}
                        onChange={(e) => updateItem(item.id, { category: e.target.value as BillCategory })}
                      >
                        <option value="Consultation">Consultation</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Lab Test">Lab Test</option>
                        <option value="Procedure">Procedure</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] text-slate-400 block mb-1">Rate (₹)</label>
                      <input
                        type="number"
                        className={input}
                        min={0}
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })}
                      />
                    </div>
                    <div className="sm:col-span-1 text-right">
                      <label className="text-[11px] text-slate-400 block mb-1">Total</label>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block py-2">
                        ₹{item.amount}
                      </span>
                    </div>
                    <div className="sm:col-span-1 text-right">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(item.id)}
                          className="p-2 text-rose-500 hover:text-rose-700"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal, Discount & Tax */}
            <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Discount (% off subtotal)">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className={input}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  />
                </Field>
                <Field label="Tax / GST (%)">
                  <input
                    type="number"
                    min={0}
                    max={28}
                    className={input}
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                  />
                </Field>
              </div>

              {/* Total Calculation Strip */}
              <div className="mt-4 space-y-1.5 rounded-xl bg-slate-50 p-4 text-xs dark:bg-slate-800/80">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono">{money(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({discountPercent}%):</span>
                    <span className="font-mono">- {money(discountAmount)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Tax ({taxPercent}% GST):</span>
                    <span className="font-mono">+ {money(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900 dark:border-slate-700 dark:text-white">
                  <span>Grand Total:</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400">{money(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          <Field label="Invoice Notes / Payment Instructions">
            <input
              className={input}
              placeholder="e.g. Payable within 7 business days, or coverage through TPA Insurance"
              value={invoiceNotes}
              onChange={(e) => setInvoiceNotes(e.target.value)}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={btn.ghost} onClick={() => setCreateOpen(false)}>
              Cancel
            </button>
            <button type="submit" className={btn.primary}>
              Issue Official Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Collect Payment & Mark as Paid */}
      {payTargetBill && (
        <Modal
          open={!!payTargetBill}
          onClose={() => setPayTargetBill(null)}
          title={`Collect Payment: ${payTargetBill.invoiceNumber}`}
          icon={<CreditCard size={20} />}
        >
          <form onSubmit={handleConfirmPayment} className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 text-xs dark:bg-slate-800/60">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Patient Name:</span>
                <span className="font-semibold">{patientName(s, payTargetBill.patientId)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Invoice Number:</span>
                <span className="font-mono font-bold">{payTargetBill.invoiceNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-t border-slate-200 pt-2 mt-2 dark:border-slate-700 text-sm">
                <span className="font-bold">Total Amount Due:</span>
                <span className="font-mono font-extrabold text-emerald-600">{money(payTargetBill.total)}</span>
              </div>
            </div>

            <Field label="Payment Instrument / Method" required>
              <select
                className={select}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                <option value="UPI / QR">UPI / QR (PhonePe, GPay, Paytm)</option>
                <option value="Cash">Cash at Reception Counter</option>
                <option value="Credit/Debit Card">Credit / Debit Card</option>
                <option value="Medical Insurance">Medical Insurance / TPA</option>
              </select>
            </Field>

            <Field label="Transaction Reference / Cheque / UTR #" hint="Optional reference number">
              <input
                className={input}
                placeholder="e.g. UPI-98421098412 or CARD-AUTH-4819"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className={btn.ghost} onClick={() => setPayTargetBill(null)}>
                Cancel
              </button>
              <button type="submit" className={btn.primary}>
                Confirm Receipt of {money(payTargetBill.total)}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: Printable Official Medical Invoice */}
      {printInvoiceTarget && (
        <Modal
          open={!!printInvoiceTarget}
          onClose={() => setPrintInvoiceTarget(null)}
          title="Official Tax Invoice Slip"
          icon={<Receipt size={20} />}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 text-sm">
            {/* Invoice Container */}
            <div
              id="invoice-print-area"
              className="rounded-2xl border-2 border-slate-200 bg-white p-6 text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-cyan-600 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-cyan-700 dark:text-cyan-400">
                    MEDISYNC HEALTH CLINIC
                  </h2>
                  <p className="text-xs text-slate-500">Official Clinical Billing & Financial Statement</p>
                  <p className="text-xs text-slate-400">GSTIN: 27AABCM8421K1ZM · Phone: +91 9822001122</p>
                </div>
                <div className="text-right">
                  <Badge tone={printInvoiceTarget.status === 'Paid' ? 'green' : 'amber'}>
                    {printInvoiceTarget.status.toUpperCase()}
                  </Badge>
                  <p className="mt-1 font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {printInvoiceTarget.invoiceNumber}
                  </p>
                  <p className="text-xs text-slate-400">Date: {printInvoiceTarget.date}</p>
                </div>
              </div>

              {/* Billed To Patient Info */}
              {(() => {
                const pat = getPatient(s, printInvoiceTarget.patientId);
                return (
                  <div className="my-4 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
                    <span className="text-slate-400 block mb-1">BILLED TO PATIENT:</span>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-bold">{pat?.name || printInvoiceTarget.patientId}</p>
                        <p className="text-slate-500">{pat?.phone} · Blood: {pat?.bloodGroup}</p>
                        {pat?.address && <p className="text-slate-500">{pat.address}</p>}
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400">Patient ID:</span>
                        <p className="font-mono font-semibold">{printInvoiceTarget.patientId}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Line Items Table */}
              <table className="w-full text-left text-xs my-4">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 font-semibold">
                    <th className="py-2">#</th>
                    <th className="py-2">Item Description</th>
                    <th className="py-2">Category</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Rate</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {printInvoiceTarget.items?.map((it, idx) => (
                    <tr key={it.id}>
                      <td className="py-2 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2 font-medium">{it.description}</td>
                      <td className="py-2 text-slate-500">{it.category}</td>
                      <td className="py-2 text-center font-mono">{it.qty}</td>
                      <td className="py-2 text-right font-mono">{money(it.unitPrice)}</td>
                      <td className="py-2 text-right font-mono font-semibold">{money(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Calculation */}
              <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                <div className="ml-auto w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span className="font-mono">{money(printInvoiceTarget.subtotal)}</span>
                  </div>
                  {printInvoiceTarget.discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({printInvoiceTarget.discountPercent}%):</span>
                      <span className="font-mono">
                        - {money((printInvoiceTarget.subtotal * printInvoiceTarget.discountPercent) / 100)}
                      </span>
                    </div>
                  )}
                  {printInvoiceTarget.taxPercent > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Tax / GST ({printInvoiceTarget.taxPercent}%):</span>
                      <span className="font-mono">
                        + {money((printInvoiceTarget.subtotal * printInvoiceTarget.taxPercent) / 100)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-300 pt-2 text-base font-extrabold text-slate-900 dark:border-slate-700 dark:text-white">
                    <span>Grand Total:</span>
                    <span className="font-mono text-cyan-700 dark:text-cyan-400">
                      {money(printInvoiceTarget.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details if Paid */}
              {printInvoiceTarget.status === 'Paid' && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                  <span className="font-bold">PAYMENT CONFIRMATION:</span> Settled via{' '}
                  <strong>{printInvoiceTarget.paymentMethod}</strong> on {printInvoiceTarget.paidAt}.
                  {printInvoiceTarget.transactionRef && (
                    <span className="block font-mono mt-0.5">Reference: {printInvoiceTarget.transactionRef}</span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 flex items-end justify-between border-t border-slate-200 pt-4 text-xs text-slate-400 dark:border-slate-800">
                <span>Computer generated tax invoice. No signature required.</span>
                <div className="text-right">
                  <span className="font-semibold block text-slate-700 dark:text-slate-300">MediSync Finance Desk</span>
                  <span>Accounts & Billing Dept.</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button type="button" className={btn.ghost} onClick={() => setPrintInvoiceTarget(null)}>
                Close
              </button>
              <button
                type="button"
                className={btn.primary}
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={16} /> Print Hospital Invoice
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
