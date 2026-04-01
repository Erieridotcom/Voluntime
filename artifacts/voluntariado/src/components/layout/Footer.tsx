import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl font-bold text-primary mb-4 tracking-tight">Voluntime</h3>
            <p className="text-muted/80 max-w-sm">
              Conectando el talento y la energía de los jóvenes mexicanos con las causas que más importan. Tu forma de hacer la diferencia empieza aquí.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 font-display">Plataforma</h4>
            <ul className="space-y-2 text-muted/80">
              <li><a href="/oportunidades" className="hover:text-primary transition-colors">Explorar causas</a></li>
              <li><a href="/registro" className="hover:text-primary transition-colors">Soy Voluntario</a></li>
              <li><a href="/registro?type=organization" className="hover:text-primary transition-colors">Soy Organización</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 font-display">Legal & Ayuda</h4>
            <ul className="space-y-2 text-muted/80">
              <li><a href="#" className="hover:text-primary transition-colors">Términos de uso</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacidad</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contacto</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-muted/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted/60">
          <p>© {new Date().getFullYear()} Voluntime. Hecho en México.</p>
          <p className="flex items-center gap-1 mt-2 md:mt-0">
            Hecho con <Heart className="w-4 h-4 text-accent fill-accent" /> para el cambio
          </p>
        </div>
      </div>
    </footer>
  );
}
