import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // get current session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return !session ? <Login /> : <Dashboard session={session} />;
}
