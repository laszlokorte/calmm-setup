const h = require('react-hyperscript')
const hh = require('hyperscript-helpers')
const {div, h1, ul, li, button} = hh(h)

const {default: React} = require("react")
const ReactDOM = require("react-dom")
const {default: Atom} = require("kefir.atom")
const {default: Stored} = require("atom.storage")
const {default: Undo, Replace} = require("atom.undo")

const L = require("partial.lenses")
const R = require("ramda")
const {default: K, bind, classes, fromIds} = require("kefir.react.html")

const model = require("./model")

const HistoryPanel = ({items = Undo({Atom})}) => div([
  h(K.button, {
    onClick: evt => {
      items.undo()
    },
    disabled: K(items.undo.has, R.not)
  }, "Undo"),
  h(K.button, {
    onClick: evt => {
      items.redo()
    },
    disabled: K(items.redo.has, R.not) 
  }, "Redo"),
])

const List = ({items = Atom([])}) => 
  h(K.ul, {},
    K(items, R.addIndex(R.map)((item, idx) => 
      li({key: idx}, item)))
  )

const App = ({items = Atom([])}) =>
  div([
    h(HistoryPanel, {items}),
    h1('My App'),    
    button({onClick: evt => {
      items.modify(R.append("elem"))
    }}, "Add Item"),
    button({onClick: evt => {
      items.modify(R.empty)
    }}, "Clear"),
    h(List, {items})
  ])

const storeWithTransientHistory = Stored({
  key: "my-app-storage-transient",
  value: model.initial,
  Atom: value => Undo({
    value, 
    Atom,
    replace: Replace.youngerThan(100)
  }),
  debounce: 250,
  storage: localStorage,
  schema: model.schema,
})

const storeWithPersistentHistory = Undo({
  value: model.initial,
  Atom: value => Stored({
    key: "my-app-storage-persistent",
    value,
    Atom,
    debounce: 50,
    storage: localStorage,
    schema: model.schema,
  }),
  replace: Replace.youngerThan(100)
})

ReactDOM.render(
  h(App, {
    items: storeWithPersistentHistory
  }),
  document.getElementById("app")
)