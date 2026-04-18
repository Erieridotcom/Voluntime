import { useCreateOpportunity, useListCategories } from "@workspace/api-client-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectionChips } from "@/components/ui/selection-chips";
import { Loader2, PlusCircle, MapPin, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { SKILLS, INTERESTS, ACCESSIBILITY_OPTIONS, MEXICAN_STATES, CITIES_BY_STATE } from "@/lib/matchingOptions";

const publishSchema = z.object({
  title: z.string().min(5, "El titulo es muy corto"),
  description: z.string().min(20, "La descripcion debe tener al menos 20 caracteres"),
  requirements: z.string().optional(),
  category: z.string().min(1, "Selecciona una categoria"),
  effortLevel: z.enum(["low", "medium", "high"]),
  location: z.string().min(3, "La ubicacion es requerida"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  spotsAvailable: z.coerce.number().min(1).optional().or(z.literal("")),
});

type PublishForm = z.infer<typeof publishSchema>;

function PublishContent() {
  const createMutation = useCreateOpportunity();
  const { data: categories } = useListCategories();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isRemote, setIsRemote] = useState(false);

  useEffect(() => {
    if (selectedState && CITIES_BY_STATE[selectedState]) {
      setAvailableCities(CITIES_BY_STATE[selectedState]);
      setSelectedCity("");
    } else {
      setAvailableCities([]);
      setSelectedCity("");
    }
  }, [selectedState]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PublishForm>({
    resolver: zodResolver(publishSchema),
    defaultValues: { effortLevel: "medium" },
  });

  const categoryValue = watch("category");
  const effortValue = watch("effortLevel");

  const onSubmit = (data: PublishForm) => {
    const formattedData = {
      ...data,
      spotsAvailable: data.spotsAvailable === "" ? undefined : Number(data.spotsAvailable),
      skills: selectedSkills,
      interests: selectedInterests,
      accessibilityFeatures: selectedAccessibility,
      state: selectedState || undefined,
      city: selectedCity || undefined,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      isRemote: isRemote,
    };

    createMutation.mutate({ data: formattedData }, {
      onSuccess: (res) => {
        toast({ title: "Oportunidad publicada", description: "Los voluntarios ya pueden ver tu oportunidad." });
        setLocation(`/oportunidades/${res.id}`);
      },
      onError: () => {
        toast({ title: "Error al publicar", description: "Revisa los datos e intenta nuevamente.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-screen">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground font-bold text-sm mb-4">
          <PlusCircle className="w-4 h-4" /> Nueva Iniciativa
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground">Publicar Oportunidad</h1>
        <p className="text-xl text-muted-foreground font-medium mt-2">
          Comparte los detalles de tu proyecto para encontrar a los voluntarios ideales.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="rounded-[2rem] border-0 shadow-lg shadow-muted/40 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 pb-5 pt-7 px-8">
            <h2 className="text-xl font-display font-bold">Informacion Basica</h2>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">Titulo de la oportunidad</Label>
              <Input id="title" placeholder="Ej. Reforestacion del Parque Central" className="h-14 rounded-xl bg-muted/30 text-lg" {...register("title")} data-testid="input-title" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Descripcion</Label>
              <Textarea id="description" placeholder="Explica de que trata la oportunidad y cual sera el impacto..." className="min-h-[140px] rounded-xl bg-muted/30 resize-none text-base p-4" {...register("description")} data-testid="input-description" />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements" className="text-base">Requisitos especiales (Opcional)</Label>
              <Textarea id="requirements" placeholder="Ej. Ser mayor de 18 anos, tener camara propia..." className="min-h-[80px] rounded-xl bg-muted/30 resize-none" {...register("requirements")} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base">Categoria Principal</Label>
                <Select value={categoryValue} onValueChange={(val) => setValue("category", val)}>
                  <SelectTrigger className="h-14 rounded-xl bg-muted/30" data-testid="select-category">
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-base">Nivel de Esfuerzo</Label>
                <Select value={effortValue} onValueChange={(val: "low" | "medium" | "high") => setValue("effortLevel", val)}>
                  <SelectTrigger className="h-14 rounded-xl bg-muted/30" data-testid="select-effort">
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Bajo (1-2 hrs/semana)</SelectItem>
                    <SelectItem value="medium">Medio (3-5 hrs/semana)</SelectItem>
                    <SelectItem value="high">Alto (6+ hrs/semana)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-0 shadow-lg shadow-muted/40 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 pb-5 pt-7 px-8">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">Logistica</h2>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base">Estado</Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="h-14 rounded-xl bg-muted/30" data-testid="select-state">
                    <SelectValue placeholder="Selecciona estado..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MEXICAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-base">Ciudad / Municipio</Label>
                <Select
                  value={selectedCity}
                  onValueChange={setSelectedCity}
                  disabled={availableCities.length === 0}
                >
                  <SelectTrigger className="h-14 rounded-xl bg-muted/30">
                    <SelectValue placeholder={selectedState ? "Selecciona ciudad..." : "Primero selecciona un estado"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <Switch
                checked={isRemote}
                onCheckedChange={setIsRemote}
                id="is-remote"
              />
              <Label htmlFor="is-remote" className="text-base cursor-pointer">
                Esta oportunidad es remota (no requiere presencia física)
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-base">Lugar específico (opcional)</Label>
              <Input id="location" placeholder='Ej. Centro Cultural El Chopo, Parque Naucalli, o "Remoto"' className="h-14 rounded-xl bg-muted/30" {...register("location")} data-testid="input-location" />
              <p className="text-xs text-muted-foreground">Nombre del lugar exacto, instalación o dirección donde se realizará la actividad.</p>
              {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-base">Fecha Inicio</Label>
                <Input type="date" id="startDate" className="h-14 rounded-xl bg-muted/30" {...register("startDate")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-base">Fecha Fin</Label>
                <Input type="date" id="endDate" className="h-14 rounded-xl bg-muted/30" {...register("endDate")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spotsAvailable" className="text-base">Lugares disponibles</Label>
                <Input type="number" id="spotsAvailable" placeholder="Sin limite" className="h-14 rounded-xl bg-muted/30" {...register("spotsAvailable")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-0 shadow-lg shadow-muted/40 overflow-hidden">
          <CardHeader className="bg-secondary/30 border-b border-border/50 pb-5 pt-7 px-8">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">Matching con Voluntarios</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Estas opciones ayudan al sistema a conectarte con los voluntarios mas compatibles.
            </p>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <SelectionChips
              label="Habilidades deseadas"
              description="Que habilidades buscas en los voluntarios?"
              options={SKILLS}
              selected={selectedSkills}
              onChange={setSelectedSkills}
            />

            <div className="border-t border-border/40 pt-6">
              <SelectionChips
                label="Intereses y causas relacionadas"
                description="Con que temas esta relacionada esta oportunidad?"
                options={INTERESTS}
                selected={selectedInterests}
                onChange={setSelectedInterests}
              />
            </div>

            <div className="border-t border-border/40 pt-6">
              <SelectionChips
                label="Caracteristicas de accesibilidad"
                description="Con que caracteristicas de accesibilidad cuenta esta oportunidad?"
                options={ACCESSIBILITY_OPTIONS}
                selected={selectedAccessibility}
                onChange={setSelectedAccessibility}
              />
            </div>
          </CardContent>
        </Card>

        <div className="pb-8">
          <Button type="submit" size="lg" className="w-full h-16 rounded-2xl text-lg shadow-xl" disabled={createMutation.isPending} data-testid="button-publish">
            {createMutation.isPending ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : "Publicar Oportunidad"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function Publish() {
  return (
    <ProtectedRoute allowedType="organization">
      <PublishContent />
    </ProtectedRoute>
  );
}
