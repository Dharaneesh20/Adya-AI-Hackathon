import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const LoginPage: React.FC = () => {
  const { login, retryLogin, loading, error } = useAuth();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      await login();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryLogin();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary-500 rounded-2xl mx-auto flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Campus Laundry System
            </h1>
            <p className="text-gray-600">
              Sign in to manage your laundry requests and lost items
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Sign-in Error
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {error}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                {isRetrying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading || isRetrying}
            className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            size="lg"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </Button>
        </div>

        <div className="text-center space-y-4">
          <div className="text-sm text-gray-500">
            <p>By signing in, you agree to our terms of service</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Troubleshooting:</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-1 space-y-1">
              <li>• Allow popups for this site</li>
              <li>• Disable ad blockers temporarily</li>
              <li>• Check your internet connection</li>
              <li>• Try refreshing the page</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;