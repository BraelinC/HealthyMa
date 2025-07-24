import { useState, useEffect } from 'react';

export type ProfileSystemType = 'traditional' | 'smart';

export function useProfileSystem() {
  const [profileSystem, setProfileSystem] = useState<ProfileSystemType>('traditional');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load preference from localStorage on component mount
    const savedPreference = localStorage.getItem('profile-system-preference');
    if (savedPreference === 'smart' || savedPreference === 'traditional') {
      setProfileSystem(savedPreference);
    }
    setIsLoading(false);
  }, []);

  const toggleProfileSystem = (systemType: ProfileSystemType) => {
    setProfileSystem(systemType);
    localStorage.setItem('profile-system-preference', systemType);
  };

  const isSmartProfileEnabled = profileSystem === 'smart';

  return {
    profileSystem,
    isSmartProfileEnabled,
    isLoading,
    toggleProfileSystem,
    setToSmartProfile: () => toggleProfileSystem('smart'),
    setToTraditionalProfile: () => toggleProfileSystem('traditional')
  };
}