import { useQuery } from '@tanstack/react-query'
import { campusApi } from '../api/campus'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'

type ReadOnlyPageProps = {
  title: string
  endpoint: string
}

export function ReadOnlyPage({ title, endpoint }: ReadOnlyPageProps) {
  const { data } = useQuery({ queryKey: ['readonly', endpoint], queryFn: () => campusApi.readOnly(endpoint) })
  const rows = Array.isArray(data)
    ? data
    : typeof data === 'object' && data && 'records' in data
      ? (data as { records: unknown[] }).records
      : []
  const first = rows[0] as Record<string, unknown> | undefined
  const columns = first
    ? Object.keys(first).filter((key) => !hiddenKeys.has(key)).map((key) => ({ key, title: columnTitle(key) }))
    : [{ key: 'empty', title: '数据' }]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[#172235]">{title}</h1>
      </div>
      <Card className="p-5">
        <DataTable rows={rows as Record<string, unknown>[]} columns={columns} />
      </Card>
    </div>
  )
}

const hiddenKeys = new Set(['id', 'createTime', 'updateTime', 'deleted', 'teachingClassId', 'studentId', 'courseId', 'teacherId', 'semesterId'])

function columnTitle(key: string) {
  const map: Record<string, string> = {
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
  }
  return map[key] ?? key
}
