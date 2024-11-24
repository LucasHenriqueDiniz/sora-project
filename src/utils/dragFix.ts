// Fix para o bug do WebKit que impede drag & drop
// https://bugs.webkit.org/show_bug.cgi?id=265857
export function initDragFix() {
  document.addEventListener("dragstart", (event) => {
    if (event.target && event.target instanceof HTMLElement) {
      event.dataTransfer?.setData("text/plain", event.target.id || "draggedElement");
    }
  });
}
