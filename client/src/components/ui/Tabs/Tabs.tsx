import React, { createContext, useContext, useState, useRef, useEffect, forwardRef, type ReactNode, type HTMLAttributes, type ReactElement } from "react";

interface TabsContextType {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  tabsId: string;
  registerTab: (element: HTMLElement | null) => number;
  unregisterTab: (index: number) => void;
  registerPanel: (element: HTMLElement | null) => number;
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
  const tabElements = useRef<(HTMLElement | null)[]>([]);
  const panelElements = useRef<(HTMLElement | null)[]>([]);
  const nextTabIndex = useRef(0);
  const nextPanelIndex = useRef(0);

  const setActiveIndex = (newIndex: number) => {
    if (!isControlled) setUncontrolledIndex(newIndex);
    onChange?.(newIndex);
  };

  const registerTab = (element: HTMLElement | null) => {
    const idx = nextTabIndex.current++;
    tabElements.current[idx] = element;
    return idx;
  };

  const unregisterTab = (idx: number) => {
    tabElements.current[idx] = null;
  };

  const registerPanel = (element: HTMLElement | null) => {
    const idx = nextPanelIndex.current++;
    panelElements.current[idx] = element;
    return idx;
  };

  const unregisterPanel = (idx: number) => {
    panelElements.current[idx] = null;
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
    <TabsContext.Provider value={{ activeIndex, setActiveIndex, tabsId, registerTab, unregisterTab, registerPanel, unregisterPanel }}>
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
    const { activeIndex, setActiveIndex, tabsId, registerTab, unregisterTab } = useTabsContext();
    const indexRef = useRef<number>(-1);
    const isRegistered = useRef(false);

    useEffect(() => {
      if (!isRegistered.current && ref.current) {
        indexRef.current = registerTab(ref.current);
        isRegistered.current = true;
      }
      return () => {
        if (isRegistered.current) {
          unregisterTab(indexRef.current);
          isRegistered.current = false;
        }
      };
    }, [registerTab, unregisterTab, ref]);

    const isActive = indexRef.current === activeIndex;

    return (
      <button
        ref={ref}
        role="tab"
        id={`${tabsId}-tab-${indexRef.current}`}
        aria-selected={isActive}
        aria-controls={`${tabsId}-panel-${indexRef.current}`}
        tabIndex={isActive ? 0 : -1}
        disabled={disabled}
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
    const { activeIndex, tabsId, registerPanel, unregisterPanel } = useTabsContext();
    const indexRef = useRef<number>(-1);
    const isRegistered = useRef(false);

    useEffect(() => {
      if (!isRegistered.current && ref.current) {
        indexRef.current = registerPanel(ref.current);
        isRegistered.current = true;
      }
      return () => {
        if (isRegistered.current) {
          unregisterPanel(indexRef.current);
          isRegistered.current = false;
        }
      };
    }, [registerPanel, unregisterPanel, ref]);

    const isActive = indexRef.current === activeIndex;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`${tabsId}-panel-${indexRef.current}`}
        aria-labelledby={`${tabsId}-tab-${indexRef.current}`}
        tabIndex={0}
        className={`py-4 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabPanel.displayName = "TabPanel";