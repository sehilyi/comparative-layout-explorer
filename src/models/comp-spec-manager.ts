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
  let _C = {...C}
  /* fill empty parts */
  if (_C.name === undefined) _C.name = DEFAULT_COMP_SPEC.name;
  if (_C.consistency === undefined) _C.consistency = DEFAULT_COMP_SPEC.consistency;
  if (_C.overlap_reduction === undefined) _C.overlap_reduction = DEFAULT_COMP_SPEC.overlap_reduction;
  if (_C.reference === undefined) _C.reference = DEFAULT_COMP_SPEC.reference;

  /* layout */
  if (typeof _C.layout !== "object") {
    _C = {..._C, layout: {...DEFAULT_COMP_SPECS[_C.layout.toString()].layout, type: _C.layout}};
  }
  else {
    // when undefined, put default value
    // TODO: have these as keys? ["mirrored", "arrangement"]
    _C.layout.mirrored = ifUndefinedGetDefault(_C.layout.mirrored, DEFAULT_COMP_SPECS[_C.layout.type].layout["mirrored"])
    _C.layout.arrangement = ifUndefinedGetDefault(_C.layout.arrangement, DEFAULT_COMP_SPECS[_C.layout.type].layout["arrangement"])
  }

  /* consistency */
  let solidC = {..._C, consistency: correctConsistency(A, B, C)} as _CompSpecSolid;

  /* explicit encoding */
  // for superimposition and animated, do not use line connections
  if (solidC.explicit_encoding && solidC.explicit_encoding.line_connection) {
    if (solidC.layout.arrangement === "animated" || solidC.layout.type === "superimposition") {
      solidC.explicit_encoding.line_connection = {...solidC.explicit_encoding.line_connection, type: false};
    }
  }

  /* change referece */
  const _A = solidC.reference === "A" ? {...A} : {...B};
  const _B = solidC.reference === "A" ? {...B} : {...A};

  return {_A, _B, solidC};  // TODO: is this safe?
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