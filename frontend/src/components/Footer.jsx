import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-6 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold">Quick Links</h3>
          <ul className="mt-3 space-y-2">
            <li><Link to="/" className="hover:text-secondary">Home</Link></li>
            <li><Link to="/features" className="hover:text-secondary">Features</Link></li>
            <li><Link to="/about" className="hover:text-secondary">About</Link></li>
            <li><Link to="/contact" className="hover:text-secondary">Contact</Link></li>
          </ul>
        </div>

        {/* Privacy & Terms */}
        <div>
          <h3 className="text-xl font-semibold">Legal</h3>
          <ul className="mt-3 space-y-2">
            <li><Link to="/privacy-policy" className="hover:text-secondary">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-secondary">Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* Copyright */}
        <div>
          <h3 className="text-xl font-semibold">Stay Connected</h3>
          <p className="mt-3">© {new Date().getFullYear()} Society Security System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
