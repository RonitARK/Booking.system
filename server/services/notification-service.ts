import { storage } from "../storage";

// In a real implementation, this would integrate with email and SMS providers
// For this MVP, we'll simulate notification sending

type NotificationRequest = {
  userId: number;
  type: "confirmation" | "reminder" | "cancellation" | "rescheduled";
  appointmentId: number;
};

export async function sendNotification(
  request: NotificationRequest
): Promise<boolean> {
  try {
    const { userId, type, appointmentId } = request;
    
    // Get user and appointment details
    const user = await storage.getUser(userId);
    const appointment = await storage.getAppointment(appointmentId);
    
    if (!user || !appointment) {
      console.error("User or appointment not found for notification", { userId, appointmentId });
      return false;
    }
    
    // Find notification record
    const notifications = await storage.listNotificationsByUser(userId);
    const notification = notifications.find(
      n => n.appointmentId === appointmentId && n.type === type && !n.sent
    );
    
    if (!notification) {
      console.error("Notification record not found", { userId, appointmentId, type });
      return false;
    }
    
    // In a real implementation, we would send an actual email or SMS here
    console.log(`Sending ${type} notification to ${user.name} for appointment "${appointment.title}"`);
    
    // Simulate API call to send notification
    const success = Math.random() > 0.1; // 90% success rate for simulation
    
    if (success) {
      // Mark notification as sent
      await storage.markNotificationAsSent(notification.id);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
}

// Simulate scheduled reminders
// In a real app, this would be a cron job or scheduled task
export async function scheduleReminders(): Promise<void> {
  try {
    // Get all users
    const users = await storage.listUsers();
    
    // Get upcoming appointments in the next 24 hours
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointments = await storage.listAppointments({
      startDate: now,
      endDate: tomorrow
    });
    
    // Create reminder notifications
    for (const appointment of appointments) {
      if (appointment.clientId) {
        // Check if a reminder already exists
        const userNotifications = await storage.listNotificationsByUser(appointment.clientId);
        const hasReminder = userNotifications.some(
          n => n.appointmentId === appointment.id && n.type === "reminder"
        );
        
        if (!hasReminder) {
          // Create the reminder
          const reminder = await storage.createNotification({
            userId: appointment.clientId,
            appointmentId: appointment.id,
            type: "reminder",
            method: "email",
            sent: false,
            scheduledFor: new Date(Date.now() + 1000 * 60 * 60) // Send in 1 hour for demo
          });
          
          // In a real app, we would schedule this to be sent at the appropriate time
          setTimeout(() => {
            sendNotification({
              userId: appointment.clientId!,
              type: "reminder",
              appointmentId: appointment.id
            });
          }, 60 * 1000); // Send after 1 minute for demo purposes
        }
      }
    }
  } catch (error) {
    console.error("Error scheduling reminders:", error);
  }
}

// Start the reminder scheduler (in a real app, this would be more sophisticated)
setInterval(scheduleReminders, 15 * 60 * 1000); // Check every 15 minutes
