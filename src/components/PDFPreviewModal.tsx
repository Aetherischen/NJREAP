
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, ExternalLink, AlertCircle, FileText } from "lucide-react";

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title?: string;
}

const PDFPreviewModal = ({ isOpen, onClose, pdfUrl, title = "PDF Preview" }: PDFPreviewModalProps) => {
  const [showFallback, setShowFallback] = useState(false);

  // Auto-detect if PDF preview will fail and show fallback immediately
  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setShowFallback(false);
      
      // Check if we're likely to hit sandbox issues by testing the domain
      const isExternalDomain = !pdfUrl.includes(window.location.hostname);
      if (isExternalDomain) {
        // Delay showing fallback to allow brief attempt at loading
        const timer = setTimeout(() => {
          setShowFallback(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, pdfUrl]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'sample-appraisal-report.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const handleEmbedError = () => {
    console.log('PDF embed failed, switching to fallback');
    setShowFallback(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-full h-full flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleOpenInNewTab}
                size="sm"
                variant="outline"
                className="border-[#4d0a97] text-[#4d0a97] hover:bg-[#4d0a97] hover:text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
              <Button
                onClick={handleDownload}
                size="sm"
                className="bg-[#4d0a97] hover:bg-[#a044e3]"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button
                onClick={onClose}
                size="sm"
                variant="outline"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 p-6">
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
            {!showFallback ? (
              <div className="w-full h-full relative">
                <div className="text-center p-4 text-gray-600">
                  <div className="animate-spin w-8 h-8 border-2 border-[#4d0a97] border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Loading PDF preview...</p>
                </div>
                <object
                  data={pdfUrl}
                  type="application/pdf"
                  className="w-full h-full rounded-lg absolute inset-0"
                  onError={handleEmbedError}
                  style={{ display: showFallback ? 'none' : 'block' }}
                >
                  <embed
                    src={pdfUrl}
                    type="application/pdf"
                    className="w-full h-full rounded-lg"
                    onError={handleEmbedError}
                  />
                </object>
              </div>
            ) : (
              <div className="text-center p-8 max-w-md">
                <div className="mb-6">
                  <FileText className="w-20 h-20 text-[#4d0a97] mx-auto mb-4" />
                  <AlertCircle className="w-8 h-8 text-orange-500 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  PDF Preview Not Available
                </h3>
                <p className="text-gray-600 mb-6">
                  Your browser has blocked the PDF preview for security reasons. 
                  You can still view or download the PDF using the buttons below.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={handleOpenInNewTab}
                    className="bg-[#4d0a97] hover:bg-[#a044e3] w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View PDF in New Tab
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="border-[#4d0a97] text-[#4d0a97] hover:bg-[#4d0a97] hover:text-white w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFPreviewModal;
