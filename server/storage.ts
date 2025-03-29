import {
  users, type User, type InsertUser,
  appointments, type Appointment, type InsertAppointment,
  calendarIntegrations, type CalendarIntegration, type InsertCalendarIntegration,
  aiSuggestions, type AiSuggestion, type InsertAiSuggestion,
  notifications, type Notification, type InsertNotification
} from "@shared/schema";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(role?: string): Promise<User[]>;
  
  // Appointment operations
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  listAppointments(filters?: { 
    startDate?: Date, 
    endDate?: Date, 
    clientId?: number, 
    staffId?: number,
    status?: string
  }): Promise<Appointment[]>;
  
  // Calendar integration operations
  getCalendarIntegration(id: number): Promise<CalendarIntegration | undefined>;
  getCalendarIntegrationsByUser(userId: number): Promise<CalendarIntegration[]>;
  createCalendarIntegration(integration: InsertCalendarIntegration): Promise<CalendarIntegration>;
  updateCalendarIntegration(id: number, integration: Partial<CalendarIntegration>): Promise<CalendarIntegration | undefined>;
  deleteCalendarIntegration(id: number): Promise<boolean>;
  
  // AI suggestion operations
  getAiSuggestion(id: number): Promise<AiSuggestion | undefined>;
  createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  listAiSuggestionsByUser(userId: number): Promise<AiSuggestion[]>;
  markAiSuggestionAsUsed(id: number): Promise<AiSuggestion | undefined>;
  
  // Notification operations
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  listNotificationsByUser(userId: number): Promise<Notification[]>;
  markNotificationAsSent(id: number): Promise<Notification | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private appointments: Map<number, Appointment>;
  private calendarIntegrations: Map<number, CalendarIntegration>;
  private aiSuggestions: Map<number, AiSuggestion>;
  private notifications: Map<number, Notification>;
  
  private userIdCounter: number = 1;
  private appointmentIdCounter: number = 1;
  private calendarIntegrationIdCounter: number = 1;
  private aiSuggestionIdCounter: number = 1;
  private notificationIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.appointments = new Map();
    this.calendarIntegrations = new Map();
    this.aiSuggestions = new Map();
    this.notifications = new Map();
    
    // Seed admin user for demo purposes
    const adminUser: User = {
      id: this.userIdCounter++,
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "555-123-4567",
      role: "admin",
      createdAt: new Date()
    };
    this.users.set(adminUser.id, adminUser);
    
    // Seed staff user
    const staffUser: User = {
      id: this.userIdCounter++,
      username: "staff",
      password: "staff123",
      name: "John Davis",
      email: "john@example.com",
      phone: "555-987-6543",
      role: "staff",
      createdAt: new Date()
    };
    this.users.set(staffUser.id, staffUser);
    
    // Seed customer user
    const customerUser: User = {
      id: this.userIdCounter++,
      username: "customer",
      password: "customer123",
      name: "Michael Thompson",
      email: "michael@example.com",
      phone: "555-555-5555",
      role: "customer",
      createdAt: new Date()
    };
    this.users.set(customerUser.id, customerUser);
    
    // Seed some sample appointments
    const now = new Date();
    const startTime1 = new Date(now);
    startTime1.setHours(9, 0, 0, 0);
    const endTime1 = new Date(now);
    endTime1.setHours(9, 45, 0, 0);
    
    const startTime2 = new Date(now);
    startTime2.setHours(11, 0, 0, 0);
    const endTime2 = new Date(now);
    endTime2.setHours(12, 0, 0, 0);
    
    const startTime3 = new Date(now);
    startTime3.setHours(14, 0, 0, 0);
    const endTime3 = new Date(now);
    endTime3.setHours(14, 30, 0, 0);
    
    const appointment1: Appointment = {
      id: this.appointmentIdCounter++,
      title: "Client Consultation",
      startTime: startTime1,
      endTime: endTime1,
      clientId: customerUser.id,
      staffId: staffUser.id,
      location: "Video Call",
      notes: "Initial consultation",
      status: "scheduled",
      color: "#3b82f6", // blue
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const appointment2: Appointment = {
      id: this.appointmentIdCounter++,
      title: "Team Meeting",
      startTime: startTime2,
      endTime: endTime2,
      clientId: null,
      staffId: staffUser.id,
      location: "Conference Room",
      notes: "All staff required",
      status: "scheduled",
      color: "#8b5cf6", // purple
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const appointment3: Appointment = {
      id: this.appointmentIdCounter++,
      title: "Project Review",
      startTime: startTime3,
      endTime: endTime3,
      clientId: customerUser.id,
      staffId: adminUser.id,
      location: "Office",
      notes: "Review progress on current project",
      status: "scheduled",
      color: "#10b981", // green
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.appointments.set(appointment1.id, appointment1);
    this.appointments.set(appointment2.id, appointment2);
    this.appointments.set(appointment3.id, appointment3);
    
    // Seed calendar integrations
    const googleCalendar: CalendarIntegration = {
      id: this.calendarIntegrationIdCounter++,
      userId: adminUser.id,
      provider: "google",
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      expiresAt: new Date(Date.now() + 3600000),
      connected: true,
      createdAt: new Date()
    };
    
    const outlookCalendar: CalendarIntegration = {
      id: this.calendarIntegrationIdCounter++,
      userId: adminUser.id,
      provider: "outlook",
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      expiresAt: new Date(Date.now() + 3600000),
      connected: true,
      createdAt: new Date()
    };
    
    this.calendarIntegrations.set(googleCalendar.id, googleCalendar);
    this.calendarIntegrations.set(outlookCalendar.id, outlookCalendar);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async listUsers(role?: string): Promise<User[]> {
    const allUsers = Array.from(this.users.values());
    return role 
      ? allUsers.filter(user => user.role === role)
      : allUsers;
  }

  // Appointment operations
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const now = new Date();
    const newAppointment: Appointment = { 
      ...appointment, 
      id,
      createdAt: now,
      updatedAt: now 
    };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment: Appointment = {
      ...appointment,
      ...updates,
      updatedAt: new Date()
    };
    
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }

  async listAppointments(filters?: { 
    startDate?: Date, 
    endDate?: Date, 
    clientId?: number, 
    staffId?: number,
    status?: string 
  }): Promise<Appointment[]> {
    let appointments = Array.from(this.appointments.values());
    
    if (filters) {
      if (filters.startDate) {
        appointments = appointments.filter(a => a.startTime >= filters.startDate!);
      }
      
      if (filters.endDate) {
        appointments = appointments.filter(a => a.endTime <= filters.endDate!);
      }
      
      if (filters.clientId !== undefined) {
        appointments = appointments.filter(a => a.clientId === filters.clientId);
      }
      
      if (filters.staffId !== undefined) {
        appointments = appointments.filter(a => a.staffId === filters.staffId);
      }
      
      if (filters.status) {
        appointments = appointments.filter(a => a.status === filters.status);
      }
    }
    
    return appointments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  // Calendar integration operations
  async getCalendarIntegration(id: number): Promise<CalendarIntegration | undefined> {
    return this.calendarIntegrations.get(id);
  }

  async getCalendarIntegrationsByUser(userId: number): Promise<CalendarIntegration[]> {
    return Array.from(this.calendarIntegrations.values())
      .filter(integration => integration.userId === userId);
  }

  async createCalendarIntegration(integration: InsertCalendarIntegration): Promise<CalendarIntegration> {
    const id = this.calendarIntegrationIdCounter++;
    const newIntegration: CalendarIntegration = {
      ...integration,
      id,
      createdAt: new Date()
    };
    this.calendarIntegrations.set(id, newIntegration);
    return newIntegration;
  }

  async updateCalendarIntegration(id: number, updates: Partial<CalendarIntegration>): Promise<CalendarIntegration | undefined> {
    const integration = this.calendarIntegrations.get(id);
    if (!integration) return undefined;
    
    const updatedIntegration: CalendarIntegration = {
      ...integration,
      ...updates
    };
    
    this.calendarIntegrations.set(id, updatedIntegration);
    return updatedIntegration;
  }

  async deleteCalendarIntegration(id: number): Promise<boolean> {
    return this.calendarIntegrations.delete(id);
  }

  // AI suggestion operations
  async getAiSuggestion(id: number): Promise<AiSuggestion | undefined> {
    return this.aiSuggestions.get(id);
  }

  async createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const id = this.aiSuggestionIdCounter++;
    const newSuggestion: AiSuggestion = {
      ...suggestion,
      id,
      createdAt: new Date()
    };
    this.aiSuggestions.set(id, newSuggestion);
    return newSuggestion;
  }

  async listAiSuggestionsByUser(userId: number): Promise<AiSuggestion[]> {
    return Array.from(this.aiSuggestions.values())
      .filter(suggestion => suggestion.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markAiSuggestionAsUsed(id: number): Promise<AiSuggestion | undefined> {
    const suggestion = this.aiSuggestions.get(id);
    if (!suggestion) return undefined;
    
    const updatedSuggestion: AiSuggestion = {
      ...suggestion,
      used: true
    };
    
    this.aiSuggestions.set(id, updatedSuggestion);
    return updatedSuggestion;
  }

  // Notification operations
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date()
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async listNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsSent(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification: Notification = {
      ...notification,
      sent: true
    };
    
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
}

export const storage = new MemStorage();
