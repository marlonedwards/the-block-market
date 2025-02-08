import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Header from '../components/Header';
import { supabase } from '../config/supabase';

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check auth status and onboarding
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session) {
          // Check if user exists in public_users
          const { data: userData, error } = await supabase
            .from('public_users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error || !userData) {
            // User not onboarded, redirect to onboarding
            navigate('/onboard');
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        const { data: userData, error } = await supabase
          .from('public_users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error || !userData) {
          navigate('/onboard');
        }
      }
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return <div>Loading...</div>; // Add a proper loading component
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        <h2 className="text-2xl font-medium mb-8">Universities</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/trade')}
          >
            <div className="aspect-video bg-muted/10 rounded-lg mb-4"></div>
            <h3 className="font-medium text-lg mb-2">Carnegie Mellon University</h3>
            <p className="text-sm">Trade meal blocks securely with other students</p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;