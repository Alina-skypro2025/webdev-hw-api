import { api } from "./api";

export type Course = {
  _id: string;
  title: string;
  description: string;
};

export type CourseDetails = Course & {
  suitable: string[];
  directions: string[];
};

export function getCourses() {
  return api<Course[]>("/api/fitness/courses");
}

export function getCourseById(id: string) {
  return api<CourseDetails>(`/api/fitness/courses/${id}`);
}
