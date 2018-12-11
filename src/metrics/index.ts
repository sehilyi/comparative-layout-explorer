import ImageSSIM from './ssim';
import {CHART_TOTAL_SIZE} from 'src/useful-factory/constants';

export function getSSIM(a: any[], b: any[]) {
  let imgData1: ImageSSIM.IImage = {data: a, width: CHART_TOTAL_SIZE.width, height: CHART_TOTAL_SIZE.height, channels: 4};
  let imgData2: ImageSSIM.IImage = {data: b, width: CHART_TOTAL_SIZE.width, height: CHART_TOTAL_SIZE.height, channels: 4};
  let imagePair = [imgData1, imgData2, 8, false];
  let res = ImageSSIM.compare(imagePair[0] as ImageSSIM.IImage, imagePair[1] as ImageSSIM.IImage, imagePair[2] as number, 0.01, 0.03, imagePair[3] as boolean);
  return res.ssim;
}