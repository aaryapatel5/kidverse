/**
 * KidVerse REST API Client Service
 * Connects React frontend with Java Spring Boot backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface Product {
  id: number;
  title: string;
  age: string;
  ageGroup: '3-5' | '6-8' | '9+';
  description: string;
  price: number;
  color: string;
  imageUrl: string;
  videoUrl: string;
  isBudget?: boolean;
}

export interface AuthResponse {
  id: number;
  username: string;
  email?: string;
  role: string;
  message: string;
  stars?: number;
  token?: string;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('kidverse_token');
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('kidverse_token', token);
  } else {
    localStorage.removeItem('kidverse_token');
  }
}

function getAuthHeaders(includeJson: boolean = true): Record<string, string> {
  const headers: Record<string, string> = {};
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface OrderRequest {
  userId?: number;
  username: string;
  productIds: number[];
  discountPct: number;
  shipping: number;
  freeGift?: string | null;
}

export interface OrderResponse {
  orderId: number;
  userId: number;
  username: string;
  subtotal: number;
  discountPct: number;
  discountAmount: number;
  shipping: number;
  total: number;
  freeGift?: string;
  status: string;
  orderDate: string;
  productIds: number[];
}

export interface ProgressResponse {
  childUsername: string;
  stars: number;
  lastGame: string;
  rewardDiscount: number;
  rewardTier: string;
}

// ── Auth APIs ──
export async function apiLogin(username: string, password: string, userType: 'parent' | 'child'): Promise<AuthResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, userType }),
    });
  } catch (netErr) {
    throw new Error('Unable to connect to the backend server. Please verify MySQL and Spring Boot are running.');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Invalid username or password.');
  }

  const data: AuthResponse = await response.json();
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

// ── Brevo Email OTP APIs ──
export async function apiSendOtp(
  email: string,
  purpose: 'LOGIN' | 'REGISTER' | 'VERIFY' = 'VERIFY'
): Promise<{ success: boolean; message: string; email: string }> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose }),
    });
  } catch (netErr) {
    throw new Error('Unable to connect to the backend server. Please verify MySQL and Spring Boot are running.');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to send OTP email.');
  }

  return await response.json();
}

export async function apiVerifyOtp(
  email: string,
  otp: string
): Promise<{ success: boolean; message: string; email: string; verified: boolean }> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
  } catch (netErr) {
    throw new Error('Unable to connect to the backend server. Please verify MySQL and Spring Boot are running.');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Verification failed. Incorrect or expired code.');
  }

  return await response.json();
}

export async function apiLoginOtp(
  email: string,
  otp: string,
  userType: 'parent' | 'child'
): Promise<AuthResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/login-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, userType }),
    });
  } catch (netErr) {
    throw new Error('Unable to connect to the backend server. Please verify MySQL and Spring Boot are running.');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'OTP Login failed.');
  }

  const data: AuthResponse = await response.json();
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function apiRegister(
  username: string,
  password: string,
  role: 'PARENT' | 'CHILD',
  email?: string,
  parentUsername?: string
): Promise<AuthResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role, email, parentUsername }),
    });
  } catch (netErr) {
    throw new Error('Unable to connect to the backend server. Please verify MySQL and Spring Boot are running.');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Registration failed. Please try a different username.');
  }

  const data: AuthResponse = await response.json();
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

// ── Product APIs ──
export async function apiGetProducts(ageGroup?: string, budgetOnly: boolean = false): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (ageGroup && ageGroup !== 'all') params.append('ageGroup', ageGroup);
    if (budgetOnly) params.append('budgetOnly', 'true');

    const url = `${API_BASE_URL}/products${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  } catch (error) {
    console.warn('Backend unavailable, fallback to local products:', error);
    return [];
  }
}

// ── Order APIs ──
export async function apiCreateOrder(order: OrderRequest): Promise<OrderResponse> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(true),
      'X-Username': order.username,
    },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to complete order');
  }

  return await response.json();
}

export async function apiGetPurchasedProductIds(username: string): Promise<number[]> {
  try {
    if (!username) return [];
    const response = await fetch(`${API_BASE_URL}/orders/purchased?username=${encodeURIComponent(username)}`, {
      headers: {
        ...getAuthHeaders(false),
        'X-Username': username,
      },
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.warn('Could not load purchased products from backend:', error);
    return [];
  }
}

// ── Child Progress / Stars APIs ──
export async function apiGetProgress(childUsername: string, callerUsername?: string): Promise<ProgressResponse | null> {
  try {
    const target = childUsername || 'Leo';
    const caller = callerUsername || target;
    const response = await fetch(`${API_BASE_URL}/progress/${encodeURIComponent(target)}`, {
      headers: {
        ...getAuthHeaders(false),
        'X-Username': caller,
      },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn('Could not fetch child progress from backend:', error);
    return null;
  }
}

export async function apiGetProgressForParent(parentUsername: string): Promise<ProgressResponse | null> {
  try {
    if (!parentUsername) return null;
    const response = await fetch(`${API_BASE_URL}/progress/parent/${encodeURIComponent(parentUsername)}`, {
      headers: {
        ...getAuthHeaders(false),
        'X-Username': parentUsername,
      },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn('Could not fetch child progress for parent from backend:', error);
    return null;
  }
}

export async function apiAddStar(username: string, gameId: string, starsToAdd: number = 1): Promise<ProgressResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/progress/star`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(true),
        'X-Username': username,
      },
      body: JSON.stringify({ username, gameId, starsToAdd }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn('Could not sync stars with backend:', error);
    return null;
  }
}
