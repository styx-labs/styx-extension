import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Loader2,
} from "lucide-react";

interface ExtensionTabProps {
  isExpanded: boolean;
  onToggle: () => void;
  loading: boolean;
}

const ExtensionTab: React.FC<ExtensionTabProps> = ({
  isExpanded,
  onToggle,
  loading,
}) => (
  <div
    className={`flex items-center justify-between p-4 border-b border-gray-100 bg-white ${
      !isExpanded ? "extension-tab-closed" : ""
    }`}
  >
    {isExpanded ? (
      <>
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-purple-600" />
          <a
            href="https://styxlabs.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-900 hover:text-purple-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <img
                src={chrome.runtime.getURL("icon/128.png")}
                alt="Styx Logo"
                className="w-6 h-6"
              />
              <h1>Styx</h1>
            </div>
          </a>
        </div>
        <button
          onClick={onToggle}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          aria-label="Minimize"
        >
          <ChevronRight className="w-6 h-6" strokeWidth={2} stroke="#9333ea" />
        </button>
      </>
    ) : (
      <button
        onClick={onToggle}
        className="w-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        aria-label="Expand"
      >
        {loading ? (
          <Loader2
            className="w-6 h-6 animate-spin"
            strokeWidth={2}
            stroke="#9333ea"
          />
        ) : (
          <ChevronLeft className="w-6 h-6" strokeWidth={2} stroke="#9333ea" />
        )}
      </button>
    )}
  </div>
);

export default ExtensionTab;
