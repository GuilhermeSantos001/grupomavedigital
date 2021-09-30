import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

const resolverMap = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value); // Convert outgoing Date to integer for JSON
    },
    serialize(value) {
      return value.getTime(); // Convert incoming integer to Date
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // Convert hard-coded AST string to integer and then to Date
      }

      return null; // Invalid hard-coded value (not an integer)
    },
  })
}

export default resolverMap;