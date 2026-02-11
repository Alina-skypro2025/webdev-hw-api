import BodyflexImg from "./courses/Bodyflex.jpg";
import FitnessImg from "./courses/Fitness.jpg";
import StepAerobicsImg from "./courses/Stepaerobics.jpg";
import StretchingImg from "./courses/Stretching.jpg";
import YogaImg from "./courses/Yoga.jpg";

const imagesBySlug: Record<string, string> = {
  yoga: YogaImg,
  stretching: StretchingImg,
  fitness: FitnessImg,
  stepaerobics: StepAerobicsImg,
  bodyflex: BodyflexImg,
};

export function getCourseImage(slug: string) {
  return imagesBySlug[(slug || "").toLowerCase()] || "";
}
