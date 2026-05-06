import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = { title: "Moje konto" };

export default function KontoDashboard() {
  return (
    <div>
      <PageHeader
        pill="👤 Konto"
        pillColor="#4BBFCA"
        title="Moje konto"
      />
    </div>
  );
}
