import React, { useEffect, useRef, useState } from "react";
import DropZone from "./DropZone";

interface DraggableOverlayProps {
  children: React.ReactNode;
}

const DraggableOverlay: React.FC<DraggableOverlayProps> = ({ children }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isOnRight, setIsOnRight] = useState(true);
  const [verticalPosition, setVerticalPosition] = useState(
    window.innerHeight * 0.1
  );
  const [hoveredSide, setHoveredSide] = useState<"left" | "right" | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0, startTop: 0 });

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!overlayRef.current) return;

      setIsMouseDown(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startTop: verticalPosition,
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;

      const deltaX = Math.abs(e.clientX - dragStartRef.current.x);
      const deltaY = Math.abs(e.clientY - dragStartRef.current.y);

      // Start dragging only if mouse has moved more than 5 pixels
      if (!isDragging && (deltaX > 5 || deltaY > 5)) {
        setIsDragging(true);
        if (overlayRef.current) {
          overlayRef.current.classList.add("dragging");
        }
      }

      if (isDragging) {
        // Calculate new vertical position
        const newY = Math.max(
          0,
          Math.min(
            window.innerHeight - 100,
            dragStartRef.current.startTop + (e.clientY - dragStartRef.current.y)
          )
        );
        setVerticalPosition(newY);

        // Determine which side to highlight based on horizontal position
        const shouldBeOnRight = e.clientX > window.innerWidth / 2;
        setHoveredSide(shouldBeOnRight ? "right" : "left");
      }
    };

    const handleMouseUp = () => {
      if (!overlayRef.current) return;

      if (isDragging && hoveredSide) {
        setIsOnRight(hoveredSide === "right");
      }

      setIsDragging(false);
      setIsMouseDown(false);
      setHoveredSide(null);
      overlayRef.current.classList.remove("dragging");
    };

    const overlay = overlayRef.current;
    if (overlay) {
      overlay.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      if (overlay) {
        overlay.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [isDragging, isMouseDown, verticalPosition, hoveredSide]);

  return (
    <>
      <DropZone
        side="left"
        isActive={isDragging}
        isHighlighted={hoveredSide === "left"}
      />
      <DropZone
        side="right"
        isActive={isDragging}
        isHighlighted={hoveredSide === "right"}
      />
      <div
        ref={overlayRef}
        className="overlay"
        style={{
          top: verticalPosition,
          right: isOnRight ? 0 : "auto",
          left: isOnRight ? "auto" : 0,
        }}
      >
        {children}
      </div>
    </>
  );
};

export default DraggableOverlay;
