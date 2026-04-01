import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { HeartHandshake, Loader2, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const loginMutation = useLogin();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate({ data }, {
      onSuccess: (res: any) => {
  if (res?.token) localStorage.setItem("auth_token", res.token);
        // Invalidate getMe so it refetches and updates the UI
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({
          title: "¡Hola de nuevo!",
          description: "Has iniciado sesión exitosamente.",
        });
        setLocation("/");
      },
      onError: (error: any) => {
        toast({
          title: "Error al iniciar sesión",
          description: error.error || "Revisa tus credenciales e intenta de nuevo.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 relative z-10 bg-card p-10 rounded-[2.5rem] shadow-2xl border border-border"
      >
        <div className="text-center">
          <Link href="/">
            <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center cursor-pointer mb-6 transform transition hover:rotate-12">
              <HeartHandshake className="w-8 h-8 text-primary-foreground" />
            </div>
          </Link>
          <h2 className="mt-2 text-3xl font-display font-bold text-foreground">
            Bienvenido de vuelta
          </h2>
          <p className="mt-3 text-sm text-muted-foreground font-medium">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="font-semibold text-accent hover:text-accent/80 transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                className={`rounded-xl bg-muted/50 h-12 ${errors.email ? "border-destructive" : ""}`}
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <a href="#" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`rounded-xl bg-muted/50 h-12 ${errors.password ? "border-destructive" : ""}`}
                {...register("password")}
              />
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-2xl text-lg font-medium bg-foreground text-background hover:bg-foreground/90 group"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Entrar
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
