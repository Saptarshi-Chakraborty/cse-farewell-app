import {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
  useContext,
  useCallback,
} from "react";
import { account } from "@/lib/appwrite";
import { Models } from "appwrite";

type GlobalContextType = {
  user: Models.User<Models.Preferences> | null;
  setUser: Dispatch<SetStateAction<Models.User<Models.Preferences> | null>>;
  session: any;
  setSession: Dispatch<SetStateAction<any>>;
  checkAuth: () => Promise<void>;
  isCheckingAuth: boolean;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

type GlobalContextProviderProps = {
  children: ReactNode;
};

export function GlobalContextProvider({
  children,
}: GlobalContextProviderProps) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const checkAuth = useCallback(async () => {
    // Skip if we're already checking
    if (isCheckingAuth) return;

    setIsCheckingAuth(true);
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error: any) {
      // Clear user if unauthorized or any other error
      setUser(null);
      // Don't log error for unauthorized requests
      if (error.code !== 401) {
        console.error("Auth check error:", error);
      }
    } finally {
      setIsCheckingAuth(false);
    }
  }, [isCheckingAuth]); // Remove user dependency

  return (
    <GlobalContext.Provider
      value={{
        user,
        setUser,
        session,
        setSession,
        checkAuth,
        isCheckingAuth,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error(
      "useGlobalContext must be used within a GlobalContextProvider"
    );
  }
  return context;
}

export default GlobalContext;
