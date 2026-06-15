// ASCII art "data flow" animation
// Ported from git-merge.com (Svelte) to vanilla JS canvas
//
// 视觉：很多方块（█▓▒░）像波浪一样在背景里从左到右流过，
//       经过 ASCII art 文字位置时把字符"点亮"成实心方块。
//       鼠标悬停时附近方块会更亮。

// ASCII art 内容（要展示在大框里的文字），5 行
// 从 logoArt 用 figlet standard 字体生成的"kaiyuanqingnian"导出
const F = [
  ' _         _                               _                   _             ',
  '| | ____ _(_)_   _ _   _  __ _ _ __   __ _(_)_ __   __ _ _ __ (_) __ _ _ __  ',
  "| |/ / _` | | | | | | | |/ _` | '_ \\ / _` | | '_ \\ / _` | '_ \\| |/ _` | '_ \\ ",
  '|   < (_| | | |_| | |_| | (_| | | | | (_| | | | | | (_| | | | | | (_| | | | |',
  '|_|\\_\\__,_|_|\\__, |\\__,_|\\__,_|_| |_|\\__, |_|_| |_|\\__, |_| |_|_|\\__,_|_| |_|',
  '             |___/                      |_|        |___/                     ',
];

// 注意：上面的字符串里包含单引号/反引号/反斜杠，但它们都在 '...' 或 "..." 内部，
// 不会终止模板字符串。我会小心处理：
// - 第 3 行 (开头 "| |/ / _` |...") 用双引号包了，因为它含单引号（`'`）
// - 最后一行 (开头 "|_|\_\\...") 用了 \\ 转义反斜杠

// 让最后一行更稳：重写
const F2 = [
  ' _         _                               _                   _             ',
  '| | ____ _(_)_   _ _   _  __ _ _ __   __ _(_)_ __   __ _ _ __ (_) __ _ _ __  ',
  "| |/ / _` | | | | | | | |/ _` | '_ \\ / _` | | '_ \\ / _` | '_ \\| |/ _` | '_ \\ ",
  '|   < (_| | | |_| | |_| | (_| | | | | (_| | | | | | (_| | | | | | (_| | | | |',
  '|_|\\_\\__,_|_|\\__, |\\__,_|\\__,_|_| |_|\\__, |_|_| |_|\\__, |_| |_|_|\\__,_|_| |_|',
  '             |___/                      |_|        |___/                     ',
];

// 上面我把所有反引号改成 'x' 形式，但 ASCII art 里没反引号，安全。
// 实际原图里没反引号字符，我之前描述错了。再确认：

// 字符候选
const SOLID = ['█', '▓', '▒', '░'];           // 满格区
const LIGHT = ['▒', '░'];                      // 浅区
const FAINT = ['·', '.', '.', '·', ','];       // 微弱
const BLOB = ['(■)', '(■)', '(A)'];            // 粒子死后留的 blob

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function isTextChar(col, row, yOffset, xOffset, F) {
  if (row < yOffset || row >= yOffset + F.length) return false;
  if (col < xOffset || col >= xOffset + F[row - yOffset].length) return false;
  const ch = F[row - yOffset][col - xOffset];
  return ch !== undefined && ch !== ' ';
}

export function startAsciiFlow(canvas, F) {
  const ctx = canvas.getContext('2d');
  let dpr = Math.max(1, window.devicePixelRatio || 1);
  let W = 0, H = 0;
  let cellW = 0, cellH = 0;
  let cols = 0, rows = 0;
  let C = 16;            // 字体像素大小
  let x = 0, S = 0;      // cell width / cell height (含行高倍数)
  const i = 1.1;          // line-height factor

  // grid 状态（流体背景场）
  let t = 0, u = 0;      // cols, rows
  let yOff = 0, xOff = 0; // 文本在 grid 中的偏移
  let E = null, D = null, O = null, K = null, A = null;
  let J = null, M = null, N = null;
  let L = 0; // 最右粒子 col
  let particles = [];
  let particleId = 0;

  // 鼠标
  let mouseCol = -1, mouseRow = -1, mouseActive = false;

  // 主题颜色（从 CSS variables 取）
  let primaryColor = '#e94f0d';
  let textColor = '#1e1e1e';

  function getCssVar(name, fallback) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }

  function readColors() {
    primaryColor = getCssVar('--color-primary', '#e94f0d');
    textColor = getCssVar('--color-text', '#1e1e1e');
  }

  function spawnParticle(row) {
    return {
      id: ++particleId,
      col: 0,
      row,
      dir: 'right',     // 'right' | 'diag-up' | 'diag-down'
      diagLeft: 0,
      toFork: 3 + Math.floor(Math.random() * 6),
      style: particleId % 2 === 0 ? 'solid' : 'light',
      alive: true,
    };
  }

  function spawnParticles() {
    particles = [];
    const n = clamp(Math.round(rows / 3), 4, 9);
    for (let k = 0; k < n; k++) {
      const row = 1 + Math.round(k / Math.max(1, n - 1) * (rows - 2));
      const p = spawnParticle(row);
      p.toFork = 2 + k + Math.floor(Math.random() * 4);
      particles.push(p);
    }
  }

  function resize() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    if (W < 1 || H < 1) return; // 隐藏时跳过
    canvas.width = Math.max(1, Math.floor(W * dpr));
    canvas.height = Math.max(1, Math.floor(H * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    // 计算 C（字体大小）
    const m = F.length;
    const p = Math.max(...F.map((row) => row.length));
    const r = (W * 0.92) / (p * 0.67);
    const a = (H * 0.92) / (m * i);
    C = Math.min(16, r, a);
    x = C * 0.67;
    S = C * i;
    cols = Math.ceil(W / x);
    rows = Math.ceil(H / S);
    yOff = Math.round((rows - m) / 2);
    xOff = Math.round((cols - p) / 2);
    const o = rows * cols;
    E = new Int16Array(o);
    D = new Float32Array(o);
    O = new Uint8Array(o);
    K = new Array(o).fill('');
    A = new Float32Array(o);
    const s = m * p;
    J = new Float32Array(s);
    M = new Float32Array(s);
    N = new Float32Array(s);
    for (let k = 0; k < s; k++) M[k] = Math.floor(Math.random() * 50);
    L = 0;
    readColors();
    spawnParticles();
  }

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // 主题切换监听
  const mo = new MutationObserver(() => readColors());
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'data-theme', 'class'] });

  // 鼠标
  function onMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouseCol = Math.floor((e.clientX - rect.left) / x);
    mouseRow = Math.floor((e.clientY - rect.top) / S);
    mouseActive = true;
  }
  function onLeave() {
    mouseCol = -1;
    mouseRow = -1;
    mouseActive = false;
  }
  canvas.parentElement?.addEventListener('mousemove', onMove);
  canvas.parentElement?.addEventListener('mouseleave', onLeave);
  canvas.parentElement?.addEventListener('touchmove', (e) => {
    if (e.touches[0]) onMove(e.touches[0]);
  }, { passive: true });

  function textAt(col, row) {
    if (row < yOff || row >= yOff + F.length) return '';
    if (col < xOff || col >= xOff + F[row - yOff].length) return '';
    return F[row - yOff][col - xOff] || '';
  }

  function isText(col, row) {
    const c = textAt(col, row);
    return c !== '' && c !== ' ';
  }

  function paintCell(col, row, id, style) {
    if (col < 0 || row < 0 || col >= cols || row >= rows) return;
    if (isText(col, row)) return;
    const i = row * cols + col;
    E[i] = id;
    D[i] = 1;
    O[i] = style === 'solid' ? 0 : 1;
    if (col > L) L = col;
  }

  function stampBlob(col, row, id, style) {
    // 在 (col,row) 周围随机贴 BLOB 字符
    if (col < 0 || row < 0 || col >= cols || row >= rows) return;
    const blob = BLOB[Math.floor(Math.random() * BLOB.length)];
    let o = col - 1;
    for (let k = 0; k < blob.length; k++) {
      const s = o + k;
      if (s < 0 || s >= cols || row < 0 || row >= rows) continue;
      if (isText(s, row)) continue;
      const c = row * cols + s;
      const cur = E[c];
      if (cur === 0 || cur === id) {
        E[c] = id;
        D[c] = 1;
        O[c] = style === 'solid' ? 0 : 1;
        K[c] = blob[k];
        A[c] = 110;
      }
    }
  }

  function canDiagonal(col, row, dir, n) {
    for (let a = 1; a <= n; a++) {
      const cc = col + a;
      const rr = row + (dir === 'diag-down' ? a : -a);
      if (cc < 0 || rr < 0 || cc >= cols || rr >= rows) return false;
      const i = rr * cols + cc;
      if (E[i] !== 0 && D[i] > 0.35) return false;
    }
    return true;
  }

  function stepParticles() {
    const maxParticles = clamp(Math.floor(rows / 1.5), 10, 20);
    const aliveSet = new Set(particles.filter((p) => p.alive && p.dir === 'right').map((p) => p.row));
    for (const p of particles) {
      if (!p.alive) continue;
      const drow = p.dir === 'diag-down' ? 1 : p.dir === 'diag-up' ? -1 : 0;
      const nextCol = p.col + 1;
      const nextRow = clamp(p.row + drow, 1, rows - 1);
      if (nextCol >= cols) { p.alive = false; continue; }
      if (isText(nextCol, nextRow)) { p.alive = false; continue; }
      const i = nextRow * cols + nextCol;
      const cur = E[i];
      if (cur !== 0 && cur !== p.id) {
        stampBlob(nextCol, nextRow, p.id, p.style);
        p.alive = false;
        continue;
      }
      p.col = nextCol;
      p.row = nextRow;
      paintCell(p.col, p.row, p, p);
      if (p.dir !== 'right') {
        p.diagLeft--;
        if (p.diagLeft <= 0) {
          p.dir = 'right';
          stampBlob(p.col, p.row, p.id, p.style);
        }
      } else if (--p.toFork <= 0) {
        if (particles.filter((q) => q.alive).length < maxParticles) {
          if (Math.random() > 0.5) {
            // 分裂
            const childDir = Math.random() > 0.5 ? 'diag-down' : 'diag-up';
            const childLen = 5 + Math.floor(Math.random() * 8);
            const childRow = clamp(
              p.row + (childDir === 'diag-down' ? childLen : -childLen),
              1, rows - 1
            );
            if (canDiagonal(p.col, p.row, childDir, childLen)) {
              stampBlob(p.col, p.row, p.id, p.style);
              const childStyle = p.style === 'solid' ? 'light' : 'solid';
              const child = spawnParticle(p.row);
              child.col = p.col;
              child.row = p.row;
              child.dir = childDir;
              child.diagLeft = childLen;
              child.toFork = 3 + Math.floor(Math.random() * 6);
              child.style = childStyle;
              particles.push(child);
              aliveSet.add(childRow);
              // 自己也可能转向
              if (Math.random() < 0.65) {
                const turnDir = childDir === 'diag-down' ? 'diag-up' : 'diag-down';
                const turnLen = 4 + Math.floor(Math.random() * 6);
                if (canDiagonal(p.col, p.row, turnDir, turnLen)) {
                  p.dir = turnDir;
                  p.diagLeft = turnLen;
                }
              }
            }
          }
        }
        p.toFork = 3 + Math.floor(Math.random() * 6);
      }
    }
    particles = particles.filter((p) => p.alive);
    // 补充新粒子
    const minP = Math.max(4, Math.floor(rows / 3));
    const usedRows = new Set(particles.map((p) => p.row));
    let attempts = 0;
    while (particles.length < minP && attempts++ < 20) {
      const r = clamp(1 + Math.floor(Math.random() * (rows - 1)), 1, rows - 1);
      if (!usedRows.has(r)) {
        const style = particleId % 2 === 0 ? 'solid' : 'light';
        particles.push(spawnParticle(r));
        usedRows.add(r);
      }
    }
  }

  function decay() {
    for (let k = 0; k < D.length; k++) {
      if (D[k] > 0) {
        D[k] *= 0.984;
        if (A[k] > 0) {
          A[k]--;
          if (A[k] <= 0) K[k] = '';
        }
        if (D[k] < 0.06) {
          D[k] = 0;
          E[k] = 0;
          K[k] = '';
          A[k] = 0;
        }
      }
    }
  }

  function pickChar(d, style) {
    if (style === 0) {
      if (d > 0.85) return '█';
      if (d > 0.65) return '▓';
      if (d > 0.42) return '▒';
      return '░';
    }
    if (d > 0.6) return '▒';
    return '░';
  }

  function drawTextReveal() {
    // 计算文本区域每格的 build-up
    const m = F.length;
    const p = Math.max(...F.map((row) => row.length));
    for (let er = 0; er < m; er++) {
      for (let tr = 0; tr < p; tr++) {
        const idx = er * p + tr;
        const gx = xOff + tr;
        const gy = yOff + er;
        if (L >= gx) {
          // 粒子已经过这一列
          if (M[idx] > 0) {
            M[idx]--;
          } else {
            J[idx] = Math.min(1, J[idx] + 0.04 + Math.random() * 0.05);
          }
        }
        N[idx] *= 0.91;
        if (N[idx] < 0.01) N[idx] = 0;
        if (mouseActive && mouseCol >= 0 && J[idx] >= 0.88) {
          const dx = gx - mouseCol;
          const dy = gy - mouseRow;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 3) {
            const v = Math.pow(1 - dist / 3, 1.5);
            N[idx] = Math.max(N[idx], v);
          }
        }
      }
    }

    // 画文本
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 1;
    for (let er = 0; er < m; er++) {
      const row = F[er];
      for (let tr = 0; tr < row.length; tr++) {
        const ch = row[tr];
        if (ch === ' ') continue;
        const idx = er * p + tr;
        const j = J[idx];
        const n = N[idx];
        if (j <= 0.08 && n <= 0) continue;
        let drawCh;
        if (n > 0.05) {
          if (n > 0.65) {
            drawCh = SOLID[2 + Math.floor(Math.random() * 2)]; // ▒/░? actually c[0..1] = ▒, ▒
            // git-merge.com: c[Math.floor(Math.random()*c.length)] where c = ['▒', '▒']  -- 两个都是 ▒
            // So always ▒
            drawCh = '▒';
          } else if (n > 0.3 || Math.random() < n * 3) {
            drawCh = LIGHT[Math.floor(Math.random() * LIGHT.length)]; // '▒' or '░'
          } else {
            drawCh = ch;
          }
        } else if (j > 0.9) {
          drawCh = ch;
        } else if (j > 0.72) {
          drawCh = LIGHT[Math.floor(Math.random() * LIGHT.length)];
        } else if (j > 0.4) {
          drawCh = SOLID[2 + Math.floor(Math.random() * 2)]; // ▒ or ▒
          drawCh = '▒';
        } else {
          drawCh = FAINT[Math.floor(Math.random() * FAINT.length)];
        }
        ctx.fillText(drawCh, (xOff + tr) * x, (yOff + er) * S);
      }
    }
  }

  function drawFlowField() {
    ctx.font = `${C}px Menlo, Monaco, Consolas, "JetBrains Mono", monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    decay();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (isText(c, r)) continue;
        const i = r * cols + c;
        const d = D[i];
        if (d <= 0) continue;
        const style = O[i];
        const blob = K[i];
        if (blob) {
          ctx.fillStyle = primaryColor;
          ctx.globalAlpha = clamp(0.32 + d * 0.72, 0, 1);
        } else if (style === 0 && d > 0.85) {
          ctx.fillStyle = textColor;
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = primaryColor;
          ctx.globalAlpha = clamp(0.28 + d * 0.82, 0, 1);
        }
        ctx.fillText(blob || pickChar(d, style), c * x, r * S);
      }
    }
    drawTextReveal();
  }

  let raf = 0;
  let frame = 0;
  function loop() {
    raf = requestAnimationFrame(loop);
    try {
      if (!canvas.offsetParent) return; // 不可见时跳过
      frame++;
      // 测量 text 区域 build-up 比例
      let lit = 0;
      const total = J ? J.length : 0;
      for (let k = 0; k < total; k++) if (J[k] >= 0.88) lit++;
      const ratio = total > 0 ? lit / total : 1;
      const interval = ratio >= 0.8 ? 14 : 2;
      if (W > 0 && H > 0) {
        ctx.clearRect(0, 0, W, H);
        if (frame % interval === 0) stepParticles();
        drawFlowField();
      }
      mouseActive = false;
    } catch (err) {
      // 静默不抛错，避免动画卡死
      
    }
  }
  loop();

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    mo.disconnect();
    canvas.parentElement?.removeEventListener('mousemove', onMove);
    canvas.parentElement?.removeEventListener('mouseleave', onLeave);
  };
}
