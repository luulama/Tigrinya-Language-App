import { FirstLesson } from "../../components/first-lesson";
import { firstLessonContent } from "../../lib/first-lesson-content";
export default async function Page() {
  return <FirstLesson content={await firstLessonContent()} />;
}
