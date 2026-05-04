/**
 * Global Currency Formatter for Ethiopian Birr (ETB)
 * Ensures consistent display across the entire Merchant Finance Suite
 */
export const formatCurrency = (amount: number | null | undefined) => {
  // Handle null/undefined as requested
  if (amount === null || amount === undefined) {
    return '0.00 ETB';
  }

  try {
    const formatted = new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    // Standard ETB format usually puts ETB at the start. 
    // We can ensure it's clean and consistent.
    return formatted;
  } catch (error) {
    console.error('[CURRENCY_FORMAT_ERROR]', error);
    return `${Number(amount).toFixed(2)} ETB`;
  }
};

/**
 * Alternative format with "Birr" label if requested
 */
export const formatCurrencyWithLabel = (amount: number | null | undefined) => {
  return `${formatCurrency(amount)} (Birr)`;
};
