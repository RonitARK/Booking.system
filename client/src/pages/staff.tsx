import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  PlusCircle, 
  Search, 
  Mail,
  Phone,
  Calendar,
  Clock,
  MoreVertical,
  UserPlus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Sample staff data
const staffData = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "555-123-4567",
    role: "admin",
    status: "active",
    appointmentsToday: 3,
    appointmentsThisWeek: 12
  },
  {
    id: 2,
    name: "John Davis",
    email: "john@example.com",
    phone: "555-987-6543",
    role: "staff",
    status: "active",
    appointmentsToday: 2,
    appointmentsThisWeek: 8
  }
];

// Staff form schema
const staffFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  role: z.enum(["admin", "staff"])
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

export default function Staff() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Check if user is admin
  const isAdmin = user?.role === "admin";
  
  const filteredStaff = staffData.filter(staff => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        staff.name.toLowerCase().includes(query) ||
        staff.email.toLowerCase().includes(query) ||
        staff.role.toLowerCase().includes(query)
      );
    }
    return true;
  });
  
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
      role: "staff"
    }
  });
  
  const onSubmit = async (data: StaffFormValues) => {
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would call the API to create a new staff member
      console.log("Adding new staff member:", data);
      
      toast({
        title: "Staff member added",
        description: `${data.name} has been added successfully.`
      });
      
      // Reset form and close dialog
      form.reset();
      setAddStaffOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add staff member. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
              <h1 className="text-2xl font-semibold mb-4 sm:mb-0">Staff Management</h1>
              
              {isAdmin && (
                <Button onClick={() => setAddStaffOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Staff Member
                </Button>
              )}
            </div>
            
            <div className="mb-6">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search staff..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStaff.map(staff => (
                <Card key={staff.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{staff.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {staff.role === "admin" ? "Administrator" : "Staff Member"}
                          </Badge>
                        </div>
                      </div>
                      
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm">{staff.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm">{staff.phone}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-3">
                      <div className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 p-2 rounded-md flex-1">
                        <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400 mb-1" />
                        <span className="text-sm font-semibold">{staff.appointmentsToday}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Today</span>
                      </div>
                      <div className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 p-2 rounded-md flex-1">
                        <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400 mb-1" />
                        <span className="text-sm font-semibold">{staff.appointmentsThisWeek}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">This Week</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <Button variant="outline" className="w-full">
                      View Schedule
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Add Staff Dialog */}
          <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Staff Member</DialogTitle>
                <DialogDescription>
                  Create a new staff account. They will receive login credentials via email.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="staff">Staff Member</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddStaffOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Staff Member"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
