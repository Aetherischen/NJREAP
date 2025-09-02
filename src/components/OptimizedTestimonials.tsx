import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Star, User, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Testimonial {
  name: string;
  rating: number;
  text: string;
  isGoogle: boolean;
}

interface OptimizedTestimonialsProps {
  testimonials: Testimonial[];
}

const OptimizedTestimonials = ({ testimonials }: OptimizedTestimonialsProps) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Memoize testimonial navigation functions
  const nextTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  }, [testimonials.length]);

  const goToTestimonial = useCallback((index: number) => {
    setCurrentTestimonial(index);
  }, []);

  // Auto-advance testimonials with pause on hover
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, [nextTestimonial, isPaused]);

  // Memoize current testimonial to prevent unnecessary re-renders
  const currentTestimonialData = useMemo(
    () => testimonials[currentTestimonial],
    [testimonials, currentTestimonial]
  );

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <Badge variant="outline" className="text-[#4d0a97] border-[#4d0a97]/30 mb-4">
          Client Reviews
        </Badge>
        <h2 id="testimonials-heading" className="text-4xl font-bold text-gray-900 mb-6">
          What Our Clients Say
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Real reviews from satisfied customers who trust us with their property needs
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <Card className="bg-white shadow-2xl border-2 border-gray-100 hover:border-[#4d0a97]/20 transition-all duration-500">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#4d0a97] to-[#a044e3] rounded-full flex items-center justify-center mb-4">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < currentTestimonialData.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="mb-4">
                    <Quote className="w-8 h-8 text-[#4d0a97]/20 mb-2" />
                    <p className="text-gray-700 text-lg leading-relaxed italic">
                      "{currentTestimonialData.text}"
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {currentTestimonialData.name}
                      </h4>
                      {currentTestimonialData.isGoogle && (
                        <Badge variant="secondary" className="mt-1">
                          Google Review
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="sm"
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full shadow-lg bg-white/90 hover:bg-white border-gray-200 hover:border-[#4d0a97]/30"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full shadow-lg bg-white/90 hover:bg-white border-gray-200 hover:border-[#4d0a97]/30"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Testimonial Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentTestimonial
                  ? "bg-[#4d0a97] scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OptimizedTestimonials;