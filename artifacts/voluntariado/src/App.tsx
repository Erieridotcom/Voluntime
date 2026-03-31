import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Pages
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Opportunities from "@/pages/opportunities";
import OpportunityDetail from "@/pages/opportunity-detail";
import Recommendations from "@/pages/recommendations";
import Profile from "@/pages/profile";
import Publish from "@/pages/publish";
import Applications from "@/pages/applications";
import Dashboard from "@/pages/dashboard";
import Forum from "@/pages/forum";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/registro" component={Register} />
          <Route path="/oportunidades" component={Opportunities} />
          <Route path="/oportunidades/:id" component={OpportunityDetail} />
          <Route path="/mis-recomendaciones" component={Recommendations} />
          <Route path="/perfil" component={Profile} />
          <Route path="/publicar" component={Publish} />
          <Route path="/mis-postulaciones" component={Applications} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/foro" component={Forum} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
