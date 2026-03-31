import { useState, useEffect } from "react";
import { useListOpportunities, useListCategories } from "@workspace/api-client-react";
import { OpportunityCard } from "@/components/ui/opportunity-card";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader2, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MEXICAN_STATES, CITIES_BY_STATE } from "@/lib/matchingOptions";

async function fetchCities(state: string): Promise<string[]> {
  if (!state) return [];
  if (CITIES_BY_STATE[state]) return CITIES_BY_STATE[state];
  const res = await fetch(`/api/locations/cities?state=${encodeURIComponent(state)}`);
  if (!res.ok) return [];
  return res.json();
}

export default function Opportunities() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [effort, setEffort] = useState<string>("all");
  const [accessibility, setAccessibility] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const { data: categories } = useListCategories();

  useEffect(() => {
    if (selectedState && selectedState !== "all") {
      fetchCities(selectedState).then(setAvailableCities);
      setSelectedCity("all");
    } else {
      setAvailableCities([]);
      setSelectedCity("all");
    }
  }, [selectedState]);

  const queryParams: any = {};
  if (debouncedSearch) queryParams.search = debouncedSearch;
  if (category && category !== "all") queryParams.category = category;
  if (effort && effort !== "all") queryParams.effort = effort;
  if (accessibility && accessibility !== "all") queryParams.accessibility = accessibility;
  if (selectedState && selectedState !== "all") queryParams.state = selectedState;

  const { data: opportunities, isLoading } = useListOpportunities(queryParams);

  const filteredOpportunities = (opportunities || []).filter((opp) => {
    if (selectedCity && selectedCity !== "all") {
      return opp.city?.toLowerCase() === selectedCity.toLowerCase();
    }
    return true;
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const accessibilityOptions = [
    "Acceso en silla de ruedas",
    "Sin barreras físicas",
    "Lenguaje de señas",
    "Trabajo remoto",
    "Sin requisito de movilidad",
    "Guía de audio"
  ];

  const hasFilters = category !== "all" || effort !== "all" || accessibility !== "all" || debouncedSearch !== "" || selectedState !== "all" || selectedCity !== "all";

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/10 py-12 border-b border-primary/20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            Explora Causas
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl">
            Encuentra el proyecto perfecto para ti. Filtra por tus intereses, tiempo disponible o necesidades de accesibilidad.
          </p>

          <div className="mt-8 flex flex-col md:flex-row gap-4 bg-card p-4 rounded-[2rem] shadow-xl shadow-muted/50">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Busca por palabra clave, organización o lugar..."
                className="w-full h-14 pl-12 rounded-xl border-none bg-muted/30 focus-visible:ring-primary text-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-8">
          <div className="flex items-center gap-2 font-display font-bold text-lg mb-4">
            <Filter className="w-5 h-5" />
            Filtros
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Categoría</h3>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full h-12 rounded-xl bg-card border-border">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Estado</h3>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-full h-12 rounded-xl bg-card border-border">
                <SelectValue placeholder="Cualquier estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquier estado</SelectItem>
                {MEXICAN_STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {availableCities.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Ciudad / Municipio</h3>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full h-12 rounded-xl bg-card border-border">
                  <SelectValue placeholder="Cualquier ciudad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquier ciudad</SelectItem>
                  {availableCities.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Nivel de Esfuerzo</h3>
            <Select value={effort} onValueChange={setEffort}>
              <SelectTrigger className="w-full h-12 rounded-xl bg-card border-border">
                <SelectValue placeholder="Cualquiera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquiera</SelectItem>
                <SelectItem value="low">Bajo (1-2 hrs/semana)</SelectItem>
                <SelectItem value="medium">Medio (3-5 hrs/semana)</SelectItem>
                <SelectItem value="high">Alto (6+ hrs/semana)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Accesibilidad</h3>
            <Select value={accessibility} onValueChange={setAccessibility}>
              <SelectTrigger className="w-full h-12 rounded-xl bg-card border-border">
                <SelectValue placeholder="Sin preferencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sin preferencia</SelectItem>
                {accessibilityOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl"
              onClick={() => {
                setCategory("all");
                setEffort("all");
                setAccessibility("all");
                setSearch("");
                setDebouncedSearch("");
                setSelectedState("all");
                setSelectedCity("all");
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Results */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-48 rounded-[2rem]" />
                  <Skeleton className="h-6 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                  <Skeleton className="h-20 rounded-xl mt-2" />
                </div>
              ))}
            </div>
          ) : filteredOpportunities.length > 0 ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="font-medium text-muted-foreground">
                  Se encontraron <strong className="text-foreground">{filteredOpportunities.length}</strong> oportunidades
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOpportunities.map((opp) => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-[2rem] border border-dashed border-border shadow-sm">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-2">No se encontraron oportunidades</h3>
              <p className="text-muted-foreground max-w-md font-medium">
                Intenta ajustar tus filtros o probar con otros términos de búsqueda para encontrar lo que buscas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
