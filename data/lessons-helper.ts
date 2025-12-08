import { Language } from "@/constants/translations";
import { lessons } from "./lessons";
import { lessonsPt } from "./lessons-pt";
import { Lesson } from "@/types/lesson";

export function getLessons(language: Language): Lesson[] {
  return language === "pt" ? lessonsPt : lessons;
}

export function getLesson(lessonId: string, language: Language): Lesson | undefined {
  const lessonList = getLessons(language);
  return lessonList.find((l) => l.id === lessonId);
}
