import api from '../../../helpers/api/apiCore';
import { ENDPOINTS } from '../../../config/endpoints';

const FA = ENDPOINTS.FINANCIAL;

export const financialApi = {
  // Overview
  getOverview:      ()        => api.get(FA.OVERVIEW).then((r) => r.data),

  // Transactions
  getTransactions:  (params)  => api.get(FA.TRANSACTIONS, { params }).then((r) => r.data),
  getTransaction:   (id)      => api.get(FA.TRANSACTION(id)).then((r) => r.data),
  addTransaction:   (body)    => api.post(FA.TRANSACTIONS, body).then((r) => r.data),
  updateTransaction:(id,body) => api.patch(FA.TRANSACTION(id), body).then((r) => r.data),
  deleteTransaction:(id)      => api.delete(FA.TRANSACTION(id)).then((r) => r.data),
  getCategories:    ()        => api.get(FA.CATEGORIES).then((r) => r.data),

  // Savings goals
  getSavingsGoals:  ()        => api.get(FA.SAVINGS_GOALS).then((r) => r.data),
  createGoal:       (body)    => api.post(FA.SAVINGS_GOALS, body).then((r) => r.data),
  updateGoal:       (id,body) => api.patch(FA.SAVINGS_GOAL(id), body).then((r) => r.data),
  deleteGoal:       (id)      => api.delete(FA.SAVINGS_GOAL(id)).then((r) => r.data),

  // Investments
  getInvestments:   ()        => api.get(FA.INVESTMENTS).then((r) => r.data),

  // Reports
  getReport:        (params)  => api.get(FA.REPORTS, { params }).then((r) => r.data),

  // Analysis & insights
  getAnalysis:      ()        => api.get(FA.ANALYSIS).then((r) => r.data),
  getInsights:      ()        => api.get(FA.INSIGHTS).then((r) => r.data),

  // Gmail integration
  getGmailStatus:   ()        => api.get(FA.GMAIL_STATUS).then((r) => r.data),
  connectGmail:     ()        => api.get(FA.GMAIL_CONNECT).then((r) => r.data),
  disconnectGmail:  ()        => api.delete(FA.GMAIL_DISCONNECT).then((r) => r.data),
  syncGmail:        ()        => api.post(FA.GMAIL_SYNC).then((r) => r.data),

  // PDF upload
  uploadStatement:  (formData) => api.post(FA.PDF_UPLOAD, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data),

  // Ledger
  getLedgerEntries:    (params)    => api.get(FA.LEDGER, { params }).then((r) => r.data),
  createLedgerEntry:   (body)      => api.post(FA.LEDGER, body).then((r) => r.data),
  updateLedgerEntry:   (id, body)  => api.patch(FA.LEDGER_ENTRY(id), body).then((r) => r.data),
  deleteLedgerEntry:   (id)        => api.delete(FA.LEDGER_ENTRY(id)).then((r) => r.data),
  recordLedgerPayment: (id, body)  => api.post(FA.LEDGER_PAYMENT(id), body).then((r) => r.data),
  settleLedgerEntry:   (id, body)   => api.post(FA.LEDGER_SETTLE(id), body).then((r) => r.data),
  writeOffLedgerEntry: (id, body)   => api.post(FA.LEDGER_WRITE_OFF(id), body).then((r) => r.data),
  getLedgerSummary:    ()          => api.get(FA.LEDGER_SUMMARY).then((r) => r.data),
  getLedgerHistory:    (id)        => api.get(FA.LEDGER_HISTORY(id)).then((r) => r.data),

  // Allocations
  getAllocations:       (params)    => api.get(FA.ALLOCATIONS, { params }).then((r) => r.data),
  createAllocation:    (body)      => api.post(FA.ALLOCATIONS, body).then((r) => r.data),
  updateAllocation:    (id, body)  => api.patch(FA.ALLOCATION_ENTRY(id), body).then((r) => r.data),
  deleteAllocation:    (id)        => api.delete(FA.ALLOCATION_ENTRY(id)).then((r) => r.data),
  topUpAllocation:     (id, body)  => api.post(FA.ALLOCATION_TOP_UP(id), body).then((r) => r.data),
  markAllocationUsed:  (id)        => api.post(FA.ALLOCATION_MARK_USED(id)).then((r) => r.data),
  cancelAllocation:    (id)        => api.post(FA.ALLOCATION_CANCEL(id)).then((r) => r.data),
  getAllocationsSummary:()          => api.get(FA.ALLOCATIONS_SUMMARY).then((r) => r.data),
};
