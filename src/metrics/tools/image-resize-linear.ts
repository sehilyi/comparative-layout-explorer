module ImageResizeLinear {
  'use strict';

  export type Data = number[] | any[] | Uint8Array;

  export interface IImage {
    data: Data;
    width: number;
    height: number;
    channels: number;
  }

  export function linear(from: IImage, to: IImage): void {
    var sw: number = (from.width < to.width) ? ((from.width - 1) / to.width) : (from.width / to.width);
    var sh: number = (from.height < to.height) ? ((from.height - 1) / to.height) : (from.height / to.height);

    // sw > 2 => linear(from, {width: Math.floor(from.height/2), height:to.height, data: new Uint8Array(...),});

    var w: number = from.width * from.channels;
    var lw: number = from.width - 1;
    var lh: number = from.height - 1;

    var fx: number, fy: number, fx0: number, fy0: number;
    var rx: number, ry: number, rx1: number, ry1: number;
    var p1: number, p2: number, p3: number, p4: number;
    var w1: number, w2: number, w3: number, w4: number;

    for (var ty: number = 0; ty < to.height; ty++) {
      for (var tx: number = 0; tx < to.width; tx++) {
        fx = tx * sw;
        fy = ty * sh;

        fx0 = Math.floor(fx);
        fy0 = Math.floor(fy);

        p1 = fx0 * from.channels + fy0 * w;
        p2 = p1 + ((fx0 < lw) ? from.channels : 0);
        p3 = p1 + ((fy0 < lh) ? w : 0);
        p4 = p3 + ((fx0 < lw) ? from.channels : 0);

        rx = fx - fx0;
        ry = fy - fy0;
        rx1 = 1.0 - rx;
        ry1 = 1.0 - ry;

        w1 = rx1 * ry1;
        w2 = rx * ry1;
        w3 = rx1 * ry;
        w4 = rx * ry;

        for (var c: number = 0; c < from.channels; c++) {
          to.data[(tx + ty * to.width) * from.channels + c] =
            w1 * from.data[p1 + c] +
            w2 * from.data[p2 + c] +
            w3 * from.data[p3 + c] +
            w4 * from.data[p4 + c];
        }
      }
    }
  }
}

export default ImageResizeLinear;