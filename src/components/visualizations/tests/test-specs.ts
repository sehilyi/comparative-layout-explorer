import {Spec} from "src/models/simple-vega-spec";
import {CompSpec, DEFAULT_COMP_SPEC} from "src/models/comp-spec";
import {DATASET_MOVIES} from "src/datasets/movies";

export function getCompTitle(A: Spec, B: Spec, C: CompSpec) {
  return (A.mark === "point" ? "scatterplot" : A.mark + "chart") + " x " + (B.mark === "point" ? "scatterplot" : B.mark + "chart") + " " +
    C.layout + "(" + C.unit + "," + C.direction + ") "
}

export function getExamples() {
  return getExampleSpec().sort((a, b) => a.C.layout < b.C.layout ? -1 : 1)
}
export function getExampleSpec(): {A: Spec, B: Spec, C: CompSpec}[] {
  return [
    {
      C: {
        ...DEFAULT_COMP_SPEC,
        layout: "juxtaposition",
        direction: "horizontal",
        unit: "element",
        mirrored: true,
        consistency: {
          x_axis: true, y_axis: true, color: true
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values: DATASET_MOVIES.rawData
        },
        mark: "bar",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "Source", type: "nominal"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {
          values: DATASET_MOVIES.rawData
        },
        mark: "bar",
        encoding: {
          x: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "Source", type: "nominal"},
          color: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        ...DEFAULT_COMP_SPEC,
        layout: "juxtaposition",
        direction: "horizontal",
        unit: "chart",
        mirrored: false,
        consistency: {
          x_axis: false, y_axis: true, color: true
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values: DATASET_MOVIES.rawData
        },
        mark: "bar",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "IMDB_Rating", type: "quantitative"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {
          values: DATASET_MOVIES.rawData
        },
        mark: "point",
        encoding: {
          x: {field: "US_Gross", type: "quantitative"},
          y: {field: "IMDB_Rating", type: "quantitative"}
        }
      }
    },
    {
      C: {
        ...DEFAULT_COMP_SPEC,
        layout: "juxtaposition",
        direction: "horizontal",
        unit: "chart",
        mirrored: true,
        consistency: {
          x_axis: true, y_axis: true, color: true
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values: DATASET_MOVIES.rawData
        },
        mark: "bar",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "Source", type: "nominal"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {
          values: DATASET_MOVIES.rawData
        },
        mark: "bar",
        encoding: {
          x: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "Source", type: "nominal"},
          color: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        ...DEFAULT_COMP_SPEC,
        layout: "superimposition",
        unit: "chart",
        consistency: {
          x_axis: true, y_axis: true, color: true
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values: DATASET_MOVIES.rawData
        },
        mark: "point",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative"},
          y: {field: "US_Gross", type: "quantitative"}
        }
      },
      B: {
        data: {
          values: DATASET_MOVIES.rawData
        },
        mark: "point",
        encoding: {
          x: {field: "US_Gross", type: "quantitative"},
          y: {field: "IMDB_Rating", type: "quantitative"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      }
    },
    /*
    {
      C: {
        ...DEFAULT_COMP_SPEC,
        title: "bar nes sca",
        layout: "superimposition",
        unit: "element",
        consistency: {
          x_axis: true, y_axis: true, color: true
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values: DATASET_MOVIES.rawData
        },
        mark: "bar",
        encoding: {
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          x: {field: "Source", type: "nominal"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {
          values: DATASET_MOVIES.rawData
        },
        mark: "point",
        encoding: {
          x: {field: "US_Gross", type: "quantitative"},
          y: {field: "IMDB_Rating", type: "quantitative"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      }
    },
    */
    {
      C: {
        ...DEFAULT_COMP_SPEC,
        layout: "superimposition",
        unit: "chart",
        consistency: {
          x_axis: false, y_axis: false, color: false
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values: DATASET_MOVIES.rawData
        },
        mark: "bar",
        encoding: {
          x: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "Source", type: "nominal"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {
          values: DATASET_MOVIES.rawData
        },
        mark: "point",
        encoding: {
          x: {field: "US_Gross", type: "quantitative"},
          y: {field: "IMDB_Rating", type: "quantitative"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      }
    }
  ]
}