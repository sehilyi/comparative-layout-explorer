import {ifUndefinedGetDefault} from "src/useful-factory/utils";
import {CompSpec, DEFAULT_LAYOUT_JUX, _CompSpecSolid, DEFAULT_COMP_SPECS, DEFAULT_COMP_SPEC} from "./comp-spec";
import {Spec} from "./simple-vega-spec";
import {correctConsistency} from "src/components/visualizations/consistency";

/**
 * This function modify spec to alleviate minor issues.
 * For example, when only Layout type is specified, this modifies C.layout with full default settings
 * @param C
 */
export function correctCompSpec(A: Spec, B: Spec, C: CompSpec) {
  let modifiedSpec = {...C}
  /* fill empty parts */
  if (modifiedSpec.name === undefined) modifiedSpec.name = DEFAULT_COMP_SPEC.name
  if (modifiedSpec.consistency === undefined) modifiedSpec.consistency = DEFAULT_COMP_SPEC.consistency
  if (modifiedSpec.overlap_reduction === undefined) modifiedSpec.overlap_reduction = DEFAULT_COMP_SPEC.overlap_reduction
  if (modifiedSpec.reference === undefined) modifiedSpec.reference = DEFAULT_COMP_SPEC.reference

  /* layout */
  if (typeof modifiedSpec.layout !== "object") {
    modifiedSpec = {...modifiedSpec, layout: {...DEFAULT_LAYOUT_JUX, type: modifiedSpec.layout}}
  }
  else {
    // when undefined, put default value
    // TODO: have these as keys? ["mirrored", "arrangement"]
    modifiedSpec.layout.mirrored = ifUndefinedGetDefault(modifiedSpec.layout.mirrored, DEFAULT_COMP_SPECS[modifiedSpec.layout.type].layout["mirrored"])
    modifiedSpec.layout.arrangement = ifUndefinedGetDefault(modifiedSpec.layout.arrangement, DEFAULT_COMP_SPECS[modifiedSpec.layout.type].layout["arrangement"])
  }

  /* consistency */
  modifiedSpec = {...modifiedSpec, consistency: correctConsistency(A, B, C)};

  return modifiedSpec as _CompSpecSolid  // TODO: is this safe?
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