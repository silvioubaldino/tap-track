import { ReactNode, useEffect, useState } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Verificar preferência do sistema
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDark);
    
    // Adicionar listener para mudanças na preferência do sistema
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? "dark bg-gray-900" : "bg-gray-100"}`}>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
              Controle de Tempo
            </h1>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-md ${darkMode ? "bg-gray-700 text-yellow-300" : "bg-gray-200 text-gray-700"}`}
              aria-label="Alternar tema"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </header>
        
        <main className="pb-20">
          {children}
        </main>
        
        <footer className={`text-center text-sm mt-8 py-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          © {new Date().getFullYear()} Controle de Tempo
        </footer>
      </div>
    </div>
  );
};

export default Layout; 