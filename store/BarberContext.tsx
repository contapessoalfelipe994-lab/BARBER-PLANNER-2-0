
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Barbershop, Customer, Appointment, FinancialRecord, UserRole } from '../types';
import { CONFIG } from '../config';

export interface Notification {
  message: string;
  type: 'success' | 'error';
}

interface BarberContextType {
  currentUser: User | null;
  barbershop: Barbershop | null;
  customers: Customer[];
  appointments: Appointment[];
  finances: FinancialRecord[];
  allBarbers: User[];
  notification: Notification | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  createBarbershop: (data: Partial<Barbershop>) => Promise<void>;
  joinBarbershop: (code: string) => Promise<boolean>;
  addCustomer: (data: Partial<Customer>) => Promise<string>;
  addAppointment: (data: Partial<Appointment>) => Promise<boolean>;
  completeAppointment: (appointmentId: string) => Promise<void>;
  updateBarberCommission: (barberId: string, commission: number) => Promise<void>;
  setNotification: (notif: Notification | null) => void;
  isLoading: boolean;
}

const BarberContext = createContext<BarberContextType | undefined>(undefined);

export const useBarber = () => {
  const context = useContext(BarberContext);
  if (context === undefined) {
    throw new Error('useBarber must be used within a BarberProvider');
  }
  return context;
};

export const BarberProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [finances, setFinances] = useState<FinancialRecord[]>([]);
  const [allBarbers, setAllBarbers] = useState<User[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem(CONFIG.AUTH_TOKEN_KEY);
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };
    const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro na requisição');
    }
    return response.json();
  };

  const loadAllData = async () => {
    try {
      const data = await fetchWithAuth('/sync');
      setCurrentUser(data.user);
      setBarbershop(data.barbershop);
      setCustomers(data.customers || []);
      setAppointments(data.appointments || []);
      setFinances(data.finances || []);
      setAllBarbers(data.team || []);
    } catch (error) {
      console.error('Falha ao carregar dados da Hostinger:', error);
      // Fallback para login se o token for inválido
      if (localStorage.getItem(CONFIG.AUTH_TOKEN_KEY)) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(CONFIG.AUTH_TOKEN_KEY);
    if (token) {
      loadAllData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await fetch(`${CONFIG.API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }).then(res => res.json());

      if (data.token) {
        localStorage.setItem(CONFIG.AUTH_TOKEN_KEY, data.token);
        await loadAllData();
        return { success: true, message: 'Bem-vindo de volta!' };
      }
      return { success: false, message: data.message || 'Credenciais inválidas' };
    } catch (e) {
      return { success: false, message: 'Erro ao conectar com o servidor.' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const data = await fetch(`${CONFIG.API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      }).then(res => res.json());

      if (data.token) {
        localStorage.setItem(CONFIG.AUTH_TOKEN_KEY, data.token);
        await loadAllData();
        return { success: true, message: 'Conta criada com sucesso!' };
      }
      return { success: false, message: data.message || 'Erro no registro' };
    } catch (e) {
      return { success: false, message: 'Servidor indisponível.' };
    }
  };

  const createBarbershop = async (data: Partial<Barbershop>) => {
    await fetchWithAuth('/barbershop', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await loadAllData();
  };

  const joinBarbershop = async (code: string): Promise<boolean> => {
    try {
      await fetchWithAuth('/barbershop/join', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      await loadAllData();
      return true;
    } catch (e) {
      return false;
    }
  };

  const addCustomer = async (data: Partial<Customer>): Promise<string> => {
    const result = await fetchWithAuth('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await loadAllData();
    return result.id;
  };

  const addAppointment = async (data: Partial<Appointment>): Promise<boolean> => {
    try {
      await fetchWithAuth('/appointments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setNotification({ message: 'Agendamento realizado!', type: 'success' });
      await loadAllData();
      return true;
    } catch (e: any) {
      setNotification({ message: e.message, type: 'error' });
      return false;
    }
  };

  const completeAppointment = async (id: string) => {
    await fetchWithAuth(`/appointments/${id}/complete`, { method: 'POST' });
    await loadAllData();
  };

  const updateBarberCommission = async (barberId: string, commission: number) => {
    await fetchWithAuth(`/barbers/${barberId}/commission`, {
      method: 'PATCH',
      body: JSON.stringify({ commission }),
    });
    await loadAllData();
  };

  const logout = () => {
    localStorage.removeItem(CONFIG.AUTH_TOKEN_KEY);
    setCurrentUser(null);
    setBarbershop(null);
    setCustomers([]);
    setAppointments([]);
    setFinances([]);
    setAllBarbers([]);
  };

  return (
    <BarberContext.Provider value={{ 
      currentUser, barbershop, customers, appointments, finances, allBarbers, notification, setNotification,
      login, register, logout, createBarbershop, joinBarbershop, addCustomer, addAppointment, completeAppointment, updateBarberCommission, isLoading 
    }}>
      {children}
    </BarberContext.Provider>
  );
};
