import * as XLSX from 'xlsx';
import { Course } from '../types/course';

/** 吉大教务系统《全部成绩查询.xlsx》标准 21 列表头，必须完全一致才能识别 */
export const EXPECTED_HEADER = [
  '学年学期', '课程号', '课程名', '总成绩', '课序号',
  '校公选课类别', '课程类别', '课程性质', '学分', '学时',
  '修读方式', '是否主修', '考试日期', '绩点', '重修重考',
  '等级成绩类型', '考试类型', '开课单位', '是否及格', '是否有效', '特殊原因',
];

/** 固定列位 */
export const COL = { term: 0, name: 2, score: 3, credit: 8, jd: 13 } as const;

/** 百分制 → 绩点换算表（用于指南页展示） */
export const JD_SCALE: Array<{ range: string; jd: string }> = [
  { range: '90 - 100', jd: '4.0' },
  { range: '87 - 89', jd: '3.7' },
  { range: '84 - 86', jd: '3.3' },
  { range: '80 - 83', jd: '3.0' },
  { range: '77 - 79', jd: '2.7' },
  { range: '74 - 76', jd: '2.3' },
  { range: '70 - 73', jd: '2.0' },
  { range: '67 - 69', jd: '1.7' },
  { range: '64 - 66', jd: '1.3' },
  { range: '60 - 63', jd: '1.0' },
  { range: '60 以下', jd: '0' },
];

/**
 * 百分制成绩 → 绩点。
 * 非纯数字（等级制成绩，如「优」）返回 null，需手动填写绩点。
 */
export function scoreToJd(score: string): number | null {
  if (!/^\d+(\.\d+)?$/.test(score)) return null;
  const s = parseFloat(score);
  if (s >= 90) return 4.0;
  if (s >= 87) return 3.7;
  if (s >= 84) return 3.3;
  if (s >= 80) return 3.0;
  if (s >= 77) return 2.7;
  if (s >= 74) return 2.3;
  if (s >= 70) return 2.0;
  if (s >= 67) return 1.7;
  if (s >= 64) return 1.3;
  if (s >= 60) return 1.0;
  return 0;
}

export interface ParseResult {
  ok: boolean;
  courses: Course[];
  message?: string;
}

/** 解析教务系统导出的成绩 xlsx（严格校验表头，格式不符直接报错） */
export function parseScoreXlsx(data: ArrayBuffer): ParseResult {
  try {
    const wb = XLSX.read(data, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' });
    if (!rows.length) {
      return { ok: false, courses: [], message: '识别错误：文件为空' };
    }
    // 严格校验 21 列表头
    const header = (rows[0] as unknown[]).map((h) => String(h ?? '').trim());
    for (let i = 0; i < EXPECTED_HEADER.length; i++) {
      if (header[i] !== EXPECTED_HEADER[i]) {
        return {
          ok: false,
          courses: [],
          message: '识别错误：仅支持吉大教务系统导出的《XX成绩查询.xlsx》',
        };
      }
    }
    // 逐行提取课程（跳过无课程名或无学分的行）
    const courses: Course[] = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r] as unknown[];
      if (!row || !String(row[COL.name] ?? '').trim()) continue;
      const credit = parseFloat(String(row[COL.credit] ?? ''));
      if (isNaN(credit) || credit <= 0) continue;
      const jdNum = parseFloat(String(row[COL.jd] ?? '').trim());
      courses.push({
        term: String(row[COL.term] ?? '').trim(),
        name: String(row[COL.name] ?? '').trim(),
        score: String(row[COL.score] ?? '').trim(),
        credit,
        jd: isNaN(jdNum) ? null : jdNum,
      });
    }
    if (!courses.length) {
      return { ok: false, courses: [], message: '识别错误：文件中未找到课程数据' };
    }
    return { ok: true, courses };
  } catch {
    return { ok: false, courses: [], message: '识别错误：文件解析失败，请确认为 .xlsx 格式' };
  }
}

export interface TermStat {
  term: string;
  gpa: string;
  totalCredit: number;
  courseCount: number;
}

export interface GpaResult {
  /** 总 GPA，保留 5 位小数；无可计课程时为 '—' */
  gpa: string;
  totalCredit: number;
  courseCount: number;
  /** 绩点已知的课程数 */
  countedCount: number;
  /** 等级制待填绩点的课程数 */
  pendingCount: number;
  termStats: TermStat[];
}

/** 计算加权平均绩点：Σ(绩点×学分) ÷ Σ学分，仅统计绩点已知且学分 > 0 的课程 */
export function calcGpa(courses: Course[]): GpaResult {
  let totalCredit = 0;
  let totalPoint = 0;
  let countedCount = 0;
  const termMap = new Map<string, { credit: number; point: number; count: number }>();

  for (const c of courses) {
    if (c.jd === null || !(c.credit > 0)) continue;
    countedCount++;
    totalCredit += c.credit;
    totalPoint += c.jd * c.credit;

    const key = c.term || '未分学期';
    const t = termMap.get(key) || { credit: 0, point: 0, count: 0 };
    t.credit += c.credit;
    t.point += c.jd * c.credit;
    t.count++;
    termMap.set(key, t);
  }

  const termStats: TermStat[] = [];
  termMap.forEach((v, k) => {
    termStats.push({
      term: k,
      gpa: (v.point / v.credit).toFixed(5),
      totalCredit: v.credit,
      courseCount: v.count,
    });
  });

  return {
    gpa: countedCount > 0 ? (totalPoint / totalCredit).toFixed(5) : '—',
    totalCredit,
    courseCount: courses.length,
    countedCount,
    pendingCount: courses.filter((c) => c.jd === null).length,
    termStats,
  };
}
