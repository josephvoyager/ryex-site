import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import Pillars from '@/components/landing/Pillars';
import HowItWorks from '@/components/landing/HowItWorks';
import Flywheel from '@/components/landing/Flywheel';
import AssetCloud from '@/components/landing/AssetCloud';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';
import RevealController from '@/components/landing/RevealController';

export default function LandingPage() {
  return (
    <>
      <RevealController />
      <Nav />
      <Hero />
      <Pillars />
      <HowItWorks />
      <Flywheel />
      <AssetCloud />
      <FinalCTA />
      <Footer />
    </>
  );
}
