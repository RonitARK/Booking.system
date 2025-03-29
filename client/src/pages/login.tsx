import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Function to handle successful login
  const handleLoginSuccess = (role: string = '') => {
    const roleDesc = role ? ` as ${role}` : '';
    toast({
      title: "Success",
      description: `Login successful${roleDesc}! Redirecting...`,
    });
    
    // Use setTimeout to allow the toast to be seen
    setTimeout(() => {
      // Force a hard refresh by setting window.location to ensure session is loaded
      window.location.href = "/dashboard";
    }, 1000);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await login(values.username, values.password);
      handleLoginSuccess();
    } catch (error: any) {
      console.log("Login form error:", error);
      toast({
        title: "Error",
        description: error.message || "Invalid username or password. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }

  // Demo account logins
  const loginWithDemo = async (role: string) => {
    setIsLoading(true);
    try {
      let username, password;
      
      switch (role) {
        case "admin":
          username = "admin";
          password = "admin123";
          break;
        case "staff":
          username = "staff";
          password = "staff123";
          break;
        case "customer":
          username = "customer";
          password = "customer123";
          break;
        default:
          throw new Error("Invalid role");
      }
      
      await login(username, password);
      handleLoginSuccess(role);
    } catch (error: any) {
      console.log(`Demo login error (${role}):`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to log in as ${role}. Please try again.`,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z"></path>
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-center">SmartBook AI</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your username" 
                        {...field} 
                        disabled={isLoading}
                      />
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
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              onClick={() => loginWithDemo("admin")}
              disabled={isLoading}
            >
              Admin
            </Button>
            <Button 
              variant="outline" 
              onClick={() => loginWithDemo("staff")}
              disabled={isLoading}
            >
              Staff
            </Button>
            <Button 
              variant="outline" 
              onClick={() => loginWithDemo("customer")}
              disabled={isLoading}
            >
              Customer
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="w-full">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
