import API from '../api/axios';

/**
 * Fetches total income, profit, and expenses with optional filters.
 *
 * @param {object} filters - An object containing optional filters.
 * @param {string} [filters.startDate] - The start date for filtering (ISO string).
 * @param {string} [filters.endDate] - The end date for filtering (ISO string).
 * @param {string} [filters.currency='USD'] - The currency to display the data in.
 * @param {string} [filters.expenseType] - The expense type to filter by.
 * @returns {Promise<object>} - An object with total income, profit, expenses, and weekly stats.
 */
export const fetchTotalIncome = async (filters = {}) => {
  try {
    const { startDate, endDate, currency, expenseType } = filters;
    
    // Create query parameters based on the provided filters
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (currency) params.append('currency', currency);
    if (expenseType) params.append('expenseType', expenseType);

    const res = await API.get(`/analytics/income?${params.toString()}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};
