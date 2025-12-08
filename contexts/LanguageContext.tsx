import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Language, translations } from "@/constants/translations";

const LANGUAGE_STORAGE_KEY = "@cryptolingo_language";

export const [LanguageContext, useLanguage] = createContextHook(() => {
  const [language, setLanguageState] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored) {
        if (stored === "en" || stored === "pt") {
          setLanguageState(stored as Language);
        } else {
          console.error("Invalid language value, resetting:", stored);
          await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to load language:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      setLanguageState(newLanguage);
    } catch (error) {
      console.error("Failed to save language:", error);
    }
  };

  const t = translations[language];

  return {
    language,
    setLanguage,
    t,
    isLoading,
  };
});
