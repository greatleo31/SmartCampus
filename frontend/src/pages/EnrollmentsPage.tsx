import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { Input } from '../components/ui/Input'

export function EnrollmentsPage() {
  const qc = useQueryClient()
  const [teachingClassId, setTeachingClassId] = useState(1)
  const [studentId, setStudentId] = useState(1)
  const { data = [] } = useQuery({ queryKey: ['enrollments', teachingClassId], queryFn: () => campusApi.enrollments(teachingClassId) })
  const create = useMutation({ mutationFn: campusApi.createEnrollment, onSuccess: () => qc.invalidateQueries({ queryKey: ['enrollments'] }) })
  const remove = useMutation({ mutationFn: campusApi.deleteEnrollment, onSuccess: () => qc.invalidateQueries({ queryKey: ['enrollments'] }) })

  function submit(e: FormEvent) {
    e.preventDefault()
    create.mutate({ teachingClassId, studentId })
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-slate-950">学生名单</h1>
      <Card className="p-5">
        <form className="mb-5 grid gap-3 md:grid-cols-4" onSubmit={submit}>
          <Input type="number" value={teachingClassId} onChange={(e) => setTeachingClassId(Number(e.target.value))} required />
          <Input type="number" value={studentId} onChange={(e) => setStudentId(Number(e.target.value))} required />
          <Button>加入名单</Button>
        </form>
        <DataTable
          rows={data as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'id', title: 'ID' },
            { key: 'teachingClassId', title: '教学班ID' },
            { key: 'studentId', title: '学生ID' },
            { key: 'action', title: '操作', render: (row) => <Button variant="danger" onClick={() => remove.mutate(Number(row.id))}>移除</Button> },
          ]}
        />
      </Card>
    </div>
  )
}
