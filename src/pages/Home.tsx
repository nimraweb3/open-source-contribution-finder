import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import PopularTechnologies from "../components/PopularTechnologies";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <main>
      <Hero />
      <PopularTechnologies />
      <HowItWorks />
      <FinalCTA />
      <Footer />
    </main>
  );
};

export default Home;
