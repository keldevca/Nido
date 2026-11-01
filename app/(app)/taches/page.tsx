import TachesList from "@/components/taches/TachesList";
import PageHeader from "@/components/PageHeader";
import { getCaptions } from "@/lib/lang";

export default async function TachesPage() {
  const t = await getCaptions();

  return (
    <>
      <PageHeader title={t.tasks.title} subtitle={t.tasks.subtitle} />
      <TachesList />
    </>
  );
}
