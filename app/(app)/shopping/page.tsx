import CoursesList from "@/components/courses/CoursesList";
import PageHeader from "@/components/PageHeader";
import { getCaptions } from "@/lib/lang";

export default async function ShoppingPage() {
  const t = await getCaptions();

  return (
    <>
      <PageHeader title={t.lists.purchases.title} subtitle={t.lists.purchases.subtitle} />
      <CoursesList list="purchases" />
    </>
  );
}
