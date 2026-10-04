import React, { useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { Course, AddForm, EMPTY_ADD_FORM } from '@/types/course';
import { parseScoreXlsx, calcGpa, scoreToJd, GpaResult } from '@/utils/gpa';
import { pickXlsxFile } from '@/utils/importFile';
import { loadCourses, saveCourses } from '@/utils/storage';
import styles from './index.module.scss';

const IndexPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(() => loadCourses() || []);
  const [fileName, setFileName] = useState('');
  const [addForm, setAddForm] = useState<AddForm>(EMPTY_ADD_FORM);
  const [result, setResult] = useState<GpaResult | null>(null);

  /** 每次回到本页时与本地缓存同步：「我的」页清除数据后，课程明细/文件名/计算结果一并清空 */
  useDidShow(() => {
    const stored = loadCourses();
    if (stored) {
      setCourses(stored);
    } else {
      setCourses([]);
      setFileName('');
      setResult(null);
    }
  });

  const totalCredit = courses.reduce((s, c) => s + c.credit, 0);

  const EDU_URL = 'https://iedu.jlu.edu.cn/';

  /** 前往教务系统：H5 直接新窗口打开；小程序把网址复制到剪贴板，引导去浏览器打开 */
  const handleOpenEdu = () => {
    if (process.env.TARO_ENV === 'h5') {
      window.open(EDU_URL, '_blank');
      return;
    }
    Taro.setClipboardData({
      data: EDU_URL,
      success: () => {
        Taro.showToast({ title: '网址已复制，请在浏览器打开登录', icon: 'none', duration: 2500 });
      },
    });
  };

  /** 导入成绩单（weapp 从聊天记录选文件，需先发送到文件传输助手） */
  const handleImport = async () => {
    const picked = await pickXlsxFile();
    if (!picked.ok || !picked.data) {
      if (picked.errMsg && picked.errMsg !== '已取消选择') {
        Taro.showToast({ title: picked.errMsg, icon: 'none', duration: 2500 });
      }
      return;
    }
    const parsed = parseScoreXlsx(picked.data);
    if (!parsed.ok) {
      Taro.showToast({ title: parsed.message || '识别错误', icon: 'none', duration: 2500 });
      return;
    }
    setCourses(parsed.courses);
    setFileName(picked.fileName || '');
    setResult(null);
    saveCourses(parsed.courses);
    Taro.showToast({ title: `成功导入 ${parsed.courses.length} 门课程`, icon: 'success' });
  };

  /** 手动添加课程（成绩为等级制时需手填绩点） */
  const handleAddCourse = () => {
    const name = addForm.name.trim();
    const credit = parseFloat(addForm.credit);
    const jd = parseFloat(addForm.jd);
    if (!name) return Taro.showToast({ title: '请填写课程名', icon: 'none' });
    if (isNaN(credit) || credit <= 0) {
      return Taro.showToast({ title: '请填写正确的学分', icon: 'none' });
    }
    if (isNaN(jd) || jd < 0 || jd > 4) {
      return Taro.showToast({ title: '请填写正确的绩点（0 - 4.0）', icon: 'none' });
    }
    const next: Course[] = [
      ...courses,
      {
        term: addForm.term.trim(),
        name,
        score: addForm.score.trim(),
        credit,
        jd,
      },
    ];
    setCourses(next);
    saveCourses(next);
    setAddForm(EMPTY_ADD_FORM);
    setResult(null);
    Taro.showToast({ title: '已添加课程', icon: 'success' });
  };

  /** 删除课程 */
  const handleDelete = (index: number) => {
    const next = courses.filter((_, i) => i !== index);
    setCourses(next);
    saveCourses(next);
    setResult(null);
  };

  /** 清空全部课程（需二次确认） */
  const handleClearAll = () => {
    Taro.showModal({
      title: '清空课程',
      content: `将删除全部 ${courses.length} 门课程，确定继续吗？`,
      confirmText: '清空',
      confirmColor: '#c0453e',
      success: (res) => {
        if (res.confirm) {
          setCourses([]);
          saveCourses([]);
          setResult(null);
          Taro.showToast({ title: '已清空', icon: 'success' });
        }
      },
    });
  };

  /** 百分制成绩输入时自动换算绩点；等级制成绩则清空绩点待手填 */
  const handleScoreInput = (v: string) => {
    const jd = scoreToJd(v);
    setAddForm((f) => ({ ...f, score: v, jd: jd !== null ? jd.toFixed(1) : '' }));
  };

  const handleCalculate = () => {
    if (!courses.length) {
      return Taro.showToast({ title: '请先导入或添加课程', icon: 'none' });
    }
    setResult(calcGpa(courses));
  };

  return (
    <View className={styles.container}>
      {/* 导入卡片 */}
      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <View className={styles.headerBar} />
          <Text className={styles.cardTitle}>导入成绩单</Text>
        </View>
        <Text className={styles.hint}>
          {process.env.TARO_ENV === 'h5'
            ? '点「前往教务系统」→ 登录后选择「成绩查询」模块 → 导出并下载成绩单 xlsx → 点「选择文件」从手机下载目录中选中'
            : '点「前往教务系统」→ 登录后选择「成绩查询」模块 → 导出并下载成绩单 xlsx → 在微信发给「文件传输助手」→ 点「选择文件」从聊天记录中选中'}
        </Text>
        <View className={styles.eduBtn} onClick={handleOpenEdu}>
          <Text className={styles.eduBtnText}>前往教务系统</Text>
        </View>
        <View className={styles.importBtn} onClick={handleImport}>
          <Text className={styles.importBtnText}>{fileName ? '重新导入' : '选择文件'}</Text>
        </View>
        {fileName ? (
          <Text className={styles.fileName}>已导入：{fileName}</Text>
        ) : (
          <Text className={styles.fileEmpty}>尚未导入文件</Text>
        )}
      </View>

      {/* 课程明细 */}
      {courses.length > 0 && (
        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <View className={styles.headerBar} />
            <Text className={styles.cardTitle}>课程明细</Text>
            <Text className={styles.subTitle}>
              {courses.length} 门 · {totalCredit.toFixed(1)} 学分
            </Text>
          </View>
          <View className={styles.listHead}>
            <Text className={styles.colName}>课程</Text>
            <Text className={styles.colNum}>成绩</Text>
            <Text className={styles.colNum}>学分</Text>
            <Text className={styles.colNum}>绩点</Text>
            <Text className={styles.colDel} />
          </View>
          <ScrollView scrollY enhanced showScrollbar className={styles.listScroll}>
            {courses.map((c, i) => (
              <View key={`${c.name}-${i}`} className={styles.listRow}>
                <View className={styles.colName}>
                  <Text className={styles.courseName}>{c.name}</Text>
                  {c.term ? <Text className={styles.courseTerm}>{c.term}</Text> : null}
                </View>
                <Text className={styles.colNum}>{c.score || '—'}</Text>
                <Text className={styles.colNum}>{c.credit}</Text>
                <Text className={`${styles.colNum} ${c.jd === null ? styles.jdPending : ''}`}>
                  {c.jd !== null ? c.jd.toFixed(1) : '待填'}
                </Text>
                <View className={styles.colDel} onClick={() => handleDelete(i)}>
                  <Text className={styles.delText}>✕</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 清空按钮（课程明细与手动添加之间） */}
      {courses.length > 0 && (
        <View className={styles.clearAllBtn} onClick={handleClearAll}>
          <Text className={styles.clearAllText}>清空全部课程</Text>
        </View>
      )}

      {/* 手动添加 */}
      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <View className={styles.headerBar} />
          <Text className={styles.cardTitle}>手动添加课程</Text>
        </View>
        <View className={styles.formGrid}>
          <View className={styles.formItemWide}>
            <Text className={styles.formLabel}>课程名</Text>
            <Input
              className={styles.input}
              value={addForm.name}
              placeholder="如：高等数学"
              placeholderClass={styles.placeholder}
              onInput={(e) => setAddForm((f) => ({ ...f, name: e.detail.value }))}
            />
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>成绩</Text>
            <Input
              className={styles.input}
              value={addForm.score}
              placeholder="如：95 或 优"
              placeholderClass={styles.placeholder}
              onInput={(e) => handleScoreInput(e.detail.value)}
            />
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>学分</Text>
            <Input
              className={styles.input}
              type='digit'
              value={addForm.credit}
              placeholder="如：4"
              placeholderClass={styles.placeholder}
              onInput={(e) => setAddForm((f) => ({ ...f, credit: e.detail.value }))}
            />
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>绩点</Text>
            <Input
              className={styles.input}
              type='digit'
              value={addForm.jd}
              placeholder="百分制自动填"
              placeholderClass={styles.placeholder}
              onInput={(e) => setAddForm((f) => ({ ...f, jd: e.detail.value }))}
            />
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>学期</Text>
            <Input
              className={styles.input}
              value={addForm.term}
              placeholder="选填"
              placeholderClass={styles.placeholder}
              onInput={(e) => setAddForm((f) => ({ ...f, term: e.detail.value }))}
            />
          </View>
        </View>
        <Text className={styles.formHint}>等级制成绩（优/良/中…）请手动填写绩点</Text>
        <View className={styles.addBtn} onClick={handleAddCourse}>
          <Text className={styles.addBtnText}>添加</Text>
        </View>
      </View>

      {/* 计算按钮 */}
      <View className={styles.calcBtn} onClick={handleCalculate}>
        <Text className={styles.calcBtnText}>开始计算</Text>
      </View>

      {/* 计算结果 */}
      {result && (
        <View className={styles.card}>
          <View className={styles.cardHeader}>
            <View className={styles.headerBar} />
            <Text className={styles.cardTitle}>计算结果</Text>
          </View>
          <View className={styles.resultMain}>
            <Text className={styles.gpaLabel}>平均学分绩点 (GPA)</Text>
            <Text className={styles.gpaValue}>{result.gpa}</Text>
            <View className={styles.resultMeta}>
              <Text className={styles.metaItem}>总学分 {result.totalCredit.toFixed(1)}</Text>
              <Text className={styles.metaDivider}>|</Text>
              <Text className={styles.metaItem}>计入门课程 {result.countedCount}</Text>
            </View>
          </View>

          {result.pendingCount > 0 && (
            <View className={styles.pendingTip}>
              <Text className={styles.pendingTipText}>
                有 {result.pendingCount} 门课程绩点待填写，未计入计算
              </Text>
            </View>
          )}

          {result.termStats.length > 0 && (
            <View className={styles.termSection}>
              <Text className={styles.termTitle}>分学期明细</Text>
              {result.termStats.map((t) => (
                <View key={t.term} className={styles.termRow}>
                  <View className={styles.termInfo}>
                    <Text className={styles.termName}>{t.term}</Text>
                    <Text className={styles.termMeta}>
                      {t.courseCount} 门 · {t.totalCredit.toFixed(1)} 学分
                    </Text>
                  </View>
                  <Text className={styles.termGpa}>{t.gpa}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <Text className={styles.footer}>数据仅保存在本机，不上传任何服务器</Text>
    </View>
  );
};

export default IndexPage;
