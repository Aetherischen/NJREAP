import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, ExternalLink, X, AlertTriangle } from 'lucide-react';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title?: string;
}

const PDFPreviewModal = ({ isOpen, onClose, pdfUrl, title = "PDF Preview" }: PDFPreviewModalProps) => {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowFallback(false);
      // Set a timeout to show fallback if PDF doesn't load (likely due to CORS/sandboxing)
      const timeout = setTimeout(() => {
        if (pdfUrl.startsWith('http') && !pdfUrl.includes(window.location.origin)) {
          setShowFallback(true);
        }
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [isOpen, pdfUrl]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  const handleEmbedError = () => {
    setShowFallback(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
          {!showFallback ? (
            <div className="w-full h-full bg-muted rounded-lg overflow-hidden">
              <object
                data={pdfUrl}
                type="application/pdf"
                width="100%"
                height="100%"
                className="w-full h-full"
                onError={handleEmbedError}
              >
                <embed
                  src={pdfUrl}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                  onError={handleEmbedError}
                />
              </object>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-center p-8">
              <AlertTriangle className="w-16 h-16 text-yellow-500" />
              <h3 className="text-lg font-semibold">PDF Preview Not Available</h3>
              <p className="text-muted-foreground max-w-md">
                This PDF cannot be displayed in the browser due to security restrictions. 
                You can still download it or open it in a new tab.
              </p>
              <div className="flex space-x-3 mt-6">
                <Button onClick={handleOpenInNewTab} className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </Button>
                <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFPreviewModal;