import React, { createContext, useContext, useState, useRef, useEffect, useLayoutEffect, forwardRef, type ReactNode, type HTMLAttributes } from "react";

interface TabsContextType {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  tabsId: string;
  // Synchronous registration during render - SEPARATE counters
  claimTabIndex: () => number;
  claimPanelIndex: () => number;
  // Async registration for keyboard navigation (DOM attachment)
  registerTab: (element: HTMLElement | null, index: number) => void;
  unregisterTab: (index: number) => void;
  registerPanel: (element: HTMLElement | null, index: number) => void;
  unregisterPanel: (index: number) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs compounds must be used within a Tabs component");
  }
  return context;
}

interface TabsProps {
  children: ReactNode;
  defaultIndex?: number;
  index?: number;
  onChange?: (index: number) => void;
}

export function Tabs({ children, defaultIndex = 0, index: controlledIndex, onChange }: TabsProps) {
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const isControlled = controlledIndex !== undefined;
  const activeIndex = isControlled ? controlledIndex : uncontrolledIndex;
  const tabsId = useRef(`tabs-${Math.random().toString(36).slice(2)}`).current;
  
  // DOM element refs for keyboard navigation
  const tabElements = useRef<(HTMLElement | null)[]>([]);
  const panelElements = useRef<(HTMLElement | null)[]>([]);
  
  // Separate render-phase counters for tabs and panels
  const tabIndexCounter = useRef(0);
  const panelIndexCounter = useRef(0);
  
  // Reset counters at start of each render
  tabIndexCounter.current = 0;
  panelIndexCounter.current = 0;

  const setActiveIndex = (newIndex: number) => {
    if (!isControlled) setUncontrolledIndex(newIndex);
    onChange?.(newIndex);
  };

  // Synchronous claim during render - separate counters
  const claimTabIndex = () => {
    return tabIndexCounter.current++;
  };

  const claimPanelIndex = () => {
    return panelIndexCounter.current++;
  };

  // Async registration for DOM attachment (keyboard navigation)
  const registerTab = (element: HTMLElement | null, index: number) => {
    if (element) tabElements.current[index] = element;
  };

  const unregisterTab = (index: number) => {
    tabElements.current[index] = null;
  };

  const registerPanel = (element: HTMLElement | null, index: number) => {
    if (element) panelElements.current[index] = element;
  };

  const unregisterPanel = (index: number) => {
    panelElements.current[index] = null;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tabs = tabElements.current.filter(Boolean) as HTMLElement[];
      const currentTab = tabs[activeIndex];
      if (!currentTab || e.target !== currentTab) return;

      let newIndex = activeIndex;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        newIndex = (activeIndex + 1) % tabs.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        newIndex = (activeIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        newIndex = 0;
      } else if (e.key === "End") {
        newIndex = tabs.length - 1;
      }

      if (newIndex !== activeIndex) {
        e.preventDefault();
        setActiveIndex(newIndex);
        tabs[newIndex]?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, isControlled, onChange]);

  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex, tabsId, claimTabIndex, claimPanelIndex, registerTab, unregisterTab, registerPanel, unregisterPanel }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const TabList = forwardRef<HTMLDivElement, TabListProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="tablist"
        className={`flex gap-1 border-b border-border ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabList.displayName = "TabList";

interface TabProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  disabled?: boolean;
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(
  ({ children, disabled = false, className = "", ...props }, ref) => {
    const { activeIndex, setActiveIndex, tabsId, claimTabIndex, registerTab, unregisterTab } = useTabsContext();
    const elementRef = useRef<HTMLButtonElement | null>(null);
    const indexRef = useRef<number>(-1);
    const isRegistered = useRef(false);
    const [, forceUpdate] = useState(0);

    // Claim index synchronously during render
    if (indexRef.current === -1) {
      indexRef.current = claimTabIndex();
    }

    // Async DOM registration for keyboard navigation
    useLayoutEffect(() => {
      const element = elementRef.current;
      const idx = indexRef.current;
      if (element && !isRegistered.current) {
        registerTab(element, idx);
        isRegistered.current = true;
        forceUpdate(n => n + 1);
      } else if (!element && isRegistered.current) {
        unregisterTab(idx);
        isRegistered.current = false;
        forceUpdate(n => n + 1);
      }
      return () => {
        if (isRegistered.current) {
          unregisterTab(idx);
          isRegistered.current = false;
        }
      };
    }, [elementRef.current, registerTab, unregisterTab]);

    const setRef = (element: HTMLButtonElement | null) => {
      if (ref) {
        if (typeof ref === "function") ref(element);
        else if ("current" in ref) ref.current = element;
      }
      elementRef.current = element;
    };

    const isActive = indexRef.current === activeIndex;

    return (
      <button
        ref={setRef}
        role="tab"
        id={`${tabsId}-tab-${indexRef.current}`}
        aria-selected={isActive}
        aria-controls={`${tabsId}-panel-${indexRef.current}`}
        tabIndex={isActive ? 0 : -1}
        disabled={disabled}
        aria-disabled={disabled}
        className={`
          px-4 py-2 text-sm font-medium
          transition-colors
          ${isActive ? "text-primary border-b-2 border-primary -mb-px" : "text-text-secondary hover:text-text"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${className}
        `}
        onClick={() => !disabled && setActiveIndex(indexRef.current)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Tab.displayName = "Tab";

interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  ({ children, className = "", ...props }, ref) => {
    const { activeIndex, tabsId, claimPanelIndex, registerPanel, unregisterPanel } = useTabsContext();
    const elementRef = useRef<HTMLDivElement | null>(null);
    const indexRef = useRef<number>(-1);
    const isRegistered = useRef(false);
    const [, forceUpdate] = useState(0);

    // Claim index synchronously during render (separate counter)
    if (indexRef.current === -1) {
      indexRef.current = claimPanelIndex();
    }

    // Async DOM registration
    useLayoutEffect(() => {
      const element = elementRef.current;
      const idx = indexRef.current;
      if (element && !isRegistered.current) {
        registerPanel(element, idx);
        isRegistered.current = true;
        forceUpdate(n => n + 1);
      } else if (!element && isRegistered.current) {
        unregisterPanel(idx);
        isRegistered.current = false;
        forceUpdate(n => n + 1);
      }
      return () => {
        if (isRegistered.current) {
          unregisterPanel(idx);
          isRegistered.current = false;
        }
      };
    }, [elementRef.current, registerPanel, unregisterPanel]);

    const setRef = (element: HTMLDivElement | null) => {
      if (ref) {
        if (typeof ref === "function") ref(element);
        else if ("current" in ref) ref.current = element;
      }
      elementRef.current = element;
    };

    const isActive = indexRef.current === activeIndex;

    return (
      <div
        ref={setRef}
        role="tabpanel"
        id={`${tabsId}-panel-${indexRef.current}`}
        aria-labelledby={`${tabsId}-tab-${indexRef.current}`}
        tabIndex={0}
        aria-hidden={!isActive}
        className={`py-4 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabPanel.displayName = "TabPanel";