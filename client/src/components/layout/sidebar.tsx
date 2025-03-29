import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { useCalendarIntegrations } from "@/hooks/use-calendar-integration";
import { 
  Calendar, 
  ClockIcon, 
  Users, 
  UserCircle, 
  Settings, 
  HelpCircle, 
  Plus,
  X
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ className, isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { data: calendarIntegrations, isLoading } = useCalendarIntegrations();

  return (
    <div 
      className={cn(
        "flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 h-full",
        className,
        { 
          "fixed inset-y-0 left-0 z-50 shadow-lg": isOpen,
          "hidden lg:flex": !isOpen 
        }
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z"></path>
          </svg>
          <h1 className="text-xl font-bold">SmartBook AI</h1>
        </div>
        <button 
          className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      {/* User profile */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{user?.name || 'Guest'}</p>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'User'}</span>
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="p-4 flex-grow overflow-y-auto">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Main</p>
          
          <Link href="/calendar">
            <a className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-lg",
              location === "/calendar" 
                ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}>
              <Calendar className="w-5 h-5" />
              <span>Calendar</span>
            </a>
          </Link>
          
          <Link href="/appointments">
            <a className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-lg",
              location === "/appointments" 
                ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}>
              <ClockIcon className="w-5 h-5" />
              <span>Appointments</span>
            </a>
          </Link>
          
          {(user?.role === 'admin' || user?.role === 'staff') && (
            <Link href="/staff">
              <a className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg",
                location === "/staff" 
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}>
                <Users className="w-5 h-5" />
                <span>Staff</span>
              </a>
            </Link>
          )}
          
          {(user?.role === 'admin' || user?.role === 'staff') && (
            <Link href="/clients">
              <a className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg",
                location === "/clients" 
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}>
                <UserCircle className="w-5 h-5" />
                <span>Clients</span>
              </a>
            </Link>
          )}
        </div>
        
        <div className="mt-8 space-y-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Settings</p>
          
          <Link href="/settings">
            <a className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-lg",
              location === "/settings" 
                ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}>
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </a>
          </Link>
          
          <a href="#" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <HelpCircle className="w-5 h-5" />
            <span>Help</span>
          </a>
        </div>
      </nav>
      
      {/* Calendar connections */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Connected Calendars</p>
        <div className="space-y-2">
          {isLoading ? (
            <div className="py-2 text-sm text-gray-500 dark:text-gray-400">Loading...</div>
          ) : calendarIntegrations && calendarIntegrations.length > 0 ? (
            calendarIntegrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {integration.provider === 'google' && (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.44 3.5c1.16 0 2.11.95 2.11 2.11v13.78c0 1.16-.95 2.11-2.11 2.11H3.56c-1.16 0-2.11-.95-2.11-2.11V5.61c0-1.16.95-2.11 2.11-2.11h3.16v-.53c0-.59.47-1.06 1.06-1.06s1.06.47 1.06 1.06v.53h7.9v-.53c0-.59.47-1.06 1.06-1.06s1.06.47 1.06 1.06v.53h3.16Zm0 15.89V8.76H3.56v10.63h16.88Z"></path>
                    </svg>
                  )}
                  {integration.provider === 'outlook' && (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21.75 5.25v14.25c0 .96-.79 1.75-1.75 1.75H4c-.96 0-1.75-.79-1.75-1.75V5.25C2.25 4.29 3.04 3.5 4 3.5h16c.96 0 1.75.79 1.75 1.75Zm-1.5 0c0-.14-.11-.25-.25-.25H4c-.14 0-.25.11-.25.25v14.25c0 .14.11.25.25.25h16c.14 0 .25-.11.25-.25V5.25ZM9.75 6.5v11c0 .14.11.25.25.25h10c.14 0 .25-.11.25-.25v-11c0-.14-.11-.25-.25-.25H10c-.14 0-.25.11-.25.25Z"></path>
                    </svg>
                  )}
                  {integration.provider === 'apple' && (
                    <svg className="w-5 h-5 text-gray-800 dark:text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11"></path>
                    </svg>
                  )}
                  <span className="text-sm">{integration.provider.charAt(0).toUpperCase() + integration.provider.slice(1)}</span>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            ))
          ) : (
            <div className="py-2 text-sm text-gray-500 dark:text-gray-400">No calendars connected</div>
          )}
          
          <Link href="/settings">
            <a className="text-primary-600 dark:text-primary-400 text-sm mt-2 flex items-center space-x-1">
              <Plus className="w-4 h-4" />
              <span>Add Calendar</span>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
