import React from 'react';
import { View, Text } from '@tarojs/components';
import { JD_SCALE } from '@/utils/gpa';
import styles from './index.module.scss';

/** H5 网页版可直接从手机本地选文件，无需微信中转；小程序版只能从聊天记录选文件 */
const IS_H5 = process.env.TARO_ENV === 'h5';

const STEPS = [
  {
    title: '前往教务系统',
    desc: IS_H5
      ? '点「前往教务系统」按钮，自动跳转打开教务系统 iedu.jlu.edu.cn 并登录'
      : '在计算页点「前往教务系统」按钮，用手机浏览器打开 iedu.jlu.edu.cn 并登录',
  },
  {
    title: '下载成绩单',
    desc: '进入成绩查询，导出/下载"XX成绩查询.xlsx"，文件自动保存到手机本地',
  },
  ...(IS_H5
    ? []
    : [
        {
          title: '转存到微信',
          desc: '打开手机微信 →「文件传输助手」→ 把刚下载的 xlsx 发送进去（小程序只能从聊天记录选文件）',
        },
      ]),
  {
    title: '导入文件',
    desc: IS_H5
      ? '回到本页面 → 点「选择文件」→ 从手机下载目录中选中该成绩单'
      : '回到本小程序 → 选择文件 → 从聊天记录中选中该成绩单',
  },
  {
    title: '调整科目',
    desc: '支持增删科目：点课程明细右侧 ✕ 删除科目；缺漏的科目可在「手动添加课程」中补充',
  },
  {
    title: '开始计算',
    desc: '确认课程明细无误后点击「开始计算」，即可查看总 GPA 与分学期明细',
  },
];

const NOTES = [
  '仅支持教务系统导出的"XX成绩查询.xlsx"，其他文件会提示识别错误',
  '百分制成绩会自动换算绩点；等级制成绩（优/良/中…）请手动添加课程并手填绩点',
  '课程明细支持增删：可删除多余科目，也可手动添加科目',
  '重新导入同一文件会以文件为准，恢复被误删的科目',
  '数据仅保存在本机缓存，不会上传任何服务器',
];

const GuidePage: React.FC = () => {
  return (
    <View className={styles.container}>
      {/* 使用步骤 */}
      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <View className={styles.headerBar} />
          <Text className={styles.cardTitle}>使用步骤</Text>
        </View>
        {STEPS.map((s, i) => (
          <View key={s.title} className={styles.stepRow}>
            <View className={styles.stepNum}>
              <Text className={styles.stepNumText}>{i + 1}</Text>
            </View>
            <View className={styles.stepBody}>
              <Text className={styles.stepTitle}>{s.title}</Text>
              <Text className={styles.stepDesc}>{s.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 绩点换算表 */}
      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <View className={styles.headerBar} />
          <Text className={styles.cardTitle}>百分制绩点换算</Text>
          <Text className={styles.subTitle}>吉林大学 4.0 满绩</Text>
        </View>
        <View className={styles.tableHead}>
          <Text className={styles.thScore}>成绩区间</Text>
          <Text className={styles.thJd}>绩点</Text>
        </View>
        {JD_SCALE.map((row, i) => (
          <View
            key={row.range}
            className={`${styles.tableRow} ${i % 2 === 1 ? styles.tableRowAlt : ''}`}
          >
            <Text className={styles.tdScore}>{row.range}</Text>
            <Text className={styles.tdJd}>{row.jd}</Text>
          </View>
        ))}
      </View>

      {/* 注意事项 */}
      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <View className={styles.headerBar} />
          <Text className={styles.cardTitle}>注意事项</Text>
        </View>
        {NOTES.map((n) => (
          <View key={n} className={styles.noteRow}>
            <Text className={styles.noteDot}>·</Text>
            <Text className={styles.noteText}>{n}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default GuidePage;
