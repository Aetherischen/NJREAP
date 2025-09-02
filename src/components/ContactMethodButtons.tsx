
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, FileText } from "lucide-react";
import { Link } from "react-router-dom";

interface ContactMethodButtonsProps {
  showCallButton?: boolean;
  showChatButton?: boolean;
  showContactFormButton?: boolean;
  className?: string;
}

const ContactMethodButtons = ({ 
  showCallButton = true, 
  showChatButton = true, 
  showContactFormButton = true,
  className = ""
}: ContactMethodButtonsProps) => {
  // Protected phone number (reversed to prevent web scraping)
  const getPhoneNumber = () => {
    const reversed = "5058734809";
    return reversed
      .split("")
      .reverse()
      .join("")
      .replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };

  const handleCallClick = () => {
    window.location.href = `tel:${getPhoneNumber().replace(/[^\d]/g, '')}`;
  };

  const handleChatClick = () => {
    // For now, scroll to contact form. Could be replaced with actual chat widget
    const contactElement = document.querySelector("[data-contact-form]");
    if (contactElement) {
      contactElement.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      // Fallback to navigate to contact page
      window.location.href = "/contact";
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {showCallButton && (
        <Button
          onClick={handleCallClick}
          className="flex items-center space-x-2 bg-[#4d0a97] hover:bg-[#a044e3] text-white"
          size="lg"
        >
          <Phone className="w-5 h-5" />
          <span>Call Us</span>
        </Button>
      )}
      
      {showChatButton && (
        <Button
          onClick={handleChatClick}
          variant="outline"
          className="flex items-center space-x-2 border-[#4d0a97] text-[#4d0a97] hover:bg-[#4d0a97] hover:text-white"
          size="lg"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Live Chat</span>
        </Button>
      )}
      
      {showContactFormButton && (
        <Link to="/contact">
          <Button
            variant="outline"
            className="flex items-center space-x-2 border-[#4d0a97] text-[#4d0a97] hover:bg-[#4d0a97] hover:text-white w-full"
            size="lg"
          >
            <FileText className="w-5 h-5" />
            <span>Contact Form</span>
          </Button>
        </Link>
      )}
    </div>
  );
};

export default ContactMethodButtons;
