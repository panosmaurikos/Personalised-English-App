import React from 'react';
import HomeSection from "../components/HomeSection";
import AboutSection from "../components/AboutSection";

function HomePage({
  homeRef,
  scrollToSection,
  aboutRef,
  openAuth,
  isAuthenticated
}) {
  return (
    <>
      <HomeSection
        homeRef={homeRef}
        scrollToSection={scrollToSection}
        aboutRef={aboutRef}
        openAuth={openAuth}
        isAuthenticated={isAuthenticated}
      />
      <AboutSection aboutRef={aboutRef} />
    </>
  );
}

export default HomePage;