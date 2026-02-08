import { Routes, Route, useLocation, type Location } from "react-router-dom";
import { Layout } from "./ui/Layout/Layout";
import { CoursesPage } from "../pages/CoursesPage/CoursesPage";
import { AuthPage } from "../pages/AuthPage/AuthPage";
import { CoursePage } from "../pages/CoursePage/CoursePage";
import { ProfilePage } from "../pages/ProfilePage/ProfilePage";
import { WorkoutPage } from "../pages/WorkoutPage/WorkoutPage";

export function AppRouter() {
  const location = useLocation();

  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<Layout />}>
          <Route index element={<CoursesPage />} />
          <Route path="course/:courseId" element={<CoursePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="workout/:workoutId" element={<WorkoutPage />} />

          
          <Route path="login" element={<AuthPage />} />
        </Route>
      </Routes>

     
      {backgroundLocation ? (
        <Routes>
          <Route path="/login" element={<AuthPage />} />
        </Routes>
      ) : null}
    </>
  );
}
