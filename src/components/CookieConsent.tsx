import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Small delay to avoid flash on page load
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookieConsent", JSON.stringify({
      essential: true,
      analytics: true,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const acceptEssential = () => {
    localStorage.setItem("cookieConsent", JSON.stringify({
      essential: true,
      analytics: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Main Banner */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Cookie className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Vi använder cookies 🍪
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                VasaBonus använder cookies för att hålla dig inloggad och förbättra din upplevelse. 
                Nödvändiga cookies krävs för att tjänsten ska fungera. Du kan läsa mer i vår{" "}
                <a href="/privacy" className="text-purple-600 hover:underline">integritetspolicy</a>.
              </p>
              
              {/* Details Section */}
              {showDetails && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Nödvändiga cookies</p>
                      <p className="text-xs text-gray-500">Krävs för inloggning och grundläggande funktioner</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Alltid aktiva</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Analys-cookies</p>
                      <p className="text-xs text-gray-500">Hjälper oss förstå hur tjänsten används</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Valfria</span>
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowBanner(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Stäng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button 
              onClick={acceptAll}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              Acceptera alla
            </Button>
            <Button 
              variant="outline" 
              onClick={acceptEssential}
              className="border-purple-200 hover:bg-purple-50"
            >
              Endast nödvändiga
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-600 hover:text-gray-900"
            >
              {showDetails ? "Dölj detaljer" : "Visa detaljer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
