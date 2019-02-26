import {ifUndefinedGetDefault} from "src/useful-factory/utils";
import {CompSpec, DEFAULT_LAYOUT_JUX, _CompSpecSolid, DEFAULT_COMP_SPECS, DEFAULT_COMP_SPEC} from "./comp-spec";

/**
 * This function modify spec to alleviate minor issues.
 * For example, when only Layout type is specified, this modifies C.layout with full default settings
 * @param spec
 */
export function correctCompSpec(spec: CompSpec) {
  let mSpec = {...spec}
  /* fill empty parts */
  if (mSpec.name === undefined) mSpec.name = DEFAULT_COMP_SPEC.name
  if (mSpec.consistency === undefined) mSpec.consistency = DEFAULT_COMP_SPEC.consistency
  if (mSpec.clutter_reduction === undefined) mSpec.clutter_reduction = DEFAULT_COMP_SPEC.clutter_reduction
  if (mSpec.reference === undefined) mSpec.reference = DEFAULT_COMP_SPEC.reference

  /* layout */
  if (typeof mSpec.layout !== "object") {
    mSpec = {...mSpec, layout: {...DEFAULT_LAYOUT_JUX, type: mSpec.layout}}
  }
  else {
    // when undefined, put default value
    // TODO: have these as keys? ["mirrored", "arrangement"]
    mSpec.layout.mirrored = ifUndefinedGetDefault(mSpec.layout.mirrored, DEFAULT_COMP_SPECS[mSpec.layout.type].layout["mirrored"])
    mSpec.layout.arrangement = ifUndefinedGetDefault(mSpec.layout.arrangement, DEFAULT_COMP_SPECS[mSpec.layout.type].layout["arrangement"])
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
export function deepObjectValue(spec: string | object, key?: string) {
  key = ifUndefinedGetDefault(key, "type") as string
  if (typeof spec === "object") return spec[key]
  else return spec
}