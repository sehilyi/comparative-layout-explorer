import {ifUndefinedGetDefault} from "src/useful-factory/utils";
import {CompSpec, DEFAULT_LAYOUT, _CompSpecSolid} from "./comp-spec";

/**
 * This function modify spec to alleviate minor issues.
 * For example, when only Layout type is specified, this modifies C.layout with full default settings
 * @param spec
 */
export function correctSpec(spec: CompSpec) {
  let mSpec = {...spec}
  if (typeof spec.layout !== "object") {
    mSpec = {...mSpec, layout: {...DEFAULT_LAYOUT, type: spec.layout}}
  }
  return mSpec as _CompSpecSolid  // TODO: is this safe?
}

/**
 * Get value of spec
 * This is useful when dealing with possibly two level specs
 * For example, typeof Layout is String | object
 * @param spec
 * @param key
 */
export function deepValue(spec: string | object, key?: string) {
  key = ifUndefinedGetDefault(key, "type") as string
  if (typeof spec === "object") return spec[key]
  else return spec
}