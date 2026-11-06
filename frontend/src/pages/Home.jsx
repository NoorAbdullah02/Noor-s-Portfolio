import { Suspense, lazy } from "react";
import Navbar from "../components/Navbar";
import Preloader from "../components/Preloader";
import ScrollProgress from "../components/ScrollProgress";
import Hero from "../components/Hero";
import TechMarquee from "../components/TechMarquee";
import About from "../components/About";
const Skills = lazy(() => import("../components/Skills"));
const Timeline = lazy(() => import("../components/Timeline"));
const FeaturedProjects = lazy(() => import("../components/FeaturedProjects"));
const GithubProjects = lazy(() => import("../components/GithubProjects"));
const Contact = lazy(() => import("../components/Contact"));
const Footer = lazy(() => import("../components/Footer"));
import useVisitNotifier from "../hooks/useVisitNotifier";
const ChatWidget = lazy(() => import("../components/ChatWidget"));
const CursorGlow = lazy(() => import("../components/CursorGlow"));
const CvPreview = lazy(() => import("../components/CvPreview"));

export default function Home() {
  useVisitNotifier();

  return (
    <div className="prose-justify min-h-screen bg-bg text-text">
      <Preloader />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <TechMarquee />
        <About />
      <Suspense fallback={null}>
        <Skills />
        <Timeline />
        <FeaturedProjects />
        <GithubProjects />
        <Contact />
      </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
        <ChatWidget />
        <CvPreview />
        <CursorGlow />
      </Suspense>
    </div>
  );
}
