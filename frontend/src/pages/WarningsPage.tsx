import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { PaginationBar } from '../components/ui/PaginationBar'

export function WarningsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const { data = [] } = useQuery({ queryKey: ['warnings'], queryFn: campusApi.warnings })
  const recalc = useMutation({ mutationFn: campusApi.recalculateWarnings, onSuccess: () => qc.invalidateQueries({ queryKey: ['warnings'] }) })
  const rows = data as unknown as Record<string, unknown>[]
  const pagedRows = rows.slice((page - 1) * size, page * size)
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#172235]">考勤风险预警</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#556273]">
            <span className="rounded bg-[#f2f5f1] px-2 py-1">旷课≥3 高风险</span>
            <span className="rounded bg-[#f2f5f1] px-2 py-1">旷课2次 中风险</span>
            <span className="rounded bg-[#f2f5f1] px-2 py-1">迟到/早退≥4 中风险</span>
          </div>
        </div>
        <Button onClick={() => recalc.mutate()}><RefreshCw size={16} />重新计算</Button>
      </div>
      <Card className="p-5">
        <DataTable
          rows={pagedRows}
          columns={[
            { key: 'studentNo', title: '学号' },
            { key: 'studentName', title: '学生' },
            { key: 'courseName', title: '课程' },
            { key: 'teachingClassName', title: '教学班' },
            { key: 'warningLevelText', title: '等级' },
            { key: 'absentCount', title: '旷课' },
            { key: 'lateOrEarlyCount', title: '迟到/早退' },
            { key: 'reason', title: '原因' },
            { key: 'generatedTime', title: '生成时间' },
          ]}
        />
        <PaginationBar total={rows.length} page={page} size={size} onPageChange={setPage} onSizeChange={(next) => { setSize(next); setPage(1) }} />
      </Card>
    </div>
  )
}
