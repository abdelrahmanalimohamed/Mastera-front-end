import { useMemo, useState } from 'react'

// Helper component for mobile detail rows
const DetailRow = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) => (
  <div className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0 animate-fadeIn">
    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase block mb-1">{label}</label>
    <p className={`text-sm ${highlight ? 'font-semibold text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>{value}</p>
  </div>
)

// Helper component for desktop detail rows
const DetailRowDesktop = ({ label, value, highlight = false, darkMode = false }: { label: string; value: string; highlight?: boolean; darkMode?: boolean }) => (
  <div className="animate-slideUp">
    <label className={`text-xs font-semibold uppercase block mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</label>
    <p className={`text-sm break-words ${highlight ? `font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'}` : darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
      {value}
    </p>
  </div>
)

// Sort indicator component
const SortIcon = ({ direction }: { direction?: 'asc' | 'desc' | null }) => (
  <span className="ml-1 inline-block">
    {direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '⇅'}
  </span>
)

type FileRef = { name: string; url: string }

type Row = {
  id: number
  partnerNumber: string
  companyCode: string
  name1: string
  name2: string
  businessGroup: string
  industry: string
  phone1: string
  phone2: string
  withTaxType: string
  holdingSubject: string
  searchTerm1: string
  searchTerm2: string
  taxId: string
  file?: FileRef | null
  address: string
  commercialId: string
  crEndDate: string
  crDaysLeft: number
  taxEndDate: string
  taxDaysLeft: number
  email: string
  class: string
  blocked: boolean
  blockReason: string
}

const companies = ['D100', 'D710', 'BH01', 'DH01', 'B200', 'D600', 'C102', 'C200', 'CH01', 'D500', 'K300', 'B300', 'D300', 'C103', 'C100', 'C400', 'D200', 'B400', 'C101', 'C104', 'B100', 'D400', 'D800', 'SIAC', 'C300', 'D700']

const sampleData = Array.from({ length: 47 }).map((_, i) => ({
  id: i + 1,
  partnerNumber: `P${1000 + i}`,
  companyCode: companies[i % companies.length],
  name1: `Company ${i + 1}`,
  name2: `Branch ${((i % 5) + 1)}`,
  businessGroup: ['Group A', 'Group B', 'Group C'][i % 3],
  industry: ['Manufacturing', 'Services', 'Trading'][i % 3],
  phone1: `+971-50-${String(1000 + i).slice(-4)}`,
  phone2: `+971-4-${String(2000 + i).slice(-4)}`,
  withTaxType: ['VAT', 'NoVAT'][i % 2],
  holdingSubject: ['Yes', 'No'][i % 2],
  searchTerm1: `term${i}`,
  searchTerm2: `tag${i}`,
  taxId: `TAX${10000 + i}`,
  file: null,
  address: `${i + 1} Business Street, Dubai, UAE`,
  commercialId: `CR${100000 + i}`,
  crEndDate: `2025-${String((i % 12) + 1).padStart(2, '0')}-28`,
  crDaysLeft: Math.floor(Math.random() * 365),
  taxEndDate: `2025-${String((i % 12) + 1).padStart(2, '0')}-31`,
  taxDaysLeft: Math.floor(Math.random() * 365),
  email: `contact${i}@company.ae`,
  class: ['Class A', 'Class B', 'Class C'][i % 3],
  blocked: i % 10 === 0,
  blockReason: i % 10 === 0 ? 'Non-compliance' : '',
})) as Row[]

export default function DataTablePage() {
  const [data, setData] = useState<Row[]>(sampleData)
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [query, setQuery] = useState<string>('')
  const [taxIdQuery, setTaxIdQuery] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const [selectedRow, setSelectedRow] = useState<Row | null>(null)
  const [sortBy, setSortBy] = useState<string>('id')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [blockedOnly, setBlockedOnly] = useState<boolean>(false)
  const [filterType, setFilterType] = useState<'All' | 'Vendors' | 'Customers'>('All')
  const perPage = 10

  const companiesList = useMemo(() => Array.from(new Set(data.map(d => d.companyCode))).sort(), [data])

  const handleSearch = () => setPage(1)

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
    setPage(1)
  }

  const filtered = useMemo(() => {
    let result = data.filter(d => {
      if (roleFilter && d.companyCode !== roleFilter) return false
      if (blockedOnly && !d.blocked) return false
      if (query) {
        const q = query.toLowerCase()
        if (!(d.name1.toLowerCase().includes(q) || d.name2.toLowerCase().includes(q) || d.searchTerm1.toLowerCase().includes(q) || d.searchTerm2.toLowerCase().includes(q))) return false
      }
      if (taxIdQuery) {
        const tq = taxIdQuery.toLowerCase()
        if (!d.taxId.toLowerCase().includes(tq)) return false
      }
      return true
    })

    // Apply sorting
    result.sort((a, b) => {
      let aVal: any = a[sortBy as keyof Row]
      let bVal: any = b[sortBy as keyof Row]
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = (bVal as string).toLowerCase()
      }
      
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [data, roleFilter, query, taxIdQuery, blockedOnly, sortBy, sortDir])

  const pages = Math.max(1, Math.ceil(filtered.length / perPage))

  const pageData = useMemo(() => {
    const start = (page - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, page])

  const handleFileChange = (id: number, file?: File | null) => {
    setData(prev => prev.map(r => {
      if (r.id !== id) return r
      if (!file) return { ...r, file: null }
      const url = URL.createObjectURL(file)
      return { ...r, file: { name: file.name, url } }
    }))
  }

  const handleView = (r: Row) => {
    if (r.file?.url) window.open(r.file.url, '_blank')
    else alert('No file uploaded for this row')
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 max-w-7xl mx-auto w-full">
        {/* Header with Dark Mode Toggle */}
        <div className="flex justify-between items-center mb-6 md:mb-8 animate-slideDown">
          <div>
            <h2 className={`text-xl sm:text-2xl lg:text-4xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Mastera SAP Vendors
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Manage and monitor your vendor database</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 md:p-3 rounded-lg transition-all duration-300 ${
              darkMode
                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Filters Card */}
        <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg rounded-xl p-3 sm:p-4 md:p-6 mb-4 md:mb-6 transition-all duration-300 animate-slideUp`}>
          <div className="flex flex-col gap-3 md:gap-4">
            {/* Filter Type Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setFilterType('All'); setPage(1) }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  filterType === 'All'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : darkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => { setFilterType('Vendors'); setPage(1) }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  filterType === 'Vendors'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : darkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Vendors
              </button>
              <button
                onClick={() => { setFilterType('Customers'); setPage(1) }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  filterType === 'Customers'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : darkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Customers
              </button>
            </div>

            {/* First Row - Company and Search */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="flex flex-col">
                <label className={`text-xs sm:text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Companies</label>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className={`border rounded-lg px-3 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">All Companies</option>
                  {companiesList.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:col-span-2 lg:col-span-1">
                <label className={`text-xs sm:text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Search</label>
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search name or term..."
                  className={`border rounded-lg px-3 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div className="flex flex-col">
                <label className={`text-xs sm:text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tax-Id</label>
                <input
                  value={taxIdQuery}
                  onChange={e => setTaxIdQuery(e.target.value)}
                  placeholder="Tax-Id..."
                  className={`border rounded-lg px-3 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Filter Options */}
            <div className="flex flex-wrap gap-2 items-center">
              <label className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                darkMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>
                <input
                  type="checkbox"
                  checked={blockedOnly}
                  onChange={(e) => { setBlockedOnly(e.target.checked); setPage(1) }}
                  className="cursor-pointer"
                />
                <span className="text-sm font-medium">Blocked Only</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                🔍 Search
              </button>
              <button
                onClick={() => { setRoleFilter(''); setQuery(''); setTaxIdQuery(''); setBlockedOnly(false); setFilterType('All'); setPage(1) }}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  darkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                ↺ Reset
              </button>
            </div>
          </div>
        </div>

      {/* Data Table - Responsive */}
      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg rounded-xl overflow-hidden transition-all duration-300 animate-slideUp`}>
        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className={`w-full divide-y ${darkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
            <thead className={`${darkMode ? 'bg-slate-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
              <tr>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold cursor-pointer hover:bg-opacity-75 transition-colors" onClick={() => handleSort('partnerNumber')}>
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>Partner # <SortIcon direction={sortBy === 'partnerNumber' ? sortDir : null} /></span>
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold cursor-pointer hover:bg-opacity-75 transition-colors" onClick={() => handleSort('companyCode')}>
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>Company <SortIcon direction={sortBy === 'companyCode' ? sortDir : null} /></span>
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold cursor-pointer hover:bg-opacity-75 transition-colors" onClick={() => handleSort('name1')}>
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>Name <SortIcon direction={sortBy === 'name1' ? sortDir : null} /></span>
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold cursor-pointer hover:bg-opacity-75 transition-colors" onClick={() => handleSort('name2')}>
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>Type <SortIcon direction={sortBy === 'name2' ? sortDir : null} /></span>
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold cursor-pointer hover:bg-opacity-75 transition-colors" onClick={() => handleSort('industry')}>
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>Industry <SortIcon direction={sortBy === 'industry' ? sortDir : null} /></span>
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>Status</span>
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>File</span>
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
              {pageData.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`hover:bg-opacity-50 transition-all duration-200 cursor-pointer animate-slideUp ${
                    darkMode
                      ? 'hover:bg-slate-700 bg-slate-800'
                      : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
                  }`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                  onClick={() => setSelectedRow(row)}
                >
                  <td className={`px-4 py-3 text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{row.partnerNumber}</td>
                  <td className={`px-4 py-3 text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{row.companyCode}</td>
                  <td className={`px-4 py-3 text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{row.name1}</td>
                  <td className={`px-4 py-3 text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{row.name2}</td>
                  <td className={`px-4 py-3 text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{row.industry}</td>
                  <td className="px-4 py-3 text-xs sm:text-sm">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                      row.blocked
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {row.blocked ? '🔒 Blocked' : '✓ Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs sm:text-sm">
                    <input
                      type="file"
                      id={`file-input-${row.id}`}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => { e.stopPropagation(); handleFileChange(row.id, e.target.files ? e.target.files[0] : null); }}
                      className="text-xs"
                    />
                  </td>
                  <td className="px-4 py-3 text-xs sm:text-sm">
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={(e) => { e.stopPropagation(); document.getElementById(`file-input-${row.id}`)?.click(); }} className="px-2 py-1 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 active:scale-95 transition-all duration-200 shadow-sm">✏️ Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); handleView(row); }} className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 active:scale-95 transition-all duration-200 shadow-sm">👁️ View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Cards */}
        <div className={`md:hidden divide-y ${darkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
          {pageData.map((row, idx) => (
            <div
              key={row.id}
              className={`p-4 sm:p-5 hover:bg-opacity-50 transition-all duration-200 border-b cursor-pointer animate-slideUp ${
                darkMode
                  ? 'hover:bg-slate-700 bg-slate-800'
                  : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
              }`}
              style={{ animationDelay: `${idx * 30}ms` }}
              onClick={() => setSelectedRow(row)}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{row.partnerNumber}</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{row.companyCode}</div>
                  </div>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    row.blocked
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {row.blocked ? '🔒 Blocked' : '✓ Active'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>Name:</span>
                    <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{row.name1}</div>
                  </div>
                  <div>
                    <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>Type:</span>
                    <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{row.name2}</div>
                  </div>
                  <div>
                    <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>Industry:</span>
                    <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{row.industry}</div>
                  </div>
                  <div>
                    <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>Group:</span>
                    <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{row.businessGroup}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <input
                    type="file"
                    id={`file-input-mobile-${row.id}`}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => { e.stopPropagation(); handleFileChange(row.id, e.target.files ? e.target.files[0] : null); }}
                    className="hidden"
                  />
                  {row.file && <span className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>✓ File: {row.file.name}</span>}
                </div>

                <div className="flex gap-2 pt-2 flex-wrap">
                  <button onClick={(e) => { e.stopPropagation(); document.getElementById(`file-input-mobile-${row.id}`)?.click(); }} className="flex-1 min-w-[80px] px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 active:scale-95 transition-all duration-200 shadow-sm">✏️ Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); handleView(row); }} className="flex-1 min-w-[80px] px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 active:scale-95 transition-all duration-200 shadow-sm">👁️ View</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {pageData.length === 0 && (
          <div className={`p-8 md:p-12 text-center ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
            <p className={`text-sm md:text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>📭 No records found. Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {/* Details Modal - Responsive */}
      {selectedRow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm">
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transition-all duration-300 animate-slideUp`}>
            <div className={`sticky top-0 bg-gradient-to-r ${darkMode ? 'from-blue-900 to-blue-800' : 'from-blue-600 to-blue-700'} px-4 sm:px-6 py-3 sm:py-4 border-b border-opacity-20 border-white flex justify-between items-center z-10`}>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white truncate">📋 Details - {selectedRow.partnerNumber}</h3>
              <button onClick={() => setSelectedRow(null)} className={`rounded-full w-8 h-8 flex items-center justify-center text-2xl font-bold bg-opacity-30 hover:bg-opacity-50 transition-all duration-150 ${darkMode ? 'hover:bg-white' : 'hover:bg-white'} text-white`} aria-label="Close">×</button>
            </div>
            <div className="p-4 sm:p-6">
              {/* Desktop Grid View */}
              <div className="hidden sm:grid gap-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailRowDesktop label="Name 1" value={selectedRow.name1} darkMode={darkMode} />
                  <DetailRowDesktop label="Name 2" value={selectedRow.name2} darkMode={darkMode} />
                  <DetailRowDesktop label="Address" value={selectedRow.address} darkMode={darkMode} />
                  <DetailRowDesktop label="Commercial ID" value={selectedRow.commercialId} darkMode={darkMode} />
                  <DetailRowDesktop label="Tax ID" value={selectedRow.taxId} darkMode={darkMode} />
                  <DetailRowDesktop label="Email" value={selectedRow.email} darkMode={darkMode} />
                  <DetailRowDesktop label="Phone 1" value={selectedRow.phone1} darkMode={darkMode} />
                  <DetailRowDesktop label="Phone 2" value={selectedRow.phone2} darkMode={darkMode} />
                  <DetailRowDesktop label="Industry" value={selectedRow.industry} darkMode={darkMode} />
                  <DetailRowDesktop label="Business Group" value={selectedRow.businessGroup} darkMode={darkMode} />
                  <DetailRowDesktop label="Class" value={selectedRow.class} darkMode={darkMode} />
                  <DetailRowDesktop label="CR End Date" value={selectedRow.crEndDate} darkMode={darkMode} />
                  <DetailRowDesktop label="CR Days Left" value={selectedRow.crDaysLeft.toString()} darkMode={darkMode} highlight={selectedRow.crDaysLeft < 30} />
                  <DetailRowDesktop label="Tax End Date" value={selectedRow.taxEndDate} darkMode={darkMode} />
                  <DetailRowDesktop label="Tax Days Left" value={selectedRow.taxDaysLeft.toString()} darkMode={darkMode} highlight={selectedRow.taxDaysLeft < 30} />
                  <DetailRowDesktop label="Blocked" value={selectedRow.blocked ? 'Yes' : 'No'} darkMode={darkMode} highlight={selectedRow.blocked} />
                  {selectedRow.blocked && (
                    <DetailRowDesktop label="Block Reason" value={selectedRow.blockReason || 'N/A'} darkMode={darkMode} />
                  )}
                </div>
              </div>

              {/* Mobile Stack View */}
              <div className="sm:hidden space-y-3">
                <DetailRow label="Name 1" value={selectedRow.name1} />
                <DetailRow label="Name 2" value={selectedRow.name2} />
                <DetailRow label="Partner #" value={selectedRow.partnerNumber} />
                <DetailRow label="Company" value={selectedRow.companyCode} />
                <DetailRow label="Address" value={selectedRow.address} />
                <DetailRow label="Commercial ID" value={selectedRow.commercialId} />
                <DetailRow label="Tax ID" value={selectedRow.taxId} />
                <DetailRow label="Email" value={selectedRow.email} />
                <DetailRow label="Phone 1" value={selectedRow.phone1} />
                <DetailRow label="Phone 2" value={selectedRow.phone2} />
                <DetailRow label="Industry" value={selectedRow.industry} />
                <DetailRow label="Business Group" value={selectedRow.businessGroup} />
                <DetailRow label="Class" value={selectedRow.class} />
                <DetailRow label="CR End Date" value={selectedRow.crEndDate} />
                <DetailRow label="CR Days Left" value={selectedRow.crDaysLeft.toString()} highlight={selectedRow.crDaysLeft < 30} />
                <DetailRow label="Tax End Date" value={selectedRow.taxEndDate} />
                <DetailRow label="Tax Days Left" value={selectedRow.taxDaysLeft.toString()} highlight={selectedRow.taxDaysLeft < 30} />
                <DetailRow label="Blocked" value={selectedRow.blocked ? 'Yes' : 'No'} highlight={selectedRow.blocked} />
                {selectedRow.blocked && (
                  <DetailRow label="Block Reason" value={selectedRow.blockReason || 'N/A'} />
                )}
              </div>

              <div className="mt-6">
                <button onClick={() => setSelectedRow(null)} className={`w-full px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'border border-gray-300 hover:bg-gray-100 text-gray-700'}`}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`flex flex-col sm:flex-row items-center justify-between mt-4 md:mt-6 gap-3 sm:gap-4 p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg animate-slideUp transition-all duration-300`}>
        <div className={`text-xs sm:text-sm text-center sm:text-left ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          📊 Showing {pageData.length === 0 ? 0 : (page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} entries
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
              darkMode
                ? 'bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-gray-300 disabled:text-gray-600'
                : 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 disabled:text-gray-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            ← Prev
          </button>
          
          {/* Desktop Pagination */}
          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: Math.min(pages, 5) }).map((_, i) => {
              let p: number
              if (pages <= 5) {
                p = i + 1
              } else if (page <= 3) {
                p = i + 1
              } else if (page >= pages - 2) {
                p = pages - 4 + i
              } else {
                p = page - 2 + i
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    p === page
                      ? `bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md`
                      : darkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {p}
                </button>
              )
            })}
            {pages > 5 && page < pages - 2 && (
              <>
                <span className={`text-gray-400 px-1`}>...</span>
              </>
            )}
          </div>

          {/* Mobile Page Info */}
          <div className={`sm:hidden text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} px-2`}>
            {page} / {pages}
          </div>

          <button
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            disabled={page === pages}
            className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
              darkMode
                ? 'bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-gray-300 disabled:text-gray-600'
                : 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 disabled:text-gray-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
    </div>
  )
}
