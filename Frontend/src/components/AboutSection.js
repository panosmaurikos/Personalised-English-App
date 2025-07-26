function AboutSection({ aboutRef }) {
  return (
    <section ref={aboutRef} id="about" className="container py-5">
      {/* Main container for the About section */}
      <div className="row justify-content-center align-items-center">
        {/* Left column: Image section */}
        <div className="col-lg-6 mb-4 mb-lg-0">
          <div className="about-img-wrapper">
            <img
              src="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=600&q=80"
              alt="About LinguaLearn"
              className="about-img"
            />
          </div>
        </div>

        {/* Right column: Text content */}
        <div className="col-lg-6 section-about-inner">
          {/* Section title */}
          <h2 className="fw-bold text-danger mb-4 text-center text-lg-start">About LinguaLearn</h2>
          <p className="lead text-secondary mb-3">
            <b>Empowering Your English Journey</b>
          </p>

          {/* List of features */}
          <ul className="about-list mb-3 ps-3">
            <li><b>Personalized Learning:</b> Our adaptive platform tailors lessons, exercises, and feedback to your unique needs and pace.</li>
            <li><b>Expert Instructors:</b> Learn from certified teachers with years of experience in language education.</li>
            <li><b>Smart Analytics:</b> Track your progress, identify strengths and areas for improvement, and celebrate your achievements.</li>
            <li><b>Community Support:</b> Join a vibrant community of learners, participate in group discussions, and get help whenever you need it.</li>
            <li><b>Modern Tools:</b> Enjoy interactive lessons, real-world practice, and up-to-date resources for every level.</li>
          </ul>

          {/* Vision section */}
          <h4 className="fw-bold text-danger mt-4 mb-2">Our Vision</h4>
          <p className="text-secondary mb-3">
            We envision a world where language is not a barrier but a bridge to new opportunities. At LinguaLearn, we strive to make English learning accessible, enjoyable, and effective for everyone, regardless of background or starting level.
          </p>

          {/* Why Choose Us section */}
          <h4 className="fw-bold text-danger mt-4 mb-2">Why Choose Us?</h4>
          <ul className="about-list mb-3 ps-3">
            <li>Flexible learning schedules to fit your lifestyle</li>
            <li>Interactive exercises and real-world practice scenarios</li>
            <li>Regular progress reports and personalized feedback</li>
            <li>Supportive community and expert guidance</li>
            <li>Continuous updates with the latest in language education</li>
          </ul>
          <p className="text-secondary mb-4">
            Whether you’re preparing for exams, improving your professional communication, or simply aiming for fluency, LinguaLearn is here to support your journey every step of the way.
          </p>
        </div>
      </div>

      {/* Testimonials section */}
      <div className="mt-5">
        <h4 className="fw-bold text-danger mb-3">What Our Learners Say</h4>
        <div className="about-testimonials">
          <blockquote>
            <p>"LinguaLearn helped me pass my English exam with confidence!"</p>
            <footer>- Maria, Student</footer>
          </blockquote>
          <blockquote>
            <p>"The personalized lessons and analytics are game changers."</p>
            <footer>- Ahmed, Professional</footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;