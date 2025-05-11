
export const scrollToSection = (sectionId: string) => {
  const section = document.getElementById(sectionId);
  if (section) {
    // Get the header height to offset the scroll position
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 0;

    // Calculate the position to scroll to
    const sectionPosition = section.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = sectionPosition - headerHeight;

    // Scroll to the section with offset
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};
