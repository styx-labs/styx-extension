import React from "react";
import { GripVertical } from "lucide-react";

interface DragHandleProps {
  side: "left" | "right";
}

const DragHandle: React.FC<DragHandleProps> = ({ side }) => {
  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 h-[46px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-transparent rounded-lg ${
        side === "right"
          ? "left-0 -translate-x-full"
          : "right-0 translate-x-full"
      }`}
    >
      <div className="p-2 text-gray-500">
        <GripVertical className="w-6 h-6" strokeWidth={2} stroke="#9333ea" />
      </div>
    </div>
  );
};

export default DragHandle;
