import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { HeartHandshake, Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { data: user } = useGetMe();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
        setLocation("/");
        setIsOpen(false);
      },
    });
  };

  const navLinks = [
    { href: "/oportunidades", label: "Explorar" },
    { href: "/foro", label: "Foro" },
    ...(user ? [
      { href: "/mis-recomendaciones", label: "Para ti" },
      ...(user.userType === "volunteer" ? [{ href: "/mis-postulaciones", label: "Mis Postulaciones" }] : []),
      ...(user.userType === "organization" ? [{ href: "/publicar", label: "Publicar" }, { href: "/mis-postulaciones", label: "Postulantes" }, { href: "/dashboard", label: "Dashboard" }] : []),
    ] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-xl group-hover:rotate-12 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">VoluntaRed</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-baseline space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-accent ${
                    location === link.href ? "text-accent font-semibold" : "text-foreground/80"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center gap-3 border-l border-border pl-6">
              {user ? (
                <>
                  <Link href="/perfil">
                    <Button variant="ghost" size="sm" className="gap-2 rounded-full">
                      <UserIcon className="w-4 h-4" />
                      <span className="hidden lg:inline">{user.name}</span>
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="rounded-full">Ingresar</Button>
                  </Link>
                  <Link href="/registro">
                    <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">Unirme</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-xl text-base font-medium ${
                  location === link.href ? "bg-secondary/50 text-foreground" : "text-foreground/80 hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/perfil" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-foreground/80 hover:bg-muted">
                  Mi Perfil
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="mt-4 flex flex-col gap-2 p-3 border-t border-border">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl">Ingresar</Button>
                </Link>
                <Link href="/registro" onClick={() => setIsOpen(false)}>
                  <Button className="w-full rounded-xl bg-primary text-primary-foreground">Unirme</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
