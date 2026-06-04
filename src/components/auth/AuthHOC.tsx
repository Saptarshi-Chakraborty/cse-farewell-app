import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useGlobalContext, Role, ROLES } from '@/context/GlobalContext';
import LoadingPage from '../LoadingPage';

interface WithAuthProps {
  role?: Role | Role[];
}

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthProps = {}
) => {
  const AuthComponent = (props: P) => {
    const { user, isCheckingAuth } = useGlobalContext();
    const router = useRouter();

    useEffect(() => {
      if (isCheckingAuth) {
        return; // Wait until authentication check is complete
      }

      // 1. Redirect unauthenticated users to login
      if (!user) {
        router.replace('/login');
        return;
      }

      // 2. Handle role-based authorization
      const userRoles = user.labels || [];
      const requiredRoles = options.role ? (Array.isArray(options.role) ? options.role : [options.role]) : [];

      if (requiredRoles.length > 0) {
        // Admins can access any role-protected page
        if (userRoles.includes(ROLES.ADMIN)) {
          return;
        }

        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

        if (!hasRequiredRole) {
          // Redirect if user doesn't have the required role
          // You can redirect to a dedicated "unauthorized" page or the dashboard
          router.replace('/dashboard'); 
        }
      }
    }, [user, isCheckingAuth, router]);

    // While checking or if redirecting, show a loading state
    if (isCheckingAuth || !user) {
      return <LoadingPage />; // Or a spinner component
    }

    // If authenticated and authorized, render the component
    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;