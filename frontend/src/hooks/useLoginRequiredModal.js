import { useState, useCallback } from 'react';

export function useLoginRequiredModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCampagne, setSelectedCampagne] = useState(null);

  const openModal = useCallback((campagne) => {
    setSelectedCampagne(campagne);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSelectedCampagne(null);
  }, []);

  return {
    isOpen,
    selectedCampagne,
    openModal,
    closeModal,
  };
}