import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback } from "react";

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  authMethod: "email" | "google";
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const STORAGE_KEY = "@cryptolingo_auth";

export const [AuthContext, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const user = JSON.parse(stored) as User;
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch (parseError) {
          console.error("Failed to parse auth state, resetting:", parseError);
          await AsyncStorage.removeItem(STORAGE_KEY);
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error("Failed to load auth state:", error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      const storedUsers = await AsyncStorage.getItem("@cryptolingo_users");
      let users: Record<string, any> = {};
      if (storedUsers) {
        try {
          users = JSON.parse(storedUsers);
        } catch (parseError) {
          console.error("Failed to parse users, resetting:", parseError);
          await AsyncStorage.removeItem("@cryptolingo_users");
        }
      }

      if (users[email] && users[email].password === password) {
        const user: User = {
          id: users[email].id,
          email,
          displayName: users[email].displayName,
          createdAt: users[email].createdAt,
          authMethod: "email",
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true, error: null };
      } else {
        return { success: false, error: "Invalid email or password" };
      }
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: "An error occurred during sign in" };
    }
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      try {
        const storedUsers = await AsyncStorage.getItem("@cryptolingo_users");
        let users: Record<string, any> = {};
        if (storedUsers) {
          try {
            users = JSON.parse(storedUsers);
          } catch (parseError) {
            console.error("Failed to parse users, resetting:", parseError);
            await AsyncStorage.removeItem("@cryptolingo_users");
          }
        }

        if (users[email]) {
          return { success: false, error: "Email already exists" };
        }

        const user: User = {
          id: Date.now().toString(),
          email,
          displayName,
          createdAt: new Date().toISOString(),
          authMethod: "email",
        };

        users[email] = {
          ...user,
          password,
        };

        await AsyncStorage.setItem("@cryptolingo_users", JSON.stringify(users));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));

        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });

        return { success: true, error: null };
      } catch (error) {
        console.error("Sign up error:", error);
        return { success: false, error: "An error occurred during sign up" };
      }
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    return {
      success: false,
      error: "Google Sign-In requires backend configuration. Please use email authentication.",
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, []);

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };
});
