
import Navbar from "@/components/layout/Navbar";


import HeroSection from "@/components/home/HeroSection";

import FeaturedMenu from "@/components/home/FeaturedMenu";

import PizzaCategories from "@/components/home/PizzaCategories";

import WhyChoosePizzaHub from "@/components/home/WhyChoosePizzaHub";

import HowItWorks from "@/components/home/HowItWorks";

import Footer from "@/components/layout/Footer";


export default function Home() {
  return (
    <>

      <Navbar />

  
      <main>

        <HeroSection />


        <FeaturedMenu />


        <PizzaCategories />

        <WhyChoosePizzaHub />

        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}