let root = null;
let log = [];
let highlighted = new Set();
let hlColor = "search";
let travResult = null;
let zoom = 1;
let pan = { x: 0, y: 0 };
let dragging = false;
let dragStart = null;
let newNodes = new Set();

const NR = 24, HS = 56, VS = 80;

function addLog(msg, type) {
  log = [{ msg, type, t: Date.now() }, ...log].slice(0, 40);
  renderLog();
}

function commit(r, rots, msg, type) {
  computePos(r);
  root = clone(r);
  travResult = null;
  if (rots?.length) addLog(`${msg} → ${rots.join(", ")} rotation${rots.length > 1 ? "s" : ""}`, type);
  else addLog(msg, type);
  render();
}

function handleInsert() {
  const input = document.getElementById("input").value;
  const vals = input.split(/[\s,]+/).map(Number).filter(v => !isNaN(v) && input.trim() !== "");
  if (!vals.length) return;
  let r = root, allRots = [];
  const added = new Set();
  for (const v of vals) {
    const res = insert(r, v);
    r = res.node;
    allRots = [...allRots, ...res.rots];
    added.add(String(v));
  }
  commit(r, allRots, `Inserted [${vals.join(", ")}]`, "insert");
  newNodes = added;
  setTimeout(() => { newNodes = new Set(); render(); }, 900);
  document.getElementById("input").value = "";
}

function handleDelete() {
  const input = document.getElementById("input").value;
  const vals = input.split(/[\s,]+/).map(Number).filter(v => !isNaN(v));
  if (!vals.length) return;
  let r = root, allRots = [];
  for (const v of vals) {
    const res = del(r, v);
    r = res.node;
    allRots = [...allRots, ...res.rots];
  }
  commit(r, allRots, `Deleted [${vals.join(", ")}]`, "delete");
  highlighted = new Set();
  document.getElementById("input").value = "";
}

function handleSearch() {
  const input = document.getElementById("input").value;
  const v = parseInt(input);
  if (isNaN(v)) return;
  const { found, path } = searchPath(root, v);
  highlighted = new Set(path.map(String));
  hlColor = "search";
  addLog(`Search ${v}: ${found ? "✓ FOUND" : "✗ NOT FOUND"} | Path: ${path.join(" → ")}`, found ? "found" : "miss");
  render();
  setTimeout(() => { highlighted = new Set(); render(); }, 2800);
  document.getElementById("input").value = "";
}

function handleTrav(type) {
  const fns = { inorder, preorder, postorder };
  const result = fns[type](root);
  travResult = { type, result };
  hlColor = "trav";
  render();
  result.forEach((v, i) => {
    setTimeout(() => {
      highlighted = new Set([...highlighted, String(v)]);
      render();
    }, i * 160);
  });
  setTimeout(() => { highlighted = new Set(); render(); }, result.length * 160 + 1400);
  addLog(`${type.toUpperCase()}: [${result.join(", ")}]`, "trav");
}

function randomInsert() {
  const vals = Array.from({ length: 9 }, () => Math.floor(Math.random() * 90) + 5);
  let r = null, allRots = [];
  for (const v of vals) {
    const res = insert(r, v);
    r = res.node;
    allRots = [...allRots, ...res.rots];
  }
  commit(r, allRots, `Random: [${vals.join(", ")}]`, "insert");
  newNodes = new Set(vals.map(String));
  setTimeout(() => { newNodes = new Set(); render(); }, 900);
}

function clearAll() {
  root = null;
  log = [];
  highlighted = new Set();
  travResult = null;
  document.getElementById("input").value = "";
  zoom = 1;
  pan = { x: 0, y: 0 };
  render();
}

function onMouseDown(e) {
  if (e.button === 0) {
    dragging = true;
    dragStart = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    document.querySelector(".svg-container").classList.add("grabbing");
    document.querySelector(".svg-container").classList.remove("grab");
  }
}

function onMouseMove(e) {
  if (dragging && dragStart) {
    pan = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
    render();
  }
}

function onMouseUp() {
  dragging = false;
  document.querySelector(".svg-container").classList.remove("grabbing");
  document.querySelector(".svg-container").classList.add("grab");
}

function onWheel(e) {
  e.preventDefault();
  zoom = Math.min(3, Math.max(0.25, zoom - e.deltaY * 0.0012));
  render();
}

function setZoom(z) {
  zoom = z;
  render();
}

function resetZoom() {
  zoom = 1;
  pan = { x: 0, y: 0 };
  render();
}

function render() {
  const nodes = allNodes(root);
  const edges = allEdges(root);
  const stats = {
    nodes: nodes.length,
    height: ht(root),
    maxBF: nodes.length ? Math.max(...nodes.map(n => Math.abs(getBF(n)))) : 0
  };

  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="header">
      <div class="header-left">
        <div class="header-logo">⟨/⟩</div>
        <div>
          <div class="header-title">AVL TREE VISUALIZER</div>
          <div class="header-subtitle">SELF-BALANCING BINARY SEARCH TREE ENGINE</div>
        </div>
      </div>
      <div class="header-right">
        ${[["NODES", stats.nodes, "#5cb85c"], ["HEIGHT", stats.height, "#5eb3af"], ["MAX |BF|", stats.maxBF, stats.maxBF > 1 ? "#d4695c" : "#8bcc6b"]]
          .map(([l, v, c]) => `
            <div class="stat-card" style="border-color: ${c}28;">
              <div class="stat-value" style="color: ${c}; text-shadow: 0 0 14px ${c}88;">${v}</div>
              <div class="stat-label">${l}</div>
            </div>
          `)
          .join("")}
      </div>
    </div>

    <div class="main-container">
      <div class="sidebar">
        <div class="panel">
          <div class="panel-title">▸ OPERATIONS</div>
          <input 
            id="input" 
            type="text" 
            class="input-field" 
            placeholder="10, 20, 5 …"
            onkeydown="if(event.key==='Enter')handleInsert()"
          >
          <div class="button-grid">
            <button class="btn panel-button" style="background: #5cb85c14; border: 1px solid #5cb85c40; color: #5cb85c;" onclick="handleInsert()">INSERT</button>
            <button class="btn panel-button" style="background: #d4695c14; border: 1px solid #d4695c40; color: #d4695c;" onclick="handleDelete()">DELETE</button>
            <button class="btn panel-button" style="background: #5eb3af14; border: 1px solid #5eb3af40; color: #5eb3af;" onclick="handleSearch()">SEARCH</button>
            <button class="btn panel-button" style="background: #8bcc6b14; border: 1px solid #8bcc6b40; color: #8bcc6b;" onclick="randomInsert()">RANDOM</button>
          </div>
          <button class="btn clear-button" onclick="clearAll()">✕ CLEAR ALL</button>
        </div>

        <div class="panel">
          <div class="panel-title">▸ TRAVERSALS</div>
          <button class="btn traversal-button" style="background: #a8d5a810; border: 1px solid #a8d5a835; color: #a8d5a8;" onclick="handleTrav('inorder')">INORDER  L→N→R</button>
          <button class="btn traversal-button" style="background: #6ba87410; border: 1px solid #6ba87435; color: #6ba874;" onclick="handleTrav('preorder')">PREORDER N→L→R</button>
          <button class="btn traversal-button" style="background: #b8842f10; border: 1px solid #b8842f35; color: #b8842f;" onclick="handleTrav('postorder')">POSTORDER L→R→N</button>
          ${travResult ? `
            <div class="trav-result">
              <span class="trav-type">${travResult.type.toUpperCase()}: </span>
              <span class="trav-values">${travResult.result.join(" → ")}</span>
            </div>
          ` : ""}
        </div>

        <div class="panel">
          <div class="panel-title">▸ ROTATION TYPES</div>
          ${[["LL", "Right Rotate on unbalanced"], ["RR", "Left Rotate on unbalanced"], ["LR", "Left then Right Rotate"], ["RL", "Right then Left Rotate"]]
            .map(([t, d]) => {
              const rotCol = ROT_COLOR[t];
              return `
                <div class="legend-item">
                  <div class="legend-color" style="background: ${rotCol}18; border: 1px solid ${rotCol}; color: ${rotCol};">${t}</div>
                  <div class="legend-desc">${d}</div>
                </div>
              `;
            })
            .join("")}
        </div>

        <div class="panel">
          <div class="panel-title">▸ BALANCE FACTOR</div>
          ${[["0", "#8bcc6b", "Perfectly balanced"], ["|1|", "#d4a24a", "Allowed skew"], ["|2|", "#d4695c", "Triggers rotation!"]]
            .map(([bf, c, d]) => `
              <div class="legend-item">
                <div class="bf-dot" style="background: ${c}; box-shadow: 0 0 8px ${c}88;"></div>
                <div>
                  <div class="bf-info" style="color: ${c};">BF=${bf}</div>
                  <div class="bf-sub">${d}</div>
                </div>
              </div>
            `)
            .join("")}
        </div>
      </div>

      <div class="canvas-area">
        <div class="toolbar">
          <span class="toolbar-label">ZOOM</span>
          ${[0.5, 0.75, 1, 1.25, 1.5, 2]
            .map(z => `
              <button 
                class="btn zoom-button ${zoom === z ? "active" : ""}" 
                onclick="setZoom(${z})"
                style="${zoom === z ? "background: #5cb85c22; border-color: #5cb85c; color: #7cfc7c;" : ""}"
              >${z}×</button>
            `)
            .join("")}
          <button class="btn reset-button" onclick="resetZoom()">⌂ RESET</button>
          <span class="toolbar-hint">DRAG TO PAN • SCROLL TO ZOOM</span>
        </div>

        <div class="svg-container grab" 
          onmousedown="onMouseDown(event)" 
          onmousemove="onMouseMove(event)" 
          onmouseup="onMouseUp()" 
          onmouseleave="onMouseUp()" 
          onwheel="onWheel(event)">
          
          <svg width="100%" height="100%" style="position: absolute; inset: 0; pointer-events: none;">
            <defs>
              <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="#1a3a24" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          ${!root ? `
            <div class="empty-state">
              <div class="empty-emoji">🌲</div>
              <div class="empty-text">INSERT VALUES TO GROW THE TREE</div>
              <div class="empty-hint">SUPPORTS COMMA / SPACE SEPARATED BULK INPUT</div>
            </div>
          ` : ""}

          <svg width="100%" height="100%" style="position: absolute; inset: 0;">
            <defs>
              <radialGradient id="ng" cx="35%" cy="30%">
                <stop offset="0%" stopColor="#1a3a24" />
                <stop offset="100%" stopColor="#0d1f0f" />
              </radialGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="sg" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <g transform="translate(${pan.x + 60},${pan.y + 50}) scale(${zoom})">
              ${edges.map((e, i) => {
                const x1 = e.f.x * HS, y1 = e.f.y * VS, x2 = e.t.x * HS, y2 = e.t.y * VS;
                const hl = highlighted.has(String(e.f.data)) && highlighted.has(String(e.t.data));
                const hlC = hlColor === "search" ? "#5eb3af" : "#a8d5a8";
                return `
                  <g>
                    ${hl ? `<line x1="${x1}" y1="${y1 + NR}" x2="${x2}" y2="${y2 - NR}" stroke="${hlC}" stroke-width="4" stroke-opacity="0.2" filter="url(#sg)" />` : ""}
                    <line x1="${x1}" y1="${y1 + NR}" x2="${x2}" y2="${y2 - NR}"
                      stroke="${hl ? hlC : "#1a3a24"}" stroke-width="${hl ? 2.5 : 1.5}"
                      stroke-opacity="${hl ? 1 : 0.8}" style="transition: all .3s" />
                  </g>
                `;
              }).join("")}
              ${nodes.map(node => {
                const cx = node.x * HS, cy = node.y * VS;
                const bf = getBF(node);
                const nc = BF_COLOR(bf);
                const hl = highlighted.has(String(node.data));
                const isNew = newNodes.has(String(node.data));
                const hlC = hlColor === "search" ? "#5eb3af" : "#a8d5a8";
                const animStyle = isNew ? 'style="animation: newNode .6s cubic-bezier(.34,1.56,.64,1)"' : "";
                return `
                  <g ${animStyle} transform-origin="${cx}px ${cy}px">
                    ${hl ? `<circle cx="${cx}" cy="${cy}" r="${NR + 10}" fill="none" stroke="${hlC}" stroke-width="1.5" stroke-opacity="0.3" style="animation: pulse 1.2s ease-in-out infinite" />` : ""}
                    <circle cx="${cx}" cy="${cy}" r="${NR + 4}" fill="none" stroke="${nc}" stroke-width="1" stroke-opacity="0.2" stroke-dasharray="${(NR + 4) * 2 * Math.PI * (1 - Math.abs(bf) / 3)} ${(NR + 4) * 2 * Math.PI * Math.abs(bf) / 3}" />
                    <circle cx="${cx}" cy="${cy + 3}" r="${NR}" fill="#000" fill-opacity="0.4" />
                    <circle cx="${cx}" cy="${cy}" r="${NR}" fill="url(#ng)" stroke="${hl ? hlC : isNew ? "#8bcc6b" : nc}" stroke-width="${hl || isNew ? 2.5 : 1.8}" ${hl || isNew ? 'filter="url(#sg)"' : ""} style="transition: stroke .3s, stroke-width .3s" />
                    <circle cx="${cx}" cy="${cy}" r="${NR - 5}" fill="none" stroke="${nc}" stroke-width="0.6" stroke-opacity="0.25" />
                    <text x="${cx}" y="${cy + 1}" text-anchor="middle" dominant-baseline="middle" fill="${hl ? "#fff" : "#c7d9f0"}" font-size="${node.data > 99 ? 10 : 13}" font-weight="800" font-family="inherit" style="transition: fill .3s">${node.data}</text>
                    <text x="${cx - NR - 5}" y="${cy - 9}" text-anchor="end" font-size="8" fill="#3a5a4a" font-family="inherit">h=${node.h}</text>
                    <text x="${cx + NR + 5}" y="${cy - 9}" text-anchor="start" font-size="9" fill="${nc}" font-weight="700" font-family="inherit">BF${bf >= 0 ? "+" : ""}${bf}</text>
                  </g>
                `;
              }).join("")}
            </g>
          </svg>
        </div>

        <div class="log-panel">
          <div class="log-title">▸ OPERATION LOG</div>
          <div id="log-content">
            ${log.length === 0 ? '<div class="log-empty">Awaiting operations…</div>' : ""}
            ${log.map((e, i) => {
              const c = { insert: "#7cfc7c", delete: "#d4695c", found: "#5eb3af", miss: "#d4a24a", trav: "#a8d5a8", info: "#5a7a6a" }[e.type] || "#5a7a6a";
              return `
                <div class="log-item" style="color: ${c};">
                  <span class="log-time">${new Date(e.t).toLocaleTimeString()}</span>
                  <span class="log-separator">›</span>
                  <span class="log-message">${e.msg}</span>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderLog() {
  const logContent = document.getElementById("log-content");
  if (!logContent) return;
  logContent.innerHTML = log.length === 0 ? '<div class="log-empty">Awaiting operations…</div>' : log.map((e, i) => {
    const c = { insert: "#7cfc7c", delete: "#d4695c", found: "#5eb3af", miss: "#d4a24a", trav: "#a8d5a8", info: "#5a7a6a" }[e.type] || "#5a7a6a";
    return `
      <div class="log-item log-entry" style="color: ${c};">
        <span class="log-time">${new Date(e.t).toLocaleTimeString()}</span>
        <span class="log-separator">›</span>
        <span class="log-message">${e.msg}</span>
      </div>
    `;
  }).join("");
}

// Initial render
render();