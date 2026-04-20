
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeLocalData } from "./data/mockData";

// Renderizar App imediatamente e deixar o App ou componentes lidarem com o carregamento
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

// Inicializar dados em segundo plano
initializeLocalData().catch(err => {
  console.error("Erro na inicialização de dados locais:", err);
});
