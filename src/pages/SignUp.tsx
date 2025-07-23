import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, ArrowLeft, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateEmail, validatePassword } from '@/utils/validation';

const ALLOWED_DOMAINS = ['@conlantire.com'];

const PLANTS = [
  { code: '097', name: 'Grand Prairie 097' },
  { code: '098', name: 'Romulus 098' },
  { code: '099', name: 'Mulberry 099' }
];

const STORES_BY_PLANT: Record<string, Array<{ number: string; name: string }>> = {
  '097': [
    { number: '22', name: 'Fort Worth 022' },
    { number: '27', name: 'Grand Prairie 027' },
    { number: '28', name: 'Houston 028' },
    { number: '29', name: 'San Antonio 029' },
    { number: '35', name: 'Laredo 035' },
    { number: '39', name: 'Austin 039' },
    { number: '30', name: 'Oklahoma City 030' },
    { number: '32', name: 'Little Rock 032' },
    { number: '33', name: 'Kansas City 033' },
    { number: '36', name: 'Tulsa 036' }
  ],
  '098': [
    { number: '8', name: 'Toledo 008' },
    { number: '11', name: 'Detroit 011' },
    { number: '13', name: 'Grand Rapids 013' },
    { number: '18', name: 'Cleveland 018' },
    { number: '41', name: 'Chicago 041' }
  ],
  '099': [
    { number: '3', name: 'Miami 003' },
    { number: '7', name: 'Pompano Beach 007' },
    { number: '9', name: 'Fort Myers 009' },
    { number: '002', name: 'Jacksonville 002' },
    { number: '5', name: 'Ocala 005' },
    { number: '15', name: 'Tallahassee 015' },
    { number: '1', name: 'Mulberry Service 001' },
    { number: '4', name: 'New Orleans 004' },
    { number: '6', name: 'Tampa 006' },
    { number: '21', name: 'Vero Beach 021' },
    { number: '23', name: 'Sarasota 023' },
    { number: '40', name: 'Tampa Foam Fill 040' }
  ]
};

export default function SignUp() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    plant: '',
    store: '',
    roleTitle: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (!ALLOWED_DOMAINS.some(domain => formData.email.toLowerCase().endsWith(domain))) {
      newErrors.email = 'Email must be from an authorized domain (@conlantire.com)';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    // Plant validation
    if (!formData.plant) {
      newErrors.plant = 'Please select a plant';
    }

    // Store validation
    if (!formData.store) {
      newErrors.store = 'Please select a store';
    }

    // Role validation
    if (!formData.roleTitle.trim()) {
      newErrors.roleTitle = 'Role/Title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // First, create the pending registration record
      const selectedStore = STORES_BY_PLANT[formData.plant]?.find(store => store.number === formData.store);
      const storeName = selectedStore?.name || `Store ${formData.store}`;
      const plantName = PLANTS.find(p => p.code === formData.plant)?.name || `Plant ${formData.plant}`;
      
      const { error: registrationError } = await supabase
        .from('pending_registrations')
        .insert({
          email: formData.email.toLowerCase(),
          password_hash: formData.password, // This will be handled by Supabase auth
          plant_code: plantName,
          store_number: storeName, // Store as "Store Name Store Number" format
          role_title: formData.roleTitle.trim()
        });

      if (registrationError) {
        if (registrationError.code === '23505') { // Unique constraint violation
          throw new Error('An account with this email already exists or is pending approval');
        }
        throw registrationError;
      }

      // Then create the Supabase auth user with proper metadata
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase(),
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/signup-success`,
          data: {
            store_name_number: storeName, // "Store Name Store Number" format
            default_plant: plantName,
            role_title: formData.roleTitle.trim(),
            plant_code: formData.plant
          }
        }
      });

      if (authError) {
        // If auth signup fails, we should clean up the pending registration
        await supabase
          .from('pending_registrations')
          .delete()
          .eq('email', formData.email.toLowerCase());
        
        throw authError;
      }

      toast({
        title: 'Registration submitted!',
        description: 'Please check your email to verify your account. After verification, an admin will review your registration.',
        className: 'bg-green-50 border-green-200'
      });

      navigate('/signup-success');

    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: error.message || 'An error occurred during registration. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const availableStores = formData.plant ? STORES_BY_PLANT[formData.plant] || [] : [];
  const passwordValidation = formData.password ? validatePassword(formData.password) : null;

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/lovable-uploads/00512613-69c8-42e6-af5e-e9d8e3c555ed.png')`
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      
      <Card className="relative z-10 w-full max-w-md mx-4 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-2">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
          <CardDescription className="text-gray-600">
            Join the Ordering Platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.name@conlantire.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordValidation && (
                <div className="text-xs space-y-1">
                  <div className={`font-medium ${
                    passwordValidation.strength === 'strong' ? 'text-green-600' :
                    passwordValidation.strength === 'medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    Strength: {passwordValidation.strength}
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Plant Field */}
            <div className="space-y-2">
              <Label htmlFor="plant">Plant</Label>
              <Select 
                value={formData.plant} 
                onValueChange={(value) => {
                  handleInputChange('plant', value);
                  // Clear store selection when plant changes
                  setFormData(prev => ({ ...prev, store: '' }));
                }}
              >
                <SelectTrigger className={errors.plant ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your plant" />
                </SelectTrigger>
                <SelectContent>
                  {PLANTS.map((plant) => (
                    <SelectItem key={plant.code} value={plant.code}>
                      {plant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.plant && (
                <p className="text-sm text-red-600">{errors.plant}</p>
              )}
            </div>

            {/* Store Field */}
            <div className="space-y-2">
              <Label htmlFor="store">Store</Label>
              <Select 
                value={formData.store} 
                onValueChange={(value) => handleInputChange('store', value)}
                disabled={!formData.plant}
              >
                <SelectTrigger className={errors.store ? 'border-red-500' : ''}>
                  <SelectValue placeholder={formData.plant ? "Select your store" : "First select a plant"} />
                </SelectTrigger>
                <SelectContent>
                  {availableStores.map((store) => (
                    <SelectItem key={store.number} value={store.number}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.store && (
                <p className="text-sm text-red-600">{errors.store}</p>
              )}
            </div>

            {/* Role/Title Field */}
            <div className="space-y-2">
              <Label htmlFor="roleTitle">Role/Title</Label>
              <Input
                id="roleTitle"
                type="text"
                value={formData.roleTitle}
                onChange={(e) => handleInputChange('roleTitle', e.target.value)}
                placeholder="e.g., Store Manager, Assistant Manager"
                className={errors.roleTitle ? 'border-red-500' : ''}
              />
              {errors.roleTitle && (
                <p className="text-sm text-red-600">{errors.roleTitle}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center space-y-4">
            <div className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
            
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}