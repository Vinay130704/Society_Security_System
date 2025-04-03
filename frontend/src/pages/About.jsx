import aboutImage from "../assets/signup.jpeg";
import { motion } from "framer-motion";

const AboutUs = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 pt-24"> {/* Added pt-24 for navbar spacing */}
      <div className="max-w-6xl w-full mx-auto py-12">
        {/* Main Card with animations */}
        <motion.div 
          className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Left Section - Text */}
          <motion.div 
            className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center"
            variants={itemVariants}
          >
            <motion.h1 
              className="text-4xl font-bold text-primary mb-6 text-center md:text-left relative"
              variants={itemVariants}
            >
              About <span className="text-secondary">GuardianNet</span>
              <span className="absolute bottom-0 left-0 w-20 h-1 bg-secondary-dark rounded-full"></span>
            </motion.h1>
            
            <motion.p 
              className="text-gray-600 text-lg mb-8 leading-relaxed"
              variants={itemVariants}
            >
              Welcome to <span className="font-semibold text-primary-dark">GuardianNet</span>, your trusted digital security companion.
              We provide <span className="text-secondary">seamless, technology-driven</span> security solutions for residential communities,
              ensuring <span className="font-medium">transparency, safety, and convenience</span>.
            </motion.p>
            
            <motion.div 
              className="space-y-6"
              variants={containerVariants}
            >
              <motion.div 
                className="bg-primary-light bg-opacity-10 p-6 rounded-lg border-l-4 border-secondary hover:shadow-md transition-shadow duration-300"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <h2 className="text-2xl font-semibold text-secondary mb-3">Our Mission</h2>
                <p className="text-gray-700">
                  We aim to revolutionize society security with smart and digital tools, offering
                  digital visitor management, vehicle tracking, and real-time security updates.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-primary-light bg-opacity-10 p-6 rounded-lg border-l-4 border-secondary-dark hover:shadow-md transition-shadow duration-300"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <h2 className="text-2xl font-semibold text-secondary-dark mb-3">Our Vision</h2>
                <p className="text-gray-700">
                  Our goal is to create a secure, controlled, and technology-enhanced living environment
                  where residents feel safe and empowered with digital security solutions.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Section - Image */}
          <motion.div 
            className="w-full md:w-1/2 relative"
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-dark to-secondary opacity-10"></div>
            <motion.img
              src={aboutImage}
              alt="GuardianNet Security System"
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-primary-dark to-transparent opacity-50"></div>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {[
            {
              title: "Innovation",
              desc: "Cutting-edge security technology",
              icon: "💡"
            },
            {
              title: "Reliability",
              desc: "24/7 protection you can trust",
              icon: "🛡️"
            },
            {
              title: "Community",
              desc: "Designed for residential safety",
              icon: "🏘️"
            }
          ].map((feature, index) => (
            <motion.div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              variants={itemVariants}
              whileHover={{ 
                y: -5,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
              }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-primary-dark mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;