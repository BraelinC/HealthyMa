import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HandPlatter, Download, Share2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CreatorFlyer() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copied!",
        description: "Flyer link has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      {/* Print Controls */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full">
              <HandPlatter className="text-white h-5 w-5" />
            </div>
            <span className="font-semibold text-gray-900">Creator Flyer</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Print/Save
            </Button>
          </div>
        </div>
      </div>

      {/* Flyer Content */}
      <div className="max-w-4xl mx-auto p-4 print:p-0">
        <Card className="bg-white shadow-2xl border-0 overflow-hidden print:shadow-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white p-8 relative">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                <HandPlatter className="text-white h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Healthy Mama</h2>
                <p className="text-purple-100 text-sm">Communities Built Around Food</p>
              </div>
            </div>

            {/* Main Headline */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Build. Monetize. Grow.
                <br />
                <span className="text-emerald-300">Your Own Food & Fitness Community.</span>
              </h1>
              <p className="text-xl text-purple-100 mb-6 max-w-2xl mx-auto">
                Turn your nutrition expertise into recurring income — inside an app designed for creators.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold text-emerald-300">80-90%</div>
                  <div className="text-sm text-purple-200">Revenue Share</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold text-emerald-300">$500+</div>
                  <div className="text-sm text-purple-200">Guaranteed First Month</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold text-emerald-300">100%</div>
                  <div className="text-sm text-purple-200">Content Control</div>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            {/* Mockup Section */}
            <div className="grid md:grid-cols-2 gap-8 mb-8 items-center">
              {/* Phone Mockup */}
              <div className="bg-gray-900 rounded-3xl p-6 shadow-2xl">
                <div className="bg-gray-800 rounded-2xl p-4 h-96 overflow-hidden">
                  {/* App Header */}
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        SJ
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">Sarah's Kitchen</div>
                        <div className="text-gray-400 text-xs">2,847 subscribers</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      $3,240/mo
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-4 mb-4 text-xs">
                    <span className="text-emerald-400 border-b-2 border-emerald-400 pb-1">Community</span>
                    <span className="text-gray-400">Meal Plans</span>
                    <span className="text-gray-400">Calendar</span>
                  </div>

                  {/* Create Course Button */}
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-center py-2 rounded-lg mb-4 text-sm font-semibold">
                    + Create New Course
                  </div>

                  {/* Course Cards */}
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-4 relative overflow-hidden">
                      <div className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs">
                        Published
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-1">Mediterranean Meal Prep</h3>
                      <p className="text-purple-200 text-xs mb-2">5-day healthy meal planning</p>
                      <div className="flex justify-between text-xs text-purple-200">
                        <span>89 students</span>
                        <span>$890/mo</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-4">
                      <h3 className="text-white font-semibold text-sm mb-1">Plant-Based Protein</h3>
                      <p className="text-emerald-200 text-xs mb-2">Complete protein guide</p>
                      <div className="flex justify-between text-xs text-emerald-200">
                        <span>156 students</span>
                        <span>$1,560/mo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits List */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Why Creators Choose Us</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                    <span className="text-2xl">💰</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Highest Revenue Share</h4>
                      <p className="text-gray-600 text-sm">Keep 80-90% of your earnings with transparent, creator-first pricing.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-lg">
                    <span className="text-2xl">🚀</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Built-in Audience</h4>
                      <p className="text-gray-600 text-sm">Tap into our growing community of health-conscious users actively seeking nutrition guidance.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <span className="text-2xl">🛠️</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Creator-First Tools</h4>
                      <p className="text-gray-600 text-sm">AI-powered meal planning, community features, and analytics designed specifically for nutrition creators.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Zero Setup Hassle</h4>
                      <p className="text-gray-600 text-sm">Start earning in days, not months. We handle payments, hosting, and technical infrastructure.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guarantee Section */}
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-xl p-6 text-center mb-8">
              <div className="text-xl font-bold text-yellow-800 mb-2">
                🎯 Creator Success Guarantee
              </div>
              <p className="text-yellow-700">
                We're so confident in our platform, we guarantee $500+ in your first month or we'll work with you until you get there.
              </p>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white rounded-xl p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Build Your Empire?</h2>
              <p className="text-purple-100 mb-6 text-lg">
                Join the nutrition creators already earning $1,000+ per month on Healthy Mama.
              </p>
              
              <div className="space-y-4">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Start Creating Today →
                </Button>
                
                <div className="flex justify-center gap-8 text-sm text-purple-200">
                  <span>✓ No monthly fees</span>
                  <span>✓ Instant setup</span>
                  <span>✓ 24/7 creator support</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { margin: 0; }
          .print\\:hidden { display: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}