import aboutImage from "../assets/signup.jpeg"; // Ensure the image exists

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-6">
      <div className="max-w-6xl w-full bg-white shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left Section - Text */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-primary mb-6 text-center md:text-left">
            About Us
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Welcome to <span className="font-semibold">Society Security System</span>, your trusted digital security companion.
            We provide seamless, technology-driven security solutions for residential communities,
            ensuring transparency, safety, and convenience.
          </p>
          
          <h2 className="text-2xl font-semibold text-secondary mb-3">Our Mission</h2>
          <p className="text-gray-600 text-lg mb-6">
            We aim to revolutionize society security with smart and digital tools, offering
            digital visitor management, vehicle tracking, and real-time security updates.
          </p>
          
          <h2 className="text-2xl font-semibold text-secondary mb-3">Our Vision</h2>
          <p className="text-gray-600 text-lg mb-6">
            Our goal is to create a secure, controlled, and technology-enhanced living environment
            where residents feel safe and empowered with digital security solutions.
          </p>
        </div>

        {/* Right Section - Image */}
        <div className="w-full md:w-1/2">
          <img
            src={aboutImage}
            alt="Security System"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
