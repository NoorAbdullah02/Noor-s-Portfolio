import Navbar from "../components/Navbar";
import Preloader from "../components/Preloader";
import ScrollProgress from "../components/ScrollProgress";
import Hero from "../components/Hero";
import TechMarquee from "../components/TechMarquee";
import About from "../components/About";
import Skills from "../components/Skills";
import Timeline from "../components/Timeline";
import FeaturedProjects from "../components/FeaturedProjects";
import GithubProjects from "../components/GithubProjects";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import useVisitNotifier from "../hooks/useVisitNotifier";
import ChatWidget from "../components/ChatWidget";

export default function Home() {
  useVisitNotifier();

  return (
    <div className="min-h-screen bg-bg text-text">
      <Preloader />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <TechMarquee />
        <About />
        <Skills />
        <Timeline />
        <FeaturedProjects />
        <GithubProjects />
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
