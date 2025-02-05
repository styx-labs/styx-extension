import { useExtensionState } from "@/hooks/useExtensionState";
import { Toaster } from "react-hot-toast";

export default function App() {
  const { isExpanded } = useExtensionState();

  return (
    <>
      <div
        className={`fixed top-0 right-0 h-screen bg-white shadow-lg transition-all duration-300 ease-in-out ${
          isExpanded ? "w-[600px]" : "w-20"
        }`}
      >
        {/* Your existing app content */}
      </div>
      <Toaster />
    </>
  );
} 