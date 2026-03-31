import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, BarChart3, Users, Clock, TrendingUp, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

async function fetchOrgDashboard() {
  const res = await fetch("/api/organizations/dashboard", { credentials: "include" });
  if (!res.ok) throw new Error("Error al cargar el dashboard");
  return res.json();
}

const STATUS_COLORS = {
  accepted: "#22c55e",
  pending: "#f59e0b",
  rejected: "#ef4444",
};

function DashboardContent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["org-dashboard"],
    queryFn: fetchOrgDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-24 text-center min-h-screen">
        <p className="text-muted-foreground">No se pudo cargar el dashboard.</p>
      </div>
    );
  }

  const pieData = [
    { name: "Aceptados", value: data.totalAccepted, color: STATUS_COLORS.accepted },
    { name: "Pendientes", value: data.totalPending, color: STATUS_COLORS.pending },
    { name: "Rechazados", value: data.totalRejected, color: STATUS_COLORS.rejected },
  ].filter((d) => d.value > 0);

  const barData = (data.opportunityStats || [])
    .filter((o: any) => o.totalApplications > 0)
    .map((o: any) => ({
      name: o.title,
      Aceptados: o.accepted,
      Pendientes: o.pending,
      Rechazados: o.rejected,
    }));

  const hoursData = (data.opportunityStats || [])
    .filter((o: any) => o.hoursLogged > 0)
    .map((o: any) => ({
      name: o.title,
      Horas: o.hoursLogged,
    }));

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen max-w-6xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary font-bold text-sm mb-4">
          <BarChart3 className="w-4 h-4" /> Dashboard
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-2">
          Mis Voluntarios
        </h1>
        <p className="text-xl text-muted-foreground font-medium">
          Visión general de tus iniciativas y el impacto de tus voluntarios.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="rounded-[2rem] border-0 shadow-lg shadow-muted/40">
          <CardContent className="p-6 flex flex-col gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-display font-bold">{data.totalOpportunities}</p>
            <p className="text-sm text-muted-foreground font-medium">Oportunidades</p>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-0 shadow-lg shadow-muted/40">
          <CardContent className="p-6 flex flex-col gap-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-display font-bold">{data.totalPending}</p>
            <p className="text-sm text-muted-foreground font-medium">Pendientes</p>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-0 shadow-lg shadow-muted/40">
          <CardContent className="p-6 flex flex-col gap-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-display font-bold">{data.totalAccepted}</p>
            <p className="text-sm text-muted-foreground font-medium">Aceptados</p>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-0 shadow-lg shadow-muted/40">
          <CardContent className="p-6 flex flex-col gap-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-display font-bold">{data.totalHoursLogged}</p>
            <p className="text-sm text-muted-foreground font-medium">Horas totales</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart - Status Distribution */}
        <Card className="rounded-[2rem] border-0 shadow-lg shadow-muted/40 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 pb-4 pt-6 px-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-display font-bold">Distribución de Postulantes</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {pieData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Users className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">Aún no hay postulantes</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} personas`, ""]} />
                  <Legend
                    formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Hours Bar Chart */}
        <Card className="rounded-[2rem] border-0 shadow-lg shadow-muted/40 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 pb-4 pt-6 px-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-display font-bold">Horas por Oportunidad</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {hoursData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Clock className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">Aún no hay horas registradas</p>
                <p className="text-xs mt-1">Acepta voluntarios y registra sus horas en Postulantes</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={hoursData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => [`${value} horas`, "Horas"]} />
                  <Bar dataKey="Horas" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart - Applications per Opportunity */}
      {barData.length > 0 && (
        <Card className="rounded-[2rem] border-0 shadow-lg shadow-muted/40 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 pb-4 pt-6 px-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-display font-bold">Postulantes por Oportunidad</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Aceptados" fill={STATUS_COLORS.accepted} radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="Pendientes" fill={STATUS_COLORS.pending} radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="Rechazados" fill={STATUS_COLORS.rejected} radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {data.totalApplications === 0 && (
        <Card className="rounded-[2rem] border-0 shadow-xl shadow-muted/50">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold mb-2">Sin postulantes aún</h2>
            <p className="text-muted-foreground">
              Cuando los voluntarios se postulen a tus oportunidades, verás aquí sus estadísticas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute allowedType="organization">
      <DashboardContent />
    </ProtectedRoute>
  );
}
