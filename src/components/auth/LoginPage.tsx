import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const LoginPage: React.FC = () => {
  const { login, loading, error } = useAuth();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleLogin = async () => {
    try {
      setIsRetrying(false);
      await login();
    } catch (error) {
      console.error('Login failed:', error);
      // Error is already handled in AuthContext
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Laundry System</h1>
          <p className="text-gray-600">Sign in to manage your laundry requests</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
            
            {error.includes('domain') && (
              <div className="bg-red-100 border border-red-200 rounded p-3 text-xs text-red-800">
                <p className="font-medium mb-1">Setup Required:</p>
                <p>Add this domain to Firebase Console:</p>
                <p className="font-mono bg-red-200 px-2 py-1 rounded mt-1">
                  {window.location.origin}
                </p>
                <p className="mt-1">Go to Authentication → Settings → Authorized domains</p>
              </div>
            )}

            {error.includes('popup') && (
              <div className="bg-red-100 border border-red-200 rounded p-3 text-xs text-red-800">
                <p className="font-medium mb-1">Browser Settings:</p>
                <p>• Allow popups for this site</p>
                <p>• Disable popup blockers</p>
                <p>• Try using redirect authentication</p>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                onClick={handleRetry}
                disabled={loading || isRetrying}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                size="sm"
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 text-lg font-medium flex items-center justify-center space-x-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a7.646 7.646 0 100 15.292 7.646 7.646 0 000-15.292zm0 15.292V19.5" />
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Secure authentication powered by Google
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="text-xs text-gray-500 space-y-1">
            <p>🔧 <strong>Troubleshooting:</strong></p>
            <p>• Make sure popups are enabled</p>
            <p>• Check your internet connection</p>
            <p>• Contact admin if domain errors persist</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;