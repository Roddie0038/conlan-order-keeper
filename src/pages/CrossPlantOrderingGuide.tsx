import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Building2, Users, Truck, Calendar, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { STORES } from '@/lib/stores';

const CrossPlantOrderingGuide = () => {
  const componentRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Cross-Plant Ordering Training Guide - Conlan Tire',
  });

  // Group stores by plant for display
  const storesByPlant = STORES.reduce((acc, store) => {
    if (!acc[store.plant]) acc[store.plant] = [];
    acc[store.plant].push(store);
    return acc;
  }, {} as Record<string, typeof STORES>);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header with Print Button */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Cross-Plant Ordering Training Guide</h1>
            <p className="text-muted-foreground">
              Complete guide for elevated users on submitting orders for other plants and stores
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
                Cross-Plant Ordering Training Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="p-6 bg-primary/10 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3">Purpose of This Guide</h3>
                  <p className="text-muted-foreground">
                    As an elevated user, you have the ability to submit orders on behalf of any store or plant. 
                    This guide will show you how to use the Acting-As feature and cross-plant ordering capabilities.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-300">👑 Elevated Roles</h4>
                    <ul className="text-sm space-y-1 text-left text-muted-foreground">
                      <li>• Admin</li>
                      <li>• Super Admin</li>
                      <li>• Operations Manager</li>
                      <li>• Brad Perry (special access)</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <h4 className="font-medium mb-2 text-green-700 dark:text-green-300">🎯 What You Can Do</h4>
                    <ul className="text-sm space-y-1 text-left text-muted-foreground">
                      <li>• Order for any store</li>
                      <li>• Order for any plant</li>
                      <li>• Override email addresses</li>
                      <li>• Use "Unassigned" source</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <h4 className="font-medium mb-2 text-orange-700 dark:text-orange-300">⚡ Key Features</h4>
                    <ul className="text-sm space-y-1 text-left text-muted-foreground">
                      <li>• Acting-As store selector</li>
                      <li>• Plant-to-plant transfers</li>
                      <li>• Carrier selection</li>
                      <li>• Arrival date scheduling</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="print:break-before-page">
            {/* Page 2: Store Directory */}
            <Card className="print:shadow-none print:border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  Store & Plant Directory
                </CardTitle>
                <CardDescription>
                  Complete listing of all stores available in the ordering system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(storesByPlant).map(([plant, stores], index) => {
                  const colors = ['blue', 'green', 'orange'];
                  const color = colors[index] || 'gray';
                  return (
                    <div key={plant} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full bg-${color}-500`} />
                        <h3 className={`font-bold text-lg text-${color}-700 dark:text-${color}-300`}>
                          {plant}
                        </h3>
                        <Badge variant="secondary" className="ml-2">
                          {stores.length} stores
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {stores.map((store) => (
                          <Badge key={store.name} variant="outline" className="text-xs justify-start">
                            {store.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border-l-4 border-amber-500">
                  <h4 className="font-medium mb-2 text-amber-700 dark:text-amber-300">💡 Pro Tip</h4>
                  <p className="text-sm text-muted-foreground">
                    When typing in store selectors, you can search by city name or store code. 
                    The system will automatically normalize entries to "City 0XX" format.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="print:break-before-page">
            {/* Page 3: Acting-As Feature */}
            <Card className="print:shadow-none print:border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Using the "Acting-As (Source Store)" Feature
                </CardTitle>
                <CardDescription>
                  How to submit orders on behalf of other stores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                    <h4 className="font-medium mb-2">Step 1: Locate the Acting-As Selector</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      On MTO Orders, Standard Orders, and Wheel Orders, you'll see an "Ordering as (Source Store)" dropdown.
                    </p>
                    <div className="bg-card border rounded p-3 mt-2">
                      <div className="text-sm font-medium mb-1">Ordering as (Source Store)</div>
                      <div className="border rounded px-3 py-2 text-sm bg-muted/50">
                        Select or type a store… ▼
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Elevated access: all stores visible. Manual entry allowed; type a city or code and press Enter. Tip: type "unassigned".
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                    <h4 className="font-medium mb-2">Step 2: Search and Select</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Type to search by city name or store code. The dropdown will show matching stores.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <div className="text-xs font-medium mb-1">Search Examples:</div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Type "tampa" → Shows Tampa stores</li>
                          <li>• Type "006" → Shows Tampa 006</li>
                          <li>• Type "unassigned" → Shows Unassigned 000</li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-medium mb-1">What You'll See:</div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Store name (e.g., "Tampa 006")</li>
                          <li>• Associated plant name</li>
                          <li>• "Use [typed text]" option</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                    <h4 className="font-medium mb-2">Step 3: Special "Unassigned" Option</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      For orders not tied to a specific store, type "unassigned" to select "Unassigned 000".
                    </p>
                    <div className="bg-orange-100 dark:bg-orange-900/30 border border-orange-300 rounded p-2 text-xs">
                      <strong>Note:</strong> "Unassigned 000" is only available for the Acting-As field, never for destination stores.
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-300/30">
                  <h4 className="font-medium mb-2">Acting-As Badge Display</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    When you select an Acting-As store, you'll see a badge confirming your selection:
                  </p>
                  <div className="inline-flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Acting as: <span className="font-semibold ml-1">Tampa 006</span>
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="print:break-before-page">
            {/* Page 4: Transfer Routes */}
            <Card className="print:shadow-none print:border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-6 w-6 text-primary" />
                  Transfer Routes & Destinations
                </CardTitle>
                <CardDescription>
                  Understanding the four types of transfer routes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-blue-700 dark:text-blue-300">📍 Destination Required Routes</h3>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
                      <h4 className="font-medium mb-2">Store → Store</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Shipping from one store location to another store location.
                      </p>
                      <div className="text-xs bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                        ✅ Destination store required<br/>
                        ✅ Must be in "City 0XX" format<br/>
                        ❌ Cannot use "Unassigned"
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                      <h4 className="font-medium mb-2">Plant → Store</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Shipping from a plant warehouse directly to a store location.
                      </p>
                      <div className="text-xs bg-green-100 dark:bg-green-900/30 p-2 rounded">
                        ✅ Destination store required<br/>
                        ✅ Must be in "City 0XX" format<br/>
                        ❌ Cannot use "Unassigned"
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-orange-700 dark:text-orange-300">🏭 Plant-Only Routes</h3>
                    
                    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200">
                      <h4 className="font-medium mb-2">Store → Plant</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Shipping from a store location to a plant warehouse.
                      </p>
                      <div className="text-xs bg-orange-100 dark:bg-orange-900/30 p-2 rounded">
                        ⚠️ Destination store optional<br/>
                        ✅ Plant handles routing<br/>
                        ✅ Can leave destination empty
                      </div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200">
                      <h4 className="font-medium mb-2">Plant → Plant</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Direct transfer between plant warehouses.
                      </p>
                      <div className="text-xs bg-purple-100 dark:bg-purple-900/30 p-2 rounded">
                        ⚠️ Destination store optional<br/>
                        ✅ Inter-plant logistics<br/>
                        ✅ Can leave destination empty
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border-l-4 border-amber-500">
                  <h4 className="font-medium mb-2 text-amber-700 dark:text-amber-300">⚠️ Important Validation Rules</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Destination Store Validation:</strong> Only enforced for routes ending in "Store"</li>
                    <li>• <strong>City 0XX Format:</strong> Required when destination store is specified</li>
                    <li>• <strong>Unassigned Restriction:</strong> "Unassigned 000" never allowed as destination</li>
                    <li>• <strong>Plant Routes:</strong> System automatically handles routing when destination is optional</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="print:break-before-page">
            {/* Page 5: Carriers and Arrival Dates */}
            <Card className="print:shadow-none print:border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  Carriers & Arrival Date Scheduling
                </CardTitle>
                <CardDescription>
                  How to specify shipping carriers and requested arrival dates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-blue-700 dark:text-blue-300">🚛 Available Carriers</h3>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200">
                        <h4 className="font-medium text-sm">Central Transport</h4>
                        <p className="text-xs text-muted-foreground">Primary shipping partner for long-haul routes</p>
                      </div>
                      
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200">
                        <h4 className="font-medium text-sm">PAM Transport</h4>
                        <p className="text-xs text-muted-foreground">Specialized transport for regional deliveries</p>
                      </div>
                      
                      <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200">
                        <h4 className="font-medium text-sm">Company Truck</h4>
                        <p className="text-xs text-muted-foreground">Internal fleet for local and direct deliveries</p>
                      </div>
                      
                      <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded border border-purple-200">
                        <h4 className="font-medium text-sm">Third-Party</h4>
                        <p className="text-xs text-muted-foreground">External carrier arrangements</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-green-700 dark:text-green-300">📅 Arrival Date Selection</h3>
                    
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <h4 className="font-medium mb-2">Requested Arrival Date</h4>
                      <div className="border rounded px-3 py-2 text-sm bg-background mb-2">
                        <input type="date" className="w-full bg-transparent" placeholder="Select date..." />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Specify when you need the order to arrive at the destination. This helps with logistics planning.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-300">
                      <h4 className="text-sm font-medium text-amber-700 dark:text-amber-300">💡 Best Practices</h4>
                      <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                        <li>• Allow 3-5 business days for standard delivery</li>
                        <li>• Consider carrier availability for your route</li>
                        <li>• Account for processing time at origin plant</li>
                        <li>• Coordinate with destination store for receiving</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg border border-blue-300/30">
                  <h4 className="font-medium mb-2">Form Fields Preview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-1">Carrier</label>
                      <div className="border rounded px-3 py-2 text-sm bg-background">
                        Select carrier... ▼
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Requested Arrival Date</label>
                      <div className="border rounded px-3 py-2 text-sm bg-background">
                        mm/dd/yyyy
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="print:break-before-page">
            {/* Page 6: Step-by-Step Workflow */}
            <Card className="print:shadow-none print:border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  Complete Ordering Workflow
                </CardTitle>
                <CardDescription>
                  Step-by-step process for submitting cross-plant orders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                    <h4 className="font-medium mb-2">Step 1: Choose Order Type</h4>
                    <p className="text-sm text-muted-foreground">
                      Select MTO Order, Standard Order, or Wheel Order from the main navigation.
                    </p>
                  </div>
                  
                  <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                    <h4 className="font-medium mb-2">Step 2: Set Acting-As Store</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Use the "Ordering as (Source Store)" dropdown to select which store you're ordering for.
                    </p>
                    <ul className="text-xs text-muted-foreground ml-4 space-y-1">
                      <li>• Type store name or code to search</li>
                      <li>• Select from the dropdown list</li>
                      <li>• Use "unassigned" for non-store orders</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                    <h4 className="font-medium mb-2">Step 3: Select Transfer Route</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Choose the appropriate transfer route from the dropdown:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>• Store → Store</div>
                      <div>• Store → Plant</div>
                      <div>• Plant → Store</div>
                      <div>• Plant → Plant</div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950/20">
                    <h4 className="font-medium mb-2">Step 4: Set Destination (If Required)</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      For Store→Store and Plant→Store routes, specify the destination store:
                    </p>
                    <ul className="text-xs text-muted-foreground ml-4 space-y-1">
                      <li>• Must be a real store in "City 0XX" format</li>
                      <li>• Cannot use "Unassigned" as destination</li>
                      <li>• Type city name or code to search</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20">
                    <h4 className="font-medium mb-2">Step 5: Select Carrier & Date</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose a carrier (Central Transport, PAM Transport, etc.) and set the requested arrival date.
                    </p>
                  </div>
                  
                  <div className="p-4 border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20">
                    <h4 className="font-medium mb-2">Step 6: Complete Order Details</h4>
                    <p className="text-sm text-muted-foreground">
                      Fill in all remaining order details (products, quantities, etc.) and submit the order.
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-300/30">
                  <h4 className="font-medium mb-2 text-green-700 dark:text-green-300">✅ Success Indicators</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Acting-As badge displays selected store</li>
                    <li>• Cross-plant warning appears if ordering from different plant</li>
                    <li>• Form validation passes for all required fields</li>
                    <li>• Order submission confirmation received</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="print:break-before-page">
            {/* Page 7: Quick Reference */}
            <Card className="print:shadow-none print:border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-6 w-6 text-primary" />
                  Quick Reference & Troubleshooting
                </CardTitle>
                <CardDescription>
                  At-a-glance guide for common scenarios and issues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-blue-700 dark:text-blue-300">📋 Field Requirements by Route</h3>
                    
                    <div className="overflow-hidden rounded-lg border">
                      <table className="w-full text-xs">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-2 text-left">Route</th>
                            <th className="p-2 text-center">Destination Required</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t">
                            <td className="p-2">Store → Store</td>
                            <td className="p-2 text-center text-green-600">✅ Yes</td>
                          </tr>
                          <tr className="border-t bg-muted/50">
                            <td className="p-2">Store → Plant</td>
                            <td className="p-2 text-center text-orange-600">⚠️ Optional</td>
                          </tr>
                          <tr className="border-t">
                            <td className="p-2">Plant → Store</td>
                            <td className="p-2 text-center text-green-600">✅ Yes</td>
                          </tr>
                          <tr className="border-t bg-muted/50">
                            <td className="p-2">Plant → Plant</td>
                            <td className="p-2 text-center text-orange-600">⚠️ Optional</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-green-700 dark:text-green-300">🔧 Common Issues & Solutions</h3>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded border border-red-200">
                        <h4 className="text-sm font-medium text-red-700 dark:text-red-300">Dropdown Not Visible</h4>
                        <p className="text-xs text-muted-foreground">Solution: Click outside dropdown area and try again. Dropdown uses portal positioning.</p>
                      </div>
                      
                      <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200">
                        <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300">Store Not Found</h4>
                        <p className="text-xs text-muted-foreground">Solution: Try typing just the city name or 3-digit store code. System auto-normalizes.</p>
                      </div>
                      
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200">
                        <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Validation Error</h4>
                        <p className="text-xs text-muted-foreground">Solution: Check transfer route. Destination required for routes ending in "Store".</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-purple-700 dark:text-purple-300">💡 Pro Tips</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• <strong>Search Efficiency:</strong> Type first 3 letters of city name for quick results</li>
                      <li>• <strong>Unassigned Orders:</strong> Use "unassigned" keyword for corporate/plant orders</li>
                      <li>• <strong>Cross-Plant:</strong> Orange warning banner confirms cross-plant routing</li>
                      <li>• <strong>Email Override:</strong> Your elevated status allows custom email addresses</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold text-red-700 dark:text-red-300">⚠️ Common Mistakes</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• <strong>Wrong Route:</strong> Using Plant→Plant when store delivery needed</li>
                      <li>• <strong>Missing Destination:</strong> Not setting destination for Store→Store routes</li>
                      <li>• <strong>Invalid Format:</strong> Using "Unassigned" as destination store</li>
                      <li>• <strong>Carrier Mismatch:</strong> Not selecting appropriate carrier for route</li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-300/30">
                  <h4 className="font-medium mb-2">📞 Need Additional Help?</h4>
                  <p className="text-sm text-muted-foreground">
                    For technical issues or questions about cross-plant ordering policies, contact your Operations Manager 
                    or system administrator. This guide covers the standard workflow available to all elevated users.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossPlantOrderingGuide;