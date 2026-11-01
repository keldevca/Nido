import CoursesList from "@/components/courses/CoursesList";
import PageHeader from "@/components/PageHeader";
import { getCaptions } from "@/lib/lang";

export default async function CoursesPage() {
  const t = await getCaptions();

  return (
    <>
      <PageHeader title={t.lists.groceries.title} subtitle={t.lists.groceries.subtitle} />
      <CoursesList list="groceries" />
    </>
  );
}
