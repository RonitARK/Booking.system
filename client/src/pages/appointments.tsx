import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useAppointments } from "@/hooks/use-appointments";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import AppointmentForm from "@/components/calendar/appointment-form";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  PlusCircle, 
  Search, 
  Edit2, 
  Trash2,
  CalendarIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function Appointments() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [appointmentFormOpen, setAppointmentFormOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<any>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  const { data: appointments, isLoading } = useAppointments({});
  
  const filteredAppointments = appointments?.filter(appointment => {
    // Apply status filter
    if (statusFilter && appointment.status !== statusFilter) {
      return false;
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        appointment.title.toLowerCase().includes(query) ||
        (appointment.location && appointment.location.toLowerCase().includes(query))
      );
    }
    
    return true;
  }) || [];
  
  const handleEdit = (appointment: any) => {
    setAppointmentToEdit(appointment);
    setAppointmentFormOpen(true);
  };
  
  const handleDelete = async () => {
    if (!appointmentToDelete) return;
    
    setIsDeleting(true);
    
    try {
      await apiRequest("DELETE", `/api/appointments/${appointmentToDelete}`, undefined);
      
      toast({
        title: "Appointment deleted",
        description: "The appointment has been successfully deleted."
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      setAppointmentToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the appointment.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Scheduled</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Cancelled</Badge>;
      case "no-show":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">No-show</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h1 className="text-2xl font-semibold mb-4 sm:mb-0">Appointments</h1>
              
              <Button onClick={() => {
                setAppointmentToEdit(null);
                setAppointmentFormOpen(true);
              }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search appointments..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value || undefined)}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no-show">No-show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading appointments...</div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">No appointments found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {searchQuery || statusFilter
                        ? "Try changing your search or filter criteria"
                        : "Get started by creating a new appointment"}
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => {
                        setAppointmentToEdit(null);
                        setAppointmentFormOpen(true);
                      }}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Appointment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAppointments.map(appointment => (
                          <TableRow key={appointment.id}>
                            <TableCell className="font-medium">{appointment.title}</TableCell>
                            <TableCell>
                              {format(new Date(appointment.startTime), "MMM d, yyyy")}
                              <br />
                              <span className="text-gray-500 dark:text-gray-400">
                                {format(new Date(appointment.startTime), "h:mm a")} - {format(new Date(appointment.endTime), "h:mm a")}
                              </span>
                            </TableCell>
                            <TableCell>{appointment.clientId ? "Michael Thompson" : "—"}</TableCell>
                            <TableCell>{appointment.location || "—"}</TableCell>
                            <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEdit(appointment)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => setAppointmentToDelete(appointment.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Appointment Form Modal */}
          <AppointmentForm
            isOpen={appointmentFormOpen}
            onClose={() => {
              setAppointmentFormOpen(false);
              setAppointmentToEdit(null);
            }}
            appointmentToEdit={appointmentToEdit}
          />
          
          {/* Delete Confirmation Dialog */}
          <Dialog open={appointmentToDelete !== null} onOpenChange={() => setAppointmentToDelete(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Appointment</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this appointment? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAppointmentToDelete(null)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
