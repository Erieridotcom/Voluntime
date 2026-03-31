import { useGetMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children, allowedType }: { children: React.ReactNode, allowedType?: "volunteer" | "organization" }) {
  const { data: user, isLoading } = useGetMe();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (!isLoading && user && allowedType && user.userType !== allowedType) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation, allowedType]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || (allowedType && user.userType !== allowedType)) {
    return null;
  }

  return <>{children}</>;
}
