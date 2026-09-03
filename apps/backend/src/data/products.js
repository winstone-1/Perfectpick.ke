const products = [
  {
    name: 'Classic Leather Tote',
    description: 'A timeless leather tote bag for everyday luxury.',
    price: 12500,
    category: 'bags',
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800'],
    featured: true,
    variants: [{ name: 'Tan', stock: 15 }, { name: 'Black', stock: 10 }]
  },
  {
    name: 'Suede Ankle Boots',
    description: 'Perfectly crafted suede boots for the modern style enthusiast.',
    price: 8900,
    category: 'shoes',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'],
    featured: true,
    variants: [{ name: 'Size 38', stock: 5 }, { name: 'Size 40', stock: 8 }]
  },
  {
    name: 'Stiletto Heels',
    description: 'Elegant high heels for the perfect evening look.',
    price: 7500,
    category: 'shoes',
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800'],
    featured: false,
    variants: [{ name: 'Size 37', stock: 4 }, { name: 'Size 39', stock: 6 }]
  },
  {
    name: 'Leather Sneakers',
    description: 'Casual yet sophisticated sneakers for daily wear.',
    price: 6200,
    category: 'shoes',
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800'],
    featured: true,
    variants: [{ name: 'Size 41', stock: 10 }, { name: 'Size 43', stock: 12 }]
  },
  {
    name: 'Gold Chain Necklace',
    description: 'Elegant 18k gold chain necklace to elevate any outfit.',
    price: 5400,
    category: 'jewelry',
    images: ['https://images.unsplash.com/photo-1599643477877-50a1586520f9?auto=format&fit=crop&q=80&w=800'],
    featured: false,
    variants: [{ name: 'Default', stock: 20 }]
  },
  {
    name: 'Silk Evening Gown',
    description: 'Stunning silk gown for special occasions.',
    price: 15000,
    category: 'clothes',
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800'],
    featured: true,
    variants: [{ name: 'Small', stock: 3 }, { name: 'Medium', stock: 5 }]
  },
  {
    name: 'Luxury Gift Set',
    description: 'Curated set of premium essentials for your loved ones.',
    price: 6500,
    category: 'gifts',
    images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800'],
    featured: true,
    variants: [{ name: 'Default', stock: 12 }]
  },
  {
    name: 'Anniversary Gift Box',
    description: 'Celebrate love with our specially curated anniversary box.',
    price: 8500,
    category: 'gifts',
    images: ['https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=800'],
    featured: false,
    variants: [{ name: 'Default', stock: 8 }]
  },
  {
    name: 'Spa Day Voucher Kit',
    description: 'The ultimate gift of relaxation and wellness.',
    price: 4500,
    category: 'gifts',
    images: ['https://images.unsplash.com/photo-1544161515-4af6b1d4b1b2?auto=format&fit=crop&q=80&w=800'],
    featured: true,
    variants: [{ name: 'Default', stock: 15 }]
  },
  {
    name: 'Designer Sunglasses',
    description: 'Chic frames with full UV protection.',
    price: 4200,
    category: 'accessories',
    images: ['https://images.unsplash.com/photo-1511499767390-a7335958beba?auto=format&fit=crop&q=80&w=800'],
    featured: false,
    variants: [{ name: 'Black', stock: 25 }, { name: 'Gold', stock: 15 }]
  }
];

export default products;
