import {ifUndefinedGetDefault} from "src/useful-factory/utils";
import {CompSpec, _CompSpecSolid, DEFAULT_COMP_SPECS, DEFAULT_COMP_SPEC} from "./comp-spec";
import {Spec} from "./simple-vega-spec";
import {correctConsistency} from "src/components/visualizations/consistency";

/**
 * This function modify spec to alleviate minor issues.
 * For example, when only Layout type is specified, this modifies C.layout with full default settings
 * @param C
 */
export function correctCompSpec(A: Spec, B: Spec, C: CompSpec) {
  let solidC = {...C}
  /* fill empty parts */
  if (solidC.name === undefined) solidC.name = DEFAULT_COMP_SPEC.name
  if (solidC.consistency === undefined) solidC.consistency = DEFAULT_COMP_SPEC.consistency
  if (solidC.overlap_reduction === undefined) solidC.overlap_reduction = DEFAULT_COMP_SPEC.overlap_reduction
  if (solidC.reference === undefined) solidC.reference = DEFAULT_COMP_SPEC.reference

  /* layout */
  if (typeof solidC.layout !== "object") {
    solidC = {...solidC, layout: {...DEFAULT_COMP_SPECS[solidC.layout.toString()].layout, type: solidC.layout}};
  }
  else {
    // when undefined, put default value
    // TODO: have these as keys? ["mirrored", "arrangement"]
    solidC.layout.mirrored = ifUndefinedGetDefault(solidC.layout.mirrored, DEFAULT_COMP_SPECS[solidC.layout.type].layout["mirrored"])
    solidC.layout.arrangement = ifUndefinedGetDefault(solidC.layout.arrangement, DEFAULT_COMP_SPECS[solidC.layout.type].layout["arrangement"])
  }

  /* consistency */
  solidC = {...solidC, consistency: correctConsistency(A, B, C)};

  return solidC as _CompSpecSolid  // TODO: is this safe?
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