import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { PaginationBar } from '../components/ui/PaginationBar'

export function TeachingClassesPage() {
  const qc = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const { data } = useQuery({ queryKey: ['teachingClasses', page, size, keyword], queryFn: () => campusApi.teachingClasses({ page, size, keyword: keyword.trim() || undefined }) })
  const { data: semesters } = useQuery({ queryKey: ['semesters'], queryFn: () => campusApi.semesters() })
  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: () => campusApi.courses() })
  const { data: teachers = [] } = useQuery({ queryKey: ['teachers'], queryFn: campusApi.teachers })
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ className: '', semesterId: 0, courseId: 0, teacherId: 0, capacity: 60 })
  const [courseKeyword, setCourseKeyword] = useState('')
  const [teacherKeyword, setTeacherKeyword] = useState('')
  const create = useMutation({
    mutationFn: campusApi.createTeachingClass,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['teachingClasses'] })
      setOpen(false)
      setForm({ className: '', semesterId: 0, courseId: 0, teacherId: 0, capacity: 60 })
      setCourseKeyword('')
      setTeacherKeyword('')
    },
  })
  const remove = useMutation({ mutationFn: campusApi.deleteTeachingClass, onSuccess: () => qc.invalidateQueries({ queryKey: ['teachingClasses'] }) })
  const semesterOptions = semesters?.records ?? []
  const courseOptions = courses?.records ?? []
  const filteredCourses = courseOptions.filter((item) => matchesKeyword(courseKeyword, item.code, item.name, item.aliasName, item.collegeName))
  const filteredTeachers = teachers.filter((item) => matchesKeyword(teacherKeyword, item.teacherNo, item.realName, item.department, item.collegeName))
  const selectedSemesterId = form.semesterId || semesterOptions[0]?.id || 0
  const selectedCourseId = form.courseId || filteredCourses[0]?.id || courseOptions[0]?.id || 0
  const selectedTeacherId = form.teacherId || filteredTeachers[0]?.id || teachers[0]?.id || 0

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
        <div className="mb-4 max-w-sm">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[#556273]">关键词</span>
            <Input placeholder="搜索教学班名称或编号" value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1) }} />
          </label>
        </div>
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
        <PaginationBar total={data?.total ?? 0} page={data?.page ?? page} size={data?.size ?? size} onPageChange={setPage} onSizeChange={(next) => { setSize(next); setPage(1) }} />
      </Card>
      <Modal open={open} title="新增教学班" onClose={() => setOpen(false)}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <Field label="教学班名称"><Input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} required /></Field>
          <Field label="学期"><select className={inputClass} value={selectedSemesterId} onChange={(e) => setForm({ ...form, semesterId: Number(e.target.value) })} required>{semesterOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
          <Field label="课程">
            <div className="space-y-2">
              <Input placeholder="搜索课程编号/名称/别名" value={courseKeyword} onChange={(e) => { setCourseKeyword(e.target.value); setForm({ ...form, courseId: 0 }) }} />
              <select className={inputClass} value={selectedCourseId} onChange={(e) => setForm({ ...form, courseId: Number(e.target.value) })} required>
                {filteredCourses.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}{item.aliasName ? ` · ${item.aliasName}` : ''}</option>)}
              </select>
            </div>
          </Field>
          <Field label="教师">
            <div className="space-y-2">
              <Input placeholder="搜索教师编号/姓名/院系" value={teacherKeyword} onChange={(e) => { setTeacherKeyword(e.target.value); setForm({ ...form, teacherId: 0 }) }} />
              <select className={inputClass} value={selectedTeacherId} onChange={(e) => setForm({ ...form, teacherId: Number(e.target.value) })} required>
                {filteredTeachers.map((item) => <option key={item.id} value={item.id}>{item.teacherNo} · {item.realName} · {item.department}</option>)}
              </select>
            </div>
          </Field>
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

function matchesKeyword(keyword: string, ...values: Array<string | undefined>) {
  const normalized = keyword.trim().toLowerCase()
  if (!normalized) return true
  return values.some((value) => value?.toLowerCase().includes(normalized))
}
