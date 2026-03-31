import { useParams, Link } from "wouter";
import { 
  useGetOpportunity, 
  getGetOpportunityQueryKey,
  useGetMatchScore,
  useApplyToOpportunity,
  useGetMe,
  getGetMatchScoreQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Calendar, Users, Activity, CheckCircle, ArrowLeft, Building2, Send, Loader2, Star } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const oppId = parseInt(id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: user } = useGetMe();

  const { data: opp, isLoading: isLoadingOpp, error } = useGetOpportunity(oppId, {
    query: { enabled: !!oppId, queryKey: getGetOpportunityQueryKey(oppId) }
  });

  const { data: matchScore } = useGetMatchScore(oppId, {
    query: { enabled: !!oppId && !!user && user.userType === "volunteer", queryKey: getGetMatchScoreQueryKey(oppId) }
  });

  const applyMutation = useApplyToOpportunity();
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleApply = () => {
    applyMutation.mutate({ data: { message } }, {
      onSuccess: () => {
        toast({
          title: "¡Postulación enviada!",
          description: "La organización revisará tu perfil pronto.",
        });
        setDialogOpen(false);
        setMessage("");
      },
      onError: (err: any) => {
        toast({
          title: "Error al postularse",
          description: err.error || "Ya te has postulado a esta oportunidad o ocurrió un error.",
          variant: "destructive"
        });
      }
    });
  };

  if (isLoadingOpp) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !opp) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-display font-bold">Oportunidad no encontrada</h2>
        <p className="text-muted-foreground mt-4 mb-8">La oportunidad que buscas no existe o ha sido eliminada.</p>
        <Link href="/oportunidades">
          <Button>Volver a explorar</Button>
        </Link>
      </div>
    );
  }

  const scoreColor = matchScore && matchScore.totalScore >= 70 ? 'text-green-700 bg-green-100 border-green-200' :
                     matchScore && matchScore.totalScore >= 40 ? 'text-yellow-700 bg-yellow-100 border-yellow-200' : 'text-red-700 bg-red-100 border-red-200';

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Banner / Header Image */}
      <div className="w-full h-64 md:h-96 bg-muted relative">
        {opp.imageUrl ? (
          <img src={opp.imageUrl} alt={opp.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-secondary/20 flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="w-64 h-64 bg-primary/20 rounded-full blur-3xl absolute -bottom-10 -right-10"></div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
          <div className="container mx-auto">
            <Link href="/oportunidades" className="inline-flex items-center text-white/80 hover:text-white mb-6 text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver a explorar
            </Link>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-primary hover:bg-primary text-primary-foreground border-none px-3 py-1 text-sm font-bold shadow-sm">
                {opp.category}
              </Badge>
              {!opp.isActive && (
                <Badge variant="destructive" className="px-3 py-1">Inactiva / Cerrada</Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight max-w-4xl leading-tight">
              {opp.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            
            <section>
              <h2 className="text-2xl font-display font-bold mb-4">Acerca de la oportunidad</h2>
              <p className="text-lg text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {opp.description}
              </p>
            </section>

            {opp.requirements && (
              <section className="bg-muted/30 p-8 rounded-[2rem] border border-border">
                <h2 className="text-2xl font-display font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-primary" /> Requisitos
                </h2>
                <p className="text-foreground/80 whitespace-pre-wrap">{opp.requirements}</p>
              </section>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              <section>
                <h3 className="font-bold font-display text-xl mb-4">Habilidades deseadas</h3>
                {opp.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {opp.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1.5 text-sm rounded-xl">{skill}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No se especificaron habilidades.</p>
                )}
              </section>

              <section>
                <h3 className="font-bold font-display text-xl mb-4">Intereses relacionados</h3>
                {opp.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {opp.interests.map((interest) => (
                      <Badge key={interest} variant="outline" className="px-3 py-1.5 text-sm rounded-xl">{interest}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No se especificaron intereses.</p>
                )}
              </section>
            </div>

            {opp.accessibilityFeatures.length > 0 && (
              <section className="bg-secondary/10 border border-secondary/30 p-8 rounded-[2rem]">
                <h2 className="text-2xl font-display font-bold mb-4 text-foreground flex items-center gap-2">
                  <Star className="w-6 h-6 text-secondary" /> Accesibilidad
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {opp.accessibilityFeatures.map((feat) => (
                    <div key={feat} className="flex items-center gap-3 bg-card p-4 rounded-xl shadow-sm border border-border">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Match Score Card for Volunteers */}
            {user?.userType === "volunteer" && matchScore && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 rounded-[2rem] border shadow-lg ${scoreColor}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-bold text-xl">Tu Match</h3>
                  <span className="text-3xl font-extrabold">{matchScore.totalScore}%</span>
                </div>
                <div className="space-y-2 mt-4">
                  {matchScore.reasons.map((reason, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm font-medium">
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Application Card */}
            <div className="bg-card p-6 md:p-8 rounded-[2rem] border shadow-xl shadow-muted/50 sticky top-24">
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-3">
                  <Building2 className="w-6 h-6 text-muted-foreground mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Organización</p>
                    <p className="font-bold text-lg">{opp.organizationName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-muted-foreground mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Ubicación</p>
                    <p className="font-medium">{opp.location}</p>
                    {opp.state && <p className="text-sm text-muted-foreground">{opp.state}</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-6 h-6 text-muted-foreground mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Fechas</p>
                    <p className="font-medium">
                      {opp.startDate ? new Date(opp.startDate).toLocaleDateString('es-MX') : 'Inmediato'} - 
                      {opp.endDate ? ` ${new Date(opp.endDate).toLocaleDateString('es-MX')}` : ' Continuo'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Activity className="w-6 h-6 text-muted-foreground mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Nivel de esfuerzo</p>
                    <p className="font-medium capitalize">{opp.effortLevel}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-muted-foreground mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Disponibilidad</p>
                    <p className="font-medium">
                      {opp.spotsAvailable !== null ? `${opp.spotsAvailable} lugares disponibles` : 'Sin límite de lugares'}
                    </p>
                    <p className="text-sm text-primary mt-1 font-medium">{opp.applicantsCount} personas se han postulado</p>
                  </div>
                </div>
              </div>

              {!user ? (
                <Link href="/login">
                  <Button className="w-full h-14 text-lg rounded-2xl">
                    Inicia sesión para postularte
                  </Button>
                </Link>
              ) : user.userType === "volunteer" ? (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full h-14 text-lg rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20" disabled={!opp.isActive}>
                      {opp.isActive ? '¡Quiero participar!' : 'Oportunidad Cerrada'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md rounded-[2rem] p-8">
                    <DialogHeader>
                      <DialogTitle className="font-display text-2xl">Postúlate a esta oportunidad</DialogTitle>
                      <DialogDescription className="text-base pt-2">
                        Escribe un mensaje a {opp.organizationName} explicando por qué quieres unirte a "{opp.title}".
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="¡Hola! Me encantaría participar porque..."
                        className="min-h-[150px] rounded-xl text-base p-4 resize-none bg-muted/50"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl h-12">Cancelar</Button>
                      <Button onClick={handleApply} disabled={applyMutation.isPending || !message.trim()} className="rounded-xl h-12">
                        {applyMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        Enviar postulación
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="bg-muted/50 p-4 rounded-2xl text-center text-sm font-medium text-muted-foreground border border-border">
                  Las organizaciones no pueden postularse a oportunidades.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
