var requireContext = require('require-context')

const requireModule = requireContext(__dirname, false, /\.js$/)
const modules = {}

requireModule.keys().forEach(fileName => {
  if (fileName === 'index.js') return
  if (fileName.startsWith('_')) return

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
