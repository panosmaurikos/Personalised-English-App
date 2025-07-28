function HomeSection({ homeRef, scrollToSection, aboutRef, openAuth, isAuthenticated }) {
  return (
    <section
      ref={homeRef} // Reference for the home section, used for scrolling or highlighting
      id="home" // Unique identifier for the section
      className="container py-5" // Styling for the section
    >
      <div className="row align-items-center">
        {/* Left column: Text content */}
        <div className="col-md-6">
          {/* Section title */}
          <h1 className="display-4 fw-bold text-danger mb-3 section-home-title">
            ONLINE<br />EDUCATION
          </h1>

          {/* Section description */}
          <p className="lead text-secondary mb-4">
            Unlock Your English Potential<br />
            Welcome to our personalized English learning platform, designed to help you achieve fluency and confidence. Whether you’re a student, professional, or lifelong learner, our tailored lessons and interactive tools adapt to your unique needs and goals. Start your journey to better English today!
          </p>

          {/* Action buttons */}
          <div className="d-flex gap-3 mb-4">
            {!isAuthenticated && (
              <button
                className="btn btn-danger btn-lg rounded-pill px-4 fw-bold shadow-sm"
                onClick={() => openAuth("register")} // Opens the registration modal
              >
                TRY NOW
              </button>
            )}
            <button
              className="btn btn-outline-danger btn-lg rounded-pill px-4 fw-bold shadow-sm"
              onClick={() => scrollToSection(aboutRef)} // Scrolls to the About section
            >
              SEE MORE
            </button>
          </div>
        </div>

        {/* Right column: Image content */}
        <div className="col-md-6 text-center position-relative">
          <div className="rounded-circle position-absolute section-home-img-bg"></div>
          <img
            src={process.env.PUBLIC_URL + '/site_image.png'} // Dynamic image path
            alt="Online Education" // Alternative text for the image
            className="section-home-img"
          />
          <div className="section-home-dot1"></div>
          <div className="section-home-dot2"></div>
        </div>
      </div>

      {/* News & Blog Section */}
      <div className="row pt-5">
        {/* News column */}
        <div className="col-md-6 mb-4">
          <div className="p-4 bg-white rounded-4 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <img src="https://img.icons8.com/color/32/000000/news.png" alt="News" className="me-2" />
              <h4 className="fw-bold mb-0 text-danger">News</h4>
            </div>
            <p className="text-secondary mb-0">
              We are excited to announce the launch of our new adaptive learning modules! These updates make it easier than ever to track your progress and receive personalized feedback from our expert instructors.
            </p>
          </div>
        </div>

        {/* Blog column */}
        <div className="col-md-6 mb-4">
          <div className="p-4 bg-white rounded-4 shadow-sm h-100">
            <div className="d-flex align-items-center mb-2">
              <img src="https://img.icons8.com/color/32/000000/blog.png" alt="Blog" className="me-2" />
              <h4 className="fw-bold mb-0 text-danger">Blog</h4>
            </div>
            <p className="text-secondary mb-0">
              Discover tips for mastering English, from effective study habits to real-world conversation practice. Read our latest articles on language learning strategies, student success stories, and updates from our teaching team.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeSection;