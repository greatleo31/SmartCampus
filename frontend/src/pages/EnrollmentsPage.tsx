import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'

export function EnrollmentsPage() {
  const qc = useQueryClient()
  const [teachingClassId, setTeachingClassId] = useState(0)
  const [studentId, setStudentId] = useState(0)
  const [open, setOpen] = useState(false)
  const { data: teachingClasses } = useQuery({ queryKey: ['teachingClasses'], queryFn: campusApi.teachingClasses })
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: campusApi.students })
  const classOptions = teachingClasses?.records ?? []
  const selectedTeachingClassId = teachingClassId || classOptions[0]?.id || 0
  const selectedStudentId = studentId || students[0]?.id || 0
  const { data = [] } = useQuery({
    queryKey: ['enrollments', selectedTeachingClassId],
    queryFn: () => campusApi.enrollments(selectedTeachingClassId),
    enabled: selectedTeachingClassId > 0,
  })
  const create = useMutation({
    mutationFn: campusApi.createEnrollment,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['enrollments'] })
      setOpen(false)
    },
  })
  const remove = useMutation({ mutationFn: campusApi.deleteEnrollment, onSuccess: () => qc.invalidateQueries({ queryKey: ['enrollments'] }) })

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!selectedTeachingClassId || !selectedStudentId) return
    create.mutate({ teachingClassId: selectedTeachingClassId, studentId: selectedStudentId })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[#172235]">学生名单</h1>
        <Button onClick={() => setOpen(true)}><Plus size={16} />加入名单</Button>
      </div>
      <Card className="p-5">
        <div className="mb-4 max-w-xs">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[#556273]">当前教学班</span>
            <select className={inputClass} value={selectedTeachingClassId} onChange={(e) => setTeachingClassId(Number(e.target.value))} required>
              {classOptions.map((item) => <option key={item.id} value={item.id}>{item.className}</option>)}
            </select>
          </label>
        </div>
        <DataTable
          rows={data as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'teachingClassName', title: '教学班' },
            { key: 'studentName', title: '学生姓名' },
            { key: 'studentNo', title: '学号' },
            { key: 'major', title: '专业' },
            { key: 'className', title: '行政班' },
            { key: 'action', title: '操作', render: (row) => <Button variant="danger" onClick={() => window.confirm('确认移除该学生？') && remove.mutate(Number(row.id))}>移除</Button> },
          ]}
        />
      </Card>
      <Modal open={open} title="加入学生名单" onClose={() => setOpen(false)}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <Field label="教学班">
            <select className={inputClass} value={selectedTeachingClassId} onChange={(e) => setTeachingClassId(Number(e.target.value))} required>
              {classOptions.map((item) => <option key={item.id} value={item.id}>{item.className}</option>)}
            </select>
          </Field>
          <Field label="学生">
            <select className={inputClass} value={selectedStudentId} onChange={(e) => setStudentId(Number(e.target.value))} required>
              {students.map((item) => <option key={item.id} value={item.id}>{item.realName} · {item.className} · {item.major}</option>)}
            </select>
          </Field>
          <div className="md:col-span-2"><Button type="submit" disabled={create.isPending || !selectedTeachingClassId || !selectedStudentId}>保存</Button></div>
        </form>
      </Modal>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-[#556273]">{label}</span>{children}</label>
}

const inputClass = 'h-10 w-full rounded-md border border-[#cfd8d2] bg-white px-3 text-sm text-[#172235] outline-none transition focus:border-[var(--campus-green)] focus:ring-2 focus:ring-emerald-100'
