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
    // .filter(d => d.A.mark === "rect" || d.B.mark === "rect")  // for debugging
    .filter(d => d.C.name === "test 1")
  // return examples
  return examples.sort((a, b) =>
    // sort by chart types, layout, and then unit
    (a.A.mark + a.B.mark) > (b.A.mark + b.B.mark) ? -1 : (a.A.mark + a.B.mark) < (b.A.mark + b.A.mark) ? 1 : deepObjectValue(a.C.layout) < deepObjectValue(b.C.layout) ? -1 : deepObjectValue(a.C.layout) > deepObjectValue(b.C.layout) ? 1 : -1
  )
}
export function getExampleSpec(): {A: Spec, B: Spec, C: CompSpec}[] {
  const values = DATASET_MOVIES.rawData.splice(0, 500)
  return [
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "unconnected"
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
          x: {field: "Production_Budget", type: "quantitative", aggregate: "max"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      },
    },
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "unconnected"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "bar",
        encoding: {
          x: {field: "MPAA_Rating", type: "nominal"},
          y: {field: "Production_Budget", type: "quantitative", aggregate: "max"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      },
      B: {
        data: {
          values
        },
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
          x_axis: false, y_axis: false, color: "unconnected"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "point",
        encoding: {
          x: {field: "Production_Budget", type: "quantitative", aggregate: "max"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "Creative_Type", type: "nominal"}
        }
      },
      B: {
        data: {
          values
        },
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
          x_axis: false, y_axis: false, color: "unconnected"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {
          values
        },
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
          x_axis: false, y_axis: false, color: "unconnected"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {
          values
        },
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
        layout: {type: "juxtaposition", unit: "chart", arrangement: "animated"},
        consistency: {
          x_axis: false, y_axis: true, color: "same"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Major_Genre", type: "nominal"},
          color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {
          values
        },
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "IMDB_Rating", type: "quantitative", aggregate: "max"}
        }
      },
    },
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "unconnected"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "min"}
        }
      },
      B: {
        data: {
          values
        },
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
        layout: {type: "juxtaposition", unit: "element", arrangement: "stacked"},
        consistency: {
          x_axis: false, y_axis: true, color: "different"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {
          values
        },
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
        layout: {type: "juxtaposition", unit: "element", arrangement: "adjacent"},
        consistency: {
          x_axis: false, y_axis: true, color: "different"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {
          values
        },
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
        consistency: {x_axis: false, y_axis: true, color: "same"}
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {
          values
        },
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
        consistency: {x_axis: false, y_axis: true, color: "different"}
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "rect",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Creative_Type", type: "nominal"},
          color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {
          values
        },
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
        layout: {type: "juxtaposition", unit: "chart", arrangement: "stacked"},
        consistency: {
          x_axis: true, y_axis: false, color: "different"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {
          values
        },
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
          x_axis: true, y_axis: true, color: "different"
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
        name: "test 1",
        layout: {type: "juxtaposition", unit: "element", arrangement: "animated"},
        consistency: {
          x_axis: false, y_axis: false, color: "same"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "bar",
        encoding: {
          x: {field: "Creative_Type", type: "nominal"},
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "Creative_Type", type: "nominal"}
        }
      },
      B: {
        data: {
          values
        },
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
        name: "test",
        layout: {type: "juxtaposition", unit: "element", arrangement: "animated"},
        consistency: {
          x_axis: false, y_axis: false, color: "same"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {
          values
        },
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
        name: "test",
        layout: {type: "juxtaposition", unit: "element", arrangement: "animated"},
        consistency: {
          x_axis: false, y_axis: false, color: "same"
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
        layout: {type: "juxtaposition", unit: "chart", arrangement: "animated"},
        consistency: {
          x_axis: true, y_axis: true, color: "same"
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
          x_axis: true, y_axis: true, color: "different"
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
          x_axis: false, y_axis: true, color: "different"
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
          y: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "chart", mirrored: false, arrangement: "stacked"},
        consistency: {
          x_axis: false, y_axis: true, color: "different"
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
          y: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {
          values
        },
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
          x_axis: true, y_axis: true, color: "different"
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
        layout: {type: "juxtaposition", unit: "chart", mirrored: false, arrangement: "adjacent"},
        consistency: {
          x_axis: true, y_axis: true, color: "same"
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
        layout: {type: "juxtaposition", unit: "chart", mirrored: true, arrangement: "adjacent"},
        consistency: {
          x_axis: true, y_axis: true, color: "same"
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
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent", mirrored: false},
        consistency: {
          x_axis: false, y_axis: true, color: "same"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "point",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative"},
          y: {field: "IMDB_Rating", type: "quantitative"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {
          values
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
        layout: {type: "superimposition", unit: "chart"},
        consistency: {
          x_axis: true, y_axis: true, color: "same", stroke: "different"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "point",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      },
      B: {
        data: {
          values
        },
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
        layout: {type: "juxtaposition", unit: "chart"},
        consistency: {
          x_axis: false, y_axis: true, color: "different"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "point",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "Major_Genre", type: "nominal"}
        }
      },
      B: {
        data: {
          values
        },
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
          x_axis: false, y_axis: true, color: "different"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "point",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      },
      B: {
        data: {
          values
        },
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
          x_axis: false, y_axis: true, color: "different"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "point",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      },
      B: {
        data: {
          values
        },
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
          x_axis: false, y_axis: true, color: "different"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "point",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      },
      B: {
        data: {
          values
        },
        mark: "point",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "different"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "bar",
        encoding: {
          x: {field: "MPAA_Rating", type: "nominal"},
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"}
        }
      },
      B: {
        data: {
          values
        },
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
        layout: {type: "superimposition", unit: "element", arrangement: "adjacent", mirrored: false},
        consistency: {
          x_axis: false, y_axis: false, color: "different"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "bar",
        encoding: {
          y: {field: "MPAA_Rating", type: "nominal"},
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"}
        }
      },
      B: {
        data: {
          values
        },
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
          x_axis: false, y_axis: false, color: "different"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "bar",
        encoding: {
          x: {field: "MPAA_Rating", type: "nominal"},
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"}
        }
      },
      B: {
        data: {
          values
        },
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
        layout: {type: "superimposition", unit: "element", arrangement: "adjacent", mirrored: false},
        consistency: {
          x_axis: false, y_axis: false, color: "different"
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
          y: {field: "MPAA_Rating", type: "nominal"}
        }
      },
      B: {
        data: {
          values
        },
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
          x_axis: false, y_axis: false, color: "different"
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
          y: {field: "MPAA_Rating", type: "nominal"}
        }
      },
      B: {
        data: {
          values
        },
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
          x_axis: false, y_axis: false, color: "different"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "bar",
        encoding: {
          x: {field: "MPAA_Rating", type: "nominal"},
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      },
      B: {
        data: {
          values
        },
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
        consistency: {x_axis: false, y_axis: false, color: "different"},
        clutter: {
          opacity: true
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "bar",
        encoding: {
          x: {field: "US_Gross", type: "quantitative", aggregate: "mean"},
          y: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {
          values
        },
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
        layout: {type: "superimposition", unit: "chart"},
        consistency: {
          x_axis: false, y_axis: false, color: "different"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "point",
        encoding: {
          x: {field: "IMDB_Rating", type: "quantitative"},
          y: {field: "US_Gross", type: "quantitative"}
        }
      },
      B: {
        data: {
          values
        },
        mark: "bar",
        encoding: {
          x: {field: "MPAA_Rating", type: "nominal"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "MPAA_Rating", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "different"
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {
          values
        },
        mark: "point",
        encoding: {
          x: {field: "IMDB_Rating", type: "quantitative", aggregate: "mean"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {
          values
        },
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