import { useState, useEffect } from "react";
import { getSearchCredits, checkAuth } from "@/utils/apiUtils";

export function useSearchCredits() {
  const [searchCredits, setSearchCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        setSearchCredits(null);
        return;
      }
      const credits = await getSearchCredits();
      setSearchCredits(credits);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch credits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  return {
    searchCredits,
    loading,
    error,
    refetch: fetchCredits,
  };
}
