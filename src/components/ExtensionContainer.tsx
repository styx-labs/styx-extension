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
    className={`flex items-center p-4 border-b border-gray-100 bg-white max-content ${
      isExpanded ? "justify-between" : "justify-center"
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
              className="w-6 h-6"
            />
            <h1 className="text-xl font-semibold text-gray-900">Styx</h1>
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
          className="w-10 h-10 flex items-center justify-center text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200 hover:border-purple-300"
          aria-label="Reload extension"
        >
          <RefreshCw className="w-5 h-5" strokeWidth={2} />
        </button>
      )}
      <button
        onClick={onToggle}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        aria-label={isExpanded ? "Minimize" : "Expand"}
      >
        {isExpanded ? (
          <ChevronRight className="w-6 h-6" strokeWidth={2} stroke="#9333ea" />
        ) : (
          <img
            src={chrome?.runtime?.getURL("icon/128.png")}
            alt="Styx Logo"
            className="w-6 h-6 object-contain"
          />
        )}
      </button>
    </div>
  </div>
);

export const ExtensionContainer: React.FC<ExtensionContainerProps> = ({
  children,
  maxHeight = "calc(100vh-100px)",
  className = "",
}) => {
  const { isExpanded, toggleExpansion } = useExtensionState();

  return (
    <div
      className={`extension-container bg-white rounded-l-lg shadow-lg flex flex-col ${
        !isExpanded ? "w-20" : "w-[450px]"
      } ${className}`}
      style={{ maxHeight: isExpanded ? maxHeight : "none" }}
    >
      <ExtensionHeader isExpanded={isExpanded} onToggle={toggleExpansion} />
      {isExpanded && children}
    </div>
  );
};

export default ExtensionContainer;
