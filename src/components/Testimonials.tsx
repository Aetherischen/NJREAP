
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Mitchell',
      role: 'Real Estate Agent',
      company: 'Coldwell Banker',
      rating: 5,
      text: 'NJREAP consistently delivers exceptional photography that helps my listings stand out. Their attention to detail and quick turnaround times have made them my go-to choice for all photography needs.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=80&h=80&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Property Developer',
      company: 'Summit Properties',
      rating: 5,
      text: 'The appraisal services provided by NJREAP are thorough and accurate. They\'ve helped us with multiple commercial properties and their professionalism is unmatched.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Lisa Rodriguez',
      role: 'Homeowner',
      company: 'Private Client',
      rating: 5,
      text: 'When I needed an appraisal for refinancing, NJREAP made the process smooth and stress-free. The report was detailed and delivered faster than expected.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'David Thompson',
      role: 'Real Estate Broker',
      company: 'RE/MAX Elite',
      rating: 5,
      text: 'The aerial photography and virtual tours from NJREAP have revolutionized how we market luxury properties. Our clients are consistently impressed with the quality.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#020817] mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-[#374151] max-w-3xl mx-auto">
            Don't just take our word for it. Here's what real estate professionals and homeowners have to say about our services.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gray-50 rounded-2xl p-8 relative hover:shadow-lg transition-shadow duration-300"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-[#a044e3] opacity-20" />
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-[#374151] text-lg mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author Info */}
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="font-semibold text-[#020817]">{testimonial.name}</div>
                  <div className="text-sm text-[#374151]">
                    {testimonial.role} • {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="bg-gradient-to-r from-[#4d0a97] to-[#a044e3] rounded-2xl p-12 text-center text-white">
          <h3 className="text-2xl font-bold mb-8">Trusted by Industry Leaders</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {['Licensed & Certified', 'Insured & Bonded', '500+ Properties', '5-Star Rated'].map((badge, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold mb-2">✓</div>
                <div className="text-sm text-white/90">{badge}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-[#020817] mb-4">
            Ready to Experience the Difference?
          </h3>
          <p className="text-lg text-[#374151] mb-8">
            Join hundreds of satisfied clients who trust NJREAP for their real estate needs
          </p>
          <button className="bg-[#4d0a97] hover:bg-[#a044e3] text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors duration-200">
            Get Your Free Quote Today
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
