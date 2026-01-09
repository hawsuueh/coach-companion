import supabase from '@/config/supabaseClient';

// Types
export interface Batch {
  batch_no: number;
  start_date: string | null;
  end_date: string | null;
  coach_no: number | null;
}

/**
 * Get all batches for a specific coach, ordered by start date (newest first)
 * @param coachNo - Coach number
 * @returns Array of batches or empty array
 */
export const getBatchesByCoach = async (coachNo: number): Promise<Batch[]> => {
  try {
    const { data, error } = await supabase
      .from('Batch')
      .select('*')
      .eq('coach_no', coachNo)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getBatchesByCoach:', error);
    return [];
  }
};

/**
 * Get a single batch by batch number
 * @param batchNo - Batch number
 * @returns Batch object or null if not found
 */
export const getBatchById = async (batchNo: number): Promise<Batch | null> => {
  try {
    const { data, error } = await supabase
      .from('Batch')
      .select('*')
      .eq('batch_no', batchNo)
      .single();

    if (error) {
      console.error('Error fetching batch:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getBatchById:', error);
    return null;
  }
};

/**
 * Utility function to determine current batch based on today's date
 * @param batches - Array of batches to search
 * @returns Current active batch or null if none found
 */
export const getCurrentBatch = (batches: Batch[]): Batch | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day

  return (
    batches.find(batch => {
      if (!batch.start_date || !batch.end_date) return false;

      const startDate = new Date(batch.start_date);
      const endDate = new Date(batch.end_date);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      return today >= startDate && today <= endDate;
    }) || null
  );
};
