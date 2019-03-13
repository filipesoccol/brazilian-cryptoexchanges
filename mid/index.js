var requireContext = require('require-context')

const requireModule = requireContext(__dirname, false, /\.js$/)
const modules = {}

console.log(requireModule.keys())

requireModule.keys().forEach(fileName => {
  if (fileName === 'index.js') return
  if (fileName.startsWith('_')) return
  console.log(fileName, 'ok')

  // Replace ./ and .js
  const path = fileName.replace(/(\.\/|\.js)/g, '')
  const [moduleName, imported] = path.split('/')

  if (!modules[moduleName]) {
    modules[moduleName] = {
      namespaced: true
    }
  }
  modules[moduleName] = requireModule(fileName)
})

// export default modules
module.exports = modules
