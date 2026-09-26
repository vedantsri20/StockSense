import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5001";

function App() {
  const [page, setPage] = useState("Dashboard");
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    category: "Electronics",
    price: "",
    quantity: "",
    lowStockThreshold: "5",
    supplier: "",
  });

  const [stockForm, setStockForm] = useState({
    productId: "",
    type: "IN",
    quantity: "",
    note: "",
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/products`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.products);
        if (!stockForm.productId && data.products.length) {
          setStockForm((f) => ({
            ...f,
            productId: data.products[0]._id,
          }));
        }
      }
    } catch (err) {
      console.error(err);
      setMessage("Cannot connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, p) => sum + Number(p.quantity || 0),
    0
  );

  const inventoryValue = products.reduce(
    (sum, p) => sum + Number(p.price || 0) * Number(p.quantity || 0),
    0
  );

  const lowStock = products.filter(
    (p) => Number(p.quantity) <= Number(p.lowStockThreshold)
  );

  const addProduct = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...productForm,
          price: Number(productForm.price),
          quantity: Number(productForm.quantity),
          lowStockThreshold: Number(productForm.lowStockThreshold),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || "Failed to add product");
        return;
      }

      setMessage("Product added successfully!");

      setProductForm({
        name: "",
        sku: "",
        category: "Electronics",
        price: "",
        quantity: "",
        lowStockThreshold: "5",
        supplier: "",
      });

      await loadProducts();
    } catch (err) {
      setMessage("Failed to add product.");
    }
  };

  const updateStock = async (e) => {
    e.preventDefault();

    if (!stockForm.productId || !stockForm.quantity) {
      setMessage("Select product and enter quantity.");
      return;
    }

    try {
      const res = await fetch(`${API}/api/inventory/stock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: stockForm.productId,
          type: stockForm.type,
          quantity: Number(stockForm.quantity),
          note: stockForm.note || "Stock operation",
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || "Stock operation failed");
        return;
      }

      const selectedProduct = products.find(
        (p) => p._id === stockForm.productId
      );

      setTransactions((prev) => [
        {
          id: Date.now(),
          product: selectedProduct?.name || "Product",
          type: stockForm.type,
          quantity: Number(stockForm.quantity),
          note: stockForm.note || "Stock operation",
          time: new Date().toLocaleString(),
        },
        ...prev,
      ]);

      setMessage(
        `Stock ${stockForm.type === "IN" ? "added" : "removed"} successfully! Current stock: ${data.currentStock}`
      );

      setStockForm((f) => ({
        ...f,
        quantity: "",
        note: "",
      }));

      await loadProducts();
    } catch (err) {
      setMessage("Stock operation failed.");
    }
  };

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const nav = ["Dashboard", "Products", "Operations", "Ledger"];

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.logoArea}>
          <div style={styles.logo}>📦</div>
          <div>
            <div style={styles.brand}>StockSense</div>
            <div style={styles.subtitle}>Inventory Management</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {nav.map((item) => (
            <button
              key={item}
              onClick={() => {
                setPage(item);
                setMessage("");
              }}
              style={{
                ...styles.navButton,
                ...(page === item ? styles.activeNav : {}),
              }}
            >
              {item}
            </button>
          ))}
        </nav>

        <div style={styles.avatar}>A</div>
      </header>

      <main style={styles.main}>
        {message && (
          <div style={styles.message}>
            {message}
            <button
              onClick={() => setMessage("")}
              style={styles.closeMessage}
            >
              ×
            </button>
          </div>
        )}

        {page === "Dashboard" && (
          <>
            <section style={styles.hero}>
              <div>
                <p style={styles.goodMorning}>Good morning ☀️</p>
                <h1 style={styles.heroTitle}>Welcome back, Admin 👋</h1>
                <p style={styles.heroText}>
                  Here's your inventory overview for today.
                </p>
              </div>
            </section>

            <section style={styles.valueCard}>
              <div>
                <p style={styles.cardLabel}>Total Inventory Value</p>
                <h2 style={styles.bigNumber}>{money(inventoryValue)}</h2>
                <p style={styles.green}>↗ Live from MongoDB</p>
              </div>

              <div style={styles.chart}>
                {[35, 55, 45, 70, 58, 82, 70, 92].map((height, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.bar,
                      height: `${height}px`,
                    }}
                  />
                ))}
              </div>
            </section>

            <section style={styles.statsGrid}>
              <Stat title="Total Products" value={totalProducts} icon="📦" />
              <Stat title="Total Stock" value={totalStock} icon="📊" />
              <Stat
                title="Low Stock"
                value={lowStock.length}
                icon="⚠️"
                danger
              />
            </section>

            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2>Recent Products</h2>
                <button
                  style={styles.primaryButton}
                  onClick={() => setPage("Products")}
                >
                  View Products →
                </button>
              </div>

              <ProductTable products={products.slice(0, 5)} money={money} />
            </section>
          </>
        )}

        {page === "Products" && (
          <section>
            <div style={styles.sectionHeader}>
              <div>
                <h1 style={styles.pageTitle}>Products</h1>
                <p style={styles.muted}>
                  Manage your inventory products.
                </p>
              </div>
              <button
                style={styles.primaryButton}
                onClick={() =>
                  document
                    .getElementById("add-product")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                + Add Product
              </button>
            </div>

            <ProductTable products={products} money={money} />

            <div id="add-product" style={styles.formCard}>
              <h2>Add New Product</h2>

              <form onSubmit={addProduct}>
                <div style={styles.formGrid}>
                  <Input
                    label="Product Name"
                    value={productForm.name}
                    onChange={(v) =>
                      setProductForm({ ...productForm, name: v })
                    }
                    required
                  />

                  <Input
                    label="SKU"
                    value={productForm.sku}
                    onChange={(v) =>
                      setProductForm({ ...productForm, sku: v })
                    }
                    required
                  />

                  <Input
                    label="Category"
                    value={productForm.category}
                    onChange={(v) =>
                      setProductForm({ ...productForm, category: v })
                    }
                  />

                  <Input
                    label="Price"
                    type="number"
                    value={productForm.price}
                    onChange={(v) =>
                      setProductForm({ ...productForm, price: v })
                    }
                    required
                  />

                  <Input
                    label="Quantity"
                    type="number"
                    value={productForm.quantity}
                    onChange={(v) =>
                      setProductForm({ ...productForm, quantity: v })
                    }
                    required
                  />

                  <Input
                    label="Low Stock Threshold"
                    type="number"
                    value={productForm.lowStockThreshold}
                    onChange={(v) =>
                      setProductForm({
                        ...productForm,
                        lowStockThreshold: v,
                      })
                    }
                  />

                  <Input
                    label="Supplier"
                    value={productForm.supplier}
                    onChange={(v) =>
                      setProductForm({ ...productForm, supplier: v })
                    }
                  />
                </div>

                <button style={styles.primaryButton} type="submit">
                  Add Product
                </button>
              </form>
            </div>
          </section>
        )}

        {page === "Operations" && (
          <section>
            <div style={styles.sectionHeader}>
              <div>
                <h1 style={styles.pageTitle}>Inventory Operations</h1>
                <p style={styles.muted}>
                  Add or remove stock from your inventory.
                </p>
              </div>
            </div>

            <div style={styles.operationGrid}>
              <div style={styles.formCard}>
                <h2>Stock Operation</h2>

                <form onSubmit={updateStock}>
                  <label style={styles.label}>Product</label>
                  <select
                    style={styles.input}
                    value={stockForm.productId}
                    onChange={(e) =>
                      setStockForm({
                        ...stockForm,
                        productId: e.target.value,
                      })
                    }
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} — {p.quantity} units
                      </option>
                    ))}
                  </select>

                  <label style={styles.label}>Operation</label>
                  <select
                    style={styles.input}
                    value={stockForm.type}
                    onChange={(e) =>
                      setStockForm({
                        ...stockForm,
                        type: e.target.value,
                      })
                    }
                  >
                    <option value="IN">Stock IN</option>
                    <option value="OUT">Stock OUT</option>
                  </select>

                  <Input
                    label="Quantity"
                    type="number"
                    value={stockForm.quantity}
                    onChange={(v) =>
                      setStockForm({
                        ...stockForm,
                        quantity: v,
                      })
                    }
                    required
                  />

                  <Input
                    label="Note"
                    value={stockForm.note}
                    onChange={(v) =>
                      setStockForm({
                        ...stockForm,
                        note: v,
                      })
                    }
                  />

                  <button style={styles.primaryButton} type="submit">
                    {stockForm.type === "IN"
                      ? "＋ Add Stock"
                      : "− Remove Stock"}
                  </button>
                </form>
              </div>

              <div style={styles.formCard}>
                <h2>Current Inventory</h2>
                <div style={styles.inventoryList}>
                  {products.map((p) => (
                    <div key={p._id} style={styles.inventoryRow}>
                      <div>
                        <strong>{p.name}</strong>
                        <div style={styles.muted}>{p.sku}</div>
                      </div>

                      <strong
                        style={{
                          color:
                            p.quantity <= p.lowStockThreshold
                              ? "#dc2626"
                              : "#16a34a",
                        }}
                      >
                        {p.quantity} units
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {page === "Ledger" && (
          <section>
            <div style={styles.sectionHeader}>
              <div>
                <h1 style={styles.pageTitle}>Transaction Ledger</h1>
                <p style={styles.muted}>
                  Stock operations performed during this session.
                </p>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div style={styles.empty}>
                <div style={{ fontSize: 50 }}>📋</div>
                <h2>No transactions yet</h2>
                <p>
                  Perform a Stock IN or Stock OUT operation to see it here.
                </p>
                <button
                  style={styles.primaryButton}
                  onClick={() => setPage("Operations")}
                >
                  Go to Operations
                </button>
              </div>
            ) : (
              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Note</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id}>
                        <td>{t.product}</td>
                        <td>
                          <span
                            style={{
                              ...styles.badge,
                              background:
                                t.type === "IN" ? "#dcfce7" : "#fee2e2",
                              color:
                                t.type === "IN" ? "#166534" : "#991b1b",
                            }}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td>{t.quantity}</td>
                        <td>{t.note}</td>
                        <td>{t.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function Stat({ title, value, icon, danger }) {
  return (
    <div style={styles.statCard}>
      <div>
        <p style={styles.cardLabel}>{title}</p>
        <h2 style={styles.statNumber}>{value.toLocaleString()}</h2>
        <p style={{ color: danger ? "#dc2626" : "#16a34a" }}>
          {danger ? "⚠ Needs attention" : "↗ Live data"}
        </p>
      </div>

      <div style={styles.statIcon}>{icon}</div>
    </div>
  );
}

function ProductTable({ products, money }) {
  if (!products.length) {
    return (
      <div style={styles.empty}>
        <div style={{ fontSize: 45 }}>📦</div>
        <h2>No products found</h2>
        <p>Add your first product to get started.</p>
      </div>
    );
  }

  return (
    <div style={styles.tableCard}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => {
            const isLow =
              Number(p.quantity) <= Number(p.lowStockThreshold);

            return (
              <tr key={p._id || p.sku}>
                <td>
                  <strong>{p.name}</strong>
                  <div style={styles.muted}>{p.supplier}</div>
                </td>
                <td>{p.sku}</td>
                <td>{p.category}</td>
                <td>{money(p.price)}</td>
                <td>{p.quantity}</td>
                <td>
                  <span
                    style={{
                      ...styles.badge,
                      background: isLow ? "#fee2e2" : "#dcfce7",
                      color: isLow ? "#991b1b" : "#166534",
                    }}
                  >
                    {isLow ? "Low Stock" : "In Stock"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input
        style={styles.input}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "#f4f7fb",
    color: "#0f172a",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },

  header: {
    height: 82,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 6%",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },

  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  logo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: "#2563eb",
    display: "grid",
    placeItems: "center",
    fontSize: 25,
  },

  brand: {
    fontSize: 22,
    fontWeight: 800,
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 13,
  },

  nav: {
    display: "flex",
    gap: 8,
    height: "100%",
    alignItems: "center",
  },

  navButton: {
    border: 0,
    background: "transparent",
    padding: "14px 18px",
    fontSize: 15,
    color: "#64748b",
    cursor: "pointer",
    borderBottom: "3px solid transparent",
  },

  activeNav: {
    color: "#2563eb",
    borderBottom: "3px solid #2563eb",
    fontWeight: 700,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "#2563eb",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
  },

  main: {
    maxWidth: 1300,
    margin: "0 auto",
    padding: "40px 5%",
  },

  hero: {
    padding: "30px 0 35px",
  },

  goodMorning: {
    color: "#64748b",
    margin: 0,
  },

  heroTitle: {
    fontSize: "clamp(34px, 5vw, 58px)",
    margin: "8px 0",
    fontWeight: 850,
  },

  heroText: {
    fontSize: 19,
    color: "#64748b",
    margin: 0,
  },

  valueCard: {
    background: "#071024",
    color: "#fff",
    borderRadius: 28,
    padding: "42px 45px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    boxShadow: "0 20px 50px rgba(15,23,42,.18)",
  },

  cardLabel: {
    color: "#64748b",
    margin: "0 0 10px",
    fontWeight: 600,
  },

  bigNumber: {
    fontSize: "clamp(38px, 5vw, 58px)",
    margin: "5px 0",
  },

  green: {
    color: "#10b981",
    fontWeight: 700,
  },

  chart: {
    height: 110,
    display: "flex",
    alignItems: "end",
    gap: 10,
  },

  bar: {
    width: 28,
    background: "linear-gradient(#06b6d4,#10b981)",
    borderRadius: "8px 8px 0 0",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 22,
    marginBottom: 35,
  },

  statCard: {
    background: "#fff",
    borderRadius: 20,
    padding: 25,
    display: "flex",
    justifyContent: "space-between",
    border: "1px solid #e5e7eb",
    boxShadow: "0 8px 25px rgba(15,23,42,.05)",
  },

  statNumber: {
    fontSize: 34,
    margin: "4px 0",
  },

  statIcon: {
    fontSize: 30,
    width: 55,
    height: 55,
    display: "grid",
    placeItems: "center",
    background: "#eff6ff",
    borderRadius: 15,
  },

  section: {
    marginTop: 30,
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    marginBottom: 20,
  },

  pageTitle: {
    fontSize: 36,
    margin: "0 0 5px",
  },

  muted: {
    color: "#64748b",
    fontSize: 13,
  },

  primaryButton: {
    background: "#2563eb",
    color: "#fff",
    border: 0,
    borderRadius: 10,
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },

  tableCard: {
    background: "#fff",
    borderRadius: 18,
    overflow: "auto",
    border: "1px solid #e5e7eb",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 750,
  },

  formCard: {
    background: "#fff",
    borderRadius: 20,
    padding: 28,
    marginTop: 28,
    border: "1px solid #e5e7eb",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: 18,
    marginBottom: 20,
  },

  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 7,
    color: "#475569",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    borderRadius: 9,
    border: "1px solid #cbd5e1",
    fontSize: 15,
    marginBottom: 16,
    outline: "none",
  },

  operationGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 25,
  },

  inventoryList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  inventoryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    background: "#f8fafc",
    borderRadius: 12,
  },

  badge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },

  empty: {
    background: "#fff",
    padding: 50,
    textAlign: "center",
    borderRadius: 20,
    border: "1px solid #e5e7eb",
  },

  message: {
    background: "#dcfce7",
    color: "#166534",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    display: "flex",
    justifyContent: "space-between",
  },

  closeMessage: {
    border: 0,
    background: "transparent",
    cursor: "pointer",
    fontSize: 20,
  },
};

export default App;