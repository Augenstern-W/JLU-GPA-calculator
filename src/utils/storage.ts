import Taro from '@tarojs/taro';
import { Course } from '../types/course';

const STORAGE_KEY = 'jlu_gpa_courses';

/** 读取本地缓存的课程数据，无数据返回 null */
export function loadCourses(): Course[] | null {
  try {
    const v = Taro.getStorageSync(STORAGE_KEY);
    return Array.isArray(v) && v.length > 0 ? (v as Course[]) : null;
  } catch {
    return null;
  }
}

/** 保存课程数据到本地（纯本地，不上传） */
export function saveCourses(courses: Course[]): void {
  try {
    Taro.setStorageSync(STORAGE_KEY, courses);
  } catch {
    /* 忽略存储失败 */
  }
}

/** 清除本地课程数据 */
export function clearCourses(): void {
  try {
    Taro.removeStorageSync(STORAGE_KEY);
  } catch {
    /* 忽略 */
  }
}
