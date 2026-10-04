import Taro from '@tarojs/taro';

export interface PickResult {
  ok: boolean;
  data?: ArrayBuffer;
  fileName?: string;
  errMsg?: string;
}

/**
 * 跨端选择本地 .xlsx 成绩文件。
 * - 微信小程序：从聊天记录中选择（需先把文件发送到任意聊天，如「文件传输助手」）
 * - H5：浏览器原生 input[type=file]
 */
export async function pickXlsxFile(): Promise<PickResult> {
  if (process.env.TARO_ENV === 'weapp') {
    try {
      const res = await Taro.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['xlsx'],
      });
      const file = res.tempFiles && res.tempFiles[0];
      if (!file) return { ok: false, errMsg: '未选择文件' };
      if (!/\.xlsx$/i.test(file.name)) {
        return { ok: false, errMsg: '请选择 .xlsx 格式的成绩文件' };
      }
      const data = Taro.getFileSystemManager().readFileSync(file.path);
      return { ok: true, data, fileName: file.name };
    } catch (e) {
      const msg = (e as { errMsg?: string }).errMsg || '';
      if (msg.includes('cancel')) return { ok: false, errMsg: '已取消选择' };
      return { ok: false, errMsg: '选择文件失败，请重试' };
    }
  }

  // H5
  return new Promise<PickResult>((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx';
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) return resolve({ ok: false, errMsg: '未选择文件' });
      if (!/\.xlsx$/i.test(file.name)) {
        return resolve({ ok: false, errMsg: '请选择 .xlsx 格式的成绩文件' });
      }
      const reader = new FileReader();
      reader.onload = () =>
        resolve({ ok: true, data: reader.result as ArrayBuffer, fileName: file.name });
      reader.onerror = () => resolve({ ok: false, errMsg: '读取文件失败，请重试' });
      reader.readAsArrayBuffer(file);
    };
    input.click();
  });
}
