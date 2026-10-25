import React from 'react';
import { Clock, CheckCircle2, XCircle, Ban, CheckSquare } from 'lucide-react';

export default function StatusBadge({ status }) {
  const normalized = (status || '').toUpperCase();

  switch (normalized) {
    case 'PENDING':
      return (
        <span className="badge badge-pending">
          <Clock size={12} />
          Pending Approval
        </span>
      );
    case 'APPROVED':
      return (
        <span className="badge badge-approved">
          <CheckCircle2 size={12} />
          Approved
        </span>
      );
    case 'REJECTED':
      return (
        <span className="badge badge-rejected">
          <XCircle size={12} />
          Rejected
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="badge badge-cancelled">
          <Ban size={12} />
          Cancelled
        </span>
      );
    case 'RETURNED':
      return (
        <span className="badge badge-returned">
          <CheckSquare size={12} />
          Returned / Completed
        </span>
      );
    default:
      return <span className="badge">{status}</span>;
  }
}
