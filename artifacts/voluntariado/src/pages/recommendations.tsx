import { useGetRecommendations } from "@workspace/api-client-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { OpportunityCard } from "@/components/ui/opportunity-card";
import { Sparkles, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

function RecommendationsContent() {
  const { data: recommendations, isLoading } = useGetRecommendations();

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent font-bold text-sm mb-4">
          <Sparkles className="w-4 h-4" /> Recomendaciones Inteligentes
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
          Hechas para ti
        </h1>
        <p className="text-xl text-muted-foreground font-medium">
          Analizamos tus habilidades, intereses y necesidades de accesibilidad para encontrar las causas donde tendrás el mayor impacto.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-medium">Calculando tus mejores matches...</p>
        </div>
      ) : recommendations && recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {recommendations.map((rec) => (
            <OpportunityCard 
              key={rec.opportunity.id} 
              opportunity={rec.opportunity} 
              matchScore={rec.matchScore}
              matchReasons={rec.matchReasons}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card p-12 rounded-[3rem] text-center border shadow-xl shadow-muted/50 max-w-2xl mx-auto mt-12">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-12 h-12 text-muted-foreground/50" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-4">Aún no hay recomendaciones</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Para darte las mejores recomendaciones, necesitamos conocerte mejor. Completa tu perfil con tus habilidades e intereses.
          </p>
          <Link href="/perfil">
            <Button size="lg" className="rounded-2xl h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground">
              Completar mi perfil
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Recommendations() {
  return (
    <ProtectedRoute allowedType="volunteer">
      <RecommendationsContent />
    </ProtectedRoute>
  );
}
