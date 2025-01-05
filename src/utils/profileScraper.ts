export const scrapeProfile = () => {
  // Get the candidate's name from the h1 element
  const nameElement = document.querySelector('h1.XcqMGBrLgSDsfiaCuMsRfEqqGQIKDfI');
  const fullName = nameElement?.textContent?.trim() || '';

  // Get all the content from the main profile section
  const profileContent = document.body.innerText;

  return {
    fullName,
    profileContent,
  };
};