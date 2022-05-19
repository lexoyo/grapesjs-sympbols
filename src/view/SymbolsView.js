import { render, html } from 'lit-html'
import Backbone from 'backbone'

export default class extends Backbone.View {
  initialize(model, { editor, options }) {
    //this.listenTo(this.model, "change", this.render)
    model.on('add update remove', () => this.render())
    editor.on('component:selected', () => this.render())
    editor.on('sorter:drag', (...args) => console.log('FIXME: USE SORTER DRAG', ...args))
    editor.on('sorter:drag', event => {
      this.lastPos = event.pos
      this.lastTarget = event.target
    })
    editor.on('sorter:drag:end', event => console.log('DRAG END', event))
    editor.on('sorter:drag:start', event => console.log('DRAG START', event))
    editor.on('sorter:drag:validation', event => console.log('DRAG VALIDATION', event))
    // store useful vars
    this.model = model
    this.editor = editor
    this.options = options
    // list wrapper
    this.el = document.createElement('div')
    this.el.classList.add('symbols__wrapper')
    document.querySelector(options.appendTo)
      .appendChild(this.el)
    // first render
    this.render()
  }
  render() {
    const symbols = this.model
    const selected = this.editor.getSelected()
    render(html`
    <style>
      .symbols__symbol-selected {
        border: 1px solid ${ this.options.selectColor };
      }
      .symbols__symbol {
        position: relative;
      }
      .symbols__num {
        font-size: xx-small;
      }
      .symbols__empty {
        text-align: center;
        width: 100%;
      }
    </style>
    <main class="symbols__list" @dragend=${event => this.onDrop(event)}>
      <div class="gjs-blocks-c">
      ${
  // keep the same structure as the layers panel
  symbols
    .map(s => html`
          <div
            class="gjs-block gjs-one-bg gjs-four-color-h symbols__symbol
              ${s.getComponents().has(selected?.cid) ? 'symbols__symbol-selected' : ''}
              fa ${s.attributes.icon}
            "
            title="" draggable="true"
            symbol-id=${s.id}>
            <div class="gjs-block-label">
              ${s.attributes.label}
              <div class="symbols__num">
                ${s.getComponents().size} instances
              </div>
            </div>
          </div>
         `)
}
       ${symbols.length ? '' : html`<div class="symbols__empty">
         No symbol yet.
       </div>`}
       </div>
     </main>
   `, this.el)
  }
  onDrop(...args) {
    const event = args[0]
    const symbolId = event.target.getAttribute('symbol-id')
    if(symbolId) {
      const symbol = this.editor.Symbols.get(symbolId)
      if(symbol) {
        const c = this.editor.runCommand('symbols:create', { symbol, pos: this.lastPos, target: this.lastTarget })
      } else {
        console.error(`Could not create an instance of symbol ${symbolId}: symbol not found`)
      }
    } else {
      console.log('not a symbol creation', symbolId)
    }
  }
}
