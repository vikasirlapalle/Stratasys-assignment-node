const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType, Kind } = require('graphql');

// In-memory data
let layers = [
  {
    id: '1',
    name: 'Layer 1',
    visible: true,
    color: '#FF0000',
    lastModified: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Layer 2',
    visible: false,
    color: '#00FF00',
    lastModified: new Date().toISOString(),
  },
];

// Define DateTime scalar
const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'A valid ISO-8601 DateTime string',
  parseValue(value) {
    return new Date(value); // from client
  },
  serialize(value) {
    return value instanceof Date ? value.toISOString() : value; // to client
  },
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? new Date(ast.value) : null;
  },
});

// SDL as string
const typeDefs = gql`
  scalar DateTime

  type Layer {
    id: ID!
    name: String!
    visible: Boolean!
    color: String
    lastModified: DateTime
  }

  type Query {
    layers: [Layer!]!
  }

  type Mutation {
    toggleLayerVisibility(id: ID!): Layer
  }
`;

// Resolvers
const resolvers = {
  DateTime,
  Query: {
    layers: () => layers,
  },
  Mutation: {
    toggleLayerVisibility: (_, { id }) => {
      const layer = layers.find((l) => l.id === id);
      if (!layer) throw new Error(`Layer with ID ${id} not found`);
      layer.visible = !layer.visible;
      layer.lastModified = new Date().toISOString();
      return layer;
    },
  },
};

// Create Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Start server
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
