import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { loadCourses, clearCourses } from '@/utils/storage';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const [courseCount, setCourseCount] = useState(0);

  useDidShow(() => {
    const courses = loadCourses();
    setCourseCount(courses ? courses.length : 0);
  });

  const handleClear = () => {
    if (courseCount === 0) {
      return Taro.showToast({ title: '暂无本地数据', icon: 'none' });
    }
    Taro.showModal({
      title: '清除本地数据',
      content: `将删除已缓存的 ${courseCount} 门课程数据，确定继续吗？`,
      confirmText: '清除',
      confirmColor: '#c0453e',
      success: (res) => {
        if (res.confirm) {
          clearCourses();
          setCourseCount(0);
          Taro.showToast({ title: '已清除', icon: 'success' });
        }
      },
    });
  };

  return (
    <View className={styles.container}>
      {/* 数据管理 */}
      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <View className={styles.headerBar} />
          <Text className={styles.cardTitle}>数据管理</Text>
        </View>
        <View className={styles.statRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{courseCount}</Text>
            <Text className={styles.statLabel}>本地缓存课程</Text>
          </View>
        </View>
        <View className={styles.clearBtn} onClick={handleClear}>
          <Text className={styles.clearBtnText}>清除本地数据</Text>
        </View>
      </View>

      {/* 数据说明 */}
      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <View className={styles.headerBar} />
          <Text className={styles.cardTitle}>数据说明</Text>
        </View>
        <View className={styles.noteRow}>
          <Text className={styles.noteDot}>·</Text>
          <Text className={styles.noteText}>
            本工具为纯本地计算器，成绩数据仅保存在手机缓存中，不收集、不上传任何数据
          </Text>
        </View>
        <View className={styles.noteRow}>
          <Text className={styles.noteDot}>·</Text>
          <Text className={styles.noteText}>
            重新导入成绩单会以文件为准覆盖本地数据，手动添加/删除的课程也会一并保存
          </Text>
        </View>
        <View className={styles.noteRow}>
          <Text className={styles.noteDot}>·</Text>
          <Text className={styles.noteText}>
            清除缓存后需重新导入成绩单才能计算
          </Text>
        </View>
      </View>

      {/* 关于 */}
      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <View className={styles.headerBar} />
          <Text className={styles.cardTitle}>关于</Text>
        </View>
        <View className={styles.aboutRow}>
          <Text className={styles.aboutLabel}>应用名称</Text>
          <Text className={styles.aboutValue}>吉大绩点计算器</Text>
        </View>
        <View className={styles.aboutRow}>
          <Text className={styles.aboutLabel}>绩点制度</Text>
          <Text className={styles.aboutValue}>吉林大学 4.0 满绩</Text>
        </View>
        <View className={styles.aboutRow}>
          <Text className={styles.aboutLabel}>版本</Text>
          <Text className={styles.aboutValue}>1.0.0</Text>
        </View>
        <View className={styles.aboutRow}>
          <Text className={styles.aboutLabel}>开发者</Text>
          <Text className={styles.aboutValue}>忘江湖</Text>
        </View>
        <View className={styles.aboutRow}>
          <Text className={styles.aboutLabel}>联系QQ</Text>
          <Text className={styles.aboutValue}>2464231867</Text>
        </View>
      </View>

      <Text className={styles.footer}>仅供学习参考，绩点以教务系统为准</Text>
    </View>
  );
};

export default MinePage;
