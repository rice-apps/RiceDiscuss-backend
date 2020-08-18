import { sc } from 'graphql-compose'
import { Kind } from 'graphql'

const UrlTC = sc.createScalarTC({
  name: 'URL',
  description: 'Represents a URL as specified in RFC 3986',
  serialize: value => (value ? new URL(value.toString()).toString() : null),
  parseValue: value => (value ? new URL(value.toString()) : null),
  parseLiteral: ast => {
    if (ast.kind === Kind.STRING) {
      return new URL(ast.value.toString())
    }
    return null
  }
})

const S3PayloadTC = sc.createObjectTC({
  name: 'S3Payload',
  fields: {
    signedRequest: UrlTC.getTypeNonNull().getType(),
    url: UrlTC.getTypeNonNull().getType()
  }
})

const UsernameExistsPayloadTC = sc.createObjectTC({
  name: 'UsernameExistsPayload',
  fields: {
    usernameExists: () => 'Boolean!'
  }
})

export { S3PayloadTC, UrlTC, UsernameExistsPayloadTC }
