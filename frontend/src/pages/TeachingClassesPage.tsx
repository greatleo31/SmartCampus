import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'

export function TeachingClassesPage() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['teachingClasses'], queryFn: campusApi.teachingClasses })
  const { data: semesters } = useQuery({ queryKey: ['semesters'], queryFn: campusApi.semesters })
  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: campusApi.courses })
  const { data: teachers = [] } = useQuery({ queryKey: ['teachers'], queryFn: campusApi.teachers })
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ className: '', semesterId: 0, courseId: 0, teacherId: 0, capacity: 60 })
  const create = useMutation({
    mutationFn: campusApi.createTeachingClass,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['teachingClasses'] })
      setOpen(false)
      setForm({ className: '', semesterId: 0, courseId: 0, teacherId: 0, capacity: 60 })
    },
  })
  const remove = useMutation({ mutationFn: campusApi.deleteTeachingClass, onSuccess: () => qc.invalidateQueries({ queryKey: ['teachingClasses'] }) })
  const semesterOptions = semesters?.records ?? []
  const courseOptions = courses?.records ?? []
  const selectedSemesterId = form.semesterId || semesterOptions[0]?.id || 0
  const selectedCourseId = form.courseId || courseOptions[0]?.id || 0
  const selectedTeacherId = form.teacherId || teachers[0]?.id || 0

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!selectedSemesterId || !selectedCourseId || !selectedTeacherId) return
    create.mutate({
      ...form,
      semesterId: selectedSemesterId,
      courseId: selectedCourseId,
      teacherId: selectedTeacherId,
      classCode: generateClassCode(),
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[#172235]">教学班管理</h1>
        <Button onClick={() => setOpen(true)}><Plus size={16} />新增教学班</Button>
      </div>
      <Card className="p-5">
        <DataTable
          rows={(data?.records ?? []) as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'className', title: '教学班' },
            { key: 'semesterName', title: '学期' },
            { key: 'courseName', title: '课程' },
            { key: 'teacherName', title: '教师' },
            { key: 'capacity', title: '容量' },
            { key: 'id', title: '操作', render: (row) => <Button variant="danger" onClick={() => window.confirm('确认删除该教学班？') && remove.mutate(Number(row.id))}>删除</Button> },
          ]}
        />
      </Card>
      <Modal open={open} title="新增教学班" onClose={() => setOpen(false)}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <Field label="教学班名称"><Input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} required /></Field>
          <Field label="学期"><select className={inputClass} value={selectedSemesterId} onChange={(e) => setForm({ ...form, semesterId: Number(e.target.value) })} required>{semesterOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
          <Field label="课程"><select className={inputClass} value={selectedCourseId} onChange={(e) => setForm({ ...form, courseId: Number(e.target.value) })} required>{courseOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
          <Field label="教师"><select className={inputClass} value={selectedTeacherId} onChange={(e) => setForm({ ...form, teacherId: Number(e.target.value) })} required>{teachers.map((item) => <option key={item.id} value={item.id}>{item.realName} · {item.department}</option>)}</select></Field>
          <Field label="容量"><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} required /></Field>
          <div className="md:col-span-2"><Button type="submit" disabled={create.isPending}>保存</Button></div>
        </form>
      </Modal>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-[#556273]">{label}</span>{children}</label>
}

const inputClass = 'h-10 w-full rounded-md border border-[#cfd8d2] bg-white px-3 text-sm text-[#172235] outline-none transition focus:border-[var(--campus-green)] focus:ring-2 focus:ring-emerald-100'

function generateClassCode() {
  const value = Math.floor(Date.now() + Math.random() * 1000000).toString(36).toUpperCase()
  return value.slice(-8).padStart(8, '0')
}
