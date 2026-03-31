import { useGetUserProfile, useUpdateUserProfile, getGetUserProfileQueryKey } from "@workspace/api-client-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectionChips } from "@/components/ui/selection-chips";
import { Loader2, Save, User as UserIcon, Sparkles, Trophy, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SKILLS, INTERESTS, ACCESSIBILITY_OPTIONS } from "@/lib/matchingOptions";
import { useQuery } from "@tanstack/react-query";

async function fetchCities(state: string): Promise<string[]> {
  if (!state) return [];
  const res = await fetch(`/api/locations/cities?state=${encodeURIComponent(state)}`);
  if (!res.ok) return [];
  return res.json();
}

async function fetchStates(): Promise<string[]> {
  const res = await fetch("/api/locations/states");
  if (!res.ok) return [];
  return res.json();
}

async function fetchUserStats() {
  const res = await fetch("/api/users/stats", { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}

const profileSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  bio: z.string().optional(),
  age: z.coerce.number().min(10).max(99).optional().or(z.literal("")),
  organizationName: z.string().optional(),
  organizationDescription: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const BADGE_COLORS: Record<string, string> = {
  green: "bg-green-100 text-green-800 border-green-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  teal: "bg-teal-100 text-teal-800 border-teal-200",
  indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
  gold: "bg-amber-100 text-amber-800 border-amber-200",
};

function ProfileContent() {
  const { data: profile, isLoading } = useGetUserProfile();
  const updateMutation = useUpdateUserProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const { data: stats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: fetchUserStats,
    enabled: profile?.userType === "volunteer",
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    fetchStates().then(setAvailableStates);
  }, []);

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        bio: profile.bio || "",
        age: profile.age || "",
        organizationName: profile.organizationName || "",
        organizationDescription: profile.organizationDescription || "",
      });
      setSelectedSkills(profile.skills ?? []);
      setSelectedInterests(profile.interests ?? []);
      setSelectedAccessibility(profile.accessibilityNeeds ?? []);
      setSelectedState(profile.state || "");
      setSelectedCity(profile.city || "");
    }
  }, [profile, reset]);

  useEffect(() => {
    if (selectedState) {
      fetchCities(selectedState).then((cities) => {
        setAvailableCities(cities);
        setSelectedCity((prev) => (cities.includes(prev) ? prev : ""));
      });
    } else {
      setAvailableCities([]);
      setSelectedCity("");
    }
  }, [selectedState]);

  const onSubmit = (data: ProfileForm) => {
    const formattedData = {
      ...data,
      age: data.age === "" ? undefined : Number(data.age),
      state: selectedState || undefined,
      city: selectedCity || undefined,
      skills: selectedSkills,
      interests: selectedInterests,
      accessibilityNeeds: selectedAccessibility,
    };

    updateMutation.mutate({ data: formattedData }, {
      onSuccess: () => {
        toast({ title: "Perfil actualizado", description: "Tus cambios han sido guardados exitosamente." });
        queryClient.invalidateQueries({ queryKey: getGetUserProfileQueryKey() });
      },
      onError: () => {
        toast({ title: "Error", description: "No se pudo actualizar el perfil.", variant: "destructive" });
      }
    });
  };

  if (isLoading || !profile) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const isVolunteer = profile.userType === "volunteer";

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
          <UserIcon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Mi Perfil</h1>
          <p className="text-muted-foreground font-medium">{profile.email}</p>
        </div>
      </div>

      {/* Volunteer Stats & Badges */}
      {isVolunteer && stats && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="rounded-[2rem] border-0 shadow-lg shadow-muted/40 overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Horas de voluntariado</p>
                <p className="text-3xl font-display font-bold text-foreground">{stats.totalHours}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border-0 shadow-lg shadow-muted/40 overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center">
                <Trophy className="w-7 h-7 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Postulaciones aceptadas</p>
                <p className="text-3xl font-display font-bold text-foreground">{stats.acceptedApplications}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Badges */}
      {isVolunteer && stats && stats.badges.length > 0 && (
        <Card className="rounded-[2rem] border-0 shadow-lg shadow-muted/40 overflow-hidden mb-6">
          <CardHeader className="bg-accent/10 border-b border-border/50 pb-5 pt-7 px-8">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-display font-bold">Mis Insignias</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Logros que has conseguido con tu compromiso de voluntariado.
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-wrap gap-3">
              {stats.badges.map((badge: any) => (
                <div
                  key={badge.id}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-medium text-sm ${BADGE_COLORS[badge.color] || "bg-muted text-muted-foreground border-border"}`}
                  title={badge.description}
                >
                  <span className="text-xl">{badge.icon}</span>
                  <div>
                    <p className="font-bold leading-tight">{badge.name}</p>
                    <p className="text-xs opacity-75">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isVolunteer && stats && stats.badges.length === 0 && (
        <Card className="rounded-[2rem] border-0 shadow-lg shadow-muted/40 overflow-hidden mb-6 border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground text-sm">Aún no tienes insignias. ¡Postúlate a oportunidades para ganarlas! 🌱</p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="rounded-[2rem] border-0 shadow-lg shadow-muted/40 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 pb-5 pt-7 px-8">
            <h2 className="text-xl font-display font-bold">Informacion General</h2>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" className="h-12 rounded-xl bg-muted/30" {...register("name")} data-testid="input-name" />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              {isVolunteer && (
                <div className="space-y-2">
                  <Label htmlFor="age">Edad</Label>
                  <Input id="age" type="number" className="h-12 rounded-xl bg-muted/30" {...register("age")} data-testid="input-age" />
                  {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/30" data-testid="select-state">
                    <SelectValue placeholder="Selecciona tu estado..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStates.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ciudad / Municipio</Label>
                <Select
                  value={selectedCity}
                  onValueChange={setSelectedCity}
                  disabled={availableCities.length === 0}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-muted/30" data-testid="select-city">
                    <SelectValue placeholder={selectedState ? "Selecciona tu ciudad..." : "Primero selecciona un estado"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!isVolunteer && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Nombre de la Organizacion</Label>
                  <Input id="organizationName" className="h-12 rounded-xl bg-muted/30" {...register("organizationName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organizationDescription">Descripcion de la Organizacion</Label>
                  <Textarea id="organizationDescription" className="min-h-[100px] rounded-xl bg-muted/30 resize-none" {...register("organizationDescription")} />
                </div>
              </>
            )}

            {isVolunteer && (
              <div className="space-y-2">
                <Label htmlFor="bio">Sobre mi</Label>
                <Textarea id="bio" placeholder="Cuentanos un poco sobre ti..." className="min-h-[100px] rounded-xl bg-muted/30 resize-none" {...register("bio")} data-testid="input-bio" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-0 shadow-lg shadow-muted/40 overflow-hidden">
          <CardHeader className="bg-secondary/30 border-b border-border/50 pb-5 pt-7 px-8">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">Atributos de Matching</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Cuanto mas completes esta seccion, mejores recomendaciones recibiras.
            </p>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <SelectionChips
              label="Habilidades"
              description="Selecciona las habilidades que dominas o deseas usar en el voluntariado."
              options={SKILLS}
              selected={selectedSkills}
              onChange={setSelectedSkills}
            />

            <div className="border-t border-border/40 pt-6">
              <SelectionChips
                label="Causas de interes"
                description="Las causas que mas te apasionan y quieres apoyar."
                options={INTERESTS}
                selected={selectedInterests}
                onChange={setSelectedInterests}
              />
            </div>

            {isVolunteer && (
              <div className="border-t border-border/40 pt-6">
                <SelectionChips
                  label="Necesidades de accesibilidad"
                  description="Solo te recomendaremos oportunidades que cuenten con estas caracteristicas."
                  options={ACCESSIBILITY_OPTIONS}
                  selected={selectedAccessibility}
                  onChange={setSelectedAccessibility}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end pb-8">
          <Button
            type="submit"
            size="lg"
            className="rounded-xl h-14 px-8 text-lg"
            disabled={updateMutation.isPending}
            data-testid="button-save-profile"
          >
            {updateMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
