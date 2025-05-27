import React from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import Chat from "./components/Chat";

function App() {
  return (
    <ErrorBoundary>
      <Chat />
    </ErrorBoundary>
  );
}

export default App;