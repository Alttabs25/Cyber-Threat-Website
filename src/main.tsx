import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { database } from "./services/database";

const container = document.getElementById("root");
const root = createRoot(container!);

function Loader() {
  return (
    <div style={{ textAlign: "center", marginTop: "40vh", fontSize: "1.5rem" }}>
      Initializing database...
    </div>
  );
}

(async () => {
  root.render(<Loader />);
  await database.initialize();
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
})();
