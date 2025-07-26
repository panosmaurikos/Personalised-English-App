import { useState, useEffect } from 'react';

function useSectionHighlight(sections) {
  // State to track the name of the section currently in view
  const [currentSection, setCurrentSection] = useState(sections[0]?.name || '');

  useEffect(() => {
    // Function to determine the current section based on scroll position
    const handleScroll = () => {
      // Calculate the current scroll position, accounting for the navbar height
      const scrollPos = window.scrollY + (document.querySelector('.navbar')?.offsetHeight || 0) + 10;

      // Default to the first section if no section is in view
      let current = sections[0]?.name || '';

      // Iterate through the sections to find the one currently in view
      for (let i = 0; i < sections.length; i++) {
        const { name, ref } = sections[i]; // Destructure the section name and reference
        const elem = ref.current; // Get the DOM element for the section
        if (!elem) continue; // Skip if the element is not available

        const top = elem.offsetTop; // Get the top position of the section
        const bottom = top + elem.offsetHeight; // Calculate the bottom position of the section

        // Check if the scroll position is within the section's boundaries
        if (scrollPos >= top && scrollPos < bottom) {
          current = name; // Update the current section
          break;
        }

        // If the last section is in view, set it as the current section
        if (i === sections.length - 1 && scrollPos >= top) {
          current = name;
        }
      }

      // Update the state with the current section
      setCurrentSection(current);
    };

    // Add event listeners for scroll and resize events
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    // Call the function initially to set the current section
    handleScroll();

    // Cleanup function to remove event listeners when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [sections]); // Re-run the effect if the sections array changes

  // Return the name of the current section
  return currentSection;
}

export default useSectionHighlight;