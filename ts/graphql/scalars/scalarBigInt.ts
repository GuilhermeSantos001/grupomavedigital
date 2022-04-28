import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

const resolverMap = {
  BigInt: new GraphQLScalarType({
    name: 'BigInt',
    description: 'Integer custom scalar type',
    /**
     * ? Esse método converte o valor JSON do escalar em sua representação de
     * ? back-end antes de ser adicionado a um resolvedor args.
     * ? O Apollo Server chama este método quando o escalar é fornecido por um
     * ? cliente como uma variável GraphQL para um argumento. (Quando um escalar
     * ? é fornecido como um argumento embutido em código na string de operação,
     * ? parseLiteralé chamado em seu lugar.)
     */
    parseValue(value) {
      return parseFloat(String(value));
    },
    /**
     * ? Esse método converte a representação de back-end do escalar em um formato
     * ? compatível com JSON para que o Apollo Server possa incluí-lo em uma resposta
     * ? de operação.
     * ? No exemplo acima, o Dateescalar é representado no back-end pelo Dateobjeto
     * ? JavaScript.
     * ? Quando enviamos um Dateescalar em uma resposta GraphQL, o serializamos
     * ? como o valor inteiro retornado pela getTimefunção de um Dateobjeto JavaScript .
     */
    serialize(value) {
      return String(value);
    },
    /**
     * ? Quando uma string de consulta de entrada inclui esse escalar como um valor de
     * ? argumento embutido em código, esse valor faz parte da árvore de sintaxe
     * ? abstrata (AST) do documento de consulta. O Apollo Server chama o
     * ? parseLiteralmétodo para converter a representação AST do valor para a
     * ? representação back-end do escalar.
     */
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseFloat(ast.value);
      }

      return null;
    },
  })
}

export default resolverMap;