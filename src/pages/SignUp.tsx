import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, ArrowLeft, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateEmail, validatePassword } from '@/utils/validation';

const ALLOWED_DOMAINS = ['@conlantire.com', '@aol.com'];


export default function SignUp() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
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
      newErrors.email = `Only ${ALLOWED_DOMAINS.join(' and ')} emails are allowed`;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords don\'t match';
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
      const emailLower = formData.email.toLowerCase().trim();

      // Step 1: Call Supabase signUp
      const { data: signUpData, error: authError } = await supabase.auth.signUp({
        email: emailLower,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (authError) {
        // Handle specific auth errors
        if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
          toast({
            title: 'Account already exists',
            description: 'This email is already registered. Please use Log In instead.',
            variant: 'destructive'
          });
          return;
        }
        throw authError;
      }

      if (!signUpData.user) {
        throw new Error('Sign up succeeded but no user returned');
      }

      // Step 2: Get fresh session token for the edge function call
      const { data: sessionData } = await supabase.auth.getSession();
      const authToken = sessionData.session?.access_token;

      if (!authToken) {
        throw new Error('No auth token available');
      }

      // Step 3: Link auth user to ordering_directory
      const { data: linkResult, error: linkError } = await supabase.functions.invoke(
        'link-auth-user',
        {
          body: { email: emailLower, auth_user_id: signUpData.user.id },
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (linkError || !linkResult?.ok) {
        // Auth account created but linking failed
        const errorMsg = linkResult?.error || linkError?.message || 'Failed to link account';
        
        toast({
          title: 'Admin must add you first',
          description: errorMsg,
          variant: 'destructive'
        });
        return;
      }

      // Step 4: Success!
      toast({
        title: 'Account created!',
        description: 'You can now log in with your credentials.',
        className: 'bg-green-50 border-green-200'
      });

      // Step 5: Redirect to login with pre-filled email
      setTimeout(() => {
        navigate('/login', { state: { email: emailLower } });
      }, 1000);

    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Provide specific error messages
      let errorMessage = 'An error occurred during sign up. Please try again.';
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Sign up failed',
        description: errorMessage,
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
          <CardTitle className="text-2xl font-bold text-gray-900">Create your account</CardTitle>
          <CardDescription className="text-gray-600">
            Set your password for an existing account
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
                placeholder="your.name@conlantire.com or @aol.com"
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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
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