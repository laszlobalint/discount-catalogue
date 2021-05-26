export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirmation {
  password: string;
  token: string;
}

export interface CatalogueSearchParams {
  siteIds: string[];
  categoryIds: string[];
}

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface FilterResult {
  filterResult: CatalogueResponse[];
}

export interface CatalogueRequest {
  id?: number;
  seller: string;
  category: string;
  site: string;
  address: string;
  discountRate: string;
  validFrom: Date;
  validTill?: Date;
  active: number;
  url: string;
  description?: string;
  attachment?: File;
  fileName?: string;
  sha256?: string;
}

export interface CatalogueResponse {
  id?: number;
  seller: string;
  category_id: string;
  site_id: string;
  address: string;
  discount_rate: string;
  valid_from?: Date;
  valid_till?: Date;
  active: number;
  url?: string;
  description?: string;
  attachment_file_name?: string;
  sha256?: string;
}

export interface LoginResponse {
  token: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  is_active: number;
  is_deleted?: number;
  is_admin: number;
  activation_token?: string;
  default_site_id: number;
  profile_picture?: any;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
}

export interface FetchAllUsersResponse {
  users: UserResponse[];
}

export interface ActiveUserInfo {
  name: string;
  email: string;
  isAdmin: boolean;
  defaultSite: string;
  profilePicture?: any;
  id?: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  defaultSite: string;
}

export interface UpdateUserProfile {
  id: number;
  name: string;
  email: string;
  defaultSite: string;
}

export interface UpdateResponse {
  token?: string;
  message: string;
}

export interface PasswordValidation {
  notSame?: boolean;
}

export interface SiteValidation {
  notExisting?: boolean;
}

export const SITES = {
  '1': 'Szeged',
  '2': 'Pécs',
  '3': 'Debrecen',
  '4': 'Budapest',
  '5': 'Telephelytől független',
};

export const CATEGORIES = {
  1: 'Étel/Ital',
  2: 'Autó-Motor',
  3: 'Egészség',
  4: 'Fotó',
  5: 'Szabadidő',
  6: 'Szállás, Utazás',
  7: 'Egyéb',
  8: 'Sport',
  9: 'Informatika',
  10: 'Könyv',
  11: 'Ruha',
  12: 'Szépségápolás',
  13: 'Színház, Mozi',
  14: 'Sportegyesület',
  15: 'Magánoktatás',
  16: 'Rendezvényszervezés',
  17: 'Barkács, Háztartás, Szerszám',
};

export const LANGUAGES = {
  1: 'EN',
  2: 'HU',
  3: 'DE',
};

export const BASE_URL = 'http://localhost:3000/api/v1';
