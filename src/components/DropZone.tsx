import React from "react";

interface DropZoneProps {
  side: "left" | "right";
  isActive: boolean;
  isHighlighted: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({
  side,
  isActive,
  isHighlighted,
}) => {
  return (
    <div
      className={`drop-zone ${side} ${isActive ? "active" : ""} ${
        isHighlighted ? "highlight" : ""
      }`}
    />
  );
};

export default DropZone;
