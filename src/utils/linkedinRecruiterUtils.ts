/**
 * Utility functions for interacting with LinkedIn Recruiter
 */

/**
 * Scrolls to the bottom of the page until no new content loads
 */
export const scrollToBottom = async (): Promise<void> => {
  return new Promise((resolve) => {
    let previousHeight = 0;
    const checkAndScroll = setInterval(() => {
      const scrollingElement = document.scrollingElement;
      if (!scrollingElement) {
        clearInterval(checkAndScroll);
        resolve();
        return;
      }

      const currentHeight = scrollingElement.scrollHeight;
      window.scrollTo(0, currentHeight);

      // If height hasn't changed in the last scroll, we've reached the bottom
      if (currentHeight === previousHeight) {
        clearInterval(checkAndScroll);
        resolve();
        return;
      }

      previousHeight = currentHeight;
    }, 1000); // Check every second
  });
};

/**
 * Gets the public profile URL for a LinkedIn Recruiter profile
 * Uses a hidden iframe to load the profile and extract the public URL
 */
export const getPublicProfileUrl = async (
  profileUrl: string
): Promise<string | null> => {
  try {
    // Create a hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    // Load the profile URL in the iframe
    return new Promise((resolve) => {
      // Set up a timeout to prevent hanging
      const timeout = setTimeout(() => {
        iframe.remove();
        resolve(null);
      }, 10000); // 10 second timeout

      iframe.onload = async () => {
        try {
          if (!iframe.contentWindow) {
            clearTimeout(timeout);
            iframe.remove();
            resolve(null);
            return;
          }

          // Wait a bit for the page to fully render
          await new Promise((r) => setTimeout(r, 1000));

          // Click the public profile button
          const publicProfileBtn = iframe.contentDocument?.querySelector(
            "#topcard-public-profile-hoverable-btn"
          );
          if (publicProfileBtn instanceof HTMLElement) {
            publicProfileBtn.click();
          }

          // Wait for the popup to appear
          await new Promise((r) => setTimeout(r, 500));

          // Get the public profile URL
          const publicProfileLink = iframe.contentDocument?.querySelector(
            ".topcard-condensed__public-profile-hovercard"
          );
          const publicUrl = publicProfileLink?.getAttribute("href") || null;

          clearTimeout(timeout);
          iframe.remove();
          resolve(publicUrl);
        } catch (error) {
          console.error("Error processing iframe:", error);
          clearTimeout(timeout);
          iframe.remove();
          resolve(null);
        }
      };

      iframe.src = profileUrl;
    });
  } catch (error) {
    console.error("Error getting public profile URL:", error);
    return null;
  }
};

/**
 * Gets the profile URLs of all selected profiles in the LinkedIn Recruiter interface
 */
export const getSelectedProfileLinks = (): string[] => {
  // Find all profile list items
  const profileItems = Array.from(
    document.querySelectorAll(".profile-list-item")
  );

  // Filter to only get selected profiles and extract their links
  return profileItems
    .filter((item) => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      return checkbox instanceof HTMLInputElement && checkbox.checked;
    })
    .map((item) => {
      const profileLink = item.querySelector('a[href*="/talent/profile/"]');
      return profileLink?.getAttribute("href");
    })
    .filter((href): href is string => !!href);
};
