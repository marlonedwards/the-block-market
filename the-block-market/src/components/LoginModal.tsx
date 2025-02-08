import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

const LoginModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
  
    const handleAuth = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');
  
      try {
        let result;
        if (isLogin) {
          result = await supabase.auth.signInWithPassword({
            email,
            password,
          });
        } else {
          result = await supabase.auth.signUp({
            email,
            password,
          });
        }
  
        if (result.error) throw result.error;
  
        // If successful, close the modal and reset form
        onClose();
        setEmail('');
        setPassword('');
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    const toggleMode = () => {
      setIsLogin(!isLogin);
      setError('');
    };
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-semibold text-center">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Sign up to start trading meal blocks'}
            </DialogDescription>
          </DialogHeader>
  
          <form onSubmit={handleAuth} className="space-y-6 py-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </div>
  
            {isLogin && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-sm"
                  onClick={() => {
                    // Add forgot password functionality
                  }}
                >
                  Forgot password?
                </Button>
              </div>
            )}
  
            <div className="space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading 
                  ? (isLogin ? 'Signing in...' : 'Creating account...') 
                  : (isLogin ? 'Sign In' : 'Sign Up')}
              </Button>
  
              <div className="text-center space-y-2">
                <div className="text-sm text-muted-foreground">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={toggleMode}
                >
                  {isLogin ? 'Create Account' : 'Sign In'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default LoginModal;
  
  