import { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, FileDown, FileUp, Trash2 } from 'lucide-react'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { PaginationBar } from '../components/ui/PaginationBar'
import { useAuth } from '../hooks/useAuth'
import { saveBlob } from '../lib/download'

export function GradesPage({ adminMode = false }: { adminMode?: boolean }) {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const [selected, setSelected] = useState<number[]>([])
  const [message, setMessage] = useState('')
  const [teachingClassId, setTeachingClassId] = useState(0)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [year, setYear] = useState('')
  const [term, setTerm] = useState(2)
  const isAdmin = adminMode || user?.userType === 'ADMIN'
  const { data: teachingClasses } = useQuery({ queryKey: ['teachingClasses'], queryFn: () => campusApi.teachingClasses() })
  const { data: calendarOptions = [] } = useQuery({ queryKey: ['calendarOptions'], queryFn: campusApi.calendarOptions })
  const queryParams = useMemo(() => ({
    page,
    size,
    ...(teachingClassId ? { teachingClassId } : {}),
    ...(year ? { academicYear: year, term } : {}),
  }), [page, size, teachingClassId, year, term])
  const { data } = useQuery({
    queryKey: ['grades', queryParams],
    queryFn: () => campusApi.grades(queryParams),
  })
  const upload = useMutation({
    mutationFn: (file: File) => campusApi.importGrades(file),
    onSuccess: async (result) => {
      await qc.invalidateQueries({ queryKey: ['grades'] })
      setMessage(`导入成功 ${result.successCount} 行${result.errors.length ? `，失败 ${result.errors.length} 行：${result.errors.slice(0, 3).join('；')}` : ''}`)
    },
    onError: (error) => setMessage(error.message),
  })
  const remove = useMutation({
    mutationFn: (ids: number[]) => campusApi.deleteGrades(ids),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['grades'] })
      setSelected([])
      setMessage('已批量删除')
    },
  })

  async function download(kind: 'template' | 'export') {
    const blob = kind === 'template' ? await campusApi.gradeTemplate() : await campusApi.exportGrades()
    saveBlob(blob, kind === 'template' ? '成绩导入模板.xlsx' : '成绩数据.xlsx')
  }

  const yearOptions = Array.from(new Set(calendarOptions.map((item) => item.academicYear)))
  const termOptions = Array.from(new Set(calendarOptions.filter((item) => item.academicYear === year).map((item) => item.term)))
  const teachingClassOptions = teachingClasses?.records ?? []
  const rows = (data?.records ?? []) as unknown as Record<string, unknown>[]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[#172235]">成绩管理</h1>
      </div>
      <Card className="p-5">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[#556273]">教学班</span>
            <select className={inputClass} value={teachingClassId} onChange={(event) => { setTeachingClassId(Number(event.target.value)); setPage(1) }}>
              <option value={0}>全部教学班</option>
              {teachingClassOptions.map((item) => <option key={item.id} value={item.id}>{item.className}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[#556273]">学年</span>
            <select className={inputClass} value={year} onChange={(event) => { setYear(event.target.value); setPage(1) }}>
              <option value="">全部学年</option>
              {yearOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[#556273]">学期</span>
            <select className={inputClass} value={term} onChange={(event) => { setTerm(Number(event.target.value)); setPage(1) }}>
              {(termOptions.length ? termOptions : [1, 2]).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <div className="mb-4 flex flex-wrap items-end gap-2">
          <Button variant="secondary" onClick={() => download('template')}><FileDown size={16} />下载模板</Button>
          <Button variant="secondary" onClick={() => download('export')}><Download size={16} />导出 XLSX</Button>
          <Button onClick={() => fileRef.current?.click()}><FileUp size={16} />导入 XLSX</Button>
          {isAdmin && <Button variant="danger" disabled={selected.length === 0} onClick={() => window.confirm('确认批量删除所选成绩？') && remove.mutate(selected)}><Trash2 size={16} />批量删除</Button>}
          <input ref={fileRef} className="hidden" type="file" accept=".xlsx" onChange={(event) => { const file = event.target.files?.[0]; if (file) upload.mutate(file); event.currentTarget.value = '' }} />
        </div>
        {message && <div className="mb-4 rounded-md border border-[#d9dfd8] bg-[#f8faf7] px-3 py-2 text-sm text-[#344256]">{message}</div>}
        <DataTable
          rows={rows}
          columns={[
            ...(isAdmin ? [{ key: 'select', title: '', render: (row: Record<string, unknown>) => <input type="checkbox" checked={selected.includes(Number(row.id))} onChange={(e) => setSelected((prev) => e.target.checked ? [...prev, Number(row.id)] : prev.filter((id) => id !== Number(row.id)))} /> }] : []),
            { key: 'semesterName', title: '学期' },
            { key: 'studentNo', title: '学号' },
            { key: 'courseName', title: '课程' },
            { key: 'teachingClassName', title: '教学班' },
            { key: 'studentName', title: '学生' },
            { key: 'regularScore', title: '平时分' },
            { key: 'finalScore', title: '期末分' },
            { key: 'totalScore', title: '总评' },
          ]}
        />
        <PaginationBar total={data?.total ?? 0} page={data?.page ?? page} size={data?.size ?? size} onPageChange={setPage} onSizeChange={(next) => { setSize(next); setPage(1) }} />
      </Card>
    </div>
  )
}

const inputClass = 'h-10 w-full rounded-md border border-[#cfd8d2] bg-white px-3 text-sm text-[#172235] outline-none transition focus:border-[var(--campus-green)] focus:ring-2 focus:ring-emerald-100'
