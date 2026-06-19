import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'

export function WarningsPage() {
  const qc = useQueryClient()
  const { data = [] } = useQuery({ queryKey: ['warnings'], queryFn: campusApi.warnings })
  const recalc = useMutation({ mutationFn: campusApi.recalculateWarnings, onSuccess: () => qc.invalidateQueries({ queryKey: ['warnings'] }) })
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-950">学业预警</h1>
        <Button onClick={() => recalc.mutate()}><RefreshCw size={16} />重新计算</Button>
      </div>
      <Card className="p-5">
        <DataTable
          rows={data as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'studentId', title: '学生ID' },
            { key: 'teachingClassId', title: '教学班ID' },
            { key: 'warningLevel', title: '等级' },
            { key: 'reason', title: '原因' },
            { key: 'status', title: '状态' },
            { key: 'generatedTime', title: '生成时间' },
          ]}
        />
      </Card>
    </div>
  )
}
