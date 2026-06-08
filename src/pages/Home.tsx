import { Hero } from "../components/sections/Hero";
import { Problem } from "../components/sections/Problem";
import { Method } from "../components/sections/Method";
import { Services } from "../components/sections/Services";
import { Resources } from "../components/sections/Resources";
import { About } from "../components/sections/About";
import { CTA } from "../components/sections/CTA";

export function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <Method />
      <Services />
      <Resources />
      <About />
      <CTA />
    </main>
  );
}
