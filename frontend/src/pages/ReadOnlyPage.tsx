import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { Input } from '../components/ui/Input'
import { PaginationBar } from '../components/ui/PaginationBar'

type ReadOnlyPageProps = {
  title: string
  endpoint: string
  semesterFilter?: boolean
}

export function ReadOnlyPage({ title, endpoint, semesterFilter = false }: ReadOnlyPageProps) {
  const { data: options = [] } = useQuery({ queryKey: ['calendarOptions'], queryFn: campusApi.calendarOptions, enabled: semesterFilter })
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [year, setYear] = useState('')
  const [term, setTerm] = useState(2)
  const queryParams = useMemo(() => ({
    page,
    size,
    ...(keyword.trim() ? { keyword: keyword.trim() } : {}),
    ...(semesterFilter && year ? { academicYear: year, term } : {}),
  }), [page, size, keyword, semesterFilter, year, term])
  const { data, isFetching } = useQuery({ queryKey: ['readonly', endpoint, queryParams], queryFn: () => campusApi.readOnly(endpoint, queryParams) })
  const pageData = typeof data === 'object' && data && 'records' in data
    ? data as { total: number; page: number; size: number; records: unknown[] }
    : { total: Array.isArray(data) ? data.length : 0, page, size, records: Array.isArray(data) ? data : [] }
  const rows = pageData.records
  const first = rows[0] as Record<string, unknown> | undefined
  const columns = first
    ? Object.keys(first).filter((key) => !hiddenKeys.has(key)).map((key) => ({ key, title: columnTitle(key) }))
    : [{ key: 'empty', title: '数据' }]
  const yearOptions = Array.from(new Set(options.map((item) => item.academicYear)))
  const termOptions = Array.from(new Set(options.filter((item) => item.academicYear === year).map((item) => item.term)))
  const isMakeupExams = endpoint === '/api/makeup-exams'
  const showMakeupClosed = isMakeupExams && !isFetching && pageData.total === 0

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[#172235]">{title}</h1>
      </div>
      <Card className="p-5">
        <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))_auto]">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[#556273]">关键词</span>
            <Input placeholder="搜索课程、教学班、地点、状态等" value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1) }} />
          </label>
          {semesterFilter ? (
            <>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-[#556273]">学年</span>
                <select className={inputClass} value={year} onChange={(e) => { setYear(e.target.value); setPage(1) }}>
                  <option value="">全部学年</option>
                  {yearOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-[#556273]">学期</span>
                <select className={inputClass} value={term} onChange={(e) => { setTerm(Number(e.target.value)); setPage(1) }}>
                  {(termOptions.length ? termOptions : [1, 2]).map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </>
          ) : (
            <>
              <div />
              <div />
            </>
          )}
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setKeyword('')
                setYear('')
                setTerm(2)
                setPage(1)
                setSize(10)
              }}
            >
              重置
            </Button>
          </div>
        </div>
        {showMakeupClosed ? (
          <div className="rounded-lg border border-dashed border-[#cfd8d2] bg-[#f8faf7] px-5 py-12 text-center">
            <div className="text-lg font-semibold text-[#172235]">补考未开放</div>
            <div className="mt-2 text-sm text-[#667085]">补考报名以最终成绩发布后为准。</div>
          </div>
        ) : (
          <>
            <DataTable rows={rows as Record<string, unknown>[]} columns={columns} />
            <PaginationBar total={pageData.total} page={pageData.page} size={pageData.size} onPageChange={setPage} onSizeChange={(next) => { setSize(next); setPage(1) }} />
          </>
        )}
      </Card>
    </div>
  )
}

const hiddenKeys = new Set(['id', 'createTime', 'updateTime', 'deleted', 'teachingClassId', 'studentId', 'courseId', 'teacherId', 'semesterId'])
const inputClass = 'h-10 w-full rounded-md border border-[#cfd8d2] bg-white px-3 text-sm text-[#172235] outline-none transition focus:border-[var(--campus-green)] focus:ring-2 focus:ring-emerald-100'

function columnTitle(key: string) {
  const map: Record<string, string> = {
    semester: '学期',
    className: '教学班',
    teachingClassName: '教学班',
    courseName: '课程',
    teacherName: '教师',
    studentName: '学生',
    studentNo: '学号',
    major: '专业',
    semesterName: '学期',
    capacity: '容量',
    regularScore: '平时分',
    finalScore: '期末分',
    totalScore: '总评',
    examTime: '考试时间',
    seat: '座位',
    location: '地点',
    status: '状态',
    statusText: '状态',
    openTime: '开放时间',
    description: '说明',
    gpa: '绩点',
    majorRanking: '专业排名',
    classRanking: '班级排名',
  }
  return map[key] ?? key
}
