import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister, getGetMeQueryKey, RegisterBodyUserType } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, Link, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { HeartHandshake, Building2, User, Loader2, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  organizationName: z.string().optional(),
  organizationDescription: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

type PasswordStrength = { score: 0 | 1 | 2 | 3 | 4; label: string; color: string };

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Cap at 4 and map to label/color
  const capped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;

  const map: Record<1 | 2 | 3 | 4, { label: string; color: string }> = {
    1: { label: "Débil",   color: "#F29B9B" },
    2: { label: "Regular", color: "#F2C46B" },
    3: { label: "Buena",   color: "#A8C5A0" },
    4: { label: "Segura",  color: "#6B9E6B" },
  };

  if (capped === 0) return { score: 0, label: "", color: "" };
  return { score: capped, ...map[capped] };
}

export default function Register() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const registerMutation = useRegister();

  const initialType = search.includes("type=organization") ? "organization" : null;
  const [userType, setUserType] = useState<"volunteer" | "organization" | null>(initialType as any);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [userType]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password") ?? "";
  const strength = getPasswordStrength(passwordValue);

  const onSubmit = (data: RegisterForm) => {
    if (!userType) return;

    if (userType === "organization" && !data.organizationName) {
      toast({
        title: "Falta información",
        description: "El nombre de la organización es requerido",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate(
      { data: { ...data, userType: userType as RegisterBodyUserType } },
      {
       onSuccess: (res: any) => {
  if (res?.token) localStorage.setItem("auth_token", res.token);
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          toast({
            title: "¡Bienvenido a VoluntaRed!",
            description: "Tu cuenta ha sido creada exitosamente.",
          });
          setLocation(userType === "volunteer" ? "/perfil" : "/publicar");
        },
        onError: (error: any) => {
          toast({
            title: "Error al registrarse",
            description: error.error || "Ocurrió un error. Intenta de nuevo.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-2xl w-full relative z-10">
        <AnimatePresence mode="wait">
          {!userType ? (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight">
                  ¿Cómo quieres ayudar?
                </h1>
                <p className="text-lg text-muted-foreground font-medium max-w-lg mx-auto">
                  Únete a la comunidad de jóvenes cambiando el mundo, o registra tu iniciativa para encontrar talento.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-12">
                <CardButton
                  icon={User}
                  title="Soy Voluntario"
                  description="Quiero donar mi tiempo y habilidades a causas que me importan."
                  onClick={() => setUserType("volunteer")}
                  color="bg-primary/20 text-primary-foreground border-primary/30 hover:border-primary/60"
                  iconColor="text-primary-foreground bg-primary"
                />
                <CardButton
                  icon={Building2}
                  title="Soy Organización"
                  description="Busco jóvenes talentosos para impulsar nuestra misión."
                  onClick={() => setUserType("organization")}
                  color="bg-accent/10 text-accent border-accent/30 hover:border-accent/60"
                  iconColor="text-white bg-accent"
                />
              </div>

              <div className="text-center mt-8">
                <p className="text-sm text-muted-foreground font-medium">
                  ¿Ya tienes cuenta?{" "}
                  <Link href="/login" className="text-primary font-bold hover:underline">
                    Ingresa aquí
                  </Link>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-card p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-border"
            >
              <button
                onClick={() => setUserType(null)}
                className="flex items-center text-sm font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Volver
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div
                  className={`p-3 rounded-2xl ${
                    userType === "volunteer"
                      ? "bg-primary/20 text-primary-foreground"
                      : "bg-accent/20 text-accent"
                  }`}
                >
                  {userType === "volunteer" ? (
                    <User className="w-8 h-8" />
                  ) : (
                    <Building2 className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-display font-bold text-foreground">
                    {userType === "volunteer" ? "Crea tu perfil" : "Registra tu organización"}
                  </h2>
                  <p className="text-muted-foreground font-medium">Completa tus datos para comenzar</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {userType === "volunteer" ? "Nombre completo" : "Nombre del representante"}
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ej. María García"
                      className={`rounded-xl bg-muted/50 h-12 ${errors.name ? "border-destructive" : ""}`}
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  {userType === "organization" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="organizationName">Nombre de la Organización</Label>
                        <Input
                          id="organizationName"
                          placeholder="Ej. Fundación Verde"
                          className="rounded-xl bg-muted/50 h-12"
                          {...register("organizationName")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="organizationDescription">Descripción breve</Label>
                        <Textarea
                          id="organizationDescription"
                          placeholder="¿Qué hace tu organización?"
                          className="rounded-xl bg-muted/50 min-h-[100px] resize-none"
                          {...register("organizationDescription")}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@correo.com"
                      className={`rounded-xl bg-muted/50 h-12 ${errors.email ? "border-destructive" : ""}`}
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password field with strength meter */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`rounded-xl bg-muted/50 h-12 pr-12 ${
                          errors.password ? "border-destructive" : ""
                        }`}
                        {...register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Strength meter — only visible when something is typed */}
                    <AnimatePresence>
                      {passwordValue.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-1 space-y-1.5">
                            {/* Four segment bars */}
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4].map((segment) => (
                                <motion.div
                                  key={segment}
                                  className="h-1.5 flex-1 rounded-full"
                                  animate={{
                                    backgroundColor:
                                      strength.score >= segment
                                        ? strength.color
                                        : "hsl(var(--muted))",
                                  }}
                                  transition={{ duration: 0.3 }}
                                />
                              ))}
                            </div>
                            {/* Label + tips */}
                            <div className="flex items-center justify-between">
                              <motion.p
                                key={strength.label}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xs font-semibold"
                                style={{ color: strength.color }}
                              >
                                {strength.label}
                              </motion.p>
                              {strength.score < 3 && (
                                <p className="text-xs text-muted-foreground">
                                  Agrega{" "}
                                  {!/[A-Z]/.test(passwordValue)
                                    ? "mayúsculas"
                                    : !/\d/.test(passwordValue)
                                    ? "números"
                                    : "símbolos"}{" "}
                                  para hacerla más segura
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 rounded-2xl text-lg font-medium bg-foreground text-background hover:bg-foreground/90 group"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Finalizar Registro
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CardButton({ icon: Icon, title, description, onClick, color, iconColor }: any) {
  return (
    <button
      onClick={onClick}
      className={`relative group text-left p-8 rounded-[2.5rem] border-2 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 ${color}`}
    >
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md transition-transform group-hover:scale-110 ${iconColor}`}
      >
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-display font-bold mb-3">{title}</h3>
      <p className="font-medium opacity-90 leading-relaxed">{description}</p>
    </button>
  );
}
