import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { 
  Menu, 
  Bell, 
  Sun, 
  Moon, 
  Search,
  ChevronDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onOpenSidebar: () => void;
}

export default function Header({ onOpenSidebar }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const toggleRoleDropdown = () => {
    setRoleDropdownOpen(!roleDropdownOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {isAuthenticated && (
            <DropdownMenu open={roleDropdownOpen} onOpenChange={setRoleDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-2 cursor-pointer">
                  <Badge variant="outline" className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2.5 py-1 rounded-md text-sm font-medium">
                    {user?.role || 'User'}
                  </Badge>
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => console.log("Switch to Admin")}>
                  Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Switch to Staff")}>
                  Staff
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Switch to Customer")}>
                  Customer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
            />
            <Search className="w-5 h-5 text-gray-500 dark:text-gray-400 absolute left-3 top-2.5" />
          </div>
          
          {/* Notification Bell */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
            </Button>
          </div>
          
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {theme === "dark" ? (
              <Sun className="w-6 h-6" />
            ) : (
              <Moon className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
