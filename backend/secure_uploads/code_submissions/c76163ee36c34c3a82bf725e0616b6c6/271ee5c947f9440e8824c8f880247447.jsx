import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import ProductCard from '../components/products/ProductCard.jsx'
import { products, CATEGORIES } from '../data/products.js'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

function Shop() {
  const query = useQuery()
  const initialCategory = query.get('category') || 'All'
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [search, setSearch] = useState('')

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory
    const searchText = search.trim().toLowerCase()
    const matchesSearch =
      !searchText ||
      product.name.toLowerCase().includes(searchText) ||
      product.description.toLowerCase().includes(searchText)
    return matchesCategory && matchesSearch
  })

  const categoriesWithAll = ['All', ...CATEGORIES]

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Shop
        </p>
        <h1 className="text-2xl font-semibold text-text sm:text-3xl">
          Curated pieces for every moment.
        </h1>
        <p className="max-w-2xl text-sm text-text/70">
          Filter by category or search to find the outfit that speaks your style.
        </p>
      </header>

      <section className="space-y-4 rounded-2xl bg-white/80 p-3 shadow-soft sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {categoriesWithAll.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-background text-text hover:bg-primary/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search outfits, fabric, work…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-primary/20 bg-background px-4 py-2 text-sm outline-none ring-primary/20 placeholder:text-text/40 focus:border-primary focus:ring-2"
            />
          </div>
        </div>
      </section>

      <section>
        {filteredProducts.length === 0 ? (
          <p className="rounded-2xl bg-white/80 px-4 py-6 text-sm text-text/70 shadow-soft">
            No pieces matched your search. Try another keyword or category.
          </p>
        ) : (
          <motion.div layout>
            <AnimatePresence>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  )
}

export default Shop

