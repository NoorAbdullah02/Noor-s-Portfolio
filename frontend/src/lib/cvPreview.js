const EVENT = "cv-preview:open";

export const openCvPreview = () => window.dispatchEvent(new Event(EVENT));

export const onCvPreviewOpen = (handler) => {
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
};
