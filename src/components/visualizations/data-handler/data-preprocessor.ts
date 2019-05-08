import {Spec} from "src/models/simple-vega-spec";
import {ID_COLUMN} from ".";

export function preprocessData(A: Spec, B: Spec) {
  let _A = addIDItemNaive({...A});
  let _B = addIDItemNaive({...B});
  // add more...
  return {_A, _B};
}

export function addIDItemNaive(spec: Spec) {
  let dataWithID = Object.assign([], spec.data.values);
  let cnt = 1;
  dataWithID.forEach(d => {
    d[ID_COLUMN] = cnt++;
  });
  return spec;
}