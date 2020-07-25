import { sc } from "graphql-compose";
import { Kind, GraphQLError, GraphQLNonNull, GraphQLBoolean } from "graphql";

const UrlTC = sc.createScalarTC({
    name: "URL",
    description:
        "A field whose value conforms to the standard URL format as specified in RFC3986: https://www.ietf.org/rfc/rfc3986.txt.",
    serialize(value) {
        return new URL(value.toString()).toString();
    },
    parseValue: (value) => new URL(value.toString()),
    parseLiteral(ast) {
        if (ast.kind !== Kind.STRING) {
            throw new GraphQLError(
                `Can only validate strings as URLs but got a: ${ast.kind}`,
            );
        }
        return new URL(ast.value.toString());
    },
});

const S3PayloadTC = sc.createObjectTC({
    name: "S3Payload",
    fields: {
        signedRequest: () => GraphQLNonNull(UrlTC.getType()),
        url: () => GraphQLNonNull(UrlTC.getType()),
    },
});

const UsernameExistsPayloadTC = sc.createObjectTC({
    name: "UsernameExistsPayload",
    fields: {
        usernameExists: () => GraphQLNonNull(GraphQLBoolean),
    },
});

export { S3PayloadTC, UrlTC, UsernameExistsPayloadTC };
