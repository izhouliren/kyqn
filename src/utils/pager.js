// 分页组件：复用函数
// 返回 { container, renderPage }
export function createPager() {
  const container = document.createElement("div");
  container.className = "pager";
  let totalPages = 1;

  // 三行容器
  const prevRow = document.createElement("div");
  prevRow.className = "pager-row pager-prev";
  const numRow = document.createElement("div");
  numRow.className = "pager-row pager-nums";
  const nextRow = document.createElement("div");
  nextRow.className = "pager-row pager-next";
  container.append(prevRow, numRow, nextRow);

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
    prevRow.innerHTML = "";
    numRow.innerHTML = "";
    nextRow.innerHTML = "";
    if (totalPages <= 1) {
      container.style.display = "none";
      return;
    }
    container.style.display = "";

    // 第一行：first + prev
    prevRow.appendChild(makeBtn("\u00ab first", safe === 1, () => onPageChange(1)));
    prevRow.appendChild(makeBtn("\u2039 prev", safe === 1, () => onPageChange(safe - 1)));

    // 第二行：页码
    for (let i = 1; i <= totalPages; i++) {
      const b = makeBtn(String(i), false, () => onPageChange(i));
      if (i === safe) b.classList.add("active");
      numRow.appendChild(b);
    }

    // 第三行：next + last
    nextRow.appendChild(makeBtn("next \u203a", safe === totalPages, () => onPageChange(safe + 1)));
    nextRow.appendChild(makeBtn("last \u00bb", safe === totalPages, () => onPageChange(totalPages)));
  }

  return { container, render };
}
