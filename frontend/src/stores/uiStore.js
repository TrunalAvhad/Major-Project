import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Navigation and global modals. The active screen survives a page reload
 * (sessionStorage: per tab, cleared when the tab closes).
 */
export const useUiStore = create(persist(
  (set) => ({
    activeScreen: 'home',
    activeModal: null,          // 'haltTraining' | 'quarantine' | 'exportWeights' | null
    activeMockState: 'normal',  // StatesDemoView preview: 'normal' | 'loading' | 'empty' | 'error'

    setActiveScreen: (activeScreen) => set({ activeScreen }),
    setActiveModal: (activeModal) => set({ activeModal }),
    setActiveMockState: (activeMockState) => set({ activeMockState }),
  }),
  {
    name: 'medfl_ui',
    storage: createJSONStorage(() => sessionStorage),
    partialize: (s) => ({ activeScreen: s.activeScreen }),
  },
));
