
export const searchPatterns = [
  { pattern: /yoga|meditation|fitness|gym/, category: 'fitness' },
  { pattern: /restaurant|food|dinner|lunch|eat|cuisine|fusion|seafood|spice|garden|ocean/, category: 'restaurants' },
  { pattern: /cafe|coffee|bakery/, category: 'cafes' },
  { pattern: /salon|haircut|barber|spa/, category: 'salons' },
  { pattern: /doctor|clinic|hospital|dentist/, category: 'health' },
  { pattern: /shop|store|market|mall/, category: 'shopping' },
  { pattern: /hotel|stay|accommodation/, category: 'hotels' }
];

export const keywordMap: Record<string, string[]> = {
  'restaurant': ['dining', 'eatery', 'bistro', 'diner', 'fusion', 'seafood', 'spice garden'],
  'cafe': ['coffee shop', 'café', 'espresso bar'],
  'near': ['around', 'close to', 'nearby', 'in the vicinity of'],
  'salon': ['hair salon', 'beauty parlor', 'stylist'],
  'best': ['top', 'highly rated', 'excellent', 'premium']
};
