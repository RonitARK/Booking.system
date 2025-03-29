import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useAppointments } from "@/hooks/use-appointments";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Calendar, ClockIcon, Users, UserCircle, ArrowRight, PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatDateShort } from "@/lib/utils";
import AppointmentItem from "@/components/calendar/appointment-item";
import { addDays, startOfDay, endOfDay, format } from "date-fns";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const today = new Date();
  const nextWeek = addDays(today, 7);
  
  const { data: upcomingAppointments } = useAppointments({
    startDate: startOfDay(today),
    endDate: endOfDay(nextWeek)
  });
  
  const todayAppointments = upcomingAppointments?.filter(appointment => {
    const appointmentDate = new Date(appointment.startTime);
    return (
      appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear()
    );
  }) || [];

  // Generate mock data for the chart
  // In a real implementation this would come from backend analytics
  const chartData = [
    { day: 'Mon', appointments: 4 },
    { day: 'Tue', appointments: 6 },
    { day: 'Wed', appointments: 8 },
    { day: 'Thu', appointments: 5 },
    { day: 'Fri', appointments: 7 },
    { day: 'Sat', appointments: 3 },
    { day: 'Sun', appointments: 2 }
  ];
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Today's Appointments</p>
                    <h2 className="text-3xl font-bold">{todayAppointments.length}</h2>
                  </div>
                  <Calendar className="h-10 w-10 text-primary-600" />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p>
                    <h2 className="text-3xl font-bold">{upcomingAppointments?.length || 0}</h2>
                  </div>
                  <ClockIcon className="h-10 w-10 text-orange-500" />
                </CardContent>
              </Card>
              
              {(user?.role === 'admin' || user?.role === 'staff') && (
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Staff</p>
                      <h2 className="text-3xl font-bold">2</h2>
                    </div>
                    <Users className="h-10 w-10 text-green-500" />
                  </CardContent>
                </Card>
              )}
              
              {(user?.role === 'admin' || user?.role === 'staff') && (
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Clients</p>
                      <h2 className="text-3xl font-bold">5</h2>
                    </div>
                    <UserCircle className="h-10 w-10 text-purple-500" />
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Appointment Analytics</CardTitle>
                  <CardDescription>Number of appointments per day this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="appointments" fill="#4f46e5" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>
                    {format(today, 'EEEE, MMMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-2">
                  <div className="space-y-2 max-h-[300px] overflow-auto pr-2">
                    {todayAppointments.length > 0 ? (
                      todayAppointments.map(appointment => (
                        <div key={appointment.id} className="p-2 rounded-md border border-gray-200 dark:border-gray-700">
                          <div className="font-medium">{appointment.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(appointment.startTime), 'h:mm a')} - {format(new Date(appointment.endTime), 'h:mm a')}
                          </div>
                          {appointment.location && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {appointment.location}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                        No appointments scheduled for today
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/calendar">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      View Calendar
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/appointments">
                        <span>View All</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingAppointments && upcomingAppointments.length > 0 ? (
                      upcomingAppointments.slice(0, 5).map(appointment => (
                        <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-12 rounded-full mr-4"
                              style={{ backgroundColor: appointment.color }}
                            />
                            <div>
                              <div className="font-medium">{appointment.title}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDateShort(new Date(appointment.startTime))} · {format(new Date(appointment.startTime), 'h:mm a')}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm capitalize text-gray-500 dark:text-gray-400">
                            {appointment.location}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                        No upcoming appointments
                      </div>
                    )}
                    
                    <Button className="w-full mt-4" asChild>
                      <Link href="/calendar">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Schedule New Appointment
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
