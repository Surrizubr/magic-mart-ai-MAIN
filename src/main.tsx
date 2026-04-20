
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeLocalData } from "./data/mockData";

console.log("App startup: Initializing...");

// Renderizar App imediatamente e deixar o App ou componentes lidarem com o carregamento
const container = document.getElementById("root");
if (container) {
  console.log("App startup: Root container found, rendering React...");
console.log("--- Supabase Env Verification ---");
console.log("URL:", import.meta.env.VITE_SUPABASE_URL || "NOT SET");
console.log("Key Configured:", !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
console.log("---------------------------------");
const root = createRoot(container);
  root.render(<App />);
} else {
  console.error("App startup: Root container NOT found!");
}

// Inicializar dados em segundo plano
console.log("App startup: Starting background data initialization...");
initializeLocalData()
  .then(() => {
    console.log("App startup: Background data initialization complete.");
  })
  .catch(err => {
    console.error("App startup: Error in background data initialization:", err);
  });
