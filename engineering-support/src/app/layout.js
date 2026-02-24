import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/auth/AuthProvider";

export const metadata = {
  title: "Engineering Support",
  description: "Guided documentation platform for software engineering projects"
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="appMain">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
