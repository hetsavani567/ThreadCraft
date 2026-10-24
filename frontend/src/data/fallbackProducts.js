export const fallbackProducts = [
  {
    id: 1,
    name: "Running T-Shirt",
    price: 799,
    description: "Breathable quick-dry running t-shirt crafted for everyday high performance.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80",
    category_id: 1,
    category: "Clothing",
    brand_id: 1,
    brand: "Nike",
    rating: 5.0,
    review_count: 1,
    total_stock: 63,
    variants: [
      { variant_id: 1, color_size: "Black-M", selling_price: 799, is_active: 1 },
      { variant_id: 2, color_size: "White-L", selling_price: 829, is_active: 1 }
    ]
  },
  {
    id: 2,
    name: "Training Shorts",
    price: 599,
    description: "Lightweight and flexible athletic shorts designed for gym sessions and running.",
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=700&q=80",
    category_id: 1,
    category: "Clothing",
    brand_id: 2,
    brand: "Adidas",
    rating: 4.0,
    review_count: 1,
    total_stock: 37,
    variants: [
      { variant_id: 3, color_size: "Blue-M", selling_price: 599, is_active: 1 }
    ]
  },
  {
    id: 3,
    name: "Running Shoes",
    price: 3499,
    description: "Premium cushioned road running shoes with breathable mesh and responsive grip.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
    category_id: 2,
    category: "Footwear",
    brand_id: 3,
    brand: "Puma",
    rating: 5.0,
    review_count: 1,
    total_stock: 34,
    variants: [
      { variant_id: 4, color_size: "Red-9", selling_price: 3499, is_active: 1 },
      { variant_id: 5, color_size: "Black-8", selling_price: 3599, is_active: 1 }
    ]
  },
  {
    id: 4,
    name: "Sports Cap",
    price: 399,
    description: "Adjustable lightweight sports cap with moisture-wicking sweatband.",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=700&q=80",
    category_id: 3,
    category: "Accessories",
    brand_id: 1,
    brand: "Nike",
    rating: 3.0,
    review_count: 1,
    total_stock: 23,
    variants: [
      { variant_id: 6, color_size: "Black-Free", selling_price: 399, is_active: 1 }
    ]
  },
  {
    id: 5,
    name: "Hoodie",
    price: 1999,
    description: "Warm fleece-lined pullover hoodie with kangaroo pocket and ribbed cuffs.",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80",
    category_id: 1,
    category: "Clothing",
    brand_id: 2,
    brand: "Adidas",
    rating: 5.0,
    review_count: 0,
    total_stock: 38,
    variants: [
      { variant_id: 7, color_size: "Grey-L", selling_price: 1999, is_active: 1 },
      { variant_id: 8, color_size: "Navy-XL", selling_price: 2099, is_active: 1 }
    ]
  },
  {
    id: 6,
    name: "Classic Cotton Shirt",
    price: 899,
    description: "100% combed cotton casual button-down shirt for effortless daily styling.",
    image: "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=700&q=80",
    category_id: 1,
    category: "Clothing",
    brand_id: 4,
    brand: "ThreadCraft",
    rating: 4.8,
    review_count: 3,
    total_stock: 28,
    variants: [
      { variant_id: 9, color_size: "White-M", selling_price: 899, is_active: 1 },
      { variant_id: 10, color_size: "Navy-L", selling_price: 949, is_active: 1 }
    ]
  },
  {
    id: 7,
    name: "Everyday Denim Jeans",
    price: 1299,
    description: "Comfort stretch regular fit denim jeans built for everyday durability.",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=80",
    category_id: 1,
    category: "Clothing",
    brand_id: 4,
    brand: "ThreadCraft",
    rating: 4.7,
    review_count: 5,
    total_stock: 42,
    variants: [
      { variant_id: 11, color_size: "Dark Blue-32", selling_price: 1299, is_active: 1 },
      { variant_id: 12, color_size: "Dark Blue-34", selling_price: 1299, is_active: 1 }
    ]
  },
  {
    id: 8,
    name: "Minimal Crossbody Bag",
    price: 699,
    description: "Compact waterproof nylon sling bag with multiple secure zip compartments.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80",
    category_id: 3,
    category: "Accessories",
    brand_id: 4,
    brand: "ThreadCraft",
    rating: 4.6,
    review_count: 2,
    total_stock: 19,
    variants: [
      { variant_id: 13, color_size: "Matte Black", selling_price: 699, is_active: 1 }
    ]
  }
];

export const fallbackCategories = ["All", "Clothing", "Footwear", "Accessories"];
