import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'

export function SemestersPage() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['semesters'], queryFn: campusApi.semesters })
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', currentFlag: 0 })
  const create = useMutation({
    mutationFn: campusApi.createSemester,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['semesters'] })
      setOpen(false)
      setForm({ name: '', startDate: '', endDate: '', currentFlag: 0 })
    },
  })
  const remove = useMutation({ mutationFn: campusApi.deleteSemester, onSuccess: () => qc.invalidateQueries({ queryKey: ['semesters'] }) })

  function submit(event: FormEvent) {
    event.preventDefault()
    create.mutate(form)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[#172235]">学期管理</h1>
        <Button onClick={() => setOpen(true)}><Plus size={16} />新增学期</Button>
      </div>
      <Card className="p-5">
        <DataTable
          rows={(data?.records ?? []) as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'name', title: '名称' },
            { key: 'startDate', title: '开始日期' },
            { key: 'endDate', title: '结束日期' },
            { key: 'currentFlag', title: '当前' },
            { key: 'id', title: '操作', render: (row) => <Button variant="danger" onClick={() => window.confirm('确认删除该学期？') && remove.mutate(Number(row.id))}>删除</Button> },
          ]}
        />
      </Card>
      <Modal open={open} title="新增学期" onClose={() => setOpen(false)}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <Field label="学期名称"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
          <Field label="开始日期"><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></Field>
          <Field label="结束日期"><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required /></Field>
          <label className="flex h-10 items-center gap-2 text-sm text-[#344256]">
            <input type="checkbox" checked={form.currentFlag === 1} onChange={(e) => setForm({ ...form, currentFlag: e.target.checked ? 1 : 0 })} />
            当前学期
          </label>
          <div className="md:col-span-2"><Button type="submit" disabled={create.isPending}>保存</Button></div>
        </form>
      </Modal>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-[#556273]">{label}</span>{children}</label>
}
