import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { Input, Select } from '../components/ui/Input'
import type { AttendanceRecord } from '../types/api'

export function AttendancePage() {
  const qc = useQueryClient()
  const [form, setForm] = useState<Omit<AttendanceRecord, 'id'>>({
    teachingClassId: 1,
    studentId: 1,
    attendanceDate: new Date().toISOString().slice(0, 10),
    status: 'NORMAL',
    remark: '',
  })
  const { data = [] } = useQuery({ queryKey: ['attendance'], queryFn: () => campusApi.attendance() })
  const save = useMutation({ mutationFn: campusApi.saveAttendance, onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }) })

  function submit(e: FormEvent) {
    e.preventDefault()
    save.mutate(form)
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-slate-950">考勤管理</h1>
      <Card className="p-5">
        <form className="mb-5 grid gap-3 md:grid-cols-6" onSubmit={submit}>
          <Input type="number" value={form.teachingClassId} onChange={(e) => setForm({ ...form, teachingClassId: Number(e.target.value) })} required />
          <Input type="number" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: Number(e.target.value) })} required />
          <Input type="date" value={form.attendanceDate} onChange={(e) => setForm({ ...form, attendanceDate: e.target.value })} required />
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AttendanceRecord['status'] })}>
            <option value="NORMAL">正常</option>
            <option value="LATE">迟到</option>
            <option value="EARLY_LEAVE">早退</option>
            <option value="LEAVE">请假</option>
            <option value="ABSENT">旷课</option>
          </Select>
          <Input value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} />
          <Button>保存</Button>
        </form>
        <DataTable
          rows={data as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'teachingClassId', title: '教学班ID' },
            { key: 'studentId', title: '学生ID' },
            { key: 'attendanceDate', title: '日期' },
            { key: 'status', title: '状态' },
            { key: 'remark', title: '备注' },
          ]}
        />
      </Card>
    </div>
  )
}
