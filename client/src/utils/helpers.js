/**
 * Constants and general utility helpers aligned with system specifications.
 */

// Official Kifle Ketemas in Debre Markos Municipality
export const KIFLE_KETEMAS = [
  'Abima Kifle Ketema',
  'Nigus Teklehaymanot Kifle Ketema',
  'Tedila Gualu Kifle Ketema',
  'Menkorer Kifle Ketema',
];

// System User Roles
export const ROLES = {
  RESIDENT: 'Resident',
  BUSINESS_OWNER: 'Business Owner',
  COLLECTOR: 'Collector',
  MUNICIPAL_ADMIN: 'Municipal Administrator',
  SYSTEM_ADMIN: 'System Administrator',
};

/**
 * Returns Tailwind CSS badge styling classes based on request/schedule status
 */
export const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'approved':
    case 'assigned':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'scheduled':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'completed':
    case 'available':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'rejected':
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Truncates long text strings
 */
export const truncateText = (str, length = 50) => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};