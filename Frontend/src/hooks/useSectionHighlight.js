import { useState, useEffect } from 'react';

function useSectionHighlight(sections) {
  const [currentSection, setCurrentSection] = useState(sections[0]?.name || '');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + (document.querySelector('.navbar')?.offsetHeight || 0) + 10;
      let current = sections[0]?.name || '';
      for (let i = 0; i < sections.length; i++) {
        const { name, ref } = sections[i];
        const elem = ref.current;
        if (!elem) continue;
        const top = elem.offsetTop;
        const bottom = top + elem.offsetHeight;
        if (scrollPos >= top && scrollPos < bottom) {
          current = name;
          break;
        }
        if (i === sections.length - 1 && scrollPos >= top) {
          current = name;
        }
      }
      setCurrentSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [sections]);

  return currentSection;
}

export default useSectionHighlight;