import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoginPage from '@/components/auth/LoginPage';
import StudentDashboard from '@/pages/StudentDashboard';
import StaffDashboard from '@/pages/StaffDashboard';
import AdminDashboard from '@/pages/AdminDashboard';

interface AppContentProps {}

const AppContent: React.FC<AppContentProps> = () => {
  const { user, loading, userProfile } = useAuth();

  // Mandatory iframe console logging
  useEffect(() => {
    ["log", "warn", "error"].forEach((level) => {
      const original = console[level as keyof Console] as (...args: any[]) => void;

      console[level as keyof Console] = (...args: any[]) => {
        // keep normal console output
        original.apply(console, args);

        // sanitize args for postMessage
        const safeArgs = args.map((a) => {
          if (a instanceof Error) {
            return {
              message: a.message,
              stack: a.stack,
              name: a.name,
            };
          }
          try {
            JSON.stringify(a);
            return a;
          } catch {
            return String(a);
          }
        });

        try {
          window.parent?.postMessage(
            { type: "iframe-console", level, args: safeArgs },
            "*"
          );
        } catch (e) {
          // use original, not the wrapped one (avoid recursion)
          original("Failed to postMessage:", e);
        }
      };
    });

    // Global error handler
    window.onerror = (msg, url, line, col, error) => {
      window.parent?.postMessage(
        {
          type: "iframe-console",
          level: "error",
          args: [
            msg,
            url,
            line,
            col,
            error ? { message: error.message, stack: error.stack } : null,
          ],
        },
        "*"
      );
    };

    // Unhandled promise rejections
    window.onunhandledrejection = (event) => {
      const reason =
        event.reason instanceof Error
          ? { message: event.reason.message, stack: event.reason.stack }
          : event.reason;

      window.parent?.postMessage(
        {
          type: "iframe-console",
          level: "error",
          args: ["Unhandled Promise Rejection:", reason],
        },
        "*"
      );
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Role-based routing
  const userRole = userProfile?.role || 'student';
  
  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'student':
    default:
      return <StudentDashboard />;
  }
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;