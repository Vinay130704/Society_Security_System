import { useFormik } from "formik";
import * as Yup from "yup";
import { Mail, MapPin, PhoneCall, MessageSquare } from "lucide-react";

const ContactUs = () => {
  const formik = useFormik({
    initialValues: { name: "", email: "", message: "" },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      message: Yup.string().required("Message is required"),
    }),
    onSubmit: (values, { resetForm }) => {
      console.log("Form Data:", values);
      alert("Your inquiry has been submitted!");
      resetForm();
    },
  });

  return (
    <div className="bg-gray-100 py-16 px-6 md:px-12 min-h-screen flex flex-col items-center">
      <div className="max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-primary">Contact Us</h2>
        <p className="text-lg text-gray-600 mt-4">
          Reach out to us for inquiries, support, or feedback. We’re here to help!
        </p>
      </div>

      <div className="mt-10 flex flex-col md:flex-row gap-10 w-full max-w-6xl">
        {/* Contact Info */}
        <div className="md:w-1/2 bg-white shadow-lg p-6 rounded-lg flex flex-col gap-6">
          <h3 className="text-2xl font-semibold text-primary">Get in Touch</h3>

          <div className="flex items-center gap-4">
            <MapPin className="text-secondary w-6 h-6" />
            <p className="text-lg text-gray-700">
              <strong>Address:</strong> ABC Society, Palampur, HP
            </p>
          </div>

          <div className="flex items-center gap-4">
            <PhoneCall className="text-secondary w-6 h-6" />
            <p className="text-lg text-gray-700">
              <strong>Phone:</strong> +91 98765 43210
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Mail className="text-secondary w-6 h-6" />
            <p className="text-lg text-gray-700">
              <strong>Email:</strong> support@societysecurity.com
            </p>
          </div>

          <div className="flex items-center gap-4">
            <MessageSquare className="text-secondary w-6 h-6" />
            <p className="text-lg text-gray-700">
              <strong>WhatsApp:</strong> +91 98765 43210
            </p>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="md:w-1/2 bg-white shadow-lg p-6 rounded-lg">
          <h3 className="text-2xl font-semibold text-primary">Send an Inquiry</h3>
          <form onSubmit={formik.handleSubmit} className="mt-4 space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary"
            />
            {formik.touched.name && formik.errors.name && <p className="text-red-500">{formik.errors.name}</p>}

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary"
            />
            {formik.touched.email && formik.errors.email && <p className="text-red-500">{formik.errors.email}</p>}

            <textarea
              name="message"
              placeholder="Your Message"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.message}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary"
              rows="4"
            />
            {formik.touched.message && formik.errors.message && <p className="text-red-500">{formik.errors.message}</p>}

            <button type="submit" className="w-full bg-secondary text-white p-3 rounded-md hover:bg-primary transition">
              Send Inquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
