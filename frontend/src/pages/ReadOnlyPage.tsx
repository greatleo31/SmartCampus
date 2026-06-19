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
    ? Object.keys(first).filter((key) => !['createTime', 'updateTime', 'deleted'].includes(key)).map((key) => ({ key, title: key }))
    : [{ key: 'empty', title: '数据' }]

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
      <Card className="p-5">
        <DataTable rows={rows as Record<string, unknown>[]} columns={columns} />
      </Card>
    </div>
  )
}
