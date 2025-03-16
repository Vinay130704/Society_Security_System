import { ShieldCheck, Users, PackageCheck, AlarmCheck, BellRing } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    { icon: <ShieldCheck size={40} />, title: "Visitor & Vehicle Security", description: "QR-based entry ensures only authorized personnel can access the premises." },
    { icon: <Users size={40} />, title: "Secure Staff Management", description: "Permanent IDs for workers ensure a streamlined and safe work environment." },
    { icon: <PackageCheck size={40} />, title: "Delivery Approval System", description: "One-time QR codes for delivery persons prevent unauthorized access." },
    { icon: <AlarmCheck size={40} />, title: "Emergency Alerts", description: "Instant fire, medical, and security threat notifications for residents and staff." },
    { icon: <BellRing size={40} />, title: "Real-Time Notifications", description: "Get WhatsApp/SMS alerts for visitor entries, security events, and more." },
  ];

  return (
    <div className="bg-background py-16 px-6 md:px-12">
      <h2 className="text-3xl md:text-4xl font-bold text-primary text-center">
        Why Choose Us?
      </h2>
      <p className="text-lg text-text text-center mt-4">
        Ensuring a safer and smarter living experience with cutting-edge security solutions.
      </p>

      {/* Feature Grid */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="bg-white p-6 shadow-lg rounded-lg flex flex-col items-center text-center">
            <div className="text-secondary">{feature.icon}</div>
            <h3 className="mt-4 text-xl font-semibold text-primary">{feature.title}</h3>
            <p className="mt-2 text-text">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesSection;
