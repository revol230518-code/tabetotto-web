export const scrollToTop = (target?: HTMLElement | Window | null) => {
  try {
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (target) {
          if (target instanceof Window) {
            target.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          } else {
            target.scrollTop = 0;
          }
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }, 0);
    });
  } catch (e) {
    console.warn('scrollToTop failed', e);
  }
};
