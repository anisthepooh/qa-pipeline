import { RunMeta, RunResult } from '@/types'
import { getPb, getPbAdmin } from './pocketbase'

export async function listRuns(): Promise<RunMeta[]> {
  const pb = getPb()
  if (!pb.authStore.isValid) return []
  const records = await pb.collection('runs').getList(1, 200, {
    sort: '-date',
    fields: 'id,name,url,date,summary',
  })
  return records.items.map(r => ({
    id: r.id,
    name: r.name,
    url: r.url,
    date: r.date,
    summary: r.summary,
  }))
}

export async function getRun(id: string): Promise<RunResult> {
  const pb = getPb()
  const r = await pb.collection('runs').getOne(id)
  return {
    id: r.id,
    run: { name: r.name, url: r.url, tester: r.tester, date: r.date },
    summary: r.summary,
    test_cases: r.test_cases || [],
    findings: r.findings || [],
  }
}

export async function saveRun(data: RunResult, userId: string): Promise<string> {
  const pb = await getPbAdmin()
  const record = await pb.collection('runs').create({
    user: userId,
    name: data.run.name,
    url: data.run.url,
    tester: data.run.tester,
    date: data.run.date,
    summary: data.summary,
    test_cases: data.test_cases,
    findings: data.findings,
    categories: [],
  })
  return record.id
}

export async function deleteRun(id: string): Promise<void> {
  const pb = getPb()
  await pb.collection('runs').delete(id)
}
