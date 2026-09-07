/**
 * Date and Time formatting utilities for collection schedules, notifications, and reports.
 */

// Format ISO date string to readable YYYY-MM-DD or DD/MM/YYYY
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format time string or Date to HH:MM AM/PM
export const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  // If input is time string "08:30:00"
  if (typeof timeString === 'string' && timeString.includes(':')) {
    const parts = timeString.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  }
  
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return timeString;
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

// Return relative time string (e.g. "5 mins ago", "2 hours ago") for notifications
export const timeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateString);
};