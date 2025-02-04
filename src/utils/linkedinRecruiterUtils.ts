/**
 * Utility functions for interacting with LinkedIn Recruiter
 */

/**
 * Scrolls to the bottom of the page until no new content loads
 */
export const scrollToBottom = async (): Promise<void> => {
  return new Promise((resolve) => {
    let previousHeight = 0;
    const checkAndScroll = setInterval(async () => {
      const scrollingElement = document.scrollingElement;
      if (!scrollingElement) {
        clearInterval(checkAndScroll);
        resolve();
        return;
      }

      const currentHeight = scrollingElement.scrollHeight;
      window.scrollTo({
        top: window.scrollY + 2000,
        behavior: "smooth",
      });

      // If height hasn't changed in the last scroll, we've reached the bottom
      if (
        currentHeight === previousHeight &&
        window.scrollY + window.innerHeight >= currentHeight
      ) {
        clearInterval(checkAndScroll);
        resolve();
        return;
      }

      previousHeight = currentHeight;
    }, 700);
  });
};

/**
 * Scrolls to the top of the page until no new content loads
 */
export const scrollToTop = async (): Promise<void> => {
  return new Promise((resolve) => {
    let previousScrollY = window.scrollY;
    const checkAndScroll = setInterval(() => {
      window.scrollTo({
        top: Math.max(0, window.scrollY - 4000),
        behavior: "smooth",
      });

      // If scroll position hasn't changed or we're at the top, we're done
      if (window.scrollY === previousScrollY || window.scrollY === 0) {
        clearInterval(checkAndScroll);
        resolve();
        return;
      }

      previousScrollY = window.scrollY;
    }, 300);
  });
};

export const nextPage = () => {
  console.log("nextPage");
  const nextButton = document.querySelector(".pagination__quick-link--next");
  if (!nextButton) {
    return;
  }

  // Click the next button
  (nextButton as HTMLElement).click();
};

/**
 * Gets the public profile URL from a profile page using the iframe method
 */
const getPublicProfileUrlFromPage = async (
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

export const getProfileURLs = async (
  getSelected: boolean = false,
  numProfiles: number = 0,
  useSearchMode: boolean = false
): Promise<string[]> => {
  await scrollToTop();
  await scrollToBottom();

  let items = Array.from(document.querySelectorAll(".profile-list-item"));

  if (getSelected) {
    items = items.filter((item) => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      return checkbox instanceof HTMLInputElement && checkbox.checked;
    });
  }

  if (numProfiles > 0 && items.length > numProfiles) {
    items = items.slice(0, numProfiles);
  }

  const urls: string[] = [];

  for (const item of items) {
    const profileLink = item.querySelector('a[href*="/talent/profile/"]');
    const profileUrl = profileLink?.getAttribute("href");

    if (!profileUrl) continue;

    if (useSearchMode) {
      // Use the iframe method to get the public profile URL
      const publicUrl = await getPublicProfileUrlFromPage(profileUrl);
      if (publicUrl) {
        urls.push(publicUrl);
      }
      // Add a small delay between profiles to avoid overwhelming
      await new Promise((resolve) => setTimeout(resolve, 500));
    } else {
      // Transform URL from talent/profile to public profile format directly
      const transformedUrl = profileUrl
        .replace("/talent/profile/", "/in/")
        .split("?")[0];
      urls.push(transformedUrl);
    }
  }

  console.log(`Found ${urls.length} profile URLs`);
  return urls;
};

// Add this helper function at the bottom of the file
const waitForElement = (
  doc: Document,
  selector: string,
  timeout = 5000
): Promise<Element | null> => {
  return new Promise((resolve) => {
    if (doc.querySelector(selector)) {
      return resolve(doc.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      const element = doc.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(doc.body, {
      childList: true,
      subtree: true,
    });

    // Fallback timeout
    setTimeout(() => {
      observer.disconnect();
      resolve(doc.querySelector(selector));
    }, timeout);
  });
};
