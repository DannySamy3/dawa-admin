// ─── Auth & User ────────────────────────────────────────────────────────────

export type UserRole =
  | 'ADMIN'
  | 'IMPORTER'
  | 'DISTRIBUTOR'
  | 'MANUFACTURER'
  | 'INSTITUTION'
  | 'COMMUNITY';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  importerProfile?: ImporterProfile | null;
  distributorProfile?: DistributorProfile | null;
  manufacturerProfile?: ManufacturerProfile | null;
  institutionProfile?: InstitutionProfile | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ─── Person ─────────────────────────────────────────────────────────────────

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface BaseBusinessProfile {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isVerified: boolean;
  tinNumber?: string | null;
  brela?: string | null;
  incorporationCertificate?: string | null;
  premisesRegistration?: string | null;
  businessLicence?: string | null;
  pharmacistCertificate?: string | null;
  pharmacyCouncilLicense?: string | null;
  directorId?: string | null;
  bankStatement?: string | null;
  buildingPicture?: string | null;
}

// ─── Importer ────────────────────────────────────────────────────────────────

export interface ImporterProfile extends BaseBusinessProfile {
  id: string;
  userId: string;
  companyName: string;
  tFDA_Document?: string;
  pharmacyCouncilDocument?: string;
  locationPremises?: string;
  country?: string;
  city?: string;
  physicalAddress?: string;
  md?: Person;
  supplierChain?: unknown;
  directors?: unknown;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

// ─── Distributor ─────────────────────────────────────────────────────────────

export interface DistributorProfile extends BaseBusinessProfile {
  id: string;
  userId: string;
  companyName: string;
  tFDA_Document?: string;
  warehouseLocation?: string;
  supplyArea?: string;
  directorDetails?: unknown;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

// ─── Manufacturer ─────────────────────────────────────────────────────────────

export interface ManufacturerProfile extends BaseBusinessProfile {
  id: string;
  userId: string;
  name: string;
  registrationFields?: Record<string, string>;
  tFDA_Document?: string;
  pharmacyCouncilDocument?: string;
  optionalInfo?: Record<string, string>;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

// ─── Institution ──────────────────────────────────────────────────────────────

export type InstitutionType =
  | 'PHARMACY'
  | 'DISPENSARY'
  | 'CLINIC'
  | 'HOSPITAL'
  | 'OTHER';

export interface InstitutionProfile extends BaseBusinessProfile {
  id: string;
  userId: string;
  institutionName: string;
  registrationDocs?: string[];
  type: InstitutionType;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

// ─── Community / Professional ─────────────────────────────────────────────────

export type ProfessionalStatus = 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED';

export interface Professional {
  id: string;
  userId: string;
  name: string;
  specialty: string;
  licenseNumber?: string;
  status: ProfessionalStatus;
  feesPaid?: boolean;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

// ─── Pagination ────────────────────────────────────────────────────────────────

export interface PendingRequest extends BaseBusinessProfile {
  id: string;
  userId: string;
  requestType: 'IMPORTER' | 'DISTRIBUTOR' | 'MANUFACTURER' | 'INSTITUTION' | 'ORGANICSSUPPLEMENT';
  displayName: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
  // Generic fields that might be present
  companyName?: string;
  name?: string;
  institutionName?: string;
  type?: InstitutionType;
  tFDA_Document?: string;
  warehouseLocation?: string;
  supplyArea?: string;
  registrationFields?: Record<string, string>;
  optionalInfo?: Record<string, string>;
  registrationDocs?: string[];
  city?: string;
  country?: string;
  locationPremises?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  userId: string;
  content: string;
  images: string[] | null;
  targetRoles: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
  comments: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      name: string;
      email: string;
      role: string;
    };
  }[];
}

// Some endpoints return different shapes
export interface PaginatedUsers {
  users?: User[];
  data?: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  total?: number;
  page?: number;
}
