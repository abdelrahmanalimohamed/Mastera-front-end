import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { API_BASE_URL } from '../config/constants'
import { suppliesList, type Supply } from '../config/supplies'

// Helper component for desktop detail rows
const DetailRowDesktop = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) => (
  <div className="animate-slideUp">
    <label className="text-xs font-semibold uppercase block mb-2 text-gray-600">{label}</label>
    <p className={`text-sm break-words ${highlight ? 'text-red-600' : 'text-gray-900'}`}>
      {value}
    </p>
  </div>
)

const Section = ({ title, children }: any) => (
  <div>
    <h1 className="text-sm font-extrabold uppercase tracking-wide text-gray-500 mb-4 border-b pb-2">
      {title}
    </h1>
    {children}
  </div>
)

const Grid = ({ children }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {children}
  </div>
)

const Field = ({ label, value, children, full = false }: any) => (
  <div className={full ? 'md:col-span-2' : ''}>
    <label className="text-xs font-semibold uppercase text-gray-500 block mb-1">
      {label}
    </label>
    <div className="text-sm text-gray-900 break-words">
      {children || value || 'N/A'}
    </div>
  </div>
)

// Small searchable dropdown component
function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  displayValue = '',
}: {
  options: (string | Supply)[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
  displayValue?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return
      if (!(e.target instanceof Node)) return
      if (!ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const getOptionName = (opt: string | Supply) =>
    typeof opt === 'string' ? opt : opt.name

  const getOptionValue = (opt: string | Supply) =>
    typeof opt === 'string' ? opt : opt.code

  useEffect(() => {
    if (!open) setQuery(displayValue || value)
  }, [value, displayValue, open])

  const filtered = query
    ? options.filter(o => getOptionName(o).toLowerCase().includes(query.toLowerCase()))
    : options

  return (
    <div ref={ref} className="relative">
      <input
        value={query}
        onChange={e => {
          const v = e.target.value
          setQuery(v)
          setOpen(true)
          if (v === '') onChange('')
        }}
        onFocus={() => {
          setOpen(true)
          if (query === '') setQuery(displayValue || value)
        }}
        placeholder={placeholder}
        className="border rounded-lg px-3 py-2.5 text-sm transition-all duration-200 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 text-gray-900"
      />

      {open && (
        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md shadow-lg bg-white">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-700">No results</div>
          ) : (
            filtered.map(o => {
              const oName = getOptionName(o)
              const oValue = getOptionValue(o)
              return (
                <button
                  key={oValue}
                  type="button"
                  onClick={() => {
                    onChange(oValue)
                    setQuery(oName)
                    setOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-100 text-gray-900"
                >
                  {oName}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

type FileRef = { name: string; url: string }

type Row = {
  id: number
  partnerNumber: string
  companyCode: string
  name1: string
  name2: string
  name3: string | null
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
  vatEndDate: string
  vatDaysLeft: number
  crEndDate: string
  crDaysLeft: number
  taxEndDate: string
  taxDaysLeft: number
  email: string
  class: string
  blocked: boolean
  blockReason: string
  bpGroup: string
  telephone1: string
  telephone2: string
  faxNumber: string
  taxStatus: string
  commercialTaxId: string | null
  vatId: string | null
  taxIdValidFrom: string
  taxIdValidTo: string
  taxIdExpireOn: string
  commercialIdValidFrom: string
  commercialIdValidTo: string
  commercialTaxIdExpireOn: string
  vatIdValidFrom: string
  vatIdValidTo: string
  vatIdExpireOn: string
  status: string
  isFileAttached: boolean
  industries: string
  companies: string
}

const companies = [
  'B100 - Wajhat Advanced Arch.',
  'B200 - Fit Interiors',
  'B300 - Engineering New Cities Co',
  'B400 - Edge Eng for specialized',
  'BH01 - SIAC H.for Build Mat&Supp',
  'C100 - SIAC Construction',
  'C101 - Qatar Branch',
  'C102 - Yemen Branch',
  'C103 - SIAC International Contra',
  'C104 - SIAC Solutions',
  'C200 - Edge Construction & Indus',
  'C300 - STEEL TEC - Enginerring',
  'C400 - Integrated Real Estate De',
  'CH01 - SIAC Holding for Eng&Cons',
  'D100 - Pyramids Development Indu',
  'D200 - Pyramids Zona Franca Egyp',
  'D300 - Polaris International Ind',
  'D400 - Bonyan For Investment & D',
  'D500 - Group Real Estate Develop',
  'D600 - Gulf of Suez Development',
  'D700 - Siac Assets & Facilities',
  'D710 - Siac Facilities Managemen',
  'D800 - SIAC Developments',
  'DH01 - SIAC H.for Develop&Manage',
  'K300 - Tripple Ten Company',
  'SIAC - SIAC H.for Fi.Investments',
]

export default function DataTablePage() {
  const [data, setData] = useState<Row[]>([])
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [supplyFilter, setSupplyFilter] = useState<string>('')
  const [supplyFilterDisplay, setSupplyFilterDisplay] = useState<string>('')
  const [query, setQuery] = useState<string>('')
  const [taxIdQuery, setTaxIdQuery] = useState<string>('')
  const [sapCodeQuery, setSapCodeQuery] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const [selectedRow, setSelectedRow] = useState<Row | null>(null)
  const [sortBy, setSortBy] = useState<string>('id')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [blockedOnly, setBlockedOnly] = useState<boolean>(false)
  const [filterType, setFilterType] = useState<'All' | 'Vendors' | 'Customers'>('All')
  const perPage = 10

  const [loading, setLoading] = useState<boolean>(false)
  const [cursor, setCursor] = useState<number | null>(null)
  const [hasNextPage, setHasNextPage] = useState(false)

  const companiesList = useMemo(() => Array.from(new Set(companies)).sort(), [])

  const [prevFilters, setPrevFilters] = useState({ query, taxIdQuery, sapCodeQuery, roleFilter, supplyFilter, filterType })
  const [pageCursors, setPageCursors] = useState<(number | null)[]>([null])

  const [appliedFilters, setAppliedFilters] = useState({
    query: '',
    taxIdQuery: '',
    roleFilter: '',
    sapCodeQuery: '',
    supplyFilter: '',
    blockedOnly: false,
    filterType: 'All' as 'All' | 'Vendors' | 'Customers',
  })

  const role = localStorage.getItem('role') || ''

  const buildQueryParams = (cursor: number | null) => {
    const params = new URLSearchParams()
    params.set('pageSize', String(perPage))

    if (cursor !== null) params.set('lastCursorId', String(cursor))
    if (appliedFilters.query) params.set('VendorName', appliedFilters.query)
    if (appliedFilters.taxIdQuery) params.set('TaxId', appliedFilters.taxIdQuery)
    if (appliedFilters.sapCodeQuery) params.set('SAPCode', appliedFilters.sapCodeQuery)
    if (appliedFilters.roleFilter) params.set('CompanyCode', appliedFilters.roleFilter.split(' - ')[0])
    if (appliedFilters.supplyFilter) params.set('Industry', appliedFilters.supplyFilter)
    if (appliedFilters.blockedOnly) params.set('BlockedOnly', 'true')

    if (appliedFilters.filterType === 'Vendors') {
      params.set('IndustryName', 'Vend')
    } else if (appliedFilters.filterType === 'Customers') {
      params.set('IndustryName', 'Cust')
    }

    return params.toString()
  }

  const mapPartnerToRow = (it: any): Row => ({
    id: it.id,
    partnerNumber: it.bpsapCode ?? '',
    companyCode: it.companyCode ?? '',
    name1: it.name1 ?? '',
    name2: it.name2 ?? '',
    name3: it.name3 ?? null,
    industry: it.type ?? '',
    blocked: it.status !== 'Active',
    blockReason: it.blockReason ?? '',
    businessGroup: it.businessGroup ?? '',
    phone1: it.telephone1 ?? '',
    phone2: it.telephone2 ?? '',
    withTaxType: '',
    holdingSubject: '',
    searchTerm1: it.searchTerm1 ?? '',
    searchTerm2: it.searchTerm2 ?? '',
    taxId: it.taxId ?? '',
    file: null,
    address: it.address ?? '',
    commercialId: it.commercialId ?? '',
    vatId: it.vatId ?? '',
    crEndDate: it.commercialIdValidTo ?? '',
    crDaysLeft: 0,
    vatEndDate: it.vatIdValidTo ?? '',
    vatDaysLeft: 0,
    taxEndDate: it.taxIdValidTo ?? '',
    taxDaysLeft: 0,
    email: '',
    class: it.class ?? '',
    bpGroup: it.bpGroup ?? '',
    telephone1: it.telephone1 ?? '',
    telephone2: it.telephone2 ?? '',
    faxNumber: it.faxNumber ?? '',
    taxStatus: it.taxStatus ?? '',
    commercialTaxId: it.commercialTaxId ?? null,
    taxIdValidFrom: it.taxIdValidFrom ?? '',
    taxIdValidTo: it.taxIdValidTo ?? '',
    taxIdExpireOn: it.taxIdExpireOn ?? '',
    commercialIdValidFrom: it.commercialIdValidFrom ?? '',
    commercialIdValidTo: it.commercialIdValidTo ?? '',
    commercialTaxIdExpireOn: it.commercialTaxIdExpireOn ?? '',
    vatIdValidFrom: it.vatIdValidFrom ?? '',
    vatIdValidTo: it.vatIdValidTo ?? '',
    vatIdExpireOn: it.vatIdExpireOn ?? '',
    status: it.status ?? 'Active',
    isFileAttached: it.isFileAttached ?? false,
    industries: it.industries ?? '',
    companies: it.companies ?? '',
  })

  const fetchPartners = useCallback(async (
    pageIndex: number,
    cursorForPage: number | null
  ) => {
    setLoading(true)
    try {
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
  }, [appliedFilters])

  useEffect(() => {
    const filtersChanged =
      query !== prevFilters.query ||
      taxIdQuery !== prevFilters.taxIdQuery ||
      sapCodeQuery !== prevFilters.sapCodeQuery ||
      roleFilter !== prevFilters.roleFilter ||
      supplyFilter !== prevFilters.supplyFilter ||
      filterType !== prevFilters.filterType

    if (filtersChanged) {
      setPrevFilters({ query, taxIdQuery, sapCodeQuery, roleFilter, supplyFilter, filterType })
      setPage(1)
      setCursor(null)
    }
  }, [query, taxIdQuery, roleFilter, supplyFilter, filterType, prevFilters])

  useEffect(() => {
    const cursorForPage = pageCursors[page - 1] ?? null
    fetchPartners(page - 1, cursorForPage)
  }, [page, appliedFilters])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
    setPage(1)
  }

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

  const editFileOnServer = async (businessPartnerId: number | string, file: File) => {
    try {
      const fd = new FormData()
      fd.append('BusinessPartnerId', String(businessPartnerId))
      fd.append('Attachments', file)

      const res = await fetch(`${API_BASE_URL}/BusinessPartner/edit-upload-file`, {
        method: 'POST',
        body: fd,
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Edit upload failed with status ${res.status}`)
      }
      return true
    } catch (err) {
      console.error('Edit upload error', err)
      return false
    }
  }

  const isPdf = (file: File) =>
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

  const handleFileSelect = async (id: number, files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]

    if (!isPdf(file)) {
      alert('Only PDF files are allowed!')
      return
    }

    const ok = window.confirm('Are you sure that you will upload this file ?')
    if (!ok) return

    setLoading(true)
    const success = await uploadFileToServer(id, file)
    setLoading(false)

    if (success) {
      handleFileChange(id, file)
      alert('File uploaded successfully.')
      location.reload()
    } else {
      alert('An error occurred while uploading the file.')
    }
  }

  const handleEditFileSelect = async (id: number, files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]

    if (!isPdf(file)) {
      alert('Only PDF files are allowed!')
      return
    }

    const ok = window.confirm('Are you sure that you will upload this file ?')
    if (!ok) return

    setLoading(true)
    const success = await editFileOnServer(id, file)
    setLoading(false)

    if (success) {
      handleFileChange(id, file)
      alert('File updated successfully.')
      location.reload()
    } else {
      alert('An error occurred while updating the file.')
    }
  }

  const handleViewFile = async (id: number) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/BusinessPartner/view-file/${id}`)

      if (!response.ok) {
        const errorData = await response.json()
        alert(errorData.message)
        return
      }

      const blob = await response.blob()
      const fileUrl = URL.createObjectURL(blob)
      window.open(fileUrl, '_blank')
      setTimeout(() => URL.revokeObjectURL(fileUrl), 1000)
    } catch (err) {
      console.error('Error viewing file:', err)
      alert('Failed to view the file. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleView = (r: Row) => {
    setLoading(true)
    fetch(`${API_BASE_URL}/BusinessPartner/get-partner-details/${r.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(item => {
        setSelectedRow(mapPartnerToRow(item))
      })
      .catch(err => {
        console.error(err)
        setSelectedRow(r)
      })
      .finally(() => setLoading(false))
  }

  const handleSearch = () => {
    setAppliedFilters({
      query,
      taxIdQuery,
      sapCodeQuery,
      roleFilter,
      supplyFilter,
      blockedOnly,
      filterType,
    })
    setPage(1)
    setPageCursors([null])
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-300">
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 max-w-7xl mx-auto w-full">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 md:mb-8 animate-slideDown">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Mastera Application
            </h2>
            <p className="text-sm text-gray-600 mt-1">Unified Business Partner Platform</p>
          </div>

          <div className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-200 text-gray-700">
            Hello, {localStorage.getItem('fullname') || 'User'}
          </div>

          <button
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('role')
              window.location.href = '/'
            }}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all duration-200"
          >
            Logout
          </button>
        </div>

        {/* Filters Card */}
        <div className="bg-white shadow-lg rounded-xl p-3 sm:p-4 md:p-6 mb-4 md:mb-6 transition-all duration-300 animate-slideUp">
          <div className="flex flex-col gap-3 md:gap-4">

            {/* Filter Type Buttons */}
            <div className="flex flex-wrap gap-2">
              {(['All', 'Vendors', 'Customers'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => {
                    setFilterType(type)
                    setPage(1)
                    setAppliedFilters(prev => ({ ...prev, filterType: type }))
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    filterType === type
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Filter Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="flex flex-col">
                <label className="text-xs sm:text-sm font-semibold mb-2 text-gray-700">Companies</label>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="border rounded-lg px-3 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 text-gray-900"
                >
                  <option value="">All Companies</option>
                  {companiesList.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs sm:text-sm font-semibold mb-2 text-gray-700">Category</label>
                <SearchableDropdown
                  options={suppliesList}
                  value={supplyFilter}
                  onChange={code => {
                    setSupplyFilter(code)
                    const supply = suppliesList.find(s => s.code === code)
                    setSupplyFilterDisplay(supply ? supply.name : '')
                  }}
                  displayValue={supplyFilterDisplay}
                  placeholder="Select category..."
                />
              </div>

              <div className="flex flex-col sm:col-span-2 lg:col-span-1">
                <label className="text-xs sm:text-sm font-semibold mb-2 text-gray-700">Search</label>
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by name1 or name2..."
                  className="border rounded-lg px-3 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs sm:text-sm font-semibold mb-2 text-gray-700">Tax-Id</label>
                <input
                  value={taxIdQuery}
                  onChange={e => setTaxIdQuery(e.target.value)}
                  placeholder="Tax-Id..."
                  className="border rounded-lg px-3 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs sm:text-sm font-semibold mb-2 text-gray-700">SAP Code</label>
                <input
                  value={sapCodeQuery}
                  onChange={e => setSapCodeQuery(e.target.value)}
                  placeholder="SAP Code..."
                  className="border rounded-lg px-3 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>

            {/* Blocked Only Checkbox */}
            <div className="flex flex-wrap gap-2 items-center">
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700">
                <input
                  type="checkbox"
                  checked={blockedOnly}
                  onChange={e => {
                    const isChecked = e.target.checked
                    setBlockedOnly(isChecked)
                    setAppliedFilters(prev => ({ ...prev, blockedOnly: isChecked }))
                    setPage(1)
                  }}
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
                onClick={() => {
                  setRoleFilter('')
                  setSupplyFilter('')
                  setSupplyFilterDisplay('')
                  setQuery('')
                  setTaxIdQuery('')
                  setSapCodeQuery('')
                  setBlockedOnly(false)
                  setFilterType('All')
                  setAppliedFilters({
                    query: '',
                    taxIdQuery: '',
                    sapCodeQuery: '',
                    roleFilter: '',
                    supplyFilter: '',
                    blockedOnly: false,
                    filterType: 'All',
                  })
                  setPage(1)
                  setPageCursors([null])
                  setCursor(null)
                }}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                ↺ Reset
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 animate-slideUp">

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold cursor-pointer hover:bg-opacity-75 transition-colors" onClick={() => handleSort('partnerNumber')}>
                    <span className="text-gray-700">Partner #</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold cursor-pointer hover:bg-opacity-75 transition-colors" onClick={() => handleSort('name1')}>
                    <span className="text-gray-700">Name 1</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold cursor-pointer hover:bg-opacity-75 transition-colors" onClick={() => handleSort('name2')}>
                    <span className="text-gray-700">Name 2</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold cursor-pointer hover:bg-opacity-75 transition-colors" onClick={() => handleSort('industry')}>
                    <span className="text-gray-700">Type</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">
                    <span className="text-gray-700">Status</span>
                  </th>
                  {role === 'Admin' && (
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">
                      <span className="text-gray-700">File</span>
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold">
                    <span className="text-gray-700">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pageData.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:bg-opacity-50 transition-all duration-200 cursor-pointer animate-slideUp"
                    style={{ animationDelay: `${idx * 30}ms` }}
                    onClick={() => handleView(row)}
                  >
                    <td className="px-4 py-3 text-xs sm:text-sm font-medium text-gray-900">{row.partnerNumber}</td>
                    <td className="px-4 py-3 text-xs sm:text-sm text-gray-700">{row.name1}</td>
                    <td className="px-4 py-3 text-xs sm:text-sm text-gray-700">{row.name2}</td>
                    <td className="px-4 py-3 text-xs sm:text-sm text-gray-700">{row.industry}</td>
                    <td className="px-4 py-3 text-xs sm:text-sm">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                        row.blocked
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {row.blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    {role === 'Admin' && (
                      <td className="px-4 py-3 text-xs sm:text-sm">
                        {!row.isFileAttached && (
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            id={`file-input-edit-${row.id}`}
                            onClick={e => e.stopPropagation()}
                            onChange={e => { e.stopPropagation(); handleFileSelect(row.id, e.target.files) }}
                            className="text-xs"
                          />
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 text-xs sm:text-sm">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        id={`file-upload-edit-${row.id}`}
                        onClick={e => e.stopPropagation()}
                        onChange={e => { e.stopPropagation(); handleEditFileSelect(row.id, e.target.files) }}
                        className="hidden"
                      />
                      {row.isFileAttached && (
                        <div className="flex gap-2 items-center">
                          {role === 'Admin' && (
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                document.getElementById(`file-upload-edit-${row.id}`)?.click()
                              }}
                              className="px-2 py-1 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 active:scale-95 transition-all duration-200 shadow-sm"
                            >
                              ✏️ Edit
                            </button>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); handleViewFile(row.id) }}
                            className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 active:scale-95 transition-all duration-200 shadow-sm"
                          >
                            👁️ View
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {pageData.map((row, idx) => (
              <div
                key={row.id}
                className="p-4 sm:p-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b cursor-pointer animate-slideUp"
                style={{ animationDelay: `${idx * 30}ms` }}
                onClick={() => handleView(row)}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="text-sm font-bold text-gray-900">{row.partnerNumber}</div>
                      <div className="text-xs text-gray-600">{row.companyCode}</div>
                    </div>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                      row.blocked
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {row.blocked ? '🔒 Blocked' : '✓ Active'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-gray-800">Name:</span>
                      <div className="text-gray-600">{row.name1}</div>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">Type:</span>
                      <div className="text-gray-600">{row.name2}</div>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">Industry:</span>
                      <div className="text-gray-600">{row.industry}</div>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">Group:</span>
                      <div className="text-gray-600">{row.businessGroup}</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    {row.file && <span className="text-xs text-green-600">✓ File: {row.file.name}</span>}
                  </div>

                  {row.isFileAttached && (
                    <>
                      <input
                        type="file"
                        id={`file-upload-edit-mobile-${row.id}`}
                        onClick={e => e.stopPropagation()}
                        onChange={e => { e.stopPropagation(); handleEditFileSelect(row.id, e.target.files) }}
                        className="hidden"
                      />
                      <div className="flex gap-2 pt-2 flex-wrap">
                        <button
                          onClick={e => { e.stopPropagation(); document.getElementById(`file-upload-edit-mobile-${row.id}`)?.click() }}
                          className="flex-1 min-w-[80px] px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 active:scale-95 transition-all duration-200 shadow-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleViewFile(row.id) }}
                          className="flex-1 min-w-[80px] px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 active:scale-95 transition-all duration-200 shadow-sm"
                        >
                          👁️ View
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {pageData.length === 0 && (
            <div className="p-8 md:p-12 text-center bg-gray-50">
              <p className="text-sm md:text-base text-gray-500">📭 No records found. Try adjusting your filters.</p>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {selectedRow && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">

              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 rounded-t-2xl bg-gray-50 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-bold">Business Partner Details</h3>
                  <p className="text-sm text-gray-500">Partner No: {selectedRow.partnerNumber}</p>
                </div>
                <button
                  onClick={() => setSelectedRow(null)}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-8">

                <Section title="General Information">
                  <Grid>
                    <Field label="Class" value={selectedRow.class} />
                    <Field label="Name" value={selectedRow.name3} />
                    <Field label="BP Group" value={selectedRow.bpGroup} />
                    <Field label="Status">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedRow.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {selectedRow.status}
                      </span>
                    </Field>
                    <Field label="Block Reason" value={selectedRow.blockReason || 'N/A'} />
                    <Field label="Industry" value={selectedRow.industries || 'N/A'} />
                    <Field label="Company" value={selectedRow.companies || 'N/A'} />
                  </Grid>
                </Section>

                <Section title="Contact Information">
                  <Grid>
                    <Field label="Telephone 1" value={selectedRow.telephone1} />
                    <Field label="Telephone 2" value={selectedRow.telephone2} />
                    <Field label="Fax" value={selectedRow.faxNumber} />
                    <Field label="Address" value={selectedRow.address} full />
                  </Grid>
                </Section>

                <Section title="Tax Information">
                  <Grid>
                    <Field label="Tax Status" value={selectedRow.taxStatus} />
                    <Field label="Tax ID" value={selectedRow.taxId} />
                    <Field label="Tax ID Valid From" value={selectedRow.taxIdValidFrom} />
                    <Field label="Tax ID Valid To" value={selectedRow.taxIdValidTo} />
                    <Field label="Tax ID Expire On" value={selectedRow.taxIdExpireOn} />
                  </Grid>
                </Section>

                <Section title="Commercial Registration">
                  <Grid>
                    <Field label="Commercial Tax ID" value={selectedRow.commercialTaxId || 'N/A'} />
                    <Field label="Commercial ID Valid From" value={selectedRow.commercialIdValidFrom} />
                    <Field label="Commercial ID Valid To" value={selectedRow.commercialIdValidTo} />
                    <Field label="Commercial Tax ID Expire On" value={selectedRow.commercialTaxIdExpireOn} />
                  </Grid>
                </Section>

                <Section title="VAT Registration">
                  <Grid>
                    <Field label="VAT ID" value={selectedRow.vatId || 'N/A'} />
                    <Field label="VAT ID Valid From" value={selectedRow.vatIdValidFrom} />
                    <Field label="VAT ID Valid To" value={selectedRow.vatIdValidTo} />
                    <Field label="VAT ID Expire On" value={selectedRow.vatIdExpireOn} />
                  </Grid>
                </Section>

                <div className="pt-4 border-t flex justify-end">
                  <button
                    onClick={() => setSelectedRow(null)}
                    className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition"
                  >
                    Close
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 md:mt-6 gap-3 sm:gap-4 p-4 rounded-xl bg-white shadow-lg animate-slideUp transition-all duration-300">
          <div className="text-xs sm:text-sm text-center sm:text-left text-gray-600">
            📊 Showing {pageData.length} entries — page {page}
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 disabled:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>

            <div className="text-xs font-medium text-gray-700">
              {loading ? 'Loading…' : `Page ${page}`}
            </div>

            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasNextPage}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 disabled:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
