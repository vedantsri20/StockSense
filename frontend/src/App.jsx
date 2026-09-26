function App() {
  const products = [
    {
      name: "Wireless Mouse",
      category: "Electronics",
      stock: 128,
      status: "In Stock",
    },
    {
      name: "USB Keyboard",
      category: "Accessories",
      stock: 85,
      status: "In Stock",
    },
    {
      name: "HDMI Cable",
      category: "Accessories",
      stock: 12,
      status: "Low Stock",
    },
    {
      name: "Laptop Stand",
      category: "Office",
      stock: 6,
      status: "Low Stock",
    },
  ];

  const quickActions = [
    {
      icon: "📥",
      title: "Receive Stock",
      description: "Add incoming inventory",
    },
    {
      icon: "📤",
      title: "Delivery Order",
      description: "Create outgoing order",
    },
    {
      icon: "🔄",
      title: "Transfer Stock",
      description: "Move between locations",
    },
    {
      icon: "⚙️",
      title: "Stock Adjustment",
      description: "Correct inventory quantity",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden">

      {/* =====================================================
          ANIMATED BACKGROUND
      ====================================================== */}

      <style>{`
        @keyframes floatBox {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-18px) rotate(2deg);
          }
        }

        @keyframes floatCard {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.25;
            transform: scale(1);
          }
          50% {
            opacity: 0.55;
            transform: scale(1.08);
          }
        }

        @keyframes moveDots {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        @keyframes lineMove {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -500;
          }
        }

        .ss-glow {
          animation: glowPulse 7s ease-in-out infinite;
        }

        .ss-box {
          animation: floatBox 7s ease-in-out infinite;
        }

        .ss-card {
          animation: floatCard 5s ease-in-out infinite;
        }

        .ss-dots {
          animation: moveDots 5s ease-in-out infinite;
        }

        .ss-line {
          stroke-dasharray: 8 12;
          animation: lineMove 15s linear infinite;
        }
      `}</style>


      {/* =====================================================
          LARGE BACKGROUND GLOWS
      ====================================================== */}

      <div className="ss-glow fixed -top-72 -left-64 w-[750px] h-[750px] rounded-full bg-blue-400/25 blur-[120px] pointer-events-none" />

      <div
        className="ss-glow fixed top-24 -right-72 w-[700px] h-[700px] rounded-full bg-cyan-300/25 blur-[120px] pointer-events-none"
        style={{ animationDelay: "2s" }}
      />

      <div
        className="ss-glow fixed bottom-[-300px] left-[20%] w-[800px] h-[600px] rounded-full bg-indigo-300/20 blur-[120px] pointer-events-none"
        style={{ animationDelay: "4s" }}
      />

      <div
        className="ss-glow fixed bottom-[-250px] right-[-100px] w-[600px] h-[600px] rounded-full bg-emerald-300/20 blur-[110px] pointer-events-none"
        style={{ animationDelay: "1s" }}
      />


      {/* =====================================================
          DOT GRID
      ====================================================== */}

      <div
        className="fixed inset-0 opacity-[0.16] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #2563eb 1.2px, transparent 1.2px)",
          backgroundSize: "30px 30px",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 55%, transparent 95%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 55%, transparent 95%)",
        }}
      />


      {/* =====================================================
          TOP FLOWING WAVES
      ====================================================== */}

      <svg
        className="absolute top-0 left-0 w-full h-[470px] pointer-events-none"
        viewBox="0 0 1440 470"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="waveBlue"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.20" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.10" />
          </linearGradient>

          <linearGradient
            id="waveGreen"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.10" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        <path
          d="M0 170 C180 20 320 310 520 160 C720 10 850 310 1050 145 C1220 25 1330 140 1440 55 L1440 0 L0 0 Z"
          fill="url(#waveBlue)"
        />

        <path
          d="M0 270 C180 110 350 370 560 225 C760 80 900 360 1080 190 C1240 70 1340 180 1440 100 L1440 0 L0 0 Z"
          fill="url(#waveGreen)"
        />

        <path
          d="M0 190 C180 45 320 315 520 170 C720 30 850 320 1050 150 C1220 40 1330 145 1440 65"
          fill="none"
          stroke="#60a5fa"
          strokeOpacity="0.35"
          strokeWidth="2"
        />

        <path
          d="M0 245 C180 100 350 350 560 210 C760 65 900 350 1080 180 C1240 65 1340 170 1440 100"
          fill="none"
          stroke="#34d399"
          strokeOpacity="0.25"
          strokeWidth="2"
          className="ss-line"
        />
      </svg>


      {/* =====================================================
          FLOATING INVENTORY BOX
      ====================================================== */}

      <div className="ss-box absolute top-24 right-[10%] hidden lg:block pointer-events-none">

        <svg
          width="230"
          height="230"
          viewBox="0 0 230 230"
          className="drop-shadow-2xl"
        >
          <defs>
            <linearGradient
              id="boxTop"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>

            <linearGradient
              id="boxLeft"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>

            <linearGradient
              id="boxRight"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          <ellipse
            cx="115"
            cy="198"
            rx="70"
            ry="13"
            fill="#0f172a"
            opacity="0.12"
          />

          <polygon
            points="115,35 185,75 115,115 45,75"
            fill="url(#boxTop)"
          />

          <polygon
            points="45,75 115,115 115,185 45,145"
            fill="url(#boxLeft)"
          />

          <polygon
            points="115,115 185,75 185,145 115,185"
            fill="url(#boxRight)"
          />

          <polygon
            points="103,42 127,55 127,108 103,121"
            fill="white"
            opacity="0.65"
          />

          <path
            d="M99 82 L115 91 L131 82"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />

          <path
            d="M115 91 L115 106"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>

      </div>


      {/* =====================================================
          FLOATING STOCK CARD
      ====================================================== */}

      <div className="ss-card absolute top-48 right-[4%] hidden xl:block pointer-events-none">

        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-xl rounded-2xl px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              📦
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Stock received
              </p>

              <p className="text-sm font-bold text-slate-800">
                +248 units
              </p>
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          LEFT FLOATING TRANSFER CARD
      ====================================================== */}

      <div
        className="ss-card absolute top-[390px] left-[3%] hidden xl:block pointer-events-none"
        style={{ animationDelay: "1.5s" }}
      >

        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-xl rounded-2xl px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              🔄
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Stock transfer
              </p>

              <p className="text-sm font-bold text-slate-800">
                Warehouse A → B
              </p>
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          FLOATING PARTICLES
      ====================================================== */}

      <div className="ss-dots fixed top-44 left-[7%] w-3 h-3 rounded-full bg-blue-500/60 pointer-events-none" />

      <div
        className="ss-dots fixed top-72 right-[18%] w-4 h-4 rounded-full bg-emerald-400/60 pointer-events-none"
        style={{ animationDelay: "1s" }}
      />

      <div
        className="ss-dots fixed top-[460px] right-[7%] w-3 h-3 rounded-full bg-cyan-400/60 pointer-events-none"
        style={{ animationDelay: "2s" }}
      />

      <div
        className="ss-dots fixed bottom-40 left-[12%] w-3 h-3 rounded-full bg-indigo-400/50 pointer-events-none"
        style={{ animationDelay: "3s" }}
      />


      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="relative z-20 bg-white/70 backdrop-blur-xl border-b border-white/70">

        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-xl shadow-lg shadow-blue-600/25">
              📦
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                StockSense
              </h1>

              <p className="text-xs text-slate-400">
                Inventory Management
              </p>
            </div>

          </div>


          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-9">

            <button className="relative text-sm font-semibold text-blue-600 py-7">
              Dashboard

              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            </button>

            <button className="text-sm font-medium text-slate-500 hover:text-blue-600 transition">
              Products
            </button>

            <button className="text-sm font-medium text-slate-500 hover:text-blue-600 transition">
              Operations
            </button>

            <button className="text-sm font-medium text-slate-500 hover:text-blue-600 transition">
              Ledger
            </button>

          </nav>


          {/* User */}
          <div className="flex items-center gap-4">

            <button className="relative w-10 h-10 rounded-xl hover:bg-white/80 transition text-lg">
              🔔

              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              A
            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">


        {/* Welcome */}
        <section className="mb-8">

          <p className="text-sm font-medium text-slate-500 mb-2">
            Good morning ☀️
          </p>

          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950">
            Welcome back, Admin 👋
          </h2>

          <p className="text-slate-500 mt-3 text-lg">
            Here's your inventory overview for today.
          </p>

        </section>


        {/* =====================================================
            TOTAL INVENTORY VALUE
        ====================================================== */}

        <section className="relative overflow-hidden rounded-[28px] bg-slate-950 text-white p-8 md:p-10 shadow-2xl shadow-slate-900/20 mb-7">

          <div className="absolute -top-32 right-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="absolute -bottom-40 left-1/3 w-96 h-64 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">

            <div>

              <p className="text-slate-400 text-sm font-medium mb-3">
                Total Inventory Value
              </p>

              <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                ₹24,85,600
              </h3>

              <div className="flex items-center gap-2 mt-4">

                <span className="text-emerald-400 font-bold">
                  ↗ +8.42%
                </span>

                <span className="text-slate-400 text-sm">
                  this month
                </span>

              </div>

            </div>


            {/* Chart */}
            <div className="w-full md:w-[430px]">

              <div className="flex justify-end mb-3">

                <button className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-xs text-slate-300">
                  This Month⌄
                </button>

              </div>

              <div className="h-32 flex items-end gap-2">

                {[25, 40, 32, 55, 42, 65, 58, 76, 66, 88].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t-lg bg-gradient-to-t from-emerald-500 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 transition-all duration-300"
                      style={{ height: `${height}%` }}
                    />
                  )
                )}

              </div>

              <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            KPI CARDS
        ====================================================== */}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          {/* Products */}
          <div className="group bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500 font-medium">
                  Total Products
                </p>

                <h3 className="text-3xl font-extrabold mt-2">
                  1,248
                </h3>

              </div>

              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-xl group-hover:scale-110 transition">
                📦
              </div>

            </div>

            <div className="mt-4 flex items-center gap-2">

              <span className="text-emerald-600 font-bold text-sm">
                ↗ +12.5%
              </span>

              <span className="text-xs text-slate-400">
                from last month
              </span>

            </div>

          </div>


          {/* Stock */}
          <div className="group bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500 font-medium">
                  Total Stock
                </p>

                <h3 className="text-3xl font-extrabold mt-2">
                  8,420
                </h3>

              </div>

              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl group-hover:scale-110 transition">
                📊
              </div>

            </div>

            <div className="mt-4 flex items-center gap-2">

              <span className="text-emerald-600 font-bold text-sm">
                ↗ +8.2%
              </span>

              <span className="text-xs text-slate-400">
                from last month
              </span>

            </div>

          </div>


          {/* Low stock */}
          <div className="group bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500 font-medium">
                  Low Stock
                </p>

                <h3 className="text-3xl font-extrabold mt-2">
                  24
                </h3>

              </div>

              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-xl group-hover:scale-110 transition">
                ⚠️
              </div>

            </div>

            <div className="mt-4">

              <span className="text-orange-500 font-semibold text-sm">
                ↗ Needs attention
              </span>

            </div>

          </div>

        </section>


        {/* =====================================================
            PRODUCTS + QUICK ACTIONS
        ====================================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Products */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-6 shadow-sm">

            <div className="flex items-center justify-between mb-6">

              <div>

                <h3 className="text-xl font-bold">
                  Products
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Your inventory at a glance
                </p>

              </div>

              <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                View all →
              </button>

            </div>


            <div className="hidden md:grid grid-cols-4 px-4 pb-3 text-xs font-semibold text-slate-400">

              <span>Product</span>
              <span>Category</span>
              <span>Stock</span>
              <span>Status</span>

            </div>


            {products.map((product) => (

              <div
                key={product.name}
                className="grid grid-cols-1 md:grid-cols-4 items-center gap-3 px-4 py-4 border-t border-slate-100 hover:bg-blue-50/40 transition rounded-xl"
              >

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    📦
                  </div>

                  <span className="font-semibold text-sm">
                    {product.name}
                  </span>

                </div>

                <span className="text-sm text-slate-500">
                  {product.category}
                </span>

                <span className="font-bold text-sm">
                  {product.stock}
                </span>

                <span
                  className={`w-fit px-3 py-1 rounded-full text-xs font-semibold ${
                    product.status === "In Stock"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {product.status}
                </span>

              </div>

            ))}

          </div>


          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-6 shadow-sm">

            <div className="mb-5">

              <h3 className="text-xl font-bold">
                Quick Actions
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Common inventory operations
              </p>

            </div>


            <div className="space-y-3">

              {quickActions.map((action) => (

                <button
                  key={action.title}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/60 hover:shadow-sm transition-all text-left group"
                >

                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-lg group-hover:scale-110 transition">
                    {action.icon}
                  </div>

                  <div className="flex-1">

                    <p className="text-sm font-bold">
                      {action.title}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {action.description}
                    </p>

                  </div>

                  <span className="text-slate-400 group-hover:text-blue-600 transition">
                    →
                  </span>

                </button>

              ))}

            </div>

          </div>

        </section>


        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer className="text-center py-10">

          <p className="text-xs text-slate-400">
            StockSense • Smart Inventory Management
          </p>

        </footer>

      </main>

    </div>
  );
}

export default App;