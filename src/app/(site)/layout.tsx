import GrainOverlay from "@/components/GrainOverlay";
import CustomCursor from "@/components/CustomCursor";
import SiteChrome from "@/components/SiteChrome";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import BackgroundAudio from "@/components/BackgroundAudio";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full">
      <Preloader />
      <GrainOverlay />
      <CustomCursor />
      <SiteChrome />
      <BackgroundAudio />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
