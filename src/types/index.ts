export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  specs?: string;
  badge?: {
    text: string;
    type: 'discount' | 'new' | 'hot';
  };
  inStock?: boolean;
  stockPercentage?: number;
  description?: string;
  features?: string[];
}

export interface LaptopProduct extends Product {
  processor: string;
  ram: string;
  storage: string;
  display: string;
  graphics: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  itemCount: number;
  icon: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  productBought: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem {
  cartItemId?: string;
  product: Product;
  quantity: number;
  selectedVariationId?: string | number | null;
  selectedColor?: string;
  selectedStorage?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  district?: string;
  role: 'admin' | 'customer' | 'staff' | string;
  created_at?: string;
}

export interface SavedAddress {
  id: string;
  title: string;
  recipient_name: string;
  phone: string;
  district: string;
  street_address: string;
  is_default?: boolean;
}

export interface DbCategory {
  id: string | number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  created_at?: string;
}

export interface DbProductVariation {
  id: string | number;
  product_id: string | number;
  color?: string;
  color_code?: string;
  storage?: string;
  sku?: string;
  price?: number;
  discount_price?: number;
  stock: number;
  image_url?: string;
  created_at?: string;
}

export interface DbReview {
  id: string | number;
  product_id: string | number;
  user_id?: string;
  user_name: string;
  rating: number;
  comment: string;
  is_approved?: boolean;
  created_at: string;
}

export interface DbProduct {
  id: string | number;
  name: string;
  slug: string;
  brand: string;
  category_id?: string | number;
  category?: string;
  price: number;
  discount_price?: number;
  stock: number;
  specs?: string;
  description?: string;
  image_url?: string;
  images?: string[];
  rating?: number;
  reviews_count?: number;
  is_featured?: boolean;
  badge_text?: string;
  badge_type?: string;
  created_at?: string;
  updated_at?: string;
  categories?: {
    id?: string;
    name: string;
    slug?: string;
  };
  product_variations?: DbProductVariation[];
  reviews?: DbReview[];
}

export interface DbOrderItem {
  product_id: string | number;
  variation_id?: string | number | null;
  name?: string;
  product_name?: string;
  price?: number;
  unit_price?: number;
  line_total?: number;
  quantity: number;
  image_url?: string;
  color?: string;
  storage?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'pending';

export interface DbOrder {
  id: string | number;
  order_number?: string;
  user_id?: string | null;
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string;
  shipping_address: {
    address: string;
    district: string;
    notes?: string;
  };
  items: DbOrderItem[];
  total_amount?: number;
  total?: number;
  discount_amount?: number;
  shipping_fee?: number;
  shipping_charge?: number;
  subtotal?: number;
  payment_method: string;
  payment_status: PaymentStatus;
  status: OrderStatus;
  coupon_code?: string | null;
  tracking_number?: string;
  courier_name?: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at?: string;
}
