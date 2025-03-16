import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const testimonials = [
  {
    role: "Resident",
    review: "This security system has made our society much safer!",
    stars: "⭐⭐⭐⭐⭐",
    bgColor: "bg-blue-100",
  },
  {
    role: "Resident",
    review: "QR-based entry is hassle-free for my visitors!",
    stars: "⭐⭐⭐⭐⭐",
    bgColor: "bg-blue-200",
  },
  {
    role: "Security Guard",
    review: "Scanning QR codes is quick and efficient.",
    stars: "⭐⭐⭐⭐⭐",
    bgColor: "bg-green-100",
  },
  {
    role: "Admin",
    review: "Managing approvals has become super easy!",
    stars: "⭐⭐⭐⭐⭐",
    bgColor: "bg-yellow-100",
  },
];

const Testimonials = () => {
  return (
    <div className="bg-background py-16 px-6 md:px-12">
      <h2 className="text-3xl md:text-4xl font-bold text-primary text-center">
        What Our Users Say
      </h2>
      <p className="text-lg text-text text-center mt-4">
        Trusted by residents, security guards, and admins.
      </p>

      {/* Swiper Carousel */}
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="mt-10"
      >
        {testimonials.map((testimonial, index) => (
          <SwiperSlide key={index}>
            <div className={`p-6 rounded-lg shadow-lg ${testimonial.bgColor}`}>
              <p className="text-xl font-semibold text-primary">
                {testimonial.role} Review
              </p>
              <p className="text-lg text-text mt-2 italic">
                "{testimonial.review}"
              </p>
              <p className="mt-2 text-yellow-500">{testimonial.stars}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Testimonials;
