# DSA-Project-Self-Balancing-BST-AVL-Tree-
# AVL Tree Visualizer 🌳

An interactive **AVL Tree (Self-Balancing Binary Search Tree) visualisation web application** built using **HTML, CSS, and JavaScript**.
This tool helps users understand how AVL trees maintain balance through rotations during insertion and deletion operations.

---

# Project Overview

A **Binary Search Tree (BST)** allows efficient searching, insertion, and deletion. However, when the tree becomes skewed, the performance degrades.

To solve this problem, **AVL Trees** automatically maintain balance by performing rotations whenever the tree becomes unbalanced.

This project provides a **visual interface** where users can:

* Insert values
* Delete nodes
* Search values
* Observe AVL balancing rotations
* Perform tree traversals
* View balance factors and node heights

The application dynamically updates the tree structure and highlights balancing operations in real time.

---

# Binary Search Tree Time Complexity

| Operation | Average Case | Worst Case |
| --------- | ------------ | ---------- |
| Search    | O(log n)     | O(n)       |
| Insert    | O(log n)     | O(n)       |
| Delete    | O(log n)     | O(n)       |

If nodes are inserted in sorted order, the BST becomes **skewed**, causing operations to degrade to **O(n)**.

Example of a skewed BST:

```
1
 \
  2
   \
    3
     \
      4
```

---

# Why Balanced Trees Are Needed

Balanced trees maintain a **height close to log(n)**, ensuring efficient operations.

Without balancing:

* Tree height becomes large
* Search operations become slow
* Performance becomes similar to a linked list

Balanced trees solve this issue by restructuring the tree automatically.

Examples include:

* AVL Tree
* Red-Black Tree
* B-Tree

---

# Introduction to AVL Trees

An **AVL Tree** is a **self-balancing binary search tree** introduced by **Adelson-Velsky and Landis**.

AVL Trees maintain balance using a **Balance Factor (BF)**.

### Balance Factor Formula

```
BF = height(left subtree) − height(right subtree)
```

Allowed values:

```
-1
0
+1
```

If BF becomes **+2 or -2**, the tree becomes unbalanced and rotations are performed.

---

# Types of AVL Rotations

## 1. Left-Left (LL) Rotation

Occurs when a node is inserted into the **left subtree of the left child**.

Solution:

Right Rotation

```
Before

    z
   /
  y
 /
x

After

   y
  / \
 x   z
```

---

## 2. Right-Right (RR) Rotation

Occurs when a node is inserted into the **right subtree of the right child**.

Solution:

Left Rotation

```
Before

z
 \
  y
   \
    x

After

   y
  / \
 z   x
```

---

## 3. Left-Right (LR) Rotation

Occurs when insertion happens in the **right subtree of the left child**.

Solution:

1. Left rotation on left child
2. Right rotation on root

---

## 4. Right-Left (RL) Rotation

Occurs when insertion happens in the **left subtree of the right child**.

Solution:

1. Right rotation on right child
2. Left rotation on root

---

# AVL Tree vs Red-Black Tree

| Feature       | AVL Tree          | Red-Black Tree  |
| ------------- | ----------------- | --------------- |
| Balance       | Strictly balanced | Less strict     |
| Height        | Smaller           | Slightly larger |
| Search        | Faster            | Slightly slower |
| Insert/Delete | More rotations    | Fewer rotations |

### When to Use

**AVL Tree**

* When searching is frequent
* Lookup-heavy applications
* Databases and indexing

**Red-Black Tree**

* Frequent insertions and deletions
* Used in many standard libraries

Examples:

* Java `TreeMap`
* C++ `map` and `set`

---

# Features of This Visualizer

* Insert multiple values at once
* Delete nodes dynamically
* Search nodes with highlighted path
* Visual representation of AVL rotations
* Displays node **height** and **balance factor**
* Tree traversal visualization:

  * Inorder
  * Preorder
  * Postorder
* Interactive zoom and pan
* Operation log panel
* Random tree generation

---

# Technologies Used

* HTML5
* CSS3
* JavaScript (ES6)
* SVG for tree visualization

---

# Project Structure

```
AVL-Tree-Visualizer
│
├── index.html      # Main webpage
├── style.css       # UI styling and animations
├── avl.js          # AVL tree algorithm implementation
├── script.js       # Visualization logic and UI interactions
└── README.md
```

---

# How to Run the Project

1. Clone the repository

```
git clone https://github.com/yourusername/AVL-Tree-Visualizer.git
```

2. Open the project folder.

3. Run the project by opening:

```
index.html
```

in your browser.

4. Enter values and observe how the AVL tree balances itself.

---

# Deployment

The project can be deployed using:

* Netlify
* Vercel
* Render

Example deployment steps using Netlify:

1. Push project to GitHub
2. Open Netlify
3. Import GitHub repository
4. Deploy site

---

# Learning Outcomes

Through this project, the following concepts were explored:

* Binary Search Trees
* Tree height and balance factor
* AVL tree rotations
* Self-balancing tree structures
* Algorithm visualization using web technologies

---

# Author

DSA Project
AVL Tree Visualization Tool
