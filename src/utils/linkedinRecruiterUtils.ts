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
        behavior: 'smooth'
      });

      // If height hasn't changed in the last scroll, we've reached the bottom
      if (currentHeight === previousHeight && window.scrollY + window.innerHeight >= currentHeight) {
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
        behavior: 'smooth'
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
  const nextButton = document.querySelector(
    ".pagination__quick-link--next"
  );
  if (!nextButton) {
    return;
  }

  // Click the next button
  (nextButton as HTMLElement).click();
};


export const getProfileURLs = async (
  getSelected: boolean = false,
  numProfiles: number = 0,
): Promise<string[]> => {
  await scrollToTop();
  await scrollToBottom();

  let items = Array.from(document.querySelectorAll('.profile-list-item'));
  
  console.log("total items", items.length);
  
  const batchSize = 5;
  let results: string[] = [];

  // Process items in batches
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    // Scroll to middle element in the batch
    const scrollIndex = Math.floor(batch.length / 2);
    batch[scrollIndex].scrollIntoView({ behavior: 'smooth' });
    
    // Process the batch
    const batchProfiles = await Promise.all(
      batch.map(async (item) => {
        if (getSelected) {
          const checkbox = item.querySelector('input[type="checkbox"]');
          if (!(checkbox as HTMLInputElement).checked) {
            return null;
          }
        }
        const profileLink = item.querySelector('a[href*="/talent/profile/"]');
        const profileUrl = profileLink?.getAttribute("href");
        
        if (!profileUrl) return null;

        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);

        try {
          iframe.src = profileUrl;
          await new Promise(resolve => iframe.addEventListener('load', resolve, { once: true }));
          
          const urlContainer = await waitForElement(iframe.contentDocument as Document, ".personal-info__link");
          const publicUrl = urlContainer?.getAttribute('href');
          return publicUrl;
        } finally {
          iframe.remove();
        }
      })
    );

    const validBatchProfiles = batchProfiles.filter((url): url is string => !!url);
    results.push(...validBatchProfiles);
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (numProfiles > 0 && results.length >= numProfiles) {
      results = results.slice(0, numProfiles);
      break;
    }
  }

  console.log("Total valid profiles", results.length);
  return results;
};

// Add this helper function at the bottom of the file
const waitForElement = (doc: Document, selector: string, timeout = 5000): Promise<Element | null> => {
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
      subtree: true
    });

    // Fallback timeout
    setTimeout(() => {
      observer.disconnect();
      resolve(doc.querySelector(selector));
    }, timeout);
  });
};
