export type Spec = {
  data: Data
  mark: Mark
  encoding: Encoding
}
export type Data = {
  values: object[]
}
export type Mark = 'bar';
export type Encoding = {
  x: Field
  y: Field
  color?: Color // TODO: currently, do not consider separation by color (grouped bar chart)
}
export type Field = {
  field: string
  type: DataType
  aggregate?: Aggregate
}
export type Color = {
  field: string
  type: DataType
}
export type DataType = 'nominal' | 'quantitative';
export type Aggregate = 'sum' | 'mean' | 'median' | 'max' | 'min' | 'count';