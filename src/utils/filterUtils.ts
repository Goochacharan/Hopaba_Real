
import { Recommendation, FilterOptions } from '@/types/recommendation';

export const filterRecommendations = (
  recs: Recommendation[],
  filterOptions: FilterOptions
): Recommendation[] => {
  const { distanceUnit = 'mi' } = filterOptions;
  
  return recs.filter(rec => {
    if (rec.rating < filterOptions.minRating) {
      return false;
    }

    if (filterOptions.openNowOnly && !rec.openNow) {
      return false;
    }

    if (rec.distance) {
      const distanceValue = parseFloat(rec.distance.split(' ')[0]);
      if (!isNaN(distanceValue)) {
        const adjustedDistance = distanceUnit === 'km' ? distanceValue : distanceValue * 1.60934;
        if (adjustedDistance > filterOptions.maxDistance) {
          return false;
        }
      }
    }

    if (rec.priceLevel) {
      const priceCount = rec.priceLevel.length;
      if (priceCount > filterOptions.priceLevel) {
        return false;
      }
    }

    return true;
  });
};
