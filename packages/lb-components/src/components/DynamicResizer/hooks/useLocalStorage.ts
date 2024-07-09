const useLocalStorage = (key: string) => {
  const resetLocalTopHeight = () => {
    localStorage.removeItem(key);
  };

  const getLocalTopHeight = () => {
    return localStorage.getItem(key);
  };

  const setLocalTopHeight = (value: string | number) => {
    localStorage.setItem(key, String(value));
  };

  return { resetLocalTopHeight, getLocalTopHeight, setLocalTopHeight };
};

export default useLocalStorage;
