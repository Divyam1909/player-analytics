import { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    const setCollapsed = (collapsed: boolean) => {
        setIsCollapsed(collapsed);
    };

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setCollapsed }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebarContext = () => {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebarContext must be used within a SidebarProvider');
    }
    return context;
};
