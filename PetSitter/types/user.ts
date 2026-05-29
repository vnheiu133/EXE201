import type { UserRole } from "@/enum/UserRole"

export interface User {
  userId: string
  fullName: string
  email: string
  role: UserRole
  phoneNumber?: string
  dateOfBirth?: string
  address?: string
  profilePictureUrl?: string
  createdAt: string
}
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: "user" | "shop";
  dateOfBirth?: string;
  address?: string;
}