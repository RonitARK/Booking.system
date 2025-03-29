import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertAppointmentSchema, insertCalendarIntegrationSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { generateAiSuggestions } from "./services/openai-service";
import { sendNotification } from "./services/notification-service";
import { syncCalendar } from "./services/calendar-integration";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup session middleware
  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new SessionStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "smartbook-ai-secret"
    })
  );

  // Setup passport for authentication
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Attempting login for username: ${username}`);
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          console.log(`User not found: ${username}`);
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // Check if password matches
        if (user.password !== password) {
          console.log(`Invalid password for user: ${username}`);
          return done(null, false, { message: "Invalid username or password" });
        }
        
        console.log(`Login successful for: ${username}, role: ${user.role}`);
        return done(null, user);
      } catch (err) {
        console.error(`Login error for ${username}:`, err);
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  const isAdmin = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated() && req.user && (req.user as any).role === "admin") {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };

  const isStaffOrAdmin = (req: Request, res: Response, next: any) => {
    if (
      req.isAuthenticated() &&
      req.user &&
      ((req.user as any).role === "admin" || (req.user as any).role === "staff")
    ) {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };

  // Authentication Routes
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json(info);
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/session", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      return res.json({
        isAuthenticated: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
    res.json({ isAuthenticated: false });
  });

  // User Routes
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const role = req.query.role as string | undefined;
      const users = await storage.listUsers(role);
      res.json(users.map(u => ({
        id: u.id,
        username: u.username,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        createdAt: u.createdAt
      })));
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve users" });
    }
  });

  app.post("/api/users", isAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Appointment Routes
  app.get("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const role = user.role;
      
      const startDate = req.query.startDate 
        ? new Date(req.query.startDate as string) 
        : undefined;
      
      const endDate = req.query.endDate 
        ? new Date(req.query.endDate as string) 
        : undefined;
      
      const filters: any = { startDate, endDate };
      
      // Filter based on user role
      if (role === "customer") {
        filters.clientId = user.id;
      } else if (role === "staff") {
        filters.staffId = user.id;
      }
      
      if (req.query.status) {
        filters.status = req.query.status as string;
      }
      
      const appointments = await storage.listAppointments(filters);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve appointments" });
    }
  });

  app.post("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      
      // Create a notification for the appointment
      if (appointment.clientId) {
        await storage.createNotification({
          userId: appointment.clientId,
          appointmentId: appointment.id,
          type: "confirmation",
          method: "email",
          sent: false,
          scheduledFor: new Date()
        });
        
        // Send the notification (email/SMS in a real implementation)
        await sendNotification({
          userId: appointment.clientId,
          type: "confirmation",
          appointmentId: appointment.id
        });
      }
      
      // Sync with calendar if integration exists
      if (appointment.staffId) {
        const integrations = await storage.getCalendarIntegrationsByUser(appointment.staffId);
        for (const integration of integrations) {
          await syncCalendar({
            action: "create",
            integration,
            appointment
          });
        }
      }
      
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.put("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check authorization
      const user = req.user as any;
      if (
        user.role !== "admin" &&
        appointment.staffId !== user.id &&
        appointment.clientId !== user.id
      ) {
        return res.status(403).json({ message: "Not authorized to update this appointment" });
      }
      
      // Validate partial update
      const appointmentSchema = insertAppointmentSchema.partial();
      const updates = appointmentSchema.parse(req.body);
      
      const updatedAppointment = await storage.updateAppointment(appointmentId, updates);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Create a notification for rescheduled appointment
      if (updatedAppointment.clientId && (updates.startTime || updates.endTime)) {
        await storage.createNotification({
          userId: updatedAppointment.clientId,
          appointmentId: updatedAppointment.id,
          type: "rescheduled",
          method: "email",
          sent: false,
          scheduledFor: new Date()
        });
        
        // Send the notification
        await sendNotification({
          userId: updatedAppointment.clientId,
          type: "rescheduled",
          appointmentId: updatedAppointment.id
        });
      }
      
      // Sync with calendar if integration exists
      if (updatedAppointment.staffId) {
        const integrations = await storage.getCalendarIntegrationsByUser(updatedAppointment.staffId);
        for (const integration of integrations) {
          await syncCalendar({
            action: "update",
            integration,
            appointment: updatedAppointment
          });
        }
      }
      
      res.json(updatedAppointment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  app.delete("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check authorization
      const user = req.user as any;
      if (
        user.role !== "admin" &&
        appointment.staffId !== user.id &&
        appointment.clientId !== user.id
      ) {
        return res.status(403).json({ message: "Not authorized to delete this appointment" });
      }
      
      // Create a cancellation notification
      if (appointment.clientId) {
        await storage.createNotification({
          userId: appointment.clientId,
          appointmentId: appointment.id,
          type: "cancellation",
          method: "email",
          sent: false,
          scheduledFor: new Date()
        });
        
        // Send the notification
        await sendNotification({
          userId: appointment.clientId,
          type: "cancellation",
          appointmentId: appointment.id
        });
      }
      
      // Sync with calendar if integration exists
      if (appointment.staffId) {
        const integrations = await storage.getCalendarIntegrationsByUser(appointment.staffId);
        for (const integration of integrations) {
          await syncCalendar({
            action: "delete",
            integration,
            appointment
          });
        }
      }
      
      const success = await storage.deleteAppointment(appointmentId);
      
      if (!success) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  // Calendar Integration Routes
  app.get("/api/calendar-integrations", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const integrations = await storage.getCalendarIntegrationsByUser(user.id);
      
      // Don't send sensitive token information to client
      const sanitizedIntegrations = integrations.map(integration => ({
        id: integration.id,
        provider: integration.provider,
        connected: integration.connected,
        createdAt: integration.createdAt
      }));
      
      res.json(sanitizedIntegrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve calendar integrations" });
    }
  });

  app.post("/api/calendar-integrations", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Override userId from token
      const integrationData = {
        ...req.body,
        userId: user.id
      };
      
      const validatedData = insertCalendarIntegrationSchema.parse(integrationData);
      const integration = await storage.createCalendarIntegration(validatedData);
      
      // Don't send sensitive token information to client
      const sanitizedIntegration = {
        id: integration.id,
        provider: integration.provider,
        connected: integration.connected,
        createdAt: integration.createdAt
      };
      
      res.status(201).json(sanitizedIntegration);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid integration data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create calendar integration" });
    }
  });

  app.delete("/api/calendar-integrations/:id", isAuthenticated, async (req, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      const integration = await storage.getCalendarIntegration(integrationId);
      
      if (!integration) {
        return res.status(404).json({ message: "Calendar integration not found" });
      }
      
      // Check authorization
      const user = req.user as any;
      if (integration.userId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this integration" });
      }
      
      const success = await storage.deleteCalendarIntegration(integrationId);
      
      if (!success) {
        return res.status(404).json({ message: "Calendar integration not found" });
      }
      
      res.json({ message: "Calendar integration deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete calendar integration" });
    }
  });
  
  // AI Suggestion Routes
  app.get("/api/ai-suggestions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const suggestions = await storage.listAiSuggestionsByUser(user.id);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve AI suggestions" });
    }
  });
  
  app.post("/api/ai-suggestions/generate", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Validate date parameter
      const schema = z.object({
        date: z.string().transform(val => new Date(val))
      });
      
      const { date } = schema.parse(req.body);
      
      // Get appointments for context
      const startDate = new Date(date);
      startDate.setDate(startDate.getDate() - 7); // Get one week of previous appointments
      
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 7); // And one week of future appointments
      
      const appointments = await storage.listAppointments({
        startDate,
        endDate,
        staffId: user.role === "staff" || user.role === "admin" ? user.id : undefined,
        clientId: user.role === "customer" ? user.id : undefined
      });
      
      // Generate AI suggestions
      const suggestionData = await generateAiSuggestions({
        userId: user.id,
        date,
        appointments,
        userRole: user.role
      });
      
      // Save the suggestion
      const suggestion = await storage.createAiSuggestion({
        userId: user.id,
        date,
        suggestion: suggestionData,
        used: false
      });
      
      res.json(suggestion);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid date", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to generate AI suggestions" });
    }
  });
  
  app.post("/api/ai-suggestions/:id/use", isAuthenticated, async (req, res) => {
    try {
      const suggestionId = parseInt(req.params.id);
      const suggestion = await storage.getAiSuggestion(suggestionId);
      
      if (!suggestion) {
        return res.status(404).json({ message: "AI suggestion not found" });
      }
      
      // Check authorization
      const user = req.user as any;
      if (suggestion.userId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to use this suggestion" });
      }
      
      const updatedSuggestion = await storage.markAiSuggestionAsUsed(suggestionId);
      
      if (!updatedSuggestion) {
        return res.status(404).json({ message: "AI suggestion not found" });
      }
      
      res.json(updatedSuggestion);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark AI suggestion as used" });
    }
  });
  
  // Notification Routes
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const notifications = await storage.listNotificationsByUser(user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve notifications" });
    }
  });

  return httpServer;
}
