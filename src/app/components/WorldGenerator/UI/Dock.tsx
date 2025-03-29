"use client";

import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "./utils";

// Constants for dock styling
const DOCK_HEIGHT = 64;
const DEFAULT_MAGNIFICATION = 48;
const DEFAULT_DISTANCE = 100;
const DEFAULT_ITEM_SIZE = 40;

// Context for providing dock functionality to children
type DockContextType = {
  mouseX: React.MutableRefObject<number>;
  magnification: number;
  distance: number;
};

const DockContext = createContext<DockContextType | null>(null);

// Hook to use dock context
function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error("useDock must be used within a Dock component");
  }
  return context;
}

// Main Dock component
interface DockProps {
  children: React.ReactNode;
  className?: string;
  onIconClick?: (id: string) => void;
  activeSidebar?: string | null;
}

export function Dock({
  children,
  className = "",
  onIconClick,
  activeSidebar = null,
}: DockProps) {
  const mouseX = useRef<number>(Infinity);
  const dockRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dockRef.current) {
      const rect = dockRef.current.getBoundingClientRect();
      const mouseXRelative = e.clientX - rect.left;
      mouseX.current = mouseXRelative;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseX.current = Infinity;
  }, []);

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
      <motion.div
        ref={dockRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-black/30 backdrop-blur-md ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DockContext.Provider
          value={{
            mouseX,
            magnification: DEFAULT_MAGNIFICATION,
            distance: DEFAULT_DISTANCE,
          }}
        >
          {children}
        </DockContext.Provider>
      </motion.div>
    </div>
  );
}

// Dock Item component
interface DockItemProps {
  icon: React.ReactNode;
  label: string;
  id: string;
  onClick?: (id: string) => void;
  isActive?: boolean;
}

export function DockItem({
  icon,
  label,
  id,
  onClick,
  isActive = false,
}: DockItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const { mouseX, magnification, distance } = useDock();
  const [isHovered, setIsHovered] = useState(false);

  // Animation values
  const baseWidth = DEFAULT_ITEM_SIZE;
  const width = useMotionValue(baseWidth);

  // Update width based on mouse position
  useEffect(() => {
    function updateWidth() {
      if (!itemRef.current) return;

      const rect = itemRef.current.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;

      // Calculate distance from mouse to item center
      const distanceFromMouse = Math.abs(mouseX.current - itemCenter);

      // Only scale if mouse is within the dock
      if (mouseX.current !== Infinity) {
        // Scale based on distance from mouse
        let newWidth = baseWidth;
        if (distanceFromMouse < distance) {
          const scale =
            1 +
            (((distance - distanceFromMouse) / distance) *
              (magnification - baseWidth)) /
              baseWidth;
          newWidth = baseWidth * scale;
        }
        width.set(newWidth);
      } else {
        width.set(baseWidth);
      }

      // Schedule next update
      requestAnimationFrame(updateWidth);
    }

    const animation = requestAnimationFrame(updateWidth);
    return () => cancelAnimationFrame(animation);
  }, [mouseX, magnification, distance, baseWidth, width]);

  // Create a spring for smoother animation
  const springWidth = useSpring(width, { damping: 15, stiffness: 200 });

  return (
    <motion.div
      ref={itemRef}
      className={cn(
        "relative flex items-center justify-center rounded-full cursor-pointer transition-colors",
        isActive ? "bg-white/30" : "bg-white/10 hover:bg-white/20"
      )}
      style={{ width: springWidth, height: springWidth }}
      whileTap={{ scale: 0.9 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onClick?.(id)}
      role="button"
      aria-label={label}
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-6 h-6">{icon}</div>

      {/* Label tooltip */}
      {isHovered && (
        <motion.div
          className="absolute bottom-full mb-2 px-3 py-1 rounded-md bg-black/70 text-white text-xs whitespace-nowrap"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.div>
      )}
    </motion.div>
  );
}
