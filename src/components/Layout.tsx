import { ReactNode, useEffect, useState } from "react";
import { ThemeMode } from "../types";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Verifica se o sistema está em modo escuro
  const checkSystemTheme = (): boolean => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  // Efeito para inicializar o tema e adicionar listener para mudanças no sistema
  useEffect(() => {
    const updateTheme = () => {
      if (themeMode === "system") {
        setIsDarkMode(checkSystemTheme());
      } else {
        setIsDarkMode(themeMode === "dark");
      }
    };

    updateTheme();
    
    // Adicionar listener para mudanças na preferência do sistema
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (themeMode === "system") {
        updateTheme();
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode]);

  // Função para alternar o modo de tema
  const toggleTheme = () => {
    if (themeMode === "light") {
      setThemeMode("dark");
    } else if (themeMode === "dark") {
      setThemeMode("system");
    } else {
      setThemeMode("light");
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? "dark bg-gray-900" : "bg-gray-100"}`}>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Controle de Tempo
            </h1>
            <div className="flex items-center">
              <button 
                onClick={toggleTheme}
                className={`p-2 rounded-md flex items-center ${isDarkMode ? "bg-gray-700 text-yellow-300" : "bg-gray-200 text-gray-700"}`}
                aria-label="Alternar tema"
              >
                {themeMode === "light" && (
                  <span title="Tema Claro">☀️</span>
                )}
                {themeMode === "dark" && (
                  <span title="Tema Escuro">🌙</span>
                )}
                {themeMode === "system" && (
                  <span title="Tema do Sistema">🖥️</span>
                )}
                <span className="ml-2 text-xs">
                  {themeMode === "light" ? "Claro" : themeMode === "dark" ? "Escuro" : "Sistema"}
                </span>
              </button>
            </div>
          </div>
        </header>
        
        <main className="pb-20">
          {children}
        </main>
        
        <footer className={`text-center text-sm mt-8 py-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          <p className="mb-2">© {new Date().getFullYear()} Controle de Tempo</p>
          <p className="text-xs opacity-75">Os dados são armazenados localmente no seu navegador e podem ser perdidos se você limpar os dados de navegação.</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout; 