import {Spec} from "src/models/simple-vega-spec";
import {CompSpec} from "src/models/comp-spec";
import {deepObjectValue, correctCompSpec} from "src/models/comp-spec-manager";
import {getChartType} from "../constraints";
import {DATASET_MOVIES} from "src/datasets/movies";

export function getCompTitle(A: Spec, B: Spec, C: CompSpec) {
  const mC = correctCompSpec({...C})
  return getSimpleCompTitle(A, B, C) + " " +
    "(" + deepObjectValue(mC.layout).toString().slice(0, 3).toUpperCase() + "|" + mC.layout.unit.slice(0, 3).toUpperCase() + "|" +
    mC.layout.arrangement.toString().slice(0, 1).toUpperCase() + "|" + (mC.layout.mirrored ? "M|" : "F|") +
    "|Consistency{x:" + mC.consistency.x_axis + ",y:" + mC.consistency.y_axis + ",c:" + mC.consistency.color +
    "}) " + mC.name
}
export function getSimpleCompTitle(A: Spec, B: Spec, C: CompSpec) {
  return getChartType(A) + " x " + getChartType(B)
}

export function getExamples() {
  let examples = getExampleSpec()

  // debugging
  // .filter(d => correctCompSpec({...d.C}).layout.type === "superimposition")
  // .filter(d => d.A.mark === "rect" || d.B.mark === "rect")  // for debugging
  // .filter(d => d.A.mark === "point" || d.B.mark === "point")
  // .filter(d => d.C.name === "visual linking test")

  return examples
    .sort((a, b) => correctCompSpec(a.C).layout.mirrored > correctCompSpec(b.C).layout.mirrored ? -1 : 1)
    .sort((a, b) => (a.A.mark + a.B.mark) > (b.A.mark + b.B.mark) ? -1 : 1)
    .sort((a, b) => correctCompSpec(a.C).layout.unit > correctCompSpec(b.C).layout.unit ? -1 : 1)
    .sort((a, b) => correctCompSpec(a.C).layout.arrangement > correctCompSpec(b.C).layout.arrangement ? -1 : 1)
    .sort((a, b) => correctCompSpec(a.C).layout.type > correctCompSpec(b.C).layout.type ? -1 : 1)
    .sort((a, b) => correctCompSpec(a.C).name > correctCompSpec(b.C).name ? 1 : -1)

}
export function getExampleSpec(): {A: Spec, B: Spec, C: CompSpec}[] {
  const values = DATASET_MOVIES.rawData.splice(0, 500)
  return [
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independant"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "MPAA_Rating", type: "nominal"},
          y: {field: "Production_Budget", type: "quantitative", aggregate: "max"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Major_Genre", type: "nominal"},
          color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"}
        }
      }
    },
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independant"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "Production_Budget", type: "quantitative", aggregate: "max"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "Creative_Type", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "MPAA_Rating", type: "nominal"},
          color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"}
        }
      }
    },
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independant"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "MPAA_Rating", type: "nominal"},
          y: {field: "Production_Budget", type: "quantitative", aggregate: "max"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      },
    },
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independant"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "Production_Budget", type: "quantitative"},
          y: {field: "US_Gross", type: "quantitative"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      },
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "element", arrangement: "animated"},
        consistency: {
          x_axis: false, y_axis: false, color: "shared"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {values},
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "US_Gross", type: "quantitative", aggregate: "mean"}
        }
      },
    },
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independant"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "min"}
        }
      },
      B: {
        data: {values},
        mark: "rect",
        encoding: {
          x: {field: "Creative_Type", type: "nominal"},
          y: {field: "Major_Genre", type: "nominal"},
          color: {field: "IMDB_Rating", type: "quantitative", aggregate: "max"}
        }
      },
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "element", arrangement: "adjacent"},
        consistency: {
          x_axis: false, y_axis: true, color: "shared"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {values},
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "US_Gross", type: "quantitative", aggregate: "mean"}
        }
      },
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent", mirrored: true},
        consistency: {x_axis: false, y_axis: true, color: "shared"}
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {values},
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "US_Gross", type: "quantitative", aggregate: "mean"}
        }
      },
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent"},
        consistency: {x_axis: true, y_axis: true, color: "distinct"}
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {values},
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "US_Gross", type: "quantitative", aggregate: "mean"}
        }
      },
    },
    /*
    {
      C: {
        name: "visual linking test",
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent"},
        consistency: {
          color: {
            type: "shared",
            target: {secondary: {element: "axis-label", property: "foreground"}}
          },
          x_axis: false, y_axis: false
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "IMDB_Rating", type: "quantitative", aggregate: "mean"}
        }
      }
    },*/
    {
      C: {
        name: "visual linking test",
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent"},
        consistency: {
          color: {
            type: "shared",
            target: {secondary: {element: "mark", property: "stroke"}}
          },
          x_axis: false, y_axis: false
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "IMDB_Rating", type: "quantitative", aggregate: "mean"}
        }
      }
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "chart", arrangement: "stacked"},
        consistency: {
          x_axis: true, y_axis: false, color: "distinct"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "IMDB_Rating", type: "quantitative", aggregate: "mean"}
        }
      }
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "element", arrangement: "adjacent"},
        consistency: {
          x_axis: true, y_axis: true, color: "distinct"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "Source", type: "nominal"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {values},
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
        layout: {type: "juxtaposition", unit: "element", arrangement: "animated"},
        consistency: {
          x_axis: false, y_axis: false, color: "shared"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Creative_Type", type: "nominal"},
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "Creative_Type", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "element", arrangement: "animated"},
        consistency: {
          x_axis: false, y_axis: false, color: "shared"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "chart", arrangement: "animated"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
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
          values
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
        layout: {type: "juxtaposition", unit: "element", arrangement: "stacked", mirrored: false},
        consistency: {
          x_axis: true, y_axis: true, color: "distinct"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
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
          values
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
        layout: {type: "juxtaposition", unit: "chart", mirrored: false, arrangement: "stacked"},
        consistency: {
          x_axis: false, y_axis: true, color: "distinct"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "Source", type: "nominal"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "chart", mirrored: false, arrangement: "stacked"},
        consistency: {
          x_axis: true, y_axis: true, color: "distinct"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "Source", type: "nominal"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {values},
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
        layout: {type: "juxtaposition", unit: "chart", mirrored: false, arrangement: "adjacent"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "Source", type: "nominal"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {values},
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
        layout: {type: "juxtaposition", unit: "chart", mirrored: true, arrangement: "adjacent"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "Source", type: "nominal"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {values},
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
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent", mirrored: true},
        consistency: {
          x_axis: false, y_axis: true, color: "shared"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative"},
          y: {field: "IMDB_Rating", type: "quantitative"},
          color: {field: "Major_Genre", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "US_Gross", type: "quantitative"},
          y: {field: "IMDB_Rating", type: "quantitative"},
          color: {field: "Major_Genre", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "chart", arrangement: "animated"},
        consistency: {
          x_axis: false, y_axis: true, color: "shared"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative"},
          y: {field: "IMDB_Rating", type: "quantitative"},
          color: {field: "Major_Genre", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "US_Gross", type: "quantitative"},
          y: {field: "IMDB_Rating", type: "quantitative"},
          color: {field: "Major_Genre", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "element", arrangement: "animated"},
        consistency: {
          x_axis: false, y_axis: true, color: "shared"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative"},
          y: {field: "IMDB_Rating", type: "quantitative"},
          color: {field: "Major_Genre", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "US_Gross", type: "quantitative"},
          y: {field: "IMDB_Rating", type: "quantitative"},
          color: {field: "Major_Genre", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "element", arrangement: "animated"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared", stroke: "distinct"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "Production_Budget", type: "quantitative", aggregate: "max"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "superimposition", unit: "chart"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared", stroke: "distinct"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "Production_Budget", type: "quantitative", aggregate: "max"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: true, color: "independant"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: true, color: "independant"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative"},
          y: {field: "US_Gross", type: "quantitative"}
        }
      }
    },
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independant"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "MPAA_Rating", type: "nominal"},
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"}
        }
      },
      B: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "US_Gross", type: "quantitative"},
          y: {field: "IMDB_Rating", type: "quantitative"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independant"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          y: {field: "MPAA_Rating", type: "nominal"},
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"}
        }
      },
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          y: {field: "Source", type: "nominal"},
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independant"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "MPAA_Rating", type: "nominal"},
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"}
        }
      },
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "Source", type: "nominal"},
          color: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independant"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "MPAA_Rating", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independant"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "MPAA_Rating", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "US_Gross", type: "quantitative"},
          y: {field: "Worldwide_Gross", type: "quantitative"},
          color: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independant"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "MPAA_Rating", type: "nominal"},
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Major_Genre", type: "nominal"},
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "Major_Genre", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "superimposition", unit: "chart"},
        consistency: {x_axis: true, y_axis: true, color: "independant"},
        overlap_reduction: {
          jitter_x: true,
          opacity: true
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          y: {field: "US_Gross", type: "quantitative", aggregate: "mean"},
          x: {field: "Source", type: "nominal"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"},
          x: {field: "Source", type: "nominal"},
          color: {field: "Source", type: "nominal"}
        }
      },
    },
    {
      C: {
        layout: {type: "superimposition", unit: "chart"},
        consistency: {x_axis: false, y_axis: true, color: "independant"},
        overlap_reduction: {
          opacity: true
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          y: {field: "US_Gross", type: "quantitative", aggregate: "mean"},
          x: {field: "Source", type: "nominal"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "point",
        encoding: {
          y: {field: "US_Gross", type: "quantitative"},
          x: {field: "IMDB_Rating", type: "quantitative"},
          color: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independant"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "IMDB_Rating", type: "quantitative", aggregate: "mean"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          y: {field: "MPAA_Rating", type: "nominal"},
          x: {field: "US_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      }
    }
  ]
}