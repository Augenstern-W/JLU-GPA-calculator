// 课程数据模型
export interface Course {
  /** 学年学期，如 2024-2025-1 */
  term: string;
  /** 课程名 */
  name: string;
  /** 总成绩（百分制数字或等级制文本，如 优） */
  score: string;
  /** 学分 */
  credit: number;
  /** 绩点，null 表示等级制成绩待手填 */
  jd: number | null;
}

/** 手动添加课程表单 */
export interface AddForm {
  name: string;
  score: string;
  credit: string;
  jd: string;
  term: string;
}

export const EMPTY_ADD_FORM: AddForm = {
  name: '',
  score: '',
  credit: '',
  jd: '',
  term: '',
};
