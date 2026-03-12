class AVLNode {
  constructor(data) {
    this.data = data;
    this.h = 1;
    this.left = null;
    this.right = null;
    this.id = Math.random().toString(36).substr(2, 9);
    this.x = 0;
    this.y = 0;
    this.bf = 0;
  }
}

const ht = n => n ? n.h : 0;
const getBF = n => n ? ht(n.left) - ht(n.right) : 0;
const updH = n => { if (n) n.h = 1 + Math.max(ht(n.left), ht(n.right)); };
const leftRot = r => { const nr = r.right; r.right = nr.left; updH(r); nr.left = r; updH(nr); return nr; };
const rightRot = r => { const nr = r.left; r.left = nr.right; updH(r); nr.right = r; updH(nr); return nr; };

function balance(root) {
  updH(root);
  const bf = getBF(root);
  root.bf = bf;
  if (bf === -2) {
    if (getBF(root.right) === 1) { root.right = rightRot(root.right); return leftRot(root); }
    return leftRot(root);
  }
  if (bf === 2) {
    if (getBF(root.left) === -1) { root.left = leftRot(root.left); return rightRot(root); }
    return rightRot(root);
  }
  return root;
}

function insert(root, x, rots = []) {
  if (!root) return { node: new AVLNode(x), rots };
  if (x < root.data) { const r = insert(root.left, x, rots); root.left = r.node; }
  else if (x > root.data) { const r = insert(root.right, x, rots); root.right = r.node; }
  else return { node: root, rots };
  updH(root);
  const abf = getBF(root);
  if (abf === -2) {
    if (getBF(root.right) === 1) rots.push("RL"); else rots.push("RR");
  } else if (abf === 2) {
    if (getBF(root.left) === -1) rots.push("LR"); else rots.push("LL");
  }
  return { node: balance(root), rots };
}

function del(root, x, rots = []) {
  if (!root) return { node: null, rots };
  if (x < root.data) { const r = del(root.left, x, rots); root.left = r.node; }
  else if (x > root.data) { const r = del(root.right, x, rots); root.right = r.node; }
  else {
    if (!root.left || !root.right) return { node: root.left || root.right, rots };
    let s = root.right; while (s.left) s = s.left;
    root.data = s.data;
    const r = del(root.right, s.data, rots); root.right = r.node;
  }
  if (!root) return { node: null, rots };
  const abf = getBF(root);
  if (abf === 2) { if (getBF(root.left) >= 0) rots.push("LL"); else rots.push("LR"); }
  else if (abf === -2) { if (getBF(root.right) <= 0) rots.push("RR"); else rots.push("RL"); }
  return { node: balance(root), rots };
}

function searchPath(root, x, path = []) {
  if (!root) return { found: false, path };
  path.push(root.data);
  if (x === root.data) return { found: true, path };
  return searchPath(x < root.data ? root.left : root.right, x, path);
}

function inorder(r) { return r ? [...inorder(r.left), r.data, ...inorder(r.right)] : []; }
function preorder(r) { return r ? [r.data, ...preorder(r.left), ...preorder(r.right)] : []; }
function postorder(r) { return r ? [...postorder(r.left), ...postorder(r.right), r.data] : []; }

function computePos(root, depth = 0, ctr = { v: 0 }) {
  if (!root) return;
  computePos(root.left, depth + 1, ctr);
  root.x = ctr.v++;
  root.y = depth;
  computePos(root.right, depth + 1, ctr);
  root.bf = getBF(root);
}

function clone(n) {
  if (!n) return null;
  const c = new AVLNode(n.data);
  c.h = n.h;
  c.x = n.x;
  c.y = n.y;
  c.bf = n.bf;
  c.id = n.id;
  c.left = clone(n.left);
  c.right = clone(n.right);
  return c;
}

function allNodes(r) { return r ? [r, ...allNodes(r.left), ...allNodes(r.right)] : []; }
function allEdges(r) {
  if (!r) return [];
  const e = [];
  if (r.left) e.push({ f: r, t: r.left });
  if (r.right) e.push({ f: r, t: r.right });
  return [...e, ...allEdges(r.left), ...allEdges(r.right)];
}

const BF_COLOR = bf => bf === 0 ? "#8bcc6b" : Math.abs(bf) === 1 ? "#d4a24a" : "#d4695c";
const ROT_COLOR = { LL: "#5cb85c", RR: "#a8d5a8", LR: "#6ba874", RL: "#b8842f" };