import React from "react";
import {
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Expand,
  Shrink,
} from "lucide-react";
import { useExtensionState } from "../hooks/useExtensionState";
import { usePosition } from "../contexts/PositionContext";
import { useLayout } from "../contexts/LayoutContext";
import { cn } from "@/utils/cn";
import { SearchCredits } from "./SearchCredits";

interface ExtensionContainerProps {
  children: React.ReactNode;
  className?: string;
}

const ExtensionHeader = ({
  isExpanded,
  onToggle,
  isOnRight = true,
}: {
  isExpanded: boolean;
  onToggle: () => void;
  isOnRight?: boolean;
}) => {
  const { isHeightExpanded, setHeightExpanded } = useLayout();

  return (
    <div
      className={`flex items-center py-2 border-b border-gray-100 bg-white max-content ${
        isExpanded ? "justify-between px-4" : "justify-center px-2"
      }`}
    >
      <div className="flex items-center gap-2">
        {isExpanded && (
          <a
            href="https://app.styxlabs.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-900 hover:text-purple-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <img
                src={chrome.runtime.getURL("../../icon/128.png")}
                alt="Styx Logo"
                className="w-4 h-4"
                draggable={false}
              />
              <h1 className="text-base font-semibold text-purple-900">Styx</h1>
            </div>
          </a>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isExpanded && (
          <>
            <SearchCredits variant="compact" />
            <button
              onClick={() => {
                chrome.runtime.sendMessage({ type: "RELOAD_EXTENSION" });
                window.location.reload();
              }}
              className="p-2 flex items-center justify-center text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
              aria-label="Reload extension"
            >
              <RefreshCw className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={() => setHeightExpanded(!isHeightExpanded)}
              className="p-2 flex items-center justify-center text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
              aria-label={
                isHeightExpanded ? "Collapse height" : "Expand height"
              }
            >
              {isHeightExpanded ? (
                <Shrink className="w-4 h-4" strokeWidth={2} />
              ) : (
                <Expand className="w-4 h-4" strokeWidth={2} />
              )}
            </button>
          </>
        )}
        <button
          onClick={onToggle}
          className={`p-2 text-purple-500 rounded-lg transition-colors ${
            isExpanded ? "hover:text-purple-700 hover:bg-purple-50" : ""
          }`}
          aria-label={isExpanded ? "Minimize" : "Expand"}
        >
          {isExpanded ? (
            isOnRight ? (
              <ChevronRight
                className="w-4 h-4"
                strokeWidth={2}
                stroke="#9333ea"
              />
            ) : (
              <ChevronLeft
                className="w-4 h-4"
                strokeWidth={2}
                stroke="#9333ea"
              />
            )
          ) : (
            <img
              src={chrome?.runtime?.getURL("icon/128.png")}
              alt="Styx Logo"
              className="w-4 h-4 object-contain"
              draggable={false}
            />
          )}
        </button>
      </div>
    </div>
  );
};

export const ExtensionContainer: React.FC<ExtensionContainerProps> = ({
  children,
  className = "",
}) => {
  const { isExpanded, toggleExpansion } = useExtensionState();
  const { isOnRight } = usePosition();
  const {
    containerMaxHeight,
    containerWidth,
    isHeightExpanded,
    containerHeight,
  } = useLayout();

  return (
    <div
      className={cn(
        "extension-container bg-white flex flex-col",
        isOnRight ? "rounded-l-lg right-0" : "rounded-r-lg left-0",
        "shadow-lg transition-all duration-300",
        isHeightExpanded && "fixed top-0",
        className
      )}
      style={{
        maxHeight: containerMaxHeight,
        width: isExpanded ? containerWidth : "6rem",
        height: containerHeight,
      }}
    >
      <ExtensionHeader
        isExpanded={isExpanded}
        onToggle={toggleExpansion}
        isOnRight={isOnRight}
      />
      <div className="flex-1 overflow-y-auto">{isExpanded && children}</div>
    </div>
  );
};

export default ExtensionContainer;
