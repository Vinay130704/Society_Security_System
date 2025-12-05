import { Link } from "react-router-dom";
import { Shield, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-primary to-primary-dark text-white pt-12 pb-6 px-4 sm:px-6 lg:px-8 border-t border-primary-light/30 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-secondary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-background to-gray-300 bg-clip-text text-transparent">
                Guardian<span className="font-extrabold">Net</span>
              </span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Advanced security solutions for modern communities. Protecting what matters most with cutting-edge technology and 24/7 monitoring.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200 uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  Tech Park, Sector 62<br />Delhi 110032, India
                </span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-secondary mr-3 flex-shrink-0" />
                <a href="mailto:contact@guardiannet.com" className="text-gray-300 hover:text-white text-sm transition-colors">
                  contact@guardiannet.com
                </a>
              </li>
            </ul>
          </div>

          {/* Phone Numbers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200 uppercase tracking-wider">Phone Support</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-secondary mr-3 flex-shrink-0" />
                <a href="tel:+918219136254" className="text-gray-300 hover:text-white text-sm transition-colors">
                  +91 82191 36254
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-secondary mr-3 flex-shrink-0" />
                <a href="tel:+919888384712" className="text-gray-300 hover:text-white text-sm transition-colors">
                  +91 98883 84712
                </a>
              </li>
            </ul>
            <div className="pt-2">
              <Link 
                to="/contact" 
                className="inline-block px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary-dark rounded-md text-white transition-colors"
              >
                Emergency Contact
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200 uppercase tracking-wider">Security Updates</h3>
            <p className="text-gray-300 text-sm">
              Subscribe to receive security tips and system updates.
            </p>
            <form className="space-y-3">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full px-4 py-2 bg-primary-light/50 border border-primary-light rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                required
              />
              <button 
                type="submit" 
                className="w-full px-4 py-2 bg-secondary hover:bg-secondary-dark rounded-md text-white font-medium transition-colors text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-primary-light/50 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} GuardianNet Security Systems. All rights reserved.
            </p>
            
            <div className="text-gray-400 text-sm">
              <span>Designed by </span>
              <a 
                href="https://vanshkholi0.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary hover:text-secondary-dark transition-colors font-medium"
              >
                Vansh
              </a>
              <span> & </span>
              <a 
                href="https://vinyportfolio.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary hover:text-secondary-dark transition-colors font-medium"
              >
                Vinay
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;