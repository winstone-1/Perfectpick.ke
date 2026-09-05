export const CATEGORY_GROUPS = [
  {
    parent: 'Fashion',
    categories: ['bags', 'shoes', 'handbags', 'clothes', 'accessories'],
  },
  {
    parent: 'Jewelry & Watches',
    categories: ['jewelry', 'earrings', 'hairclips', 'keyrings', 'rings', 'watches', 'phone-charms'],
  },
  {
    parent: 'Beauty',
    categories: ['beauty-accessories', 'body-mists', 'oils'],
  },
  {
    parent: 'Gifts & Home',
    categories: ['gifts', 'gift-boxes', 'mugs', 'fans'],
  },
  {
    parent: 'Apparel',
    categories: ['ponchos', 'sweaters', 'cardigans'],
  },
];

export const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap(g => g.categories);

export function getCategoryGroup(category) {
  for (const group of CATEGORY_GROUPS) {
    if (group.categories.includes(category)) return group.parent;
  }
  return null;
}

export function getGroupedCategories() {
  return CATEGORY_GROUPS.map(g => ({
    parent: g.parent,
    categories: g.categories,
  }));
}
