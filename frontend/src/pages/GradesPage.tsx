import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { Input } from '../components/ui/Input'

export function GradesPage() {
  const qc = useQueryClient()
  const [form, setForm] = useState({ teachingClassId: 1, studentId: 1, regularScore: 70, finalScore: 80 })
  const { data = [] } = useQuery({ queryKey: ['grades'], queryFn: () => campusApi.grades() })
  const save = useMutation({ mutationFn: campusApi.saveGrade, onSuccess: () => qc.invalidateQueries({ queryKey: ['grades'] }) })

  function submit(e: FormEvent) {
    e.preventDefault()
    save.mutate(form)
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-slate-950">成绩管理</h1>
      <Card className="p-5">
        <form className="mb-5 grid gap-3 md:grid-cols-5" onSubmit={submit}>
          <Input type="number" value={form.teachingClassId} onChange={(e) => setForm({ ...form, teachingClassId: Number(e.target.value) })} required />
          <Input type="number" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: Number(e.target.value) })} required />
          <Input type="number" min="0" max="100" value={form.regularScore} onChange={(e) => setForm({ ...form, regularScore: Number(e.target.value) })} required />
          <Input type="number" min="0" max="100" value={form.finalScore} onChange={(e) => setForm({ ...form, finalScore: Number(e.target.value) })} required />
          <Button>保存</Button>
        </form>
        <DataTable
          rows={data as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'teachingClassId', title: '教学班ID' },
            { key: 'studentId', title: '学生ID' },
            { key: 'regularScore', title: '平时分' },
            { key: 'finalScore', title: '期末分' },
            { key: 'totalScore', title: '总评' },
          ]}
        />
      </Card>
    </div>
  )
}
