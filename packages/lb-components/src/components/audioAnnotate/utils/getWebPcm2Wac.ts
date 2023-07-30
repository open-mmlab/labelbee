const getWebFileArrayBuffer = async (url: string) => {
  return await fetch(url).then((response) => response.arrayBuffer());
};

const getWebPcm2WavArrayBuffer = async (url: string) => {
  const bytes = await getWebFileArrayBuffer(url);
  return addWavHeader(bytes, 16000, 16, 1); // 这里是当前业务需求，特定的参数，采样率16000，采样位数16，声道数1
};

const writeString = (view: DataView, offset: number, str: string) => {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
};

const floatTo32BitPCM = (output: DataView, offset: number, input: ArrayBuffer) => {
  let inputArray = new Int32Array(input);
  let offsetLocal = offset
  for (let i = 0; i < inputArray.length; i++, offsetLocal += 4) {
    output.setInt32(offsetLocal, inputArray[i], true);
  }
};

const floatTo16BitPCM = (output: DataView, offset: number, input: ArrayBuffer) => {
  let inputArray = new Int16Array(input);
  let offsetLocal = offset
  for (let i = 0; i < inputArray.length; i++, offsetLocal += 2) {
    output.setInt16(offsetLocal, inputArray[i], true);
  }
};

const floatTo8BitPCM = (output: DataView, offset: number, input: ArrayBuffer) => {
  let inputArray = new Int8Array(input);
  let offsetLocal = offset
  for (let i = 0; i < inputArray.length; i++, offsetLocal++) {
    output.setInt8(offsetLocal, inputArray[i]);
  }
};

const addWavHeader = (samples: ArrayBuffer, sampleRateTmp: number, sampleBits: number, channelCount: number) => {
  let dataLength = samples.byteLength;
  /* 新的buffer类，预留44bytes的heaer 空间 */
  let buffer = new ArrayBuffer(44 + dataLength);
  /* 转为 Dataview, 利用 API 来填充字节 */
  let view = new DataView(buffer);
  /* 定义一个内部函数，以 big end 数据格式填充字符串至 DataView */

  let offset = 0;
  /* ChunkID, 4 bytes,  资源交换文件标识符 */
  writeString(view, offset, 'RIFF');
  offset += 4;
  /* ChunkSize, 4 bytes, 下个地址开始到文件尾总字节数,即文件大小-8 */
  view.setUint32(offset, /* 32 */ 36 + dataLength, true);
  offset += 4;
  /* Format, 4 bytes, WAV文件标志 */
  writeString(view, offset, 'WAVE');
  offset += 4;
  /* Subchunk1 ID, 4 bytes, 波形格式标志 */
  writeString(view, offset, 'fmt ');
  offset += 4;
  /* Subchunk1 Size, 4 bytes, 过滤字节,一般为 0x10 = 16 */
  view.setUint32(offset, 16, true);
  offset += 4;
  /* Audio Format, 2 bytes, 格式类别 (PCM形式采样数据) */
  view.setUint16(offset, 1, true);
  offset += 2;
  /* Num Channels, 2 bytes,  通道数 */
  view.setUint16(offset, channelCount, true);
  offset += 2;
  /* SampleRate, 4 bytes, 采样率,每秒样本数,表示每个通道的播放速度 */
  view.setUint32(offset, sampleRateTmp, true);
  offset += 4;
  /* ByteRate, 4 bytes, 波形数据传输率 (每秒平均字节数) 通道数×每秒数据位数×每样本数据位/8 */
  view.setUint32(offset, sampleRateTmp * channelCount * (sampleBits / 8), true);
  offset += 4;
  /* BlockAlign, 2 bytes, 快数据调整数 采样一次占用字节数 通道数×每样本的数据位数/8 */
  view.setUint16(offset, channelCount * (sampleBits / 8), true);
  offset += 2;
  /* BitsPerSample, 2 bytes, 每样本数据位数 */
  view.setUint16(offset, sampleBits, true);
  offset += 2;
  /* Subchunk2 ID, 4 bytes, 数据标识符 */
  writeString(view, offset, 'data');
  offset += 4;
  /* Subchunk2 Size, 4 bytes, 采样数据总数,即数据总大小-44 */
  view.setUint32(offset, dataLength, true);
  offset += 4;

  /* 数据流需要以大端的方式存储，定义不同采样比特的 API */
  if (sampleBits === 16) {
    floatTo16BitPCM(view, 44, samples);
  } else if (sampleBits === 8) {
    floatTo8BitPCM(view, 44, samples);
  } else {
    floatTo32BitPCM(view, 44, samples);
  }
  return view.buffer;
};

export const getWebPcm2WavBase64 = async (url: string) => {
  let bytes = await getWebPcm2WavArrayBuffer(url);
  return `data:audio/wav;base64,${btoa(
    new Uint8Array(bytes).reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''),
  )}`;
};
