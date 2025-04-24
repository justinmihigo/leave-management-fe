import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '../components/ui/button';

const NotFound: React.FC = () => {
  const history = useHistory();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-6">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => history.push('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound; 