import { api } from "./api";
export type Course = {
  _id: string;
  title: string;
  description: string;
  nameRU?: string;
  nameEN?: string;
  durationInDays?: number;
  dailyDurationInMinutes?: {
    from: number;
    to: number;
  };
};

export type CourseDetails = Course & {
  suitable: string[];
  directions: string[];
};



export type Workout = {
  _id: string;
  name: string;
  video: string;
  exercises: {
    _id: string;
    name: string;
    quantity: number;
  }[];
};

export type UserProfile = {
  email: string;
  selectedCourses: string[];
};

export type WorkoutProgress = {
  workoutId: string;
  workoutCompleted: boolean;
  progressData: number[];
};



export function getCourses() {
  return api<Course[]>("/api/fitness/courses");
}

export function getCourseById(id: string) {
  return api<CourseDetails>(`/api/fitness/courses/${id}`);
}



export function getCourseWorkouts(courseId: string) {
  return api<Workout[]>(`/api/fitness/courses/${courseId}/workouts`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("sky_token")}`,
    },
  });
}


export function getCurrentUser() {
  return api<UserProfile>("/api/fitness/users/me", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("sky_token")}`,
    },
  });
}

export function addUserCourse(courseId: string) {
  return api<{ message: string }>("/api/fitness/users/me/courses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("sky_token")}`,
    },
    body: JSON.stringify({ courseId }),
  });
}

export function removeUserCourse(courseId: string) {
  return api<{ message: string }>(`/api/fitness/users/me/courses/${courseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("sky_token")}`,
    },
  });
}

export function getWorkoutProgress(courseId: string, workoutId: string) {
  return api<WorkoutProgress>(
    `/api/fitness/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("sky_token")}`,
      },
    }
  );
}

export function saveWorkoutProgress(
  courseId: string,
  workoutId: string,
  progressData: number[]
) {
  return api<{ message: string }>(
    `/api/fitness/courses/${courseId}/workouts/${workoutId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("sky_token")}`,
      },
      body: JSON.stringify({ progressData }),
    }
  );
}