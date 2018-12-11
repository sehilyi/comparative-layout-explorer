module ImageMSE {
  'use strict';

  export type Data = number[] | any[] | Uint8Array;

	/**
	 * Grey = 1, GreyAlpha = 2, RGB = 3, RGBAlpha = 4
	 */
  export type Channels = number;

  export interface IImage {
    data: Data;
    width: number;
    height: number;
    channels: Channels;
  }

  export interface IResult {
    mse: number;
    psnr: number;
  }

  export function compare(image1: IImage,
    image2: IImage,
    luminance: boolean = true): IResult {
    var sum: number = 0;
    var l: number = image1.data.length;
    var i: number;
    var a1: number;
    var a2: number;

    if (image1.channels === 1) {
      for (i = 0; i < l; i += image1.channels) {
        sum += Math.pow(image1.data[i] - image2.data[i], 2);
      }
    } else if (image1.channels === 2) {
      for (i = 0; i < l; i += image1.channels) {
        sum += Math.pow(image1.data[i] * image1.data[i + 1] / 255 - image2.data[i] * image2.data[i - 1] / 255, 2);
      }
    } else if (image1.channels === 3 && !luminance) {
      for (i = 0; i < l; i += image1.channels) {
        sum += Math.pow(image1.data[i] - image2.data[i], 2);
        sum += Math.pow(image1.data[i + 1] - image2.data[i + 1], 2);
        sum += Math.pow(image1.data[i + 2] - image2.data[i + 2], 2);
      }
    } else if (image1.channels === 3 && luminance) {
      for (i = 0; i < l; i += image1.channels) {
        sum += Math.pow(0.212655 * image1.data[i] - 0.212655 * image2.data[i], 2);
        sum += Math.pow(0.715158 * image1.data[i + 1] - 0.715158 * image2.data[i + 1], 2);
        sum += Math.pow(0.072187 * image1.data[i + 2] - 0.072187 * image2.data[i + 2], 2);
      }
    } else if (image1.channels === 4 && !luminance) {
      for (i = 0; i < l; i += image1.channels) {
        a1 = image1.data[i + 3] / 255;
        a2 = image2.data[i + 3] / 255;
        sum += Math.pow(image1.data[i] * a1 - image2.data[i] * a2, 2);
        sum += Math.pow(image1.data[i + 1] * a1 - image2.data[i + 1] * a2, 2);
        sum += Math.pow(image1.data[i + 2] * a1 - image2.data[i + 2] * a2, 2);
      }
    } else if (image1.channels === 4 && luminance) {
      for (i = 0; i < l; i += image1.channels) {
        a1 = image1.data[i + 3] / 255;
        a2 = image2.data[i + 3] / 255;
        sum += Math.pow(0.212655 * image1.data[i] * a1 - 0.212655 * image2.data[i] * a2, 2);
        sum += Math.pow(0.715158 * image1.data[i + 1] * a1 - 0.715158 * image2.data[i + 1] * a2, 2);
        sum += Math.pow(0.072187 * image1.data[i + 2] * a1 - 0.072187 * image2.data[i + 2] * a2, 2);
      }
    }

    var pc: number = l;

    if ((image1.channels === 3 || image1.channels === 4) && !luminance) {
      pc *= 3;
    }

    var mse: number = sum / pc;

    return {
      mse: mse,
      psnr: psnr(mse)
    };
  }

  function psnr(mse: number, max: number = 255): number {
    return 10 * log10((max * max) / mse);
  }

  function log10(value: number): number {
    return Math.log(value) / Math.LN10;
  }
}

export default ImageMSE;