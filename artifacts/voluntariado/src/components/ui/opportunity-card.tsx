import { Opportunity } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, Activity, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface OpportunityCardProps {
  opportunity: Opportunity;
  matchScore?: number;
  matchReasons?: string[];
}

export function OpportunityCard({ opportunity, matchScore, matchReasons }: OpportunityCardProps) {
  
  const getEffortColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-secondary text-secondary-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      case 'high': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getEffortLabel = (level: string) => {
    switch (level) {
      case 'low': return 'Esfuerzo bajo';
      case 'medium': return 'Esfuerzo medio';
      case 'high': return 'Esfuerzo alto';
      default: return 'Desconocido';
    }
  };

  const scoreColor = matchScore && matchScore >= 70 ? 'text-green-600 bg-green-100' :
                     matchScore && matchScore >= 40 ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100';

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="h-full flex flex-col overflow-hidden rounded-[2rem] border-0 shadow-xl shadow-muted/50 bg-card hover:shadow-2xl transition-all duration-300 relative">
        
        {/* Match Score Badge (if present) */}
        {matchScore !== undefined && (
          <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1 shadow-sm backdrop-blur-md ${scoreColor}`}>
            <span>{matchScore}% Match</span>
          </div>
        )}

        <div className="h-48 w-full bg-muted relative overflow-hidden">
          {opportunity.imageUrl ? (
            <img src={opportunity.imageUrl} alt={opportunity.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
              <span className="font-display font-bold text-4xl text-primary/40 opacity-50 tracking-tighter">VR</span>
            </div>
          )}
          <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
            <Badge className="bg-background/90 text-foreground backdrop-blur-md hover:bg-background border-none shadow-sm rounded-xl px-3 py-1">
              {opportunity.category}
            </Badge>
          </div>
        </div>

        <CardHeader className="p-6 pb-2">
          <h3 className="font-display font-bold text-xl leading-tight line-clamp-2 mb-1">{opportunity.title}</h3>
          <p className="text-muted-foreground font-medium text-sm">{opportunity.organizationName}</p>
        </CardHeader>

        <CardContent className="p-6 pt-2 flex-grow flex flex-col gap-4">
          <p className="text-sm text-foreground/80 line-clamp-2">{opportunity.description}</p>
          
          <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground mt-auto pt-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {opportunity.city && opportunity.state
                  ? `${opportunity.city}, ${opportunity.state}`
                  : opportunity.state
                  ? opportunity.state
                  : opportunity.location || "Sin ubicación"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 shrink-0" />
              <span className="truncate">{getEffortLabel(opportunity.effortLevel)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="truncate">{opportunity.startDate ? new Date(opportunity.startDate).toLocaleDateString('es-MX', { month: 'short', day: 'numeric'}) : 'Continuo'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 shrink-0" />
              <span className="truncate">{opportunity.spotsAvailable ? `${opportunity.spotsAvailable} lugares` : 'Sin límite'}</span>
            </div>
          </div>

          {opportunity.accessibilityFeatures && opportunity.accessibilityFeatures.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {opportunity.accessibilityFeatures.slice(0, 2).map((feat, i) => (
                <Badge key={i} variant="outline" className="text-xs rounded-lg font-normal border-border bg-muted/20">
                  {feat}
                </Badge>
              ))}
              {opportunity.accessibilityFeatures.length > 2 && (
                <Badge variant="outline" className="text-xs rounded-lg font-normal border-border bg-muted/20">
                  +{opportunity.accessibilityFeatures.length - 2}
                </Badge>
              )}
            </div>
          )}

          {matchReasons && matchReasons.length > 0 && (
            <div className="mt-2 text-xs font-medium text-green-600/80 bg-green-50 p-2 rounded-xl">
              ✓ {matchReasons[0]}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-6 pt-0 mt-auto">
          <Link href={`/oportunidades/${opportunity.id}`} className="w-full">
            <Button className="w-full rounded-2xl group transition-all" variant="outline">
              Ver detalles
              <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
