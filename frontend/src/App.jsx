function App() {
  const menuItems = [
    "Dashboard",
    "Products",
    "Receipts",
    "Delivery Orders",
    "Internal Transfers",
    "Stock Adjustments",
    "Stock Ledger",
  ];

  const stats = [
    {
      title: "Total Products",
      value: "1,248",
      change: "+12.5%",
      icon: "📦",
    },
    {
      title: "Total Stock",
      value: "8,420",
      change: "+8.2%",
      icon: "📊",
    },
    {
      title: "Low Stock Items",
      value: "24",
      change: "-4.3%",
      icon: "⚠️",
    },
    {
      title: "Locations",
      value: "8",
      change: "+2",
      icon: "📍",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 text-white min-h-screen flex flex-col">

        {/* Logo */}
        <div className="px-6 py-7 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl">
              📦
            </div>

            <div>
              <h1 className="text-xl font-bold">StockSense</h1>
              <p className="text-xs text-slate-400">
                Inventory System
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">

          {menuItems.map((item, index) => (
            <div
              key={item}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition ${
                index === 0
                  ? "bg-blue-600 shadow-lg shadow-blue-600/20"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-lg">
                {["⌂", "▣", "↓", "↑", "⇄", "⚙", "☷"][index]}
              </span>

              <span className="text-sm font-medium">
                {item}
              </span>
            </div>
          ))}

        </nav>

        {/* User */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold">
              A
            </div>

            <div>
              <p className="text-sm font-semibold">
                Admin User
              </p>
              <p className="text-xs text-slate-400">
                Administrator
              </p>
            </div>
          </div>
        </div>

      </aside>

      {/* Main Area */}
      <main className="flex-1 min-w-0">

        {/* Topbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Dashboard
            </h2>

            <p className="text-sm text-slate-500">
              Overview of your inventory
            </p>
          </div>

          <div className="flex items-center gap-4">

            {/* Search */}
            <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-4 py-2.5 w-64">
              <span className="text-slate-400 mr-2">⌕</span>

              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm w-full"
              />
            </div>

            {/* Notification */}
            <button className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 transition">
              🔔
            </button>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              A
            </div>

          </div>

        </header>

        {/* Dashboard Content */}
        <section className="p-8">

          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, Admin 👋
            </h1>

            <p className="text-slate-500 mt-1">
              Here's what's happening with your inventory today.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

            {stats.map((stat) => (
              <div
                key={stat.title}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-sm text-slate-500 font-medium">
                      {stat.title}
                    </p>

                    <h3 className="text-3xl font-bold text-slate-900 mt-2">
                      {stat.value}
                    </h3>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
                    {stat.icon}
                  </div>

                </div>

                <div className="mt-4">
                  <span className="text-sm font-semibold text-emerald-600">
                    {stat.change}
                  </span>

                  <span className="text-xs text-slate-400 ml-2">
                    from last month
                  </span>
                </div>

              </div>
            ))}

          </div>

          {/* Lower Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">

            {/* Recent Activity */}
            <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Recent Activity
                  </h2>

                  <p className="text-sm text-slate-500">
                    Latest inventory movements
                  </p>
                </div>

                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  View all
                </button>
              </div>

              <div className="space-y-4">

                {[
                  ["📥", "New stock received", "Warehouse A", "2 min ago"],
                  ["📤", "Delivery order completed", "Warehouse B", "18 min ago"],
                  ["🔄", "Internal transfer", "A → B", "1 hour ago"],
                  ["⚙️", "Stock adjustment", "Warehouse A", "2 hours ago"],
                ].map(([icon, title, location, time]) => (

                  <div
                    key={title}
                    className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                  >

                    <div className="flex items-center gap-4">

                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        {icon}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {title}
                        </p>

                        <p className="text-xs text-slate-400">
                          {location}
                        </p>
                      </div>

                    </div>

                    <span className="text-xs text-slate-400">
                      {time}
                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Low Stock */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">

              <div className="flex items-center justify-between mb-6">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Low Stock
                  </h2>

                  <p className="text-sm text-slate-500">
                    Items needing attention
                  </p>
                </div>

                <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full">
                  4 items
                </span>

              </div>

              <div className="space-y-4">

                {[
                  ["Wireless Mouse", "8 left"],
                  ["USB Keyboard", "5 left"],
                  ["HDMI Cable", "3 left"],
                  ["Laptop Stand", "2 left"],
                ].map(([product, stock]) => (

                  <div
                    key={product}
                    className="flex items-center justify-between"
                  >

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {product}
                      </p>

                      <p className="text-xs text-red-500 mt-1">
                        {stock}
                      </p>
                    </div>

                    <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-1/4 h-full bg-red-500 rounded-full"></div>
                    </div>

                  </div>

                ))}

              </div>

              <button className="w-full mt-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition">
                View Low Stock
              </button>

            </div>

          </div>

        </section>

      </main>
    </div>
  );
}

export default App;