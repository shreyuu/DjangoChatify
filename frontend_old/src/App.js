import React from "react";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import store from "./store";
import ErrorBoundary from "./components/ErrorBoundary";
import Router from "./Router";

function App() {
    return (
        <Provider store={store}>
            <ErrorBoundary>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: "#363636",
                            color: "#fff",
                        },
                        success: {
                            duration: 3000,
                            theme: {
                                primary: "#4aed88",
                            },
                        },
                    }}
                />
                <Router />
            </ErrorBoundary>
        </Provider>
    );
}

export default App;
