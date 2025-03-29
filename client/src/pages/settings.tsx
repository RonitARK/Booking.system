import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { useCalendarIntegrations } from "@/hooks/use-calendar-integration";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  Mail, 
  Smartphone, 
  Lock, 
  Sun, 
  Moon, 
  Laptop,
  Trash2,
  ArrowRightLeft
} from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { SiApple } from "react-icons/si";
import { PiMicrosoftOutlookLogoFill } from "react-icons/pi";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { data: calendarIntegrations, isLoading } = useCalendarIntegrations();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    reminderTime: "1"
  });
  
  const handleSettingChange = (setting: string, value: any) => {
    setSettings({
      ...settings,
      [setting]: value
    });
    
    toast({
      title: "Settings updated",
      description: "Your preferences have been saved."
    });
  };
  
  const handleConnectGoogle = () => {
    // In a real implementation, this would redirect to Google OAuth flow
    toast({
      title: "Google Calendar",
      description: "Connecting to Google Calendar..."
    });
  };
  
  const handleConnectOutlook = () => {
    // In a real implementation, this would redirect to Microsoft OAuth flow
    toast({
      title: "Outlook Calendar",
      description: "Connecting to Outlook Calendar..."
    });
  };
  
  const handleConnectApple = () => {
    // In a real implementation, this would redirect to Apple OAuth flow
    toast({
      title: "Apple Calendar",
      description: "Connecting to Apple Calendar..."
    });
  };
  
  const handleDisconnectCalendar = (id: number) => {
    // In a real implementation, this would call the API to disconnect the calendar
    toast({
      title: "Calendar disconnected",
      description: "Calendar has been disconnected successfully."
    });
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Settings</h1>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Update your personal details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue={user?.name || ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue={user?.username || ""} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="flex">
                          <Input id="email" defaultValue={user?.email || ""} />
                          <Button variant="ghost" size="icon" className="ml-2">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <div className="flex">
                          <Input id="phone" defaultValue={user?.phone || ""} />
                          <Button variant="ghost" size="icon" className="ml-2">
                            <Smartphone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Security</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" placeholder="••••••••" />
                          </div>
                          <div></div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" placeholder="••••••••" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input id="confirm-password" type="password" placeholder="••••••••" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="destructive" onClick={() => setDeleteAccountDialogOpen(true)}>
                      Delete Account
                    </Button>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Manage how you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receive appointment confirmations and reminders via email
                          </p>
                        </div>
                        <Switch 
                          checked={settings.emailNotifications} 
                          onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)} 
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">SMS Notifications</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receive appointment reminders via text message
                          </p>
                        </div>
                        <Switch 
                          checked={settings.smsNotifications} 
                          onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)} 
                        />
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="font-medium mb-2">Reminder Time</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          How far in advance should we send appointment reminders
                        </p>
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="reminder-1" 
                              name="reminder-time" 
                              value="1" 
                              checked={settings.reminderTime === "1"}
                              onChange={() => handleSettingChange("reminderTime", "1")}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                            />
                            <Label htmlFor="reminder-1">1 hour</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="reminder-24" 
                              name="reminder-time" 
                              value="24" 
                              checked={settings.reminderTime === "24"}
                              onChange={() => handleSettingChange("reminderTime", "24")}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                            />
                            <Label htmlFor="reminder-24">1 day</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="reminder-48" 
                              name="reminder-time" 
                              value="48" 
                              checked={settings.reminderTime === "48"}
                              onChange={() => handleSettingChange("reminderTime", "48")}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                            />
                            <Label htmlFor="reminder-48">2 days</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Preferences</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="integrations">
                <Card>
                  <CardHeader>
                    <CardTitle>Calendar Integrations</CardTitle>
                    <CardDescription>
                      Connect your external calendars to sync appointments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Connected Calendars</h3>
                      
                      {isLoading ? (
                        <div className="text-center py-4">Loading integrations...</div>
                      ) : calendarIntegrations && calendarIntegrations.length > 0 ? (
                        <div className="space-y-4">
                          {calendarIntegrations.map(integration => (
                            <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-center space-x-3">
                                {integration.provider === "google" && (
                                  <Globe className="h-6 w-6 text-red-500" />
                                )}
                                {integration.provider === "outlook" && (
                                  <PiMicrosoftOutlookLogoFill className="h-6 w-6 text-blue-500" />
                                )}
                                {integration.provider === "apple" && (
                                  <SiApple className="h-6 w-6 text-gray-800 dark:text-gray-200" />
                                )}
                                <div>
                                  <h4 className="font-medium">{integration.provider.charAt(0).toUpperCase() + integration.provider.slice(1)} Calendar</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Connected since {new Date(integration.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDisconnectCalendar(integration.id)}
                                >
                                  <ArrowRightLeft className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDisconnectCalendar(integration.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          No calendars connected
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Add Calendar</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button 
                          variant="outline" 
                          className="h-auto py-6 flex flex-col items-center"
                          onClick={handleConnectGoogle}
                        >
                          <Globe className="h-8 w-8 text-red-500 mb-2" />
                          <span>Google Calendar</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="h-auto py-6 flex flex-col items-center"
                          onClick={handleConnectOutlook}
                        >
                          <PiMicrosoftOutlookLogoFill className="h-8 w-8 text-blue-500 mb-2" />
                          <span>Outlook Calendar</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="h-auto py-6 flex flex-col items-center"
                          onClick={handleConnectApple}
                        >
                          <SiApple className="h-8 w-8 text-gray-800 dark:text-gray-200 mb-2" />
                          <span>Apple Calendar</span>
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Theme Setting</h3>
                      <div className="flex flex-col space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <Button 
                            variant={theme === "light" ? "default" : "outline"} 
                            className="h-auto py-4 flex flex-col items-center"
                            onClick={() => setTheme("light")}
                          >
                            <Sun className="h-6 w-6 mb-2" />
                            <span>Light</span>
                          </Button>
                          
                          <Button 
                            variant={theme === "dark" ? "default" : "outline"} 
                            className="h-auto py-4 flex flex-col items-center"
                            onClick={() => setTheme("dark")}
                          >
                            <Moon className="h-6 w-6 mb-2" />
                            <span>Dark</span>
                          </Button>
                          
                          <Button 
                            variant={theme === "system" ? "default" : "outline"} 
                            className="h-auto py-4 flex flex-col items-center"
                            onClick={() => setTheme("system")}
                          >
                            <Laptop className="h-6 w-6 mb-2" />
                            <span>System</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <AlertDialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all of your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  );
}
