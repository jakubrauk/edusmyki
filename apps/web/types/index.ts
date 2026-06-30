// Strapi API response wrapper
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiEntity<T> {
  id: number;
  documentId: string;
  attributes?: T;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Ebook
export interface Ebook {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number; // PLN
  coverImage: StrapiMedia;
  pdfFile?: StrapiMedia;
  categories: Category[];
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  pageCount?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Category
export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  ebooks?: Ebook[];
  parent?: Category | null;
  children?: Category[];
}

// Strapi Media
export interface StrapiMedia {
  id: number;
  url: string;
  name: string;
  alternativeText?: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  };
}

export interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
}

// Order
export type OrderStatus = "pending" | "paid" | "cancelled" | "refunded";

export interface Order {
  id: number;
  documentId: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  guestEmail?: string;
  guestFirstName?: string;
  guestLastName?: string;
  paymentIntentId?: string;
  invoiceRequested: boolean;
  invoiceData?: InvoiceData;
  paidAt?: string;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  ebook: Ebook;
  ebookTitle: string;
  price: number;
}

export interface InvoiceData {
  companyName: string;
  nip: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

// Download Token
export interface DownloadToken {
  id: number;
  documentId: string;
  token: string;
  ebook: Ebook;
  order: Order;
  email: string;
  expiresAt: string;
  downloadCount: number;
  maxDownloads: number;
  lastDownloadedAt?: string;
}

// Cart (client-side only)
export interface CartItem {
  ebookId: number;
  documentId: string;
  title: string;
  slug: string;
  price: number;
  coverImage?: StrapiMedia;
  shortDescription: string;
}

export interface Cart {
  items: CartItem[];
}

// Checkout form
export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  invoiceRequested: boolean;
  invoiceData?: InvoiceData;
  termsAccepted: boolean;
  digitalDeliveryConsent: boolean;
  marketingConsent?: boolean;
}

// Magic Token (auth)
export interface MagicToken {
  id: number;
  documentId: string;
  token: string;
  email: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

// Review
export interface Review {
  id: number;
  documentId: string;
  rating: number;
  content: string;
  authorName: string;
  authorRole?: string;
  email: string;
  ebook: Ebook;
  order?: Order;
  featuredOnHomepage: boolean;
  publishedAt: string | null;
  createdAt: string;
}

// Settings (singleton)
export interface Settings {
  adminEmail?: string;
}

// Homepage
export interface HomepageTrustItem {
  id: number;
  text: string;
}

export interface HomepageStat {
  id: number;
  value: string;
  label: string;
}

export interface HomepageStep {
  id: number;
  title: string;
  desc: string;
}

export interface HomepageFeatureCard {
  id: number;
  title: string;
  desc: string;
  tag: string;
}

export interface Homepage {
  heroBadge: string;
  heroTitleBefore: string;
  heroTitleHighlight: string;
  heroTitleAfter: string;
  heroSubtitle: string;
  heroDescription: string;
  heroCta1: string;
  heroCta2: string;
  trustBar: HomepageTrustItem[];
  stats: HomepageStat[];
  howItWorksBadge: string;
  howItWorksTitle: string;
  howItWorksSteps: HomepageStep[];
  featuredBadge: string;
  featuredTitle: string;
  featuredLinkText: string;
  categoriesTitle: string;
  categoriesSubtitle: string;
  whyUsBadge: string;
  whyUsTitle: string;
  whyUsCards: HomepageFeatureCard[];
  testimonialsBadge: string;
  testimonialsTitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  seoText1: string;
  seoText2: string;
}
