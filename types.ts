
export enum UserRole {
  OWNER = 'OWNER',
  BARBER = 'BARBER'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  barbershopId: string | null;
  commission: number; // e.g. 0.5 for 50%
  avatar?: string;
}

export interface Barbershop {
  id: string;
  name: string;
  address: string;
  whatsapp: string;
  logo?: string;
  inviteCode: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  photo?: string;
  lastVisit: string;
  responsibleBarberId: string;
  totalSpent: number;
}

export interface Appointment {
  id: string;
  customerId: string;
  barberId: string;
  serviceName: string;
  price: number;
  time: string; // ISO string
  status: 'PENDING' | 'QUEUE' | 'COMPLETED' | 'CANCELLED';
}

export interface FinancialRecord {
  id: string;
  barberId: string;
  amount: number;
  houseAmount: number;
  barberAmount: number;
  date: string;
  description: string;
}
