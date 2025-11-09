import { supabase } from '../lib/supabase';

/**
 * Automatically deactivates expired food items
 * This should be called periodically or when fetching food items
 */
export const deactivateExpiredItems = async () => {
  try {
    const now = new Date().toISOString();
    
    // Find all active items that have expired
    const { data: expiredItems, error: fetchError } = await supabase
      .from('food_items')
      .select('id, name, expiry_date')
      .eq('is_active', true)
      .lt('expiry_date', now);

    if (fetchError) {
      console.error('Error fetching expired items:', fetchError);
      return;
    }

    if (expiredItems && expiredItems.length > 0) {
      // Deactivate expired items
      const expiredIds = expiredItems.map(item => item.id);
      
      const { error: updateError } = await supabase
        .from('food_items')
        .update({ is_active: false })
        .in('id', expiredIds);

      if (updateError) {
        console.error('Error deactivating expired items:', updateError);
      } else {
        console.log(`✅ Deactivated ${expiredItems.length} expired food item(s)`);
      }
    }
  } catch (error) {
    console.error('Error in deactivateExpiredItems:', error);
  }
};

/**
 * Check if a food item is expired
 */
export const isItemExpired = (expiryDate) => {
  if (!expiryDate) return false;
  return new Date(expiryDate) <= new Date();
};

