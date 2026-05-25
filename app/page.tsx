import Nav from "./_components/Nav";
import Hero from "./_components/Hero";
import About from "./_components/About";
import Skills from "./_components/Skills";
import Timeline from "./_components/Timeline";
import Portfolio from "./_components/Portfolio";
import Contact from "./_components/Contact";
import Footer from "./_components/Footer";
import DigitalTwin from "./_components/DigitalTwin";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative flex-1">
        <Hero />
        <About />
        <Skills />
        <Timeline />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
      <DigitalTwin />
    </>
  );
}
