export type ProductCategory = 'phone' | 'screen' | 'case' | 'accessory';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  brand: string;
  compatible_models: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export type RequestType = 'repair' | 'price' | 'part' | 'other';
export type InquiryStatus = 'new' | 'answered' | 'closed';

export interface MaintenanceInquiry {
  id: string;
  customer_name: string;
  customer_phone: string;
  device_model: string;
  request_type: RequestType;
  part_requested: string;
  message: string;
  status: InquiryStatus;
  owner_reply: string;
  created_at: string;
}

export interface PhoneIdentification {
  brand: string;
  model: string;
  color: string;
  confidence: number;
  item_type: string;
  details: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
