import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { OpportunityCard } from "@/components/ui/opportunity-card";
import { 
  useGetStatsSummary, 
  useListOpportunities 
} from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Heart, Users, MapPin, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetStatsSummary();
  const { data: opportunities, isLoading: oppsLoading } = useListOpportunities({ limit: 3 } as any);

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/20 blur-3xl"></div>
        <div className="absolute top-40 -left-40 w-72 h-72 rounded-full bg-secondary/30 blur-3xl"></div>

        <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/30 text-secondary-foreground font-medium text-sm mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse"></span>
            La red de voluntariado de México
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-foreground max-w-4xl leading-[1.1]"
          >
            Encuentra tu forma de <span className="text-primary relative inline-block">
              hacer la diferencia
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-accent" viewBox="0 0 100 12" preserveAspectRatio="none">
                <path d="M0,5 Q50,15 100,5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
              </svg>
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 text-xl text-muted-foreground max-w-2xl font-medium"
          >
            Conectamos tus habilidades y pasiones con las causas que más lo necesitan. Inteligente, accesible y con mucho corazón.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link href="/registro">
              <Button size="lg" className="rounded-full px-8 h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20">
                Soy Voluntario
              </Button>
            </Link>
            <Link href="/oportunidades">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg bg-background/50 backdrop-blur-sm border-2">
                Explorar Causas
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-foreground text-background relative z-20 -mt-8 mx-4 md:mx-12 rounded-[3rem] shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDMiPjwvcmVjdD4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-50"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-background/10">
            {[
              { label: "Oportunidades", value: stats?.totalOpportunities || 0, icon: Target, loading: statsLoading },
              { label: "Voluntarios", value: stats?.totalVolunteers || 0, icon: Users, loading: statsLoading },
              { label: "Organizaciones", value: stats?.totalOrganizations || 0, icon: MapPin, loading: statsLoading },
              { label: "Impactos", value: stats?.totalApplications || 0, icon: Heart, loading: statsLoading },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-background/10 flex items-center justify-center mb-4">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                {stat.loading ? (
                  <Skeleton className="h-10 w-20 mb-2 bg-background/20" />
                ) : (
                  <span className="text-4xl font-display font-bold text-background mb-1">{stat.value}</span>
                )}
                <span className="text-sm font-medium text-background/60">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Opportunities */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-display font-bold text-foreground mb-4">Destacadas esta semana</h2>
              <p className="text-muted-foreground max-w-xl">
                Iniciativas que necesitan tu ayuda urgentemente. Descubre dónde puedes tener el mayor impacto hoy.
              </p>
            </div>
            <Link href="/oportunidades">
              <Button variant="ghost" className="rounded-full font-medium">Ver todas →</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {oppsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-48 rounded-3xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20" />
                </div>
              ))
            ) : opportunities && opportunities.length > 0 ? (
              opportunities.slice(0, 3).map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-muted/30 rounded-3xl border border-dashed border-border">
                <p className="text-muted-foreground font-medium">Aún no hay oportunidades publicadas. ¡Sé el primero en publicar una!</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-background/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iMSIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+Cjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-6 max-w-2xl mx-auto">
            ¿Representas a una organización?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-xl mx-auto font-medium">
            Encuentra a los voluntarios ideales con nuestro sistema de matching inteligente y gestiona todo en un solo lugar.
          </p>
          <Link href="/registro?type=organization">
            <Button size="lg" className="rounded-full px-8 h-14 text-lg bg-foreground text-background hover:bg-foreground/90 shadow-xl">
              Registrar mi ONG
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
