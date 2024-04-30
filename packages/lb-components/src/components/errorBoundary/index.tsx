import React, { createContext, useContext, useMemo } from 'react';

// Create a Context to pass onError event
interface ErrorContextType {
  onError?: (msg: string) => void;
}

const ErrorContext = createContext<ErrorContextType>({
  onError: () => {},
});

// Error handling function
const handleError = () => {
  console.log('Error occurred!');
};

// Error Provider component
export const ErrorProvider: React.FC<{ onError?: () => void }> = ({ onError, children }) => {
  const errorHandler = useMemo(() => {
    return {
      onError: onError || handleError,
    }
  }, [onError])
  return (
    <ErrorContext.Provider value={errorHandler}>
      {children}
    </ErrorContext.Provider>
  );
};

// Custom hook to get throwError method in child components
export const useError = (): ErrorContextType => useContext(ErrorContext)
