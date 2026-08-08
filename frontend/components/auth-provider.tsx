"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import { api } from "@/lib/api";
import type { User } from "@/lib/types";

type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type UpdateProfilePayload = {
  firstName: string;
  lastName: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: UpdateProfilePayload) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Retrieves the authenticated user.
 *
 * Keeping the API request outside the component makes it reusable by both
 * the initial authentication check and manual refresh operations.
 */
async function getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await api.get<{ data: User }>("/auth/me");
    return data.data;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Perform the initial authentication check.
   *
   * State changes occur from the asynchronous Promise callbacks rather than
   * synchronously inside the effect itself.
   */
  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  /**
   * Reload the authenticated user's profile.
   */
  const refreshUser = useCallback(async () => {
    const currentUser = await getCurrentUser();

    setUser(currentUser);
    setLoading(false);
  }, []);

  /**
   * Authenticate an existing user.
   */
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const { data } = await api.post<{ data: { user: User } }>(
        "/auth/login",
        {
          email,
          password
        }
      );

      setUser(data.data.user);
      setLoading(false);
    },
    []
  );

  /**
   * Register and authenticate a new user.
   */
  const register = useCallback(
    async (payload: RegisterPayload): Promise<void> => {
      const { data } = await api.post<{ data: { user: User } }>(
        "/auth/register",
        payload
      );

      setUser(data.data.user);
      setLoading(false);
    },
    []
  );

  /**
   * End the current authenticated session.
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  /**
   * Update the authenticated user's profile.
   */
  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload): Promise<void> => {
      const { data } = await api.patch<{ data: User }>(
        "/auth/me",
        payload
      );

      setUser(data.data);
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      updateProfile
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      updateProfile
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}







// "use client";

// import {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
//   type ReactNode
// } from "react";
// import { api } from "@/lib/api";
// import type { User } from "@/lib/types";

// type AuthContextValue = {
//   user: User | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   register: (data: {
//     firstName: string;
//     lastName: string;
//     email: string;
//     password: string;
//   }) => Promise<void>;
//   logout: () => Promise<void>;
//   refreshUser: () => Promise<void>;
//   updateProfile: (data: { firstName: string; lastName: string }) => Promise<void>;
// };

// const AuthContext = createContext<AuthContextValue | null>(null);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   const refreshUser = useCallback(async () => {
//     try {
//       const { data } = await api.get<{ data: User }>("/auth/me");
//       setUser(data.data);
//     } catch {
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     void refreshUser();
//   }, [refreshUser]);

//   const value = useMemo<AuthContextValue>(() => ({
//     user,
//     loading,
//     refreshUser,
//     login: async (email, password) => {
//       const { data } = await api.post<{ data: { user: User } }>(
//         "/auth/login",
//         { email, password }
//       );
//       setUser(data.data.user);
//     },
//     register: async (payload) => {
//       const { data } = await api.post<{ data: { user: User } }>(
//         "/auth/register",
//         payload
//       );
//       setUser(data.data.user);
//     },
//     logout: async () => {
//       try {
//         await api.post("/auth/logout");
//       } finally {
//         setUser(null);
//       }
//     },
//     updateProfile: async (payload) => {
//       const { data } = await api.patch<{ data: User }>("/auth/me", payload);
//       setUser(data.data);
//     }
//   }), [refreshUser, user]);

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth(): AuthContextValue {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used inside AuthProvider");
//   }
//   return context;
// }
