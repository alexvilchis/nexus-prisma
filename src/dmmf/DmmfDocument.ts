import { DmmfTypes } from './DmmfTypes'
import { indexBy, Index } from '../utils'

export class DmmfDocument implements DmmfTypes.Document {
  public datamodel: DmmfTypes.Datamodel
  public schema: DmmfTypes.Schema
  public mappings: DmmfTypes.Mapping[]
  public queryObject: OutputType
  public mutationObject: OutputType
  public outputTypesIndex: Index<DmmfTypes.OutputType> = {}
  public inputTypesIndex: Index<DmmfTypes.InputType>
  public mappingsIndex: Index<DmmfTypes.Mapping>
  public enumsIndex: Index<DmmfTypes.Enum>
  public modelsIndex: Index<DmmfTypes.Model>

  constructor({ datamodel, schema, mappings }: DmmfTypes.Document) {
    // ExternalDMMF
    this.datamodel = datamodel
    this.schema = schema
    this.mappings = mappings

    // Indices
    this.modelsIndex = indexBy('name', datamodel.models)
    this.enumsIndex = indexBy('name', schema.enums)
    this.inputTypesIndex = indexBy('name', schema.inputTypes)
    this.outputTypesIndex = indexBy('name', schema.outputTypes)
    this.mappingsIndex = indexBy('model', mappings)

    // Entrypoints
    this.queryObject = this.getOutputType('Query')
    this.mutationObject = this.getOutputType('Mutation')
  }

  getInputType(inputTypeName: string) {
    const inputType = this.inputTypesIndex[inputTypeName]

    if (!inputType) {
      throw new Error('Could not find input type name: ' + inputTypeName)
    }

    return inputType
  }

  getOutputType(outputTypeName: string): OutputType {
    const outputType = this.outputTypesIndex[outputTypeName]

    if (!outputType) {
      throw new Error('Could not find output type name: ' + outputTypeName)
    }

    return new OutputType(outputType)
  }

  hasOutputType(outputTypeName: string) {
    const outputType = this.outputTypesIndex[outputTypeName]

    if (!outputType) {
      return false
    }

    return true
  }

  getEnumType(enumTypeName: string) {
    const enumType = this.enumsIndex[enumTypeName]

    if (!enumType) {
      throw new Error('Could not find enum type name: ' + enumTypeName)
    }

    return enumType
  }

  hasEnumType(enumTypeName: string) {
    const enumType = this.enumsIndex[enumTypeName]

    if (!enumType) {
      return false
    }

    return true
  }

  getModelOrThrow(modelName: string) {
    const model = this.modelsIndex[modelName]

    if (!model) {
      throw new Error('Could not find model for model: ' + modelName)
    }

    return model
  }

  hasModel(modelName: string) {
    const model = this.modelsIndex[modelName]

    if (!model) {
      return false
    }

    return true
  }

  getMapping(modelName: string) {
    const mapping = this.mappingsIndex[modelName]

    if (!mapping) {
      throw new Error('Could not find mapping for model: ' + modelName)
    }

    return mapping
  }
}

export class OutputType {
  public name: string
  public fields: DmmfTypes.SchemaField[]
  public isEmbedded?: boolean

  constructor(protected outputType: DmmfTypes.OutputType) {
    this.name = outputType.name
    this.fields = outputType.fields
    this.isEmbedded = outputType.isEmbedded
  }

  getField(fieldName: string) {
    const field = this.outputType.fields.find(f => f.name === fieldName)

    if (!field) {
      throw new Error(
        `Could not find field '${this.outputType.name}.${fieldName}' on type ${this.outputType.name}`,
      )
    }

    return field
  }
}
