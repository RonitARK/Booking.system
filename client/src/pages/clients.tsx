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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
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
  UserPlus,
  Edit2,
  Trash2,
  UserCircle
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample clients data
const clientsData = [
  {
    id: 3,
    name: "Michael Thompson",
    email: "michael@example.com",
    phone: "555-555-5555",
    appointmentsTotal: 8,
    lastAppointment: "2023-06-12",
    nextAppointment: "2023-06-20"
  },
  {
    id: 4,
    name: "Emily Rodriguez",
    email: "emily@example.com",
    phone: "555-123-7890",
    appointmentsTotal: 3,
    lastAppointment: "2023-06-05",
    nextAppointment: null
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david@example.com",
    phone: "555-987-1234",
    appointmentsTotal: 5,
    lastAppointment: "2023-06-10",
    nextAppointment: "2023-06-25"
  }
];

// Client form schema
const clientFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional()
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export default function Clients() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const filteredClients = clientsData.filter(client => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.phone.toLowerCase().includes(query)
      );
    }
    return true;
  });
  
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      phone: ""
    }
  });
  
  const onSubmit = async (data: ClientFormValues) => {
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would call the API to create a new client
      console.log("Adding new client:", data);
      
      toast({
        title: "Client added",
        description: `${data.name} has been added successfully.`
      });
      
      // Reset form and close dialog
      form.reset();
      setAddClientOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add client. Please try again.",
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
              <h1 className="text-2xl font-semibold mb-4 sm:mb-0">Client Management</h1>
              
              <Button onClick={() => setAddClientOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </div>
            
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search clients..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <TabsContent value="list" className="mt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Total Appointments</TableHead>
                          <TableHead>Next Appointment</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClients.map(client => (
                          <TableRow key={client.id}>
                            <TableCell className="font-medium">{client.name}</TableCell>
                            <TableCell>{client.email}</TableCell>
                            <TableCell>{client.phone}</TableCell>
                            <TableCell>{client.appointmentsTotal}</TableCell>
                            <TableCell>
                              {client.nextAppointment 
                                ? new Date(client.nextAppointment).toLocaleDateString() 
                                : "None scheduled"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button variant="ghost" size="icon">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Calendar className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="grid" className="mt-0 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map(client => (
                      <Card key={client.id} className="border">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <CardTitle className="text-lg">{client.name}</CardTitle>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>Schedule Appointment</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm">{client.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm">{client.phone}</span>
                          </div>
                          <div className="flex items-center space-x-4 mt-3">
                            <div className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 p-2 rounded-md flex-1">
                              <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400 mb-1" />
                              <span className="text-sm font-semibold">{client.appointmentsTotal}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Appointments</span>
                            </div>
                            <div className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 p-2 rounded-md flex-1">
                              <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400 mb-1" />
                              <span className="text-sm font-semibold">
                                {client.nextAppointment ? new Date(client.nextAppointment).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "None"}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Next Appt.</span>
                            </div>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="pt-0">
                          <Button variant="outline" className="w-full">
                            Schedule Appointment
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </div>
          
          {/* Add Client Dialog */}
          <Dialog open={addClientOpen} onOpenChange={setAddClientOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Client</DialogTitle>
                <DialogDescription>
                  Add a new client to your system. They will receive login credentials via email.
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
                          <Input placeholder="Jane Doe" {...field} />
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
                            <Input placeholder="janedoe" {...field} />
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
                          <Input type="email" placeholder="jane@example.com" {...field} />
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
                </form>
              </Form>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddClientOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Client"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
