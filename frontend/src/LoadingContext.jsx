import { createContext, useContext, useReducer } from 'react';

const LoadingContext = createContext();

const initialState = { loading: false };

function loadingReducer(state, action) {
  switch (action.type) {
    case 'START_LOADING':
      return { loading: true };
    case 'STOP_LOADING':
      return { loading: false };
    default:
      return state;
  }
}

export const LoadingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(loadingReducer, initialState);

  // Extract loading and define setLoading
  const loading = state.loading;
  const setLoading = (value) => {
    dispatch({ type: value ? 'START_LOADING' : 'STOP_LOADING' });
  };

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
