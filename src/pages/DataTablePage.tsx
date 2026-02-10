import { useMemo, useState, useEffect, useCallback } from 'react'
import { API_BASE_URL } from '../config/constants'

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

export default function DataTablePage() {
  const [data, setData] = useState<Row[]>([])
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

  // Server pagination state (cursor-based)
  const [loading, setLoading] = useState<boolean>(false)
  const [cursor, setCursor] = useState<number | null>(null)
  const [hasNextPage, setHasNextPage] = useState(false)

  const companiesList = useMemo(() => Array.from(new Set(data.map(d => d.companyCode))).sort(), [data])

  // Track previous filter values to detect filter changes
  const [prevFilters, setPrevFilters] = useState({ query, taxIdQuery, roleFilter })
  const [pageCursors, setPageCursors] = useState<(number | null)[]>([null])


const buildQueryParams = (cursor: number | null) => {
  const params = new URLSearchParams()
  params.set('pageSize', String(perPage))
  if (cursor !== null) params.set('lastCursorId', String(cursor))
  if (query) params.set('VendorName', query)
  if (taxIdQuery) params.set('TaxId', taxIdQuery)
  if (roleFilter) params.set('CompanyCode', roleFilter)
  return params.toString()
}
const mapPartnerToRow = (it: any): Row => ({
  id: it.id,
  partnerNumber: it.bpsapCode ?? '',
  companyCode: it.companyCode ?? '',
  name1: it.name1 ?? '',
  name2: it.name2 ?? '',
  industry: it.type ?? '',
  blocked: it.status !== 'Active',
  blockReason: it.blockReason ?? '',
  businessGroup: it.businessGroup ?? '',
  phone1: '',
  phone2: '',
  withTaxType: '',
  holdingSubject: '',
  searchTerm1: it.searchTerm1 ?? '',
  searchTerm2: it.searchTerm2 ?? '',
  taxId: '',
  file: null,
  address: '',
  commercialId: '',
  crEndDate: '',
  crDaysLeft: 0,
  taxEndDate: '',
  taxDaysLeft: 0,
  email: '',
  class: '',
})

const fetchPartners = useCallback(async (pageIndex: number) => {
  setLoading(true)
  try {
    const cursorForPage = pageCursors[pageIndex] ?? null
    const qs = buildQueryParams(cursorForPage)

    const res = await fetch(`${API_BASE_URL}/BusinessPartner/get-partners?${qs}`)
    const json = await res.json()

    setData(json.items.map(mapPartnerToRow))

    setPageCursors(prev => {
      const next = [...prev]
      next[pageIndex + 1] = json.nextCursor ?? null
      return next
    })

    setHasNextPage(json.hasNextPage)
  } finally {
    setLoading(false)
  }
}, [query, taxIdQuery, roleFilter, pageCursors])

const handleSearch = () => setPage(1)

  // Effect: When filters change, reset to page 1 and clear old cursors
  useEffect(() => {
    const filtersChanged = 
      query !== prevFilters.query || 
      taxIdQuery !== prevFilters.taxIdQuery || 
      roleFilter !== prevFilters.roleFilter

    if (filtersChanged) {
      setPrevFilters({ query, taxIdQuery, roleFilter })
      setPage(1)
      setCursor(null)
    }
  }, [query, taxIdQuery, roleFilter, prevFilters])

  useEffect(() => {
  fetchPartners(page - 1)
}, [page])


useEffect(() => {
  setPage(1)
  setPageCursors([null])
}, [query, taxIdQuery, roleFilter])


  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
    setPage(1)
  }

  // Client-side filtering/sorting is minimized because server returns filtered page.
  const pageData = data

  const handleFileChange = (id: number, file?: File | null) => {
    setData(prev => prev.map(r => {
      if (r.id !== id) return r
      if (!file) return { ...r, file: null }
      const url = URL.createObjectURL(file)
      return { ...r, file: { name: file.name, url } }
    }))
  }

  const uploadFileToServer = async (businessPartnerId: number | string, file: File) => {
    try {
      const fd = new FormData()
      fd.append('BusinessPartnerId', String(businessPartnerId))
      fd.append('Attachments', file)

      const res = await fetch(`${API_BASE_URL}/BusinessPartner/upload-file`, {
        method: 'POST',
        body: fd,
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Upload failed with status ${res.status}`)
      }

      return true
    } catch (err) {
      console.error('Upload error', err)
      return false
    }
  }

  const handleFileSelect = async (id: number, files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]

    // Ask for confirmation
    const ok = window.confirm('Are you sure that you will upload this file ?')
    if (!ok) return

    setLoading(true)
    const success = await uploadFileToServer(id, file)
    setLoading(false)

    if (success) {
      // update UI with selected file
      handleFileChange(id, file)
      alert('File uploaded successfully.')
    } else {
      alert('An error occurred while uploading the file.')
    }
  }

//   const handleNext = () => {
//   if (!hasNextPage || loading) return
//   setPage(p => p + 1)
//   fetchPartners()
// }


  const handleView = (r: Row) => {
    // Fetch full partner details from API and show in modal
    setLoading(true)
    fetch(
      `${API_BASE_URL}/BusinessPartner/get-partners?pageSize=1&SAPCode=${encodeURIComponent(r.partnerNumber)}`
    )
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(json => {
        const item = json.items?.[0]
        if (item) {
          const mapped: Row = {
            id: r.id,
            partnerNumber: item.bpsapCode ?? r.partnerNumber,
            companyCode: item.companyCode ?? r.companyCode,
            name1: item.name1 ?? r.name1,
            name2: item.name2 ?? r.name2,
            businessGroup: item.businessGroup ?? r.businessGroup,
            industry: item.industry ?? r.industry,
            phone1: item.phone1 ?? r.phone1,
            phone2: item.phone2 ?? r.phone2,
            withTaxType: item.withTaxType ?? r.withTaxType,
            holdingSubject: item.holdingSubject ?? r.holdingSubject,
            searchTerm1: item.searchTerm1 ?? r.searchTerm1,
            searchTerm2: item.searchTerm2 ?? r.searchTerm2,
            taxId: item.taxId ?? r.taxId,
            file: r.file,
            address: item.address ?? r.address,
            commercialId: item.commercialId ?? r.commercialId,
            crEndDate: item.crEndDate ?? r.crEndDate,
            crDaysLeft: item.crDaysLeft ?? r.crDaysLeft,
            taxEndDate: item.taxEndDate ?? r.taxEndDate,
            taxDaysLeft: item.taxDaysLeft ?? r.taxDaysLeft,
            email: item.email ?? r.email,
            class: item.class ?? r.class,
            blocked: item.blocked ?? r.blocked,
            blockReason: item.blockReason ?? r.blockReason,
          }
          setSelectedRow(mapped)
        } else {
          setSelectedRow(r)
        }
      })
      .catch(err => {
        console.error(err)
        setSelectedRow(r)
      })
      .finally(() => setLoading(false))
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
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>Name 2 <SortIcon direction={sortBy === 'name2' ? sortDir : null} /></span>
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold cursor-pointer hover:bg-opacity-75 transition-colors" onClick={() => handleSort('industry')}>
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>Type <SortIcon direction={sortBy === 'industry' ? sortDir : null} /></span>
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
                  onClick={() => handleView(row)}
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
                      {row.blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs sm:text-sm">
                    <input
                      type="file"
                      id={`file-input-${row.id}`}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => { e.stopPropagation(); handleFileSelect(row.id, e.target.files); }}
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
              onClick={() => handleView(row)}
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
                    onChange={(e) => { e.stopPropagation(); handleFileSelect(row.id, e.target.files); }}
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
          📊 Showing {pageData.length} entries — page {page}
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
              darkMode
                ? 'bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-gray-300 disabled:text-gray-600'
                : 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 disabled:text-gray-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            ← Prev
          </button>

          <div className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {loading ? 'Loading…' : `Page ${page}`}
          </div>

          <button
           onClick={() => setPage(p => p + 1)}
            disabled={!hasNextPage}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
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
