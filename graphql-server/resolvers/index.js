
const path = require('path')
const { fileLoader } = require('merge-graphql-schemas');

/* MANUAL APPROACH: Update this file manually with each resolver file */
// import userResolvers from "./user.resolvers";
// import welcomeResolvers from "./welcome.resolvers";
// const resolversArray = [userResolvers, welcomeResolvers];

/*  AUTOMATED APPROACH: Put your resolvers anywhere
    with ".resolvers.[js/ts]" naming convention */
const resolvers = fileLoader(path.join(__dirname, './**/*.resolvers.*'))

module.exports = resolvers;