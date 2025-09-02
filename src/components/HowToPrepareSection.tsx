
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";

const HowToPrepareSection = () => {
  return (
    <section className="relative py-10 lg:pt-28 lg:pb-24 bg-purple-200/10 sm:bg-[url('/images/misc/bg-top.svg'),_url('/images/misc/bg-bottom.svg')] bg-no-repeat sm:bg-[position:left_top,_right_bottom]">
      <div className="max-w-screen-xl px-4 sm:px-9 mx-auto">
        <h2 className="relative ml-6 mr-3 text-gray-900 text-4xl leading-10 md:text-[55px] md:leading-[65px] font-medium max-w-[500px]">
          How to Prepare for an Appraisal
        </h2>

        <div>
          <div className="my-4 sm:my-0">
            <img
              src="/images/misc/line.svg"
              alt="Line"
              className="w-full h-auto"
            />
          </div>
          <div className="grid gap-8 sm:gap-20 grid-cols-1 sm:grid-cols-3">
            <div className="flex flex-col sm:pl-[20%] sm:mt-4">
              <h6 className="text-slate-900 font-medium text-base sm:text-[24px] pb-5">
                Ease of Access
              </h6>
              <p className="text-slate-600 text-base md:text-[18px] md:leading-[26px] pb-2.5">
                Ensure easy access to all rooms, inclusive of the utility rooms
                and wherever mechanical equipment is located.
              </p>
            </div>
            <div className="flex flex-col sm:pl-[23%] sm:-mt-[24%]">
              <h6 className="text-slate-900 font-medium text-base sm:text-[24px] pb-5">
                Know your home
              </h6>
              <p className="text-slate-600 text-base md:text-[18px] md:leading-[26px] pb-2.5">
                Be prepared to answer any questions regarding recent
                improvements or changes to the home.
              </p>
              <Link
                to="/contact"
                className="text-purple-600 text-sm md:text-lg space-x-1.5 hover:space-x-4 flex items-center transition-all duration-300"
              >
                <span>Contact Us</span>
                <MoveRight className="inline-flex transition-all duration-300" />
              </Link>
            </div>
            <div className="flex flex-col sm:pl-[20%] sm:-mt-[64%]">
              <h6 className="text-slate-900 font-medium text-base sm:text-[24px] pb-5">
                Come prepared with questions
              </h6>
              <p className="text-slate-600 text-base md:text-[18px] md:leading-[26px] pb-2.5">
                Come prepared with questions for the appraiser. We value
                transparency and are happy to answer anything that might come to
                mind.
              </p>
              <Link
                to="/faqs"
                aria-label="Frequently Asked Questions"
                className="text-purple-600 text-sm md:text-lg space-x-1.5 hover:space-x-4 flex items-center transition-all duration-300"
              >
                <span>Learn more</span>
                <MoveRight className="inline-flex transition-all duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToPrepareSection;
