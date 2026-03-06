import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "HRM System",
  description: "Enterprise HR Management SaaS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body 
        className="
          bg-gray-100 
          text-gray-900 
          antialiased 
          min-h-screen 
          w-full 
          overflow-x-hidden
        "
      >
        <AuthProvider>
          {/* Mobile-friendly toast position: centered on small screens, top-right on desktop */}
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'max-sm:w-full max-sm:mx-4',
            }}
          />
          <main className="min-h-screen w-full">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}