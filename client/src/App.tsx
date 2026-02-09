import "./App.css";
import Landing from "./components/Layout/Landing";
import { Route } from "wouter";
import Dashboard from "./components/Layout/Daskboard";
import { ContextProvider } from "./components/Layout/context/ContextProvider";
import { ToastProvider } from "./components/UI/Toast";
import Signup from "./components/Layout/Signup";
import Login from "./components/Layout/Login";

function App() {
  return (
    <ToastProvider>
      <ContextProvider>
        <div>
          <Route path="/">
            <Landing />
          </Route>
          <Route path="/dashboard">
            <Dashboard />
          </Route>
          <Route path="/signup">
            <Signup />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
        </div>
      </ContextProvider>
    </ToastProvider>
  );
}

export default App;
