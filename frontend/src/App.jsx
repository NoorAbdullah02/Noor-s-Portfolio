import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Timeline from "./components/Timeline";
import FeaturedProjects from "./components/FeaturedProjects";
import GithubProjects from "./components/GithubProjects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Timeline />
        <FeaturedProjects />
        <GithubProjects />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
