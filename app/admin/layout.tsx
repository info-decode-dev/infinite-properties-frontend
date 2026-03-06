"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, Building2, Settings, LogOut, MessageSquare, FolderOpen, Info, Mail, Menu, X } from "lucide-react";
import { isAuthenticated, logout } from "@/middleware/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Add data-admin attribute to html element to exclude SCSS styles
    document.documentElement.setAttribute("data-admin", "true");
    
    // Fix scroll issues by setting proper height constraints on html and body
    document.documentElement.style.height = "100%";
    document.documentElement.style.overflow = "hidden";
    document.body.style.height = "100%";
    document.body.style.overflow = "hidden";

    // Aggressively disable Lenis smooth scroll
    const disableLenis = () => {
      // Check multiple possible Lenis instances
      const lenisInstance = (window as any).lenis || (window as any).__lenis;
      if (lenisInstance) {
        try {
          lenisInstance.destroy();
          delete (window as any).lenis;
          delete (window as any).__lenis;
        } catch (e) {
          console.warn("Error destroying Lenis instance:", e);
        }
      }

      // Force remove any Lenis-related event listeners by cloning and replacing
      // This is a more aggressive approach to ensure Lenis is completely disabled
      return () => {
        // Cleanup if needed
      };
    };

    const cleanupLenis = disableLenis();

    // Check authentication on mount
    const checkAuth = () => {
      if (pathname === "/admin/login") {
        // If already authenticated, redirect to admin dashboard
        if (isAuthenticated()) {
          router.push("/admin");
        }
        setIsChecking(false);
        return;
      }

      if (!isAuthenticated()) {
        router.push("/admin/login");
      } else {
        setIsAuth(true);
      }
      setIsChecking(false);
    };

    checkAuth();

    // Cleanup: remove data-admin and restore scroll when component unmounts
    return () => {
      cleanupLenis?.();
      if (!pathname?.startsWith("/admin")) {
        document.documentElement.removeAttribute("data-admin");
        document.documentElement.style.height = "";
        document.documentElement.style.overflow = "";
        document.body.style.height = "";
        document.body.style.overflow = "";
      }
    };
  }, [pathname, router]);

  const handleLogout = () => {
    logout();
  };

  // Don't show layout on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Show loading state while checking auth
  if (isChecking || !isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/properties", label: "Properties", icon: Building2 },
    { href: "/admin/enquiries", label: "Enquiries", icon: Mail },
    { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
    { href: "/admin/collections", label: "Collections & Reels", icon: FolderOpen },
    { href: "/admin/about", label: "About Us", icon: Info },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
          <Link href="/admin" className="flex items-center justify-center w-full" onClick={() => setIsMobileMenuOpen(false)}>
            <Image
              src="/assets/images/logo.png"
              alt="Infinite Properties"
              width={50}
              height={50}
              className="h-auto w-auto max-w-[50px] object-contain"
              priority
              unoptimized
            />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        ref={mainContentRef}
        className="flex-1 overflow-y-auto overflow-x-hidden lg:ml-0"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'auto',
          overscrollBehavior: 'contain'
        }}
      >
        {children}
      </main>
    </div>
  );
}

