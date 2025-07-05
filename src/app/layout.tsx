import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Revolution Travel Services - Vente et Réservations de Billets d'Avion",
  description: "Votre agence de voyage camerounaise spécialisée dans la vente et réservation de billets d'avion. Découvrez nos offres exceptionnelles et réservez votre prochain voyage en toute simplicité.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
