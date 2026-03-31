import { useGetUserApplications, useGetMe } from "@workspace/api-client-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, FileText, ExternalLink, Check, X, Clock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { getGetUserApplicationsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

async function updateApplication(opportunityId: number, appId: number, body: { status?: string; hoursLogged?: number }) {
  const res = await fetch(`/api/opportunities/${opportunityId}/applications/${appId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error al actualizar");
  return res.json();
}

function ApplicationsContent() {
  const { data: applications, isLoading } = useGetUserApplications();
  const { data: user } = useGetMe();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [hoursInput, setHoursInput] = useState<Record<number, string>>({});

  const isOrg = user?.userType === "organization";

  const handleStatusUpdate = async (opportunityId: number, appId: number, status: string) => {
    setLoadingIds((prev) => new Set(prev).add(appId));
    try {
      await updateApplication(opportunityId, appId, { status });
      queryClient.invalidateQueries({ queryKey: getGetUserApplicationsQueryKey() });
      toast({
        title: status === "accepted" ? "Postulante aceptado" : "Postulante rechazado",
        description: status === "accepted" ? "El voluntario ha sido aceptado en tu oportunidad." : "La postulación ha sido rechazada.",
      });
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
    } finally {
      setLoadingIds((prev) => { const s = new Set(prev); s.delete(appId); return s; });
    }
  };

  const handleHoursLog = async (opportunityId: number, appId: number) => {
    const hours = parseInt(hoursInput[appId] || "0");
    if (isNaN(hours) || hours < 0) {
      toast({ title: "Horas inválidas", description: "Ingresa un número válido de horas.", variant: "destructive" });
      return;
    }
    setLoadingIds((prev) => new Set(prev).add(appId));
    try {
      await updateApplication(opportunityId, appId, { hoursLogged: hours });
      queryClient.invalidateQueries({ queryKey: getGetUserApplicationsQueryKey() });
      toast({ title: "Horas registradas", description: `Se registraron ${hours} horas para este voluntario.` });
    } catch {
      toast({ title: "Error", description: "No se pudieron registrar las horas.", variant: "destructive" });
    } finally {
      setLoadingIds((prev) => { const s = new Set(prev); s.delete(appId); return s; });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
          {isOrg ? "Postulantes" : "Mis Postulaciones"}
        </h1>
        <p className="text-xl text-muted-foreground font-medium">
          {isOrg
            ? "Gestiona quién se une a tus iniciativas y registra sus horas."
            : "Haz seguimiento a las causas en las que quieres ayudar."}
        </p>
      </div>

      {!applications || applications.length === 0 ? (
        <div className="bg-card p-12 rounded-[3rem] text-center border shadow-xl shadow-muted/50 max-w-2xl mx-auto mt-12">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-muted-foreground/50" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-4">No hay postulaciones aún</h2>
          {isOrg ? (
            <p className="text-muted-foreground mb-8">Nadie se ha postulado a tus oportunidades todavía. ¡Promuévelas en redes sociales!</p>
          ) : (
            <>
              <p className="text-muted-foreground mb-8">No te has postulado a ninguna oportunidad. ¡Empieza a explorar!</p>
              <Link href="/oportunidades">
                <Button size="lg" className="rounded-2xl h-14 px-8 text-lg">Explorar Causas</Button>
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applications.map((app: any) => (
            <Card key={app.id} className="rounded-[2rem] border-0 shadow-lg shadow-muted/50 hover:shadow-xl transition-all">
              <CardContent className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 pr-4">
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      {isOrg ? `Voluntario: ${app.userName}` : "Oportunidad"}
                    </div>
                    <Link href={`/oportunidades/${app.opportunityId}`}>
                      <h3 className="font-display font-bold text-xl hover:text-primary transition-colors cursor-pointer line-clamp-2">
                        {app.opportunityTitle}
                      </h3>
                    </Link>
                    {isOrg && app.userEmail && (
                      <p className="text-xs text-muted-foreground mt-1">{app.userEmail}</p>
                    )}
                  </div>
                  <Badge className={`px-3 py-1 font-bold shrink-0 ${
                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                    app.status === 'accepted' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                    'bg-red-100 text-red-800 hover:bg-red-100'
                  }`}>
                    {app.status === 'pending' ? 'Pendiente' : app.status === 'accepted' ? 'Aceptado' : 'Rechazado'}
                  </Badge>
                </div>

                <div className="bg-muted/30 p-4 rounded-2xl mb-4 border border-border">
                  <p className="text-sm text-muted-foreground font-medium mb-1">Mensaje:</p>
                  <p className="text-foreground italic text-sm">"{app.message}"</p>
                </div>

                {/* Hours display */}
                {app.status === "accepted" && (
                  <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-green-50 rounded-xl border border-green-100">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-green-700">{app.hoursLogged} horas registradas</span>
                  </div>
                )}

                {/* Org actions */}
                {isOrg && (
                  <div className="space-y-3 mt-4 pt-4 border-t border-border/50">
                    {app.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white gap-1.5"
                          disabled={loadingIds.has(app.id)}
                          onClick={() => handleStatusUpdate(app.opportunityId, app.id, "accepted")}
                        >
                          {loadingIds.has(app.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
                          disabled={loadingIds.has(app.id)}
                          onClick={() => handleStatusUpdate(app.opportunityId, app.id, "rejected")}
                        >
                          {loadingIds.has(app.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                          Rechazar
                        </Button>
                      </div>
                    )}

                    {app.status === "accepted" && (
                      <div className="flex gap-2 items-center">
                        <Input
                          type="number"
                          min="0"
                          placeholder="Horas"
                          className="h-9 rounded-xl text-sm w-24 shrink-0"
                          value={hoursInput[app.id] ?? app.hoursLogged ?? ""}
                          onChange={(e) => setHoursInput((prev) => ({ ...prev, [app.id]: e.target.value }))}
                        />
                        <Button
                          size="sm"
                          className="flex-1 rounded-xl gap-1.5"
                          disabled={loadingIds.has(app.id)}
                          onClick={() => handleHoursLog(app.opportunityId, app.id)}
                        >
                          {loadingIds.has(app.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
                          Registrar horas
                        </Button>
                      </div>
                    )}

                    {app.status === "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full rounded-xl"
                        disabled={loadingIds.has(app.id)}
                        onClick={() => handleStatusUpdate(app.opportunityId, app.id, "pending")}
                      >
                        Volver a pendiente
                      </Button>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center text-sm font-medium text-muted-foreground mt-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(app.createdAt).toLocaleDateString('es-MX')}
                  </div>
                  <Link href={`/oportunidades/${app.opportunityId}`}>
                    <Button variant="ghost" size="sm" className="gap-2">
                      Ver oportunidad <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Applications() {
  return (
    <ProtectedRoute>
      <ApplicationsContent />
    </ProtectedRoute>
  );
}
