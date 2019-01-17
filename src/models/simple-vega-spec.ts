export type Spec = {
  data: Data
  mark: Mark
  encoding: Encoding
}
export type Data = {
  values: Object[]
}
export type Mark = 'bar';
export type Encoding = {
  x: Field
  y: Field
}
export type Field = {
  field: string
  type: DataType
  aggregate?: Aggregate
}
export type DataType = 'ordinal' | 'quantitative';
export type Aggregate = 'sum';