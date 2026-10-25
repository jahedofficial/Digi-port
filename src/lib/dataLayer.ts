/**
 * lib/dataLayer.ts
 * Google Analytics 4 (GA4) & Google Tag Manager (GTM) Official E-commerce DataLayer
 * Specification Reference: https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtag
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export interface Ga4Item {
  item_id: string;
  item_name: string;
  affiliation?: string;
  coupon?: string;
  currency?: string;
  discount?: number;
  index?: number;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  location_id?: string;
  price: number;
  quantity?: number;
}

export interface CustomerBillingData {
  customerBillingFirstName?: string;
  customerBillingLastName?: string;
  customerBillingPhone?: string;
  customerBillingPostcode?: string;
  customerBillingEmail?: string;
  customerBillingCity?: string;
  customerBillingState?: string;
  customerBillingAddress?: string;
  customerBillingCountry?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  _fbp?: string;
  _fbc?: string;
  fbp?: string;
  fbc?: string;
}

/**
 * Helper to get a cookie value safely from browser
 */
export function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : '';
}

/**
 * Helper to set a cookie safely (default 90 days expiration like Meta Pixel)
 */
export function setCookie(name: string, value: string, days: number = 90) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Get Meta Pixel _fbp and _fbc cookie values for Facebook Conversions API (CAPI) / GTM
 */
export function getFacebookCookies(): { _fbp: string; _fbc: string; fbp: string; fbc: string } {
  if (typeof window === 'undefined') {
    return { _fbp: '', _fbc: '', fbp: '', fbc: '' };
  }

  // 1. Read _fbp cookie or generate standard value if missing
  let fbp = getCookie('_fbp');
  if (!fbp) {
    fbp = `fb.1.${Date.now()}.${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setCookie('_fbp', fbp, 90);
  }

  // 2. Read _fbc cookie or build from URL / storage fbclid
  let fbc = getCookie('_fbc');
  if (!fbc) {
    let fbclid = '';
    try {
      const urlParams = new URLSearchParams(window.location.search);
      fbclid = urlParams.get('fbclid') || '';
      if (fbclid) {
        localStorage.setItem('digiport_fbclid', fbclid);
      } else {
        fbclid = localStorage.getItem('digiport_fbclid') || '';
      }
    } catch {}

    if (fbclid) {
      fbc = `fb.1.${Date.now()}.${fbclid}`;
      setCookie('_fbc', fbc, 90);
    }
  }

  return {
    _fbp: fbp || '',
    _fbc: fbc || '',
    fbp: fbp || '',
    fbc: fbc || '',
  };
}

/**
 * Universal safe helper to push to window.dataLayer
 */
export function pushToDataLayer(eventPayload: Record<string, any>) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];

  const fbCookies = getFacebookCookies();
  const enhancedPayload = {
    ...(fbCookies._fbp ? { _fbp: fbCookies._fbp, fbp: fbCookies._fbp } : {}),
    ...(fbCookies._fbc ? { _fbc: fbCookies._fbc, fbc: fbCookies._fbc } : {}),
    ...eventPayload,
  };

  window.dataLayer.push(enhancedPayload);
}

/**
 * Helper to clear previous ecommerce object as strictly required by Google GTM documentation
 */
export function clearEcommerce() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
}

/**
 * Utility helper to format and extract customer billing details for GTM Data Layer Variables
 */
export function extractCustomerBilling(formData?: {
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postcode?: string;
  zip?: string;
  country?: string;
}): CustomerBillingData {
  if (!formData) return {};

  const rawName = (formData.name || formData.fullName || '').trim();
  let firstName = formData.firstName || '';
  let lastName = formData.lastName || '';

  if (!firstName && rawName) {
    const parts = rawName.split(/\s+/);
    firstName = parts[0] || '';
    lastName = parts.slice(1).join(' ') || '';
  }

  const phone = (formData.phone || '').trim();
  const email = (formData.email || '').trim().toLowerCase();
  const city = (formData.city || 'Dhaka').trim();
  const state = (formData.state || city || 'Dhaka').trim();
  const address = (formData.address || '').trim();
  const postcode = (formData.postcode || formData.zip || '').trim();
  const country = (formData.country || 'Bangladesh').trim();

  return {
    customerBillingFirstName: firstName,
    customerBillingLastName: lastName,
    customerBillingPhone: phone,
    customerBillingPostcode: postcode,
    customerBillingEmail: email,
    customerBillingCity: city,
    customerBillingState: state,
    customerBillingAddress: address,
    customerBillingCountry: country,
    first_name: firstName,
    last_name: lastName,
    phone: phone,
    email: email,
    city: city,
    state: state,
    zip: postcode,
    country: country,
  };
}

/**
 * 1. Page View (SPA and initial page load)
 */
export function trackPageView(pagePath?: string, pageTitle?: string) {
  if (typeof window === 'undefined') return;
  const path = pagePath || window.location.pathname;
  const title = pageTitle || document.title;

  pushToDataLayer({
    event: 'page_view',
    page_location: window.location.href,
    page_path: path,
    page_title: title,
  });
}

/**
 * 2. View Item List (Category or Product Grid)
 */
export function trackViewItemList(params: {
  listId?: string;
  listName?: string;
  items: any[];
}) {
  clearEcommerce();

  pushToDataLayer({
    event: 'view_item_list',
    ecommerce: {
      item_list_id: params.listId || 'category_all',
      item_list_name: params.listName || 'Product Collection',
      items: (params.items || []).map((item, index) => ({
        item_id: String(item.id || item.productId),
        item_name: item.name || item.title,
        affiliation: 'Digiport Storefront',
        currency: 'BDT',
        discount: Number(item.discount || 0),
        index: index + 1,
        item_brand: item.brand || 'Digiport',
        item_category: item.category || 'General',
        item_variant: item.variant || item.size || item.color || 'Standard',
        price: Number(item.price || 0),
        quantity: 1,
      })),
    },
  });
}

/**
 * 3. Select Item (Product Card Click)
 */
export function trackSelectItem(item: any, listName: string = 'Product Grid', index: number = 1) {
  clearEcommerce();

  pushToDataLayer({
    event: 'select_item',
    ecommerce: {
      item_list_name: listName,
      items: [
        {
          item_id: String(item.id || item.productId),
          item_name: item.name || item.title,
          affiliation: 'Digiport Storefront',
          currency: 'BDT',
          discount: Number(item.discount || 0),
          index: index,
          item_brand: item.brand || 'Digiport',
          item_category: item.category || 'General',
          item_variant: item.variant || item.size || item.color || 'Standard',
          price: Number(item.price || 0),
          quantity: 1,
        },
      ],
    },
  });
}

/**
 * 4. View Item (Product Detail Page - PDP)
 */
export function trackViewItem(item: any, selectedVariant?: string) {
  clearEcommerce();

  const price = Number(item.price || 0);

  pushToDataLayer({
    event: 'view_item',
    ecommerce: {
      currency: 'BDT',
      value: price,
      items: [
        {
          item_id: String(item.id || item.productId),
          item_name: item.name || item.title,
          affiliation: 'Digiport Storefront',
          currency: 'BDT',
          discount: Number(item.discount || 0),
          index: 1,
          item_brand: item.brand || 'Digiport',
          item_category: item.category || 'General',
          item_variant: selectedVariant || item.size || item.color || 'Standard',
          price: price,
          quantity: 1,
        },
      ],
    },
  });
}

/**
 * 5. Add To Cart
 */
export function trackAddToCart(item: any, quantity: number = 1, selectedVariant?: string) {
  clearEcommerce();

  const price = Number(item.price || 0);
  const qty = Number(quantity || 1);

  pushToDataLayer({
    event: 'add_to_cart',
    ecommerce: {
      currency: 'BDT',
      value: price * qty,
      items: [
        {
          item_id: String(item.id || item.productId),
          item_name: item.name || item.title,
          affiliation: 'Digiport Storefront',
          currency: 'BDT',
          discount: Number(item.discount || 0),
          index: 1,
          item_brand: item.brand || 'Digiport',
          item_category: item.category || 'General',
          item_variant: selectedVariant || item.size || item.color || 'Standard',
          price: price,
          quantity: qty,
        },
      ],
    },
  });
}

/**
 * 6. Remove From Cart
 */
export function trackRemoveFromCart(item: any, quantity: number = 1, selectedVariant?: string) {
  clearEcommerce();

  const price = Number(item.price || 0);
  const qty = Number(quantity || 1);

  pushToDataLayer({
    event: 'remove_from_cart',
    ecommerce: {
      currency: 'BDT',
      value: price * qty,
      items: [
        {
          item_id: String(item.id || item.productId),
          item_name: item.name || item.title,
          affiliation: 'Digiport Storefront',
          currency: 'BDT',
          index: 1,
          item_brand: item.brand || 'Digiport',
          item_category: item.category || 'General',
          item_variant: selectedVariant || item.size || item.color || 'Standard',
          price: price,
          quantity: qty,
        },
      ],
    },
  });
}

/**
 * 7. View Cart
 */
export function trackViewCart(cartItems: any[], totalValue: number) {
  clearEcommerce();

  pushToDataLayer({
    event: 'view_cart',
    ecommerce: {
      currency: 'BDT',
      value: Number(totalValue || 0),
      items: (cartItems || []).map((item, index) => ({
        item_id: String(item.id || item.productId),
        item_name: item.name || item.title,
        affiliation: 'Digiport Storefront',
        currency: 'BDT',
        index: index + 1,
        item_brand: item.brand || 'Digiport',
        item_category: item.category || 'General',
        item_variant: item.size || item.color || 'Standard',
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
      })),
    },
  });
}

/**
 * 8. Begin Checkout
 */
export function trackBeginCheckout(params: {
  cartItems: any[];
  totalValue: number;
  couponCode?: string;
  customerBillingFirstName?: string;
  customerBillingLastName?: string;
  customerBillingPhone?: string;
  customerBillingPostcode?: string;
  customerBillingEmail?: string;
  customerBillingCity?: string;
  customerBillingState?: string;
  customerBillingAddress?: string;
  customerBillingCountry?: string;
  state?: string;
  city?: string;
  country?: string;
  zip?: string;
  _fbp?: string;
  _fbc?: string;
}) {
  clearEcommerce();

  const fbCookies = getFacebookCookies();
  const fbp = params._fbp || fbCookies._fbp;
  const fbc = params._fbc || fbCookies._fbc;
  const billingState = params.customerBillingState || params.state || params.customerBillingCity || 'Dhaka';

  const billingData: Record<string, any> = {
    _fbp: fbp,
    _fbc: fbc,
    fbp: fbp,
    fbc: fbc,
    state: billingState,
    customerBillingState: billingState,
    customerState: billingState,
  };
  if (params.customerBillingFirstName) {
    billingData.customerBillingFirstName = params.customerBillingFirstName;
    billingData.first_name = params.customerBillingFirstName;
  }
  if (params.customerBillingLastName) {
    billingData.customerBillingLastName = params.customerBillingLastName;
    billingData.last_name = params.customerBillingLastName;
  }
  if (params.customerBillingPhone) {
    billingData.customerBillingPhone = params.customerBillingPhone;
    billingData.phone = params.customerBillingPhone;
  }
  if (params.customerBillingPostcode) {
    billingData.customerBillingPostcode = params.customerBillingPostcode;
    billingData.zip = params.customerBillingPostcode;
  }
  if (params.customerBillingEmail) {
    billingData.customerBillingEmail = params.customerBillingEmail;
    billingData.email = params.customerBillingEmail;
  }
  if (params.customerBillingCity) {
    billingData.customerBillingCity = params.customerBillingCity;
    billingData.city = params.customerBillingCity;
  }
  if (params.customerBillingAddress) billingData.customerBillingAddress = params.customerBillingAddress;
  if (params.customerBillingCountry) {
    billingData.customerBillingCountry = params.customerBillingCountry;
    billingData.country = params.customerBillingCountry;
  }

  pushToDataLayer({
    event: 'begin_checkout',
    ...billingData,
    ecommerce: {
      currency: 'BDT',
      value: Number(params.totalValue || 0),
      coupon: params.couponCode || undefined,
      items: (params.cartItems || []).map((item, index) => ({
        item_id: String(item.id || item.productId),
        item_name: item.name || item.title,
        affiliation: 'Digiport Storefront',
        currency: 'BDT',
        index: index + 1,
        item_brand: item.brand || 'Digiport',
        item_category: item.category || 'General',
        item_variant: item.size || item.color || 'Standard',
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
      })),
    },
  });
}

/**
 * 9. Add Shipping Info
 */
export function trackAddShippingInfo(params: {
  cartItems: any[];
  totalValue: number;
  shippingTier: string;
  shippingCost?: number;
  couponCode?: string;
  customerBillingFirstName?: string;
  customerBillingLastName?: string;
  customerBillingPhone?: string;
  customerBillingPostcode?: string;
  customerBillingEmail?: string;
  customerBillingCity?: string;
  customerBillingState?: string;
  customerBillingAddress?: string;
  customerBillingCountry?: string;
}) {
  clearEcommerce();

  pushToDataLayer({
    event: 'add_shipping_info',
    ecommerce: {
      currency: 'BDT',
      value: Number(params.totalValue || 0),
      coupon: params.couponCode || undefined,
      shipping_tier: params.shippingTier,
      items: (params.cartItems || []).map((item, index) => ({
        item_id: String(item.id || item.productId),
        item_name: item.name || item.title,
        affiliation: 'Digiport Storefront',
        currency: 'BDT',
        index: index + 1,
        item_brand: item.brand || 'Digiport',
        item_category: item.category || 'General',
        item_variant: item.size || item.color || 'Standard',
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
      })),
    },
  });
}

/**
 * 10. Add Payment Info
 */
export function trackAddPaymentInfo(params: {
  cartItems: any[];
  totalValue: number;
  paymentType: string;
  couponCode?: string;
  customerBillingFirstName?: string;
  customerBillingLastName?: string;
  customerBillingPhone?: string;
  customerBillingPostcode?: string;
  customerBillingEmail?: string;
  customerBillingCity?: string;
  customerBillingState?: string;
  customerBillingAddress?: string;
  customerBillingCountry?: string;
}) {
  clearEcommerce();

  pushToDataLayer({
    event: 'add_payment_info',
    ecommerce: {
      currency: 'BDT',
      value: Number(params.totalValue || 0),
      coupon: params.couponCode || undefined,
      payment_type: params.paymentType,
      items: (params.cartItems || []).map((item, index) => ({
        item_id: String(item.id || item.productId),
        item_name: item.name || item.title,
        affiliation: 'Digiport Storefront',
        currency: 'BDT',
        index: index + 1,
        item_brand: item.brand || 'Digiport',
        item_category: item.category || 'General',
        item_variant: item.size || item.color || 'Standard',
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
      })),
    },
  });
}

/**
 * 11. Purchase (Transaction Completed with Google Enhanced Conversions)
 */
export function trackPurchase(params: {
  transactionId: string | number;
  totalValue: number;
  tax?: number;
  shipping?: number;
  coupon?: string;
  items: any[];
  customerBillingFirstName?: string;
  customerBillingLastName?: string;
  customerBillingPhone?: string;
  customerBillingPostcode?: string;
  customerBillingEmail?: string;
  customerBillingCity?: string;
  customerBillingState?: string;
  customerBillingAddress?: string;
  customerBillingCountry?: string;
  state?: string;
  city?: string;
  country?: string;
  zip?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  _fbp?: string;
  _fbc?: string;
}) {
  clearEcommerce();

  const fbCookies = getFacebookCookies();
  const fbp = params._fbp || fbCookies._fbp;
  const fbc = params._fbc || fbCookies._fbc;

  const billingFirstName = (params.customerBillingFirstName || params.first_name || '').trim();
  const billingLastName = (params.customerBillingLastName || params.last_name || '').trim();
  const billingPhone = (params.customerBillingPhone || params.phone || '').trim();
  const billingPostcode = (params.customerBillingPostcode || params.zip || '').trim();
  const billingEmail = (params.customerBillingEmail || params.email || '').trim().toLowerCase();
  const billingCity = (params.customerBillingCity || params.city || 'Dhaka').trim();
  const billingState = (params.customerBillingState || params.state || billingCity || 'Dhaka').trim();
  const billingAddress = (params.customerBillingAddress || '').trim();
  const billingCountry = (params.customerBillingCountry || params.country || 'Bangladesh').trim();
  const transactionId = String(params.transactionId);
  const totalValue = Number(params.totalValue || 0);

  pushToDataLayer({
    event: 'purchase',
    _fbp: fbp,
    _fbc: fbc,
    fbp: fbp,
    fbc: fbc,
    order_id: transactionId,
    transaction_id: transactionId,
    value: totalValue,
    currency: 'BDT',
    first_name: billingFirstName,
    last_name: billingLastName,
    phone: billingPhone,
    email: billingEmail,
    city: billingCity,
    state: billingState,
    zip: billingPostcode,
    postcode: billingPostcode,
    country: billingCountry,
    customerBillingFirstName: billingFirstName,
    customerBillingLastName: billingLastName,
    customerBillingPhone: billingPhone,
    customerBillingPostcode: billingPostcode,
    customerBillingEmail: billingEmail,
    customerBillingCity: billingCity,
    customerBillingState: billingState,
    customerBillingAddress: billingAddress,
    customerBillingCountry: billingCountry,
    customerEmail: billingEmail,
    customerPhone: billingPhone,
    customerState: billingState,
    customerCity: billingCity,
    // Google Enhanced Conversions / Meta User Data Object
    user_data: {
      email: billingEmail,
      phone_number: billingPhone,
      address: {
        first_name: billingFirstName,
        last_name: billingLastName,
        city: billingCity,
        region: billingState,
        postal_code: billingPostcode,
        country: billingCountry,
      },
    },
    ecommerce: {
      transaction_id: transactionId,
      affiliation: 'Digiport Storefront',
      value: totalValue,
      tax: Number(params.tax || 0),
      shipping: Number(params.shipping || 0),
      currency: 'BDT',
      coupon: params.coupon || undefined,
      items: (params.items || []).map((item, index) => ({
        item_id: String(item.id || item.productId),
        item_name: item.name || item.title,
        affiliation: 'Digiport Storefront',
        currency: 'BDT',
        index: index + 1,
        item_brand: item.brand || 'Digiport',
        item_category: item.category || 'General',
        item_variant: item.size || item.color || 'Standard',
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
      })),
    },
  });
}

/**
 * 12. Promotion Tracking
 */
export function trackViewPromotion(promo: {
  promotionId: string;
  promotionName: string;
  creativeName?: string;
  creativeSlot?: string;
}) {
  clearEcommerce();

  pushToDataLayer({
    event: 'view_promotion',
    ecommerce: {
      creative_name: promo.creativeName || 'Banner',
      creative_slot: promo.creativeSlot || 'Top Carousel',
      promotion_id: promo.promotionId,
      promotion_name: promo.promotionName,
    },
  });
}

export function trackSelectPromotion(promo: {
  promotionId: string;
  promotionName: string;
  creativeName?: string;
  creativeSlot?: string;
}) {
  clearEcommerce();

  pushToDataLayer({
    event: 'select_promotion',
    ecommerce: {
      creative_name: promo.creativeName || 'Banner',
      creative_slot: promo.creativeSlot || 'Top Carousel',
      promotion_id: promo.promotionId,
      promotion_name: promo.promotionName,
    },
  });
}
