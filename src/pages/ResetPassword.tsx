import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { validatePassword, validatePasswordMatch } from "@/utils/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Loader, CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    errors: [] as string[],
    strength: 'weak' as 'weak' | 'medium' | 'strong'
  });
  const { updatePassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  // Extract tokens from URL hash
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const type = hashParams.get('type');

    if (accessToken && refreshToken && type === 'recovery') {
      setIsValidToken(true);
    } else {
      setIsValidToken(false);
    }
    setIsCheckingToken(false);
  }, []);

  // Validate password in real-time
  useEffect(() => {
    if (password) {
      setPasswordValidation(validatePassword(password));
    } else {
      setPasswordValidation({
        isValid: false,
        errors: [],
        strength: 'weak'
      });
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValidation.isValid) {
      toast({
        title: "Invalid Password",
        description: "Please fix the password requirements before continuing.",
        variant: "destructive"
      });
      return;
    }

    if (!validatePasswordMatch(password, confirmPassword)) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both passwords are identical.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updatePassword(password);
      
      if (result.success) {
        // Clear rate limiting on successful reset
        localStorage.removeItem('passwordResetAttempts');
        localStorage.removeItem('lastPasswordResetAttempt');
        
        toast({
          title: "Password Updated",
          description: "Your password has been successfully updated. You can now log in.",
          className: "bg-green-50 border-green-200",
        });
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast({
          title: "Reset Failed",
          description: result.error || "Unable to update password. The reset link may have expired.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-red-600';
    }
  };

  const getStrengthBg = (strength: string) => {
    switch (strength) {
      case 'strong': return 'bg-green-100 border-green-200';
      case 'medium': return 'bg-yellow-100 border-yellow-200';
      default: return 'bg-red-100 border-red-200';
    }
  };

  // Show loading while checking token
  if (isCheckingToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat p-4"
        style={{
          backgroundImage: `url('/lovable-uploads/00512613-69c8-42e6-af5e-e9d8e3c555ed.png')`
        }}
      >
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-md shadow-2xl border border-white/30">
          <CardContent className="p-8 text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Validating reset link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error for invalid token
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat p-4"
        style={{
          backgroundImage: `url('/lovable-uploads/00512613-69c8-42e6-af5e-e9d8e3c555ed.png')`
        }}
      >
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-md shadow-2xl border border-white/30">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <CardTitle className="text-2xl font-bold text-gray-900">Invalid Reset Link</CardTitle>
            </div>
            <CardDescription className="text-gray-600">
              This password reset link is invalid, expired, or has already been used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat p-4"
      style={{
        backgroundImage: `url('/lovable-uploads/00512613-69c8-42e6-af5e-e9d8e3c555ed.png')`
      }}
    >
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-md shadow-2xl border border-white/30">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-2xl font-bold text-gray-900">Reset Password</CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            Create a new password for your Ordering Platform account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className={`p-3 rounded-lg border ${getStrengthBg(passwordValidation.strength)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {passwordValidation.isValid ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${getStrengthColor(passwordValidation.strength)}`}>
                      Password Strength: {passwordValidation.strength.charAt(0).toUpperCase() + passwordValidation.strength.slice(1)}
                    </span>
                  </div>
                  
                  {passwordValidation.errors.length > 0 && (
                    <ul className="text-xs space-y-1">
                      {passwordValidation.errors.map((error, index) => (
                        <li key={index} className="flex items-center gap-2 text-red-600">
                          <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                          {error}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="flex items-center gap-2 text-sm">
                  {validatePasswordMatch(password, confirmPassword) ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-600">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !passwordValidation.isValid || !validatePasswordMatch(password, confirmPassword)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}