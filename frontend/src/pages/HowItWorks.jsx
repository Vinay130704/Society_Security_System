import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const steps = [
  {
    number: "1️⃣",
    title: "Residents Register & Get Approval",
    description: "Residents sign up, and the admin verifies & approves their registration.",
  },
  {
    number: "2️⃣",
    title: "Visitors Get QR Codes & Security Scans",
    description: "Visitors receive a QR code, which security scans at the entrance for authentication.",
  },
  {
    number: "3️⃣",
    title: "Unregistered Visitors Need Resident Confirmation",
    description: "Visitors without a QR code require approval from the resident before entry.",
  },
  {
    number: "4️⃣",
    title: "Vehicles & Domestic Staff Must Be Pre-Registered",
    description: "Residents must pre-register their vehicles and staff for seamless access.",
  },
  {
    number: "5️⃣",
    title: "Emergency Alerts Notify All Relevant Personnel",
    description: "Security threats trigger instant alerts for quick action and response.",
  },
];

const HowItWorks = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="bg-white py-16 px-6 md:px-12">
      <h2 className="text-3xl md:text-4xl font-bold text-primary text-center">
        How It Works
      </h2>
      <p className="text-lg text-text text-center mt-4">
        Step-by-step process to ensure maximum security and efficiency.
      </p>

      {/* Steps Grid */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-background p-6 rounded-lg shadow-lg flex flex-col items-center text-center"
            data-aos="fade-up"
          >
            <div className="text-secondary text-3xl font-bold">{step.number}</div>
            <h3 className="mt-4 text-xl font-semibold text-primary">{step.title}</h3>
            <p className="mt-2 text-text">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
