import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Building2, ArrowRightLeft, AlertTriangle, CheckCircle, X, Info } from 'lucide-react';
import { PLANT_STORE_MAP } from '@/contexts/PlantContext';

const PlantSwitcherGuide = () => {
  const componentRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Plant Switcher Training Guide - Conlan Tire',
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header with Print Button */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Plant Switcher Training Guide</h1>
            <p className="text-muted-foreground">
              Complete guide for store managers on switching plants in the ordering system
            </p>
          </div>
          <Button onClick={handlePrint} className="gap-2" size="lg">
            <Download className="h-4 w-4" />
            Download PDF Guide
          </Button>
        </div>

        {/* Printable Content */}
        <div ref={componentRef} className="space-y-8 print:space-y-6">
          {/* Page 1: Title & Introduction */}
          <Card className="print:shadow-none print:border-2">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-4">
                <img 
                  src="/lovable-uploads/fedbf726-afa3-477f-97ef-fa62b213c003.png" 
                  alt="Conlan Tire Logo" 
                  className="h-16 mx-auto object-contain" 
                />
              </div>
              <CardTitle className="text-4xl font-bold text-primary mb-4">
                How to Switch Plants on the Conlan Tire Ordering Platform
              </CardTitle>
              <CardDescription className="text-xl">
                A Complete Guide for Store Managers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="p-6 bg-primary/10 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3">Purpose of This Guide</h3>
                  <p className="text-muted-foreground">
                    Plant switching ensures your orders reach the correct warehouse for faster processing. 
                    This guide will teach you how to properly switch plants and understand the impact on your orders.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <h4 className="font-medium mb-2 text-green-700 dark:text-green-300">✅ Key Benefits</h4>
                    <ul className="text-sm space-y-1 text-left text-muted-foreground">
                      <li>• Faster order processing</li>
                      <li>• Reduced shipping delays</li>
                      <li>• Proper inventory allocation</li>
                      <li>• Cost-effective routing</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-300">🎯 Why It Matters</h4>
                    <ul className="text-sm space-y-1 text-left text-muted-foreground">
                      <li>• Orders sent to wrong plants cause delays</li>
                      <li>• Cross-plant fees may apply</li>
                      <li>• Inventory availability varies by plant</li>
                      <li>• Regional shipping optimization</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="print:break-before-page">
            {/* Page 2: Understanding Plant System */}
            <Card className="print:shadow-none print:border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  Understanding the Plant System
                </CardTitle>
                <CardDescription>
                  Learn about the three main warehouses and their coverage areas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {Object.entries(PLANT_STORE_MAP).map(([plant, stores], index) => {
                    const colors = ['blue', 'green', 'orange'];
                    const color = colors[index];
                    return (
                      <div key={plant} className={`p-4 bg-${color}-50 dark:bg-${color}-950/20 rounded-lg border-2 border-${color}-200 dark:border-${color}-800`}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-4 h-4 rounded-full bg-${color}-500`} />
                          <h3 className={`font-bold text-${color}-700 dark:text-${color}-300`}>{plant}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Serves {stores.length} stores:</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {stores.map((store) => (
                            <Badge key={store} variant="secondary" className="text-xs mr-1 mb-1">
                              {store}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border-l-4 border-amber-500">
                  <h4 className="font-medium mb-2 text-amber-700 dark:text-amber-300">⚠️ Important Note</h4>
                  <p className="text-sm text-muted-foreground">
                    Always ensure your plant selection matches your store's designated warehouse. 
                    Cross-plant orders may incur additional fees and processing time.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="print:break-before-page">
            {/* Page 3: Locating the Plant Switcher */}
            <Card className="print:shadow-none print:border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-6 w-6 text-primary" />
                  Locating the Plant Switcher
                </CardTitle>
                <CardDescription>
                  Find the Plant Switcher on your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                    <h3 className="font-semibold mb-2">📍 Location</h3>
                    <p className="text-muted-foreground mb-3">
                      The Plant Switcher is located in the top-right corner of your dashboard, featuring a distinctive glowing blue border.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-300">🔍 Visual Identity</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Glassy dark background</li>
                        <li>• Pulsating blue neon border</li>
                        <li>• "Choose Plant" header</li>
                        <li>• Current plant indicator with colored dot</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <h4 className="font-medium mb-2 text-green-700 dark:text-green-300">📱 Components</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Current Plant display</li>
                        <li>• Default Plant information</li>
                        <li>• Plant selection dropdown</li>
                        <li>• Cross-Plant warning badge</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-300/30">
                    <h4 className="font-medium mb-2">Plant Switcher Preview</h4>
                    <div className="bg-black/40 p-4 rounded-lg border border-blue-400/30 relative">
                      <div className="absolute inset-0 border border-blue-400/60 rounded-lg animate-pulse"></div>
                      <h5 className="text-white font-bold mb-2">Choose Plant</h5>
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-blue-400" />
                        <span className="text-gray-300 text-sm">Current Plant</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-white font-semibold">Grand Prairie 97</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Default Plant: <span className="text-blue-300">Grand Prairie 97</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="print:break-before-page">
            {/* Page 4: Step-by-Step Instructions */}
            <Card className="print:shadow-none print:border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="h-6 w-6 text-primary" />
                  How to Switch Plants - Step by Step
                </CardTitle>
                <CardDescription>
                  Follow these detailed instructions to switch plants safely
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                    <h4 className="font-medium mb-2">Step 1: Locate the Plant Switcher</h4>
                    <p className="text-sm text-muted-foreground">
                      Find the glowing blue "Choose Plant" box in the top-right corner of your dashboard.
                    </p>
                  </div>
                  
                  <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                    <h4 className="font-medium mb-2">Step 2: Click the Dropdown</h4>
                    <p className="text-sm text-muted-foreground">
                      Click on the dropdown menu labeled "Switch to:" to see all available plants.
                    </p>
                  </div>
                  
                  <div className="p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                    <h4 className="font-medium mb-2">Step 3: Select Your Target Plant</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Choose from the three available options:
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                      <li>• <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>Grand Prairie 97 (Texas/Oklahoma region)</li>
                      <li>• <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>Romulus 98 (Michigan/Ohio region)</li>
                      <li>• <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-2"></span>Mulberry 99 (Florida/Louisiana region)</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950/20">
                    <h4 className="font-medium mb-2">Step 4: Review Confirmation Dialog</h4>
                    <p className="text-sm text-muted-foreground">
                      A confirmation dialog will appear explaining the impact of switching plants on your order routing.
                    </p>
                  </div>
                  
                  <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20">
                    <h4 className="font-medium mb-2">Step 5: Confirm or Cancel</h4>
                    <p className="text-sm text-muted-foreground">
                      Click "Confirm Switch" to proceed, or "Cancel" to abort the plant change.
                    </p>
                  </div>
                  
                  <div className="p-4 border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20">
                    <h4 className="font-medium mb-2">Step 6: Verify Success</h4>
                    <p className="text-sm text-muted-foreground">
                      Look for the green success message: "✅ Plant Switched Successfully"
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-300">
                  <h4 className="font-medium mb-2 text-amber-700 dark:text-amber-300">⏱️ Processing Time</h4>
                  <p className="text-sm text-muted-foreground">
                    Plant switches are immediate and will affect all new orders. The change is saved across all your devices and browser sessions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="print:break-before-page">
            {/* Page 5: Warnings & Confirmations */}
            <Card className="print:shadow-none print:border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                  Understanding Warnings & Confirmations
                </CardTitle>
                <CardDescription>
                  Learn about the safety features that protect your orders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-orange-700 dark:text-orange-300">🔶 Cross-Plant Warning</h3>
                    <div className="p-3 bg-orange-100 border-l-4 border-orange-500 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">Cross-Plant Order Alert</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        You're ordering from <strong>Romulus 98</strong> instead of your default plant (<strong>Grand Prairie 97</strong>).
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This orange banner appears when you're ordering from a different plant than your default assignment.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-blue-700 dark:text-blue-300">🔷 Confirmation Dialog</h3>
                    <div className="p-3 bg-blue-100 border border-blue-300 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Plant Switch Confirmation</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        You're switching from <strong>Grand Prairie 97</strong> to <strong>Romulus 98</strong>. 
                        This will affect which plant processes your orders.
                      </p>
                      <div className="flex gap-2">
                        <button className="px-2 py-1 bg-blue-600 text-white text-xs rounded">Confirm Switch</button>
                        <button className="px-2 py-1 border border-gray-400 text-xs rounded">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-green-700 dark:text-green-300">✅ Success Confirmation</h3>
                    <div className="p-3 bg-green-100 border-l-4 border-green-500 rounded">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Plant Switched Successfully</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Switched to Romulus 98</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Green toast notification confirms your plant switch was successful.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">🏠 Default Plant Indicator</h3>
                    <div className="p-3 bg-gray-100 border border-gray-300 rounded">
                      <div className="text-sm text-muted-foreground">
                        Default Plant: <span className="text-blue-600 font-medium">Grand Prairie 97</span>
                      </div>
                      <button className="text-xs text-blue-600 underline mt-1">Switch back to default</button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Quick link to return to your assigned default plant.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="print:break-before-page">
            {/* Page 6: What Happens After Switching */}
            <Card className="print:shadow-none print:border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  What Happens After Switching
                </CardTitle>
                <CardDescription>
                  Understanding the impact of plant changes on your orders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="font-medium mb-3 text-blue-700 dark:text-blue-300">🔄 Order Routing</h4>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• All new orders route to selected plant's systems</li>
                      <li>• Webhook endpoints automatically update</li>
                      <li>• Processing workflows adjust to new plant</li>
                      <li>• Inventory systems sync with selection</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <h4 className="font-medium mb-3 text-green-700 dark:text-green-300">💾 Persistent Selection</h4>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Choice saved across browser sessions</li>
                      <li>• Persists through page refreshes</li>
                      <li>• Maintains selection on logout/login</li>
                      <li>• Stored in your user preferences</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <h4 className="font-medium mb-3 text-purple-700 dark:text-purple-300">🌐 Cross-Device Sync</h4>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Syncs across all your devices</li>
                      <li>• Updates on tablet and desktop</li>
                      <li>• Consistent experience everywhere</li>
                      <li>• Real-time synchronization</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <h4 className="font-medium mb-3 text-orange-700 dark:text-orange-300">📊 Audit Logging</h4>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• All switches tracked for compliance</li>
                      <li>• Timestamps and reasons recorded</li>
                      <li>• Available for admin review</li>
                      <li>• Helps with troubleshooting</li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <h4 className="font-medium mb-2 text-indigo-700 dark:text-indigo-300">⚡ Immediate Effect</h4>
                  <p className="text-sm text-muted-foreground">
                    Plant switches take effect immediately. Any orders submitted after switching will be processed by the newly selected plant. 
                    Orders already in progress will continue with their original plant assignment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="print:break-before-page">
            {/* Page 7: Best Practices */}
            <Card className="print:shadow-none print:border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Best Practices & Important Reminders
                </CardTitle>
                <CardDescription>
                  Follow these guidelines for optimal plant switching
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      ✅ DO These Things
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded border-l-2 border-green-500">
                        <h4 className="font-medium text-sm mb-1">Always Verify Plant Selection</h4>
                        <p className="text-xs text-muted-foreground">Check the colored plant indicator before submitting orders</p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded border-l-2 border-green-500">
                        <h4 className="font-medium text-sm mb-1">Return to Default When Done</h4>
                        <p className="text-xs text-muted-foreground">Switch back to your home plant after cross-plant orders</p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded border-l-2 border-green-500">
                        <h4 className="font-medium text-sm mb-1">Check Color Indicators</h4>
                        <p className="text-xs text-muted-foreground">Use the colored dots to quickly identify your current plant</p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded border-l-2 border-green-500">
                        <h4 className="font-medium text-sm mb-1">Read Confirmation Dialogs</h4>
                        <p className="text-xs text-muted-foreground">Always review impact warnings before confirming switches</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                      <X className="h-5 w-5" />
                      ❌ DON'T Do These Things
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded border-l-2 border-red-500">
                        <h4 className="font-medium text-sm mb-1">Don't Submit Without Checking</h4>
                        <p className="text-xs text-muted-foreground">Never submit orders without verifying plant alignment</p>
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded border-l-2 border-red-500">
                        <h4 className="font-medium text-sm mb-1">Don't Leave Plant Switched</h4>
                        <p className="text-xs text-muted-foreground">Avoid leaving plant set to wrong location permanently</p>
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded border-l-2 border-red-500">
                        <h4 className="font-medium text-sm mb-1">Don't Ignore Warnings</h4>
                        <p className="text-xs text-muted-foreground">Pay attention to cross-plant warning banners</p>
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded border-l-2 border-red-500">
                        <h4 className="font-medium text-sm mb-1">Don't Switch Unnecessarily</h4>
                        <p className="text-xs text-muted-foreground">Only switch plants when you have a valid business reason</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-300">
                  <h4 className="font-medium mb-2 text-amber-700 dark:text-amber-300">💡 Pro Tips</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Use the "Switch back to default" quick link</li>
                      <li>• Check plant coverage before switching</li>
                      <li>• Monitor for cross-plant fees in your orders</li>
                    </ul>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Coordinate with warehouse managers for large orders</li>
                      <li>• Keep track of inventory levels across plants</li>
                      <li>• Document reasons for frequent cross-plant orders</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="print:break-before-page">
            {/* Page 8: Examples & Troubleshooting */}
            <Card className="print:shadow-none print:border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                  Examples & Troubleshooting
                </CardTitle>
                <CardDescription>
                  Real-world scenarios and common issues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-green-700 dark:text-green-300">✅ Good Example</h3>
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-300">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Fort Worth 22</Badge>
                          <span className="text-sm">Store Manager</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm font-medium">Plant: Grand Prairie 97</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ✅ Correct: Fort Worth 22 is served by Grand Prairie 97. 
                          Orders will process normally with standard shipping.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-red-700 dark:text-red-300">❌ Bad Example</h3>
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-300">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Fort Worth 22</Badge>
                          <span className="text-sm">Store Manager</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium">Plant: Romulus 98</span>
                          <X className="h-4 w-4 text-red-500" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ❌ Incorrect: Fort Worth should use Grand Prairie 97. 
                          This will cause delays and potential cross-plant fees.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-amber-700 dark:text-amber-300">🔧 Common Issues & Solutions</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border-l-4 border-amber-500">
                      <h4 className="font-medium mb-2">Issue: Orders Taking Longer Than Expected</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Possible Cause:</strong> Order routed to wrong plant due to incorrect plant selection.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Solution:</strong> Check your plant selection matches your store's designated warehouse. 
                        Contact warehouse manager if orders were sent to wrong plant.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border-l-4 border-red-500">
                      <h4 className="font-medium mb-2">Issue: Unexpected Cross-Plant Fees</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Possible Cause:</strong> Inadvertently switched to non-default plant before ordering.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Solution:</strong> Always verify plant selection before submitting orders. 
                        Use "Switch back to default" link to return to your assigned plant.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-medium mb-2">Issue: Plant Switcher Not Visible</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Possible Cause:</strong> Browser compatibility or caching issues.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Solution:</strong> Refresh the page (Ctrl+F5), clear browser cache, 
                        or try a different browser. Contact IT support if issue persists.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2">📞 Getting Help</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Technical Issues:</strong></p>
                      <p className="text-muted-foreground">Contact IT Support at extension 1234</p>
                    </div>
                    <div>
                      <p><strong>Order Questions:</strong></p>
                      <p className="text-muted-foreground">Contact your Warehouse Manager</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="print:break-before-page">
            {/* Page 9: Quick Reference */}
            <Card className="print:shadow-none print:border-2">
              <CardHeader>
                <CardTitle>Quick Reference Card</CardTitle>
                <CardDescription>
                  Keep this page handy for quick lookups
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-primary">Plant Coverage Summary</h3>
                    <div className="space-y-2">
                      {Object.entries(PLANT_STORE_MAP).map(([plant, stores], index) => {
                        const colors = ['blue', 'green', 'orange'];
                        const color = colors[index];
                        return (
                          <div key={plant} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
                            <span className="font-medium">{plant}</span>
                            <Badge variant="outline" className="ml-auto">
                              {stores.length} stores
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-primary">Quick Steps Checklist</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Locate glowing blue "Choose Plant" box</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Click "Switch to:" dropdown</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Select target plant</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Review confirmation dialog</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Click "Confirm Switch"</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Verify success message</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                    <h4 className="font-medium mb-2 text-amber-700 dark:text-amber-300">⚠️ Remember</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Always check plant before ordering</li>
                      <li>• Cross-plant orders may have fees</li>
                      <li>• Return to default when done</li>
                      <li>• Changes sync across devices</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-300">📞 Support Contacts</h4>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p><strong>IT Support:</strong> ext. 1234</p>
                      <p><strong>Warehouse:</strong> Contact your manager</p>
                      <p><strong>Training:</strong> Available in Settings</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantSwitcherGuide;