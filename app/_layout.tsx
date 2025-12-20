import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProgressContext } from "@/contexts/UserProgressContext";
import { LanguageContext } from "@/contexts/LanguageContext";
import { AuthContext, useAuth } from "@/contexts/AuthContext";
import { NotificationContext } from "@/contexts/NotificationContext";
import { DuelContext } from "@/contexts/DuelContext";
import { SubscriptionContext } from "@/contexts/SubscriptionContext";
import { NewsContext } from "@/contexts/NewsContext";
import { QuizContext } from "@/contexts/QuizContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { ChallengeProvider } from "@/contexts/ChallengeContext";
import { AchievementUnlockProvider, useAchievementUnlock } from "@/contexts/AchievementUnlockContext";
import { trpc, trpcClient } from "@/lib/trpc";
import { analytics } from "@/utils/analytics";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function ModalRenderer() {
  const { renderModals } = useAchievementUnlock();
  return <>{renderModals()}</>;
}

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "auth";

    if (!isAuthenticated && !inAuthGroup && !hasNavigated.current) {
      hasNavigated.current = true;
      router.replace("/auth");
      setTimeout(() => { hasNavigated.current = false; }, 1000);
    } else if (isAuthenticated && inAuthGroup && !hasNavigated.current) {
      hasNavigated.current = true;
      router.replace("/(tabs)");
      setTimeout(() => { hasNavigated.current = false; }, 1000);
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="lesson/[id]" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="lesson-complete" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="duel" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="duel-result" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="news/[id]" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="challenge/[id]" options={{ headerShown: false, presentation: "card" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    analytics.initialize();
    analytics.trackAppOpened(false);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        const sessionDuration = analytics.getSessionDuration();
        analytics.trackAppBackgrounded(sessionDuration);
      } else if (nextAppState === 'active') {
        analytics.trackAppOpened(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const AppContent = (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LanguageContext>
          <AuthContext>
            <SubscriptionContext>
              <PremiumProvider>
                <NotificationContext>
                  <UserProgressContext>
                    <QuizContext>
                      <AchievementUnlockProvider>
                        <ChallengeProvider>
                          <DuelContext>
                            <NewsContext>
                              <ModalRenderer />
                              <RootLayoutNav />
                            </NewsContext>
                          </DuelContext>
                        </ChallengeProvider>
                      </AchievementUnlockProvider>
                    </QuizContext>
                  </UserProgressContext>
                </NotificationContext>
              </PremiumProvider>
            </SubscriptionContext>
          </AuthContext>
        </LanguageContext>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );

  return trpcClient ? (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      {AppContent}
    </trpc.Provider>
  ) : AppContent;
}
