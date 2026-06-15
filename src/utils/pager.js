// 分页组件：复用函数
// 返回 { container, renderPage }
export function createPager() {
  const container = document.createElement("div");
  container.className = "pager";
  let totalPages = 1;

  function makeBtn(label, disabled, onClick) {
    const b = document.createElement("button");
    b.className = "pager-btn";
    b.textContent = label;
    if (disabled) b.disabled = true;
    b.addEventListener("click", onClick);
    return b;
  }

  function render(page, total, onPageChange) {
    totalPages = Math.max(1, total);
    const safe = Math.max(1, Math.min(totalPages, page | 0));
    container.innerHTML = "";
    if (totalPages <= 1) {
      container.style.display = "none";
      return;
    }
    container.style.display = "";
    container.appendChild(makeBtn("\u00ab first", safe === 1, () => onPageChange(1)));
    container.appendChild(makeBtn("\u2039 prev", safe === 1, () => onPageChange(safe - 1)));
    for (let i = 1; i <= totalPages; i++) {
      const b = makeBtn(String(i), false, () => onPageChange(i));
      if (i === safe) b.classList.add("active");
      container.appendChild(b);
    }
    container.appendChild(makeBtn("next \u203a", safe === totalPages, () => onPageChange(safe + 1)));
    container.appendChild(makeBtn("last \u00bb", safe === totalPages, () => onPageChange(totalPages)));
  }

  return { container, render };
}
