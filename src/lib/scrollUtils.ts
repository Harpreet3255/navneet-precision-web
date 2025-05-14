
export const scrollToSection = (sectionId: string) => {
  console.log(`Attempting to scroll to section: #${sectionId}`);

  // Try to find the section by ID
  const section = document.getElementById(sectionId);

  if (section) {
    console.log(`Found section: #${sectionId}`);

    // Get the header height to offset the scroll position
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 0;
    console.log(`Header height: ${headerHeight}px`);

    // Calculate the position to scroll to
    const sectionPosition = section.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = sectionPosition - headerHeight;

    console.log(`Scrolling to position: ${offsetPosition}px`);

    // Scroll to the section with offset
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  } else {
    console.error(`Section not found: #${sectionId}`);

    // Log all available section IDs for debugging
    const allSections = document.querySelectorAll('[id]');
    console.log('Available sections:');
    allSections.forEach(el => console.log(`- #${el.id}`));
  }
};
