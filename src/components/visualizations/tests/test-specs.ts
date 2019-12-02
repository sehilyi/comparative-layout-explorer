import {Spec} from "src/models/simple-vega-spec";
import {CompSpec, _CompSpecSolid} from "src/models/comp-spec";
import {deepObjectValue, correctCompSpec} from "src/models/comp-spec-manager";
import {DATASET_MOVIES} from "src/datasets/movies";
import {getChartType} from "src/models/chart-types";
import {DATASET_MTCAR_SYN} from "src/datasets/mtcar_syn";

export function getCompTitle(A: Spec, B: Spec, C: CompSpec) {
  const mC = correctCompSpec({...A}, {...B}, {...C}).solidC;
  return getSimpleCompTitle(A, B, C) + " " +
    "(" + deepObjectValue(mC.layout).toString().slice(0, 3).toUpperCase() + "|" + mC.layout.unit.slice(0, 3).toUpperCase() + "|" +
    mC.layout.arrangement.toString().slice(0, 1).toUpperCase() + "|" + (mC.layout.mirrored ? "M|" : "F|") +
    "|Consistency{x:" + mC.consistency.x_axis + ",y:" + mC.consistency.y_axis + ",c:" + mC.consistency.color +
    "}) " + mC.description;
}
export function getSimpleCompTitle(A: Spec, B: Spec, C: CompSpec) {
  return getChartType(A) + " x " + getChartType(B);
}

export function getExamples(): {A: Spec, B: Spec, C: _CompSpecSolid}[] {

  let examples = getExampleSpec()
    /// filters for debugging
    .filter(d => d.A.mark === d.B.mark)
    .filter(d => !d.C.explicit_encoding.line_connection)
    .filter(d => !(correctCompSpec(d.A, d.B, {...d.C}).solidC.layout.unit === "element" && correctCompSpec(d.A, d.B, {...d.C}).solidC.layout.type === "superimposition"))
  // .map(d => ({...d, C: correctCompSpec(d.C)}))
  // .filter(d => d.C.explicit_encoding && d.C.explicit_encoding.line_connection)
  // .filter(d => d.C.overlap_reduction != null)
  // .filter(d => correctCompSpec(d.A, d.B, {...d.C}).solidC.layout.arrangement !== "animated")
  // .filter(d => d.A.mark === "point" || d.B.mark === "point")
  // .filter(d => d.C.name.includes("item-wise juxtaposition test"))
  // .filter(d => d.C.description.includes("#46"))
  // .filter(d => isNestingLayout(correctCompSpec(d.C)))

  return JSON.parse(JSON.stringify(examples));
  // .sort((a, b) => a.C.layout.mirrored > b.C.layout.mirrored ? -1 : 1)
  // .sort((a, b) => (a.A.mark + a.B.mark) > (b.A.mark + b.B.mark) ? -1 : 1)
  // .sort((a, b) => a.C.layout.unit > b.C.layout.unit ? -1 : 1)
  // .sort((a, b) => a.C.layout.arrangement > b.C.layout.arrangement ? -1 : 1)
  // .sort((a, b) => a.C.layout.type > b.C.layout.type ? -1 : 1)
  // .sort((a, b) => a.C.name > b.C.name ? 1 : -1);

}
export function getExampleSpec(): {A: Spec, B: Spec, C: CompSpec}[] {
  const values = DATASET_MOVIES.rawData.slice(0, 400);//.filter(d => d["Source"] !== null)
  const mValues = DATASET_MTCAR_SYN.rawData;

  /// DEBUG
  // if (true) return [{
  //   C: {
  //     layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent"},
  //     consistency: {
  //       x_axis: true, y_axis: true, color: "shared"
  //     },
  //     overlap_reduction: {},
  //     explicit_encoding: {}
  //   },
  //   // https://vega.github.io/vega-lite/examples/
  //   B: {
  //     data: {values},
  //     mark: "bar",
  //     encoding: {
  //       x: {field: "Source", type: "nominal"},
  //       y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"},
  //       color: {field: "Source", type: "nominal"}
  //     }
  //   },
  //   A: {
  //     data: {values},
  //     mark: "bar",
  //     encoding: {
  //       x: {field: "Source", type: "nominal"},
  //       y: {field: "US_Gross", type: "quantitative", aggregate: "mean"},
  //       color: {field: "Source", type: "nominal"}
  //     }
  //   }
  // },];

  return [
    {
      C: {
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared"
        },
        overlap_reduction: {},
        explicit_encoding: {}
      },
      // https://vega.github.io/vega-lite/examples/
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "Source", type: "nominal"}
        }
      },
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "superimposition", unit: "chart"},
        consistency: {
          x_axis: true, y_axis: true, texture: "distinct"
        },
        overlap_reduction: {
          jitter_x: true, opacity: true,
        },
        explicit_encoding: {}
      },
      // https://vega.github.io/vega-lite/examples/
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "Source", type: "nominal"}
        }
      },
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "explicit-encoding"},
        consistency: {},
        overlap_reduction: {},
        explicit_encoding: {}
      },
      // https://vega.github.io/vega-lite/examples/
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "Source", type: "nominal"}
        }
      },
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "chart", arrangement: "stacked", mirrored: true},
        consistency: {
          x_axis: true, y_axis: true, color: "shared"
        },
        overlap_reduction: {},
        explicit_encoding: {}
      },
      // https://vega.github.io/vega-lite/examples/
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "Source", type: "nominal"}
        }
      },
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "element", arrangement: "animated"},
        consistency: {
          x_axis: true, y_axis: true, color: "distinct"
        },
        overlap_reduction: {},
        explicit_encoding: {
          // difference_mark: true
        }
      },
      // https://vega.github.io/vega-lite/examples/
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "Source", type: "nominal"}
        }
      },
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "element", arrangement: "adjacent"},
        consistency: {
          x_axis: true, y_axis: true, color: "distinct"
        },
        overlap_reduction: {},
        explicit_encoding: {
          difference_mark: true
        }
      },
      // https://vega.github.io/vega-lite/examples/
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "Source", type: "nominal"}
        }
      },
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "element", arrangement: "stacked"},
        consistency: {
          x_axis: true, y_axis: true, color: "distinct"
        },
        overlap_reduction: {},
        explicit_encoding: {}
      },
      // https://vega.github.io/vega-lite/examples/
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "Source", type: "nominal"}
        }
      },
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Source", type: "nominal"},
          y: {field: "US_Gross", type: "quantitative", aggregate: "mean"},
          color: {field: "Source", type: "nominal"}
        }
      }
    },
    {
      C: {
        layout: {type: "explicit-encoding"},
        consistency: {
          x_axis: true, y_axis: true, color: "independent"
        },
        overlap_reduction: {},
        explicit_encoding: {},
        // style: {width: 260}
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_1", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_2", type: "quantitative", aggregate: "mean"}
        }
      },
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "element", arrangement: "stacked"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared"
        },
        overlap_reduction: {},
        explicit_encoding: {},
        // style: {width: 260}
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_1", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_2", type: "quantitative", aggregate: "mean"}
        }
      },
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "element", arrangement: "animated"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared"
        },
        overlap_reduction: {},
        explicit_encoding: {},
        // style: {width: 260}
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_1", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_2", type: "quantitative", aggregate: "mean"}
        }
      },
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "element", arrangement: "diagonal"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared"
        },
        overlap_reduction: {},
        explicit_encoding: {},
        // style: {width: 260}
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_1", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_2", type: "quantitative", aggregate: "mean"}
        }
      },
    },
    {
      C: {
        layout: {type: "superimposition", unit: "chart"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared"
        },
        overlap_reduction: {
          resize: true
        },
        explicit_encoding: {},
        // style: {width: 260}
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_1", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_2", type: "quantitative", aggregate: "mean"}
        }
      },
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent", mirrored: true},
        consistency: {
          x_axis: true, y_axis: true, color: "shared"
        },
        overlap_reduction: {},
        explicit_encoding: {}
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_1", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_2", type: "quantitative", aggregate: "mean"}
        }
      },
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent"},
        consistency: {
          x_axis: true, y_axis: true, color: "distinct"
        },
        overlap_reduction: {},
        explicit_encoding: {}
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_1", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_2", type: "quantitative", aggregate: "mean"}
        }
      },
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared"
        },
        overlap_reduction: {},
        explicit_encoding: {}
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_1", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_2", type: "quantitative", aggregate: "mean"}
        }
      },
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "chart", arrangement: "diagonal", mirrored: true},
        consistency: {
          x_axis: true, y_axis: true, color: "shared"
        },
        overlap_reduction: {},
        explicit_encoding: {},
        // style: {width: 260}
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_1", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_2", type: "quantitative", aggregate: "mean"}
        }
      },
    },
    {
      C: {
        layout: {type: "juxtaposition", unit: "chart", arrangement: "diagonal", mirrored: true},
        consistency: {
          x_axis: true, y_axis: true, color: "distinct"
        },
        overlap_reduction: {},
        explicit_encoding: {},
        // style: {width: 260}
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_1", type: "quantitative", aggregate: "mean"}
        }
      },
      B: {
        data: {values: mValues},
        mark: "rect",
        encoding: {
          x: {field: "Variable_1", type: "nominal"},
          y: {field: "Variable_2", type: "nominal"},
          color: {field: "Correlation_2", type: "quantitative", aggregate: "mean"}
        }
      },
    },
    {
      C: {
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independent"
        },
        overlap_reduction: {},
        explicit_encoding: {},
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
          x_axis: false, y_axis: false, color: "independent"
        },
        overlap_reduction: {},
        explicit_encoding: {},
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
        layout: {type: "superimposition", unit: "element"},
        consistency: {
          x_axis: false, y_axis: false, color: "independent"
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
    // {
    //   C: {
    //     layout: {type: "juxtaposition", unit: "element", arrangement: "animated"},
    //     consistency: {
    //       x_axis: false, y_axis: false, color: "shared"
    //     },
    //     overlap_reduction: {},
    //     explicit_encoding: {}
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
    //     layout: {type: "superimposition", unit: "element"},
    //     consistency: {
    //       x_axis: false, y_axis: false, color: "independent"
    //     },
    //     overlap_reduction: {},
    //     explicit_encoding: {}
    //   },
    //   // https://vega.github.io/vega-lite/examples/
    //   A: {
    //     data: {values},
    //     mark: "rect",
    //     encoding: {
    //       x: {field: "Source", type: "nominal"},
    //       y: {field: "Creative_Type", type: "nominal"},
    //       color: {field: "Worldwide_Gross", type: "quantitative", aggregate: "min"}
    //     }
    //   },
    //   B: {
    //     data: {values},
    //     mark: "rect",
    //     encoding: {
    //       x: {field: "Creative_Type", type: "nominal"},
    //       y: {field: "Major_Genre", type: "nominal"},
    //       color: {field: "IMDB_Rating", type: "quantitative", aggregate: "max"}
    //     }
    //   },
    // },
    // {
    //   C: {
    //     layout: {type: "superimposition", unit: "chart"},
    //     consistency: {
    //       x_axis: true, y_axis: true, color: "shared"
    //     },
    //     overlap_reduction: {
    //       resize: true
    //     },
    //     explicit_encoding: {}
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
    //     layout: {type: "juxtaposition", unit: "element", arrangement: "adjacent"},
    //     consistency: {
    //       x_axis: true, y_axis: true, color: "shared"
    //     },
    //     overlap_reduction: {},
    //     explicit_encoding: {}
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
    //     layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent", mirrored: true},
    //     consistency: {x_axis: false, y_axis: true, color: "shared"},
    //     overlap_reduction: {},
    //     explicit_encoding: {}
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
    //     // : "",
    //     layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent"},
    //     consistency: {x_axis: true, y_axis: true, color: "distinct"},
    //     overlap_reduction: {},
    //     explicit_encoding: {}
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
    // {
    //   C: {
    //     layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent"},
    //     consistency: {
    //       color: {
    //         type: "shared",
    //         secondary_target: {element: "mark", property: "stroke"}
    //       },
    //       x_axis: false, y_axis: false
    //     }
    //   },
    //   // https://vega.github.io/vega-lite/examples/
    //   A: {
    //     data: {values},
    //     mark: "bar",
    //     encoding: {
    //       x: {field: "Source", type: "nominal"},
    //       y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
    //       color: {field: "Source", type: "nominal"}
    //     }
    //   },
    //   B: {
    //     data: {values},
    //     mark: "rect",
    //     encoding: {
    //       x: {field: "Source", type: "nominal"},
    //       y: {field: "Creative_Type", type: "nominal"},
    //       color: {field: "IMDB_Rating", type: "quantitative", aggregate: "mean"}
    //     }
    //   }
    // },
    {
      C: {
        layout: {type: "juxtaposition", unit: "chart", arrangement: "stacked"},
        consistency: {
          x_axis: true, y_axis: false, color: "distinct"
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
        layout: {type: "superimposition", unit: "chart"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared", texture: "distinct"//, stroke: "distinct"
        },
        overlap_reduction: {
          opacity: true
        },
        explicit_encoding: {}
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
        layout: {type: "juxtaposition", unit: "element", arrangement: "adjacent"},
        consistency: {
          x_axis: true, y_axis: true, color: "distinct"
        },
        overlap_reduction: {},
        explicit_encoding: {}
      },
      // https://vega.github.io/vega-lite/examples/
      A: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"},
          y: {field: "Major_Genre", type: "nominal"},
          color: {field: "Major_Genre", type: "nominal"}
        },
        transform: [{filter: {field: "Distributor", oneOf: "Walt Disney Pictures"}}]
      },
      B: {
        data: {values},
        mark: "bar",
        encoding: {
          x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "mean"},
          y: {field: "Major_Genre", type: "nominal"},
          color: {field: "Major_Genre", type: "nominal"}
        },
        transform: [{filter: {field: "Distributor", oneOf: "Universal"}}]
      }
    },
    // {
    //   C: {
    //     layout: {type: "juxtaposition", unit: "element", arrangement: "animated"},
    //     consistency: {
    //       x_axis: false, y_axis: false, color: "shared"
    //     },
    //     overlap_reduction: {},
    //     explicit_encoding: {}
    //   },
    //   // https://vega.github.io/vega-lite/examples/
    //   A: {
    //     data: {values},
    //     mark: "bar",
    //     encoding: {
    //       x: {field: "Creative_Type", type: "nominal"},
    //       y: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
    //       color: {field: "Creative_Type", type: "nominal"}
    //     }
    //   },
    //   B: {
    //     data: {values},
    //     mark: "bar",
    //     encoding: {
    //       x: {field: "Source", type: "nominal"},
    //       y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
    //       color: {field: "Source", type: "nominal"}
    //     }
    //   }
    // },
    {
      C: {
        layout: {type: "juxtaposition", unit: "element", arrangement: "animated"},
        consistency: {
          x_axis: false, y_axis: false, color: "shared"
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
    // {
    //   C: {
    //     layout: {type: "juxtaposition", unit: "element", arrangement: "animated"},
    //     consistency: {
    //       x_axis: true, y_axis: true, color: "shared"
    //     },
    //     overlap_reduction: {},
    //     explicit_encoding: {}
    //   },
    //   // https://vega.github.io/vega-lite/examples/
    //   A: {
    //     data: {
    //       values
    //     },
    //     mark: "bar",
    //     encoding: {
    //       x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
    //       y: {field: "Source", type: "nominal"},
    //       color: {field: "Source", type: "nominal"}
    //     }
    //   },
    //   B: {
    //     data: {
    //       values
    //     },
    //     mark: "bar",
    //     encoding: {
    //       x: {field: "US_Gross", type: "quantitative", aggregate: "max"},
    //       y: {field: "Source", type: "nominal"},
    //       color: {field: "Source", type: "nominal"}
    //     }
    //   }
    // },
    {
      C: {
        layout: {type: "juxtaposition", unit: "element", arrangement: "stacked", mirrored: false},
        consistency: {
          x_axis: true, y_axis: true, color: "distinct"
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
    // {
    //   C: {
    //     layout: {type: "juxtaposition", unit: "chart", mirrored: false, arrangement: "stacked"},
    //     consistency: {
    //       x_axis: true, y_axis: true, color: "distinct"
    //     },
    //     overlap_reduction: {},
    //     explicit_encoding: {}
    //   },
    //   // https://vega.github.io/vega-lite/examples/
    //   A: {
    //     data: {values},
    //     mark: "bar",
    //     encoding: {
    //       x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
    //       y: {field: "Source", type: "nominal"},
    //       color: {field: "Source", type: "nominal"}
    //     }
    //   },
    //   B: {
    //     data: {values},
    //     mark: "bar",
    //     encoding: {
    //       x: {field: "US_Gross", type: "quantitative", aggregate: "max"},
    //       y: {field: "Source", type: "nominal"},
    //       color: {field: "Source", type: "nominal"}
    //     }
    //   }
    // },
    {
      C: {
        layout: {type: "juxtaposition", unit: "chart", mirrored: false, arrangement: "adjacent"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared"
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
    // {
    //   C: {
    //     layout: {type: "juxtaposition", unit: "element", arrangement: "animated"},
    //     consistency: {
    //       x_axis: false, y_axis: true, color: "shared"
    //     },
    //     overlap_reduction: {},
    //     explicit_encoding: {}
    //   },
    //   // https://vega.github.io/vega-lite/examples/
    //   A: {
    //     data: {values},
    //     mark: "point",
    //     encoding: {
    //       x: {field: "Worldwide_Gross", type: "quantitative"},
    //       y: {field: "IMDB_Rating", type: "quantitative"},
    //       color: {field: "Major_Genre", type: "nominal"}
    //     }
    //   },
    //   B: {
    //     data: {values},
    //     mark: "point",
    //     encoding: {
    //       x: {field: "US_Gross", type: "quantitative"},
    //       y: {field: "IMDB_Rating", type: "quantitative"},
    //       color: {field: "Major_Genre", type: "nominal"}
    //     }
    //   }
    // },
    // {
    //   C: {
    //     layout: {type: "juxtaposition", unit: "element", arrangement: "animated"},
    //     consistency: {
    //       x_axis: true, y_axis: true, color: "shared", stroke: "distinct"
    //     },
    //     overlap_reduction: {},
    //     explicit_encoding: {}
    //   },
    //   // https://vega.github.io/vega-lite/examples/
    //   A: {
    //     data: {values},
    //     mark: "point",
    //     encoding: {
    //       x: {field: "Worldwide_Gross", type: "quantitative", aggregate: "max"},
    //       y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
    //       color: {field: "MPAA_Rating", type: "nominal"}
    //     }
    //   },
    //   B: {
    //     data: {values},
    //     mark: "point",
    //     encoding: {
    //       x: {field: "Production_Budget", type: "quantitative", aggregate: "max"},
    //       y: {field: "US_Gross", type: "quantitative", aggregate: "max"},
    //       color: {field: "MPAA_Rating", type: "nominal"}
    //     }
    //   }
    // },
    {
      C: {
        layout: {type: "superimposition", unit: "chart"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared", stroke: "distinct"
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
          x_axis: false, y_axis: true, color: "independent"
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
          x_axis: false, y_axis: true, color: "independent"
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
          x_axis: false, y_axis: false, color: "independent"
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
          x_axis: false, y_axis: false, color: "independent"
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
          x_axis: false, y_axis: false, color: "independent"
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
          x_axis: false, y_axis: false, color: "independent"
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
          x_axis: false, y_axis: false, color: "independent"
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
          x_axis: false, y_axis: false, color: "independent"
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
        consistency: {x_axis: true, y_axis: true, color: "independent"},
        overlap_reduction: {
          jitter_x: true,
          opacity: true
        },
        explicit_encoding: {}
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
        consistency: {x_axis: false, y_axis: true, color: "independent"},
        overlap_reduction: {
          opacity: true
        },
        explicit_encoding: {}
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
          x_axis: false, y_axis: false, color: "independent"
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
        layout: {type: "juxtaposition", unit: "element", arrangement: "adjacent"},
        consistency: {
          x_axis: true, y_axis: true, color: "distinct", texture: "distinct", stroke: "distinct"
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
        layout: {type: "superimposition", unit: "chart"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared", texture: "distinct", stroke: "distinct"
        },
        overlap_reduction: {
          opacity: true,
          jitter_y: true
        },
        explicit_encoding: {}
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
        layout: {type: "superimposition", unit: "chart"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared", stroke: "distinct", texture: "distinct"
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent", mirrored: true},
        consistency: {x_axis: false, y_axis: true, color: "shared"},
        overlap_reduction: {},
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
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent"},
        consistency: {
          x_axis: true, y_axis: true, color: "shared", stroke: "distinct"
        },
        explicit_encoding: {line_connection: {type: true}},
        overlap_reduction: {},
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
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent", mirrored: true},
        consistency: {
          x_axis: false, y_axis: true, color: "shared"
        },
        explicit_encoding: {line_connection: {type: true}},
        overlap_reduction: {},
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
        layout: {type: "juxtaposition", unit: "chart", mirrored: false, arrangement: "adjacent"},
        consistency: {
          x_axis: false, y_axis: true, color: "distinct"
        },
        explicit_encoding: {line_connection: {type: true}},
        overlap_reduction: {},
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
        layout: {type: "juxtaposition", unit: "chart", arrangement: "adjacent", mirrored: false},
        consistency: {x_axis: false, y_axis: true, color: "shared"},
        explicit_encoding: {line_connection: {type: true}},
        overlap_reduction: {},
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
          x_axis: false, y_axis: false, color: "independent"
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
          x_axis: false, y_axis: false, color: "independent"
        },
        overlap_reduction: {},
        explicit_encoding: {}
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
        layout: {type: "explicit-encoding", unit: "element"},
        consistency: {},
        overlap_reduction: {},
        explicit_encoding: {},
        // style: {height: 380}
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
        layout: {type: "explicit-encoding", unit: "element"},
        consistency: {},
        overlap_reduction: {},
        explicit_encoding: {}
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