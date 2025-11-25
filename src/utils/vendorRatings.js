import { supabase } from '../lib/supabase';

/**
 * Fetch vendor rating statistics
 */
export const getVendorRating = async (vendorId) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('vendor_id', vendorId);

    if (error) throw error;

    if (!reviews || reviews.length === 0) {
      return { avgRating: 0, totalReviews: 0 };
    }

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return {
      avgRating: parseFloat(avgRating.toFixed(1)),
      totalReviews: reviews.length
    };
  } catch (error) {
    console.error('Error fetching vendor rating:', error);
    return { avgRating: 0, totalReviews: 0 };
  }
};

/**
 * Fetch ratings for multiple vendors at once
 */
export const getVendorRatingsBatch = async (vendorIds) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('vendor_id, rating')
      .in('vendor_id', vendorIds);

    if (error) throw error;

    // Group by vendor_id and calculate averages
    const ratingsMap = {};
    vendorIds.forEach(id => {
      ratingsMap[id] = { ratings: [], totalReviews: 0 };
    });

    reviews?.forEach(review => {
      if (ratingsMap[review.vendor_id]) {
        ratingsMap[review.vendor_id].ratings.push(review.rating);
        ratingsMap[review.vendor_id].totalReviews++;
      }
    });

    // Calculate averages
    const result = {};
    Object.keys(ratingsMap).forEach(vendorId => {
      const { ratings, totalReviews } = ratingsMap[vendorId];
      if (totalReviews > 0) {
        const avgRating = ratings.reduce((sum, r) => sum + r, 0) / totalReviews;
        result[vendorId] = {
          avgRating: parseFloat(avgRating.toFixed(1)),
          totalReviews
        };
      } else {
        result[vendorId] = { avgRating: 0, totalReviews: 0 };
      }
    });

    return result;
  } catch (error) {
    console.error('Error fetching vendor ratings batch:', error);
    return {};
  }
};

/**
 * Get star string representation (for display)
 * Returns a string of star characters, not JSX
 */
export const getStarsString = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
};

