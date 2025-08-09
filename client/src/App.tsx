
import "./App.css";
import Landing from "./components/Layout/Landing";
import { Route } from "wouter";
import Dashboard from "./components/Layout/Daskboard";
import { ContextProvider } from "./components/Layout/context/ContextProvider";
import Signup from "./components/Layout/Signup";
import Login from "./components/Layout/Login";
function App() {
  return (
    <ContextProvider>
      <div>
        <Route path="/">
          <Landing />
        </Route>
        <Route path="/dashboard">
          <Dashboard />
        </Route>
        <Route path="/Signup">
          <Signup />
        </Route>
        <Route path="/Login">
          <Login />
        </Route>
      </div>
    </ContextProvider>
  );
}

export default App;
