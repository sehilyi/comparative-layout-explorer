import * as canvg from 'canvg-client';
import ImageSSIM from 'src/metrics/ssim';
import { CHART_TOTAL_SIZE } from './design-settings';

export function svgAsImageData(cid, svgid) {
  canvg(document.getElementById(cid), svgid);
  let canvas = document.getElementById(cid);
  let ctx = canvas.getContext('2d');
  let imgData = ctx.getImageData(0, 0, CHART_TOTAL_SIZE.width, CHART_TOTAL_SIZE.height).data;

  // dealing with image file
  // let img = canvas.toDataURL("image/png");
  // (document.getElementById('testimg')) != null ? (document.getElementById('testimg')).src = imgData : null;

  return imgData;
  /// ssim test code
  let imgData1 = { data: imgData.data, width: CHART_TOTAL_SIZE.width, height: CHART_TOTAL_SIZE.height, channels: 4 };
  let imgData2 = { data: imgData.data, width: CHART_TOTAL_SIZE.width, height: CHART_TOTAL_SIZE.height, channels: 4 };
  let imagePair = [imgData1, imgData2, 8, false];
  let res = ImageSSIM.compare(imagePair[0], imagePair[1], imagePair[2], 0.01, 0.03, imagePair[3]);
  ///
}