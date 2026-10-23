import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { RolarParaAgendar } from "@/components/site/RolarParaAgendar";
import { TopBar } from "@/components/site/TopBar";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <RolarParaAgendar />
      <TopBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
