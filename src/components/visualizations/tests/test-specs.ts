import {Spec} from "src/models/simple-vega-spec";
import {CompSpec} from "src/models/comp-spec";
import {deepObjectValue, correctCompSpec} from "src/models/comp-spec-manager";
import {DATASET_MOVIES} from "src/datasets/movies";
import {getChartType} from "src/models/chart-types";

export function getCompTitle(A: Spec, B: Spec, C: CompSpec) {
  const mC = correctCompSpec({...A}, {...B}, {...C}).solidC;
  return getSimpleCompTitle(A, B, C) + " " +
    "(" + deepObjectValue(mC.layout).toString().slice(0, 3).toUpperCase() + "|" + mC.layout.unit.slice(0, 3).toUpperCase() + "|" +
    mC.layout.arrangement.toString().slice(0, 1).toUpperCase() + "|" + (mC.layout.mirrored ? "M|" : "F|") +
    "|Consistency{x:" + mC.consistency.x_axis + ",y:" + mC.consistency.y_axis + ",c:" + mC.consistency.color +
    "}) " + mC.description
}
export function getSimpleCompTitle(A: Spec, B: Spec, C: CompSpec) {
  return getChartType(A) + " x " + getChartType(B);
}

export function getExamples() {
  let examples = getExampleSpec()
    // .map(d => ({...d, C: correctCompSpec(d.C)}))
    /// filter for debugging
    // .filter(d => d.C.explicit_encoding && d.C.explicit_encoding.line_connection)
    // .filter(d => d.C.overlap_reduction != null)
    // .filter(d => correctCompSpec(d.A, d.B, {...d.C}).solidC.layout.type === "juxtaposition")
    // correctCompSpec(d.A, d.B, {...d.C}).layout.unit === "chart" &&
    // correctCompSpec(d.A, d.B, {...d.C}).layout.arrangement !== "animated")
    // .filter(d => d.A.mark === "rect" || d.B.mark === "rect")
    // .filter(d => d.A.mark === "point" || d.B.mark === "point")
    // .filter(d => d.C.name.includes("element-wise juxtaposition test"))
    // .filter(d => d.C.description === "#1" || d.C.description === "#2")
    // .filter(d => d.C.description === "#55" || d.C.description === "#56" || d.C.description === "#57" || d.C.description === "#58")
    // .filter(d => isNestingLayout(correctCompSpec(d.C)))
    ;

  return examples;
  // .sort((a, b) => a.C.layout.mirrored > b.C.layout.mirrored ? -1 : 1)
  // .sort((a, b) => (a.A.mark + a.B.mark) > (b.A.mark + b.B.mark) ? -1 : 1)
  // .sort((a, b) => a.C.layout.unit > b.C.layout.unit ? -1 : 1)
  // .sort((a, b) => a.C.layout.arrangement > b.C.layout.arrangement ? -1 : 1)
  // .sort((a, b) => a.C.layout.type > b.C.layout.type ? -1 : 1)
  // .sort((a, b) => a.C.name > b.C.name ? 1 : -1);

}
export function getExampleSpec(): {A: Spec, B: Spec, C: CompSpec}[] {
  const values = DATASET_MOVIES.rawData.splice(0, 500)
  return [
    {
      C: {
        description: "#1",
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independent"
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
        description: "#2",
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independent"
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
        description: "#3",
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independent"
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
        description: "#4",
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independent"
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
        description: "#5",
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
        description: "#6",
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independent"
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
        description: "#7 resize test",
        layout: {type: "superimposition", unit: "chart"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared"
        },
        overlap_reduction: {
          resize: true
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
        description: "#8",
        layout: {type: "juxtaposition", unit: "element", arrangement: "adjacent"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared"
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
        description: "#9",
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
        description: "#10",
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
        name: "#11 visual linking test",
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
        description: "#12 visual linking test",
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent"},
        consistency: {
          color: {
            type: "shared",
            secondary_target: {element: "mark", property: "stroke"}
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
        description: "#13",
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
        description: "#14 texture test",
        layout: {type: "superimposition", unit: "chart"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared", texture: "distinct"//, stroke: "distinct"
        },
        overlap_reduction: {
          opacity: true
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "Source", type: "nominal"}
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
        description: "#15",
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
        description: "#16",
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
        description: "#17",
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
        description: "#18",
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
        description: "#19",
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
        description: "#20",
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
        description: "#21",
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
        description: "#22",
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
        description: "#23",
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
        description: "#24",
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
        description: "#25",
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
        description: "#26",
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
        description: "#27",
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
        description: "#28",
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
        description: "#29",
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: true, color: "independent"
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
        description: "#30",
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: true, color: "independent"
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
        description: "#31",
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independent"
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
        description: "#32",
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independent"
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
        description: "#33",
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independent"
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
        description: "#34",
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independent"
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
        description: "#35",
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independent"
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
        description: "#36",
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independent"
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
        description: "#37",
        layout: {type: "superimposition", unit: "chart"},
        consistency: {x_axis: true, y_axis: true, color: "independent"},
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
        description: "#38",
        layout: {type: "superimposition", unit: "chart"},
        consistency: {x_axis: false, y_axis: true, color: "independent"},
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
        description: "#39",
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independent"
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
    },
    {
      C: {
        description: "#40 distinct legend test",
        layout: {type: "juxtaposition", unit: "element", arrangement: "adjacent"},
        consistency: {
          x_axis: true, y_axis: true, color: "distinct", texture: "distinct", stroke: "distinct"
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
        description: "#41 texture test 2",
        layout: {type: "superimposition", unit: "chart"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared", texture: "distinct", stroke: "distinct"
        },
        overlap_reduction: {
          opacity: true,
          jitter_y: true
        }
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "Source", type: "nominal"}
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
        description: "#42 scatterplot texture test",
        layout: {type: "superimposition", unit: "chart"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared", stroke: "distinct", texture: "distinct"
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
    // {
    //   C: {
    //     name: "#43 heatmap texture test",
    //     layout: {type: "superimposition", unit: "chart", arrangement: "adjacent"},
    //     consistency: {
    //       x_axis: true, y_axis: true, color: "shared", texture: "distinct"
    //     },
    //     overlap_reduction: {
    //       resize: true
    //     }
    //   },
    //   // https://vega.github.io/vega-lite/examples/
    //   A: {
    //     data: {values},
    //     mark: "rect",
    //     encoding: {
    //       x: {field: "Source", type: "nominal"},
    //       y: {field: "Creative_Type", type: "nominal"},
    //       color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"}
    //     }
    //   },
    //   B: {
    //     data: {values},
    //     mark: "rect",
    //     encoding: {
    //       x: {field: "Source", type: "nominal"},
    //       y: {field: "Creative_Type", type: "nominal"},
    //       color: {field: "US_Gross", type: "quantitative", aggregate: "mean"}
    //     }
    //   },
    // },
    // {
    //   C: {
    //     name: "#44 element-wise juxtaposition test",
    //     layout: {type: "juxtaposition", unit: "element"},
    //     consistency: {
    //       x_axis: false, y_axis: false, color: "independent"
    //     }
    //   },
    //   // https://vega.github.io/vega-lite/examples/
    //   A: {
    //     data: {values},
    //     mark: "rect",
    //     encoding: {
    //       x: {field: "Source", type: "nominal"},
    //       y: {field: "Creative_Type", type: "nominal"},
    //       color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"}
    //     }
    //   },
    //   B: {
    //     data: {values},
    //     mark: "bar",
    //     encoding: {
    //       x: {field: "MPAA_Rating", type: "nominal"},
    //       y: {field: "Production_Budget", type: "quantitative", aggregate: "max"},
    //       color: {field: "MPAA_Rating", type: "nominal"}
    //     }
    //   },
    // },
    {
      C: {
        description: "#45",
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent", mirrored: true},
        consistency: {x_axis: false, y_axis: true, color: "shared"},
        explicit_encoding: {line_connection: {type: true}}
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
        description: "#46",
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared", stroke: "distinct"
        },
        explicit_encoding: {line_connection: {type: true}}
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
        description: "#47",
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent", mirrored: true},
        consistency: {
          x_axis: false, y_axis: true, color: "shared"
        },
        explicit_encoding: {line_connection: {type: true}}
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
        description: "#48",
        layout: {type: "juxtaposition", unit: "chart", mirrored: false, arrangement: "adjacent"},
        consistency: {
          x_axis: false, y_axis: true, color: "distinct"
        },
        explicit_encoding: {line_connection: {type: true}}
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          x: {field: "Source", type: "nominal"},
          color: {field: "Source", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          x: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        description: "#49",
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent", mirrored: false},
        consistency: {x_axis: false, y_axis: true, color: "shared"},
        explicit_encoding: {line_connection: {type: true}}
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
        description: "#50 cross-element consistency",
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent"},
        consistency: {
          color: {
            type: "shared",
            secondary_target: {element: "axis", property: "background"}
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
        description: "#51 width test",
        style: {width: 500},
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independent"
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
        description: "#52",
        style: {height: 300},
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independent"
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
        description: "#53",
        style: {height: 400},
        layout: {type: "juxtaposition", unit: "element", arrangement: "adjacent"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared"
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
        description: "#54",
        layout: {type: "juxtaposition", unit: "element", arrangement: "diagonal"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared"
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
        description: "#55",
        layout: {type: "explicit-encoding", unit: "element"}
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
          color: {field: "Production_Budget", type: "quantitative", aggregate: "mean"}
        }
      },
    },
    {
      C: {
        description: "#56",
        layout: {type: "explicit-encoding", unit: "element"},
        style: {height: 380}
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"},
          y: {field: "Major_Genre", type: "nominal"},
          color: {field: "Major_Genre", type: "nominal"}
        }
      },
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Production_Budget", type: "quantitative", aggregate: "mean"},
          y: {field: "Major_Genre", type: "nominal"}
        }
      }
    },
    {
      C: {
        description: "#57",
        layout: {type: "explicit-encoding", unit: "element"}
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "Major_Genre", type: "nominal"},
        },
        transform: [{filter: {field: "Distributor", oneOf: "Walt Disney Pictures"}}]
      },
      B: {
        data: {values},
        mark: "point",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
          color: {field: "Major_Genre", type: "nominal"}
        },
        transform: [{filter: {field: "Distributor", oneOf: "Universal"}}]
      }
    }
  ]
}