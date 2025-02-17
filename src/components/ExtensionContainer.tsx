import React from "react";
import { ChevronRight, RefreshCw } from "lucide-react";
import { useExtensionState } from "../hooks/useExtensionState";

interface ExtensionContainerProps {
  children: React.ReactNode;
  width?: string;
  maxHeight?: string;
  className?: string;
}

const ExtensionHeader = ({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) => (
  <div
    className={`flex items-center py-2 border-b border-gray-100 bg-white max-content ${
      isExpanded ? "justify-between px-4" : "justify-center px-2"
    }`}
  >
    <div className="flex items-center gap-2">
      {isExpanded && (
        <a
          href="https://styxlabs.co/"
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
      )}
      <button
        onClick={onToggle}
        className={`p-2 text-purple-500 rounded-lg transition-colors ${
          isExpanded ? "hover:text-purple-700 hover:bg-purple-50" : ""
        }`}
        aria-label={isExpanded ? "Minimize" : "Expand"}
      >
        {isExpanded ? (
          <ChevronRight className="w-4 h-4" strokeWidth={2} stroke="#9333ea" />
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

export const ExtensionContainer: React.FC<ExtensionContainerProps> = ({
  children,
  maxHeight = "600px",
  className = "",
}) => {
  const { isExpanded, toggleExpansion } = useExtensionState();

  return (
    <div
      className={`extension-container bg-white rounded-l-lg shadow-lg flex flex-col ${
        !isExpanded ? "w-16" : "w-[450px]"
      } ${className}`}
    >
      <ExtensionHeader isExpanded={isExpanded} onToggle={toggleExpansion} />
      {isExpanded && children}
    </div>
  );
};

export default ExtensionContainer;
