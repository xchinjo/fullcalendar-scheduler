import * as $ from 'jquery'
import { assignTo, getScrollbarWidths } from 'fullcalendar'
import EnhancedScroller from './EnhancedScroller'

/*
A Scroller, but with a wrapping div that allows "clipping" away of native scrollbars,
giving the appearance that there are no scrollbars.
*/
export default class ClippedScroller extends EnhancedScroller {

  isHScrollbarsClipped: boolean
  isVScrollbarsClipped: boolean


  /*
  Received overflows can be set to 'clipped', meaning scrollbars shouldn't be visible
  to the user, but the area should still scroll.
  */
  constructor(options?) {
    super(options)

    this.isHScrollbarsClipped = false
    this.isVScrollbarsClipped = false

    if (this.overflowX === 'clipped-scroll') {
      this.overflowX = 'scroll'
      this.isHScrollbarsClipped = true
    }

    if (this.overflowY === 'clipped-scroll') {
      this.overflowY = 'scroll'
      this.isVScrollbarsClipped = true
    }
  }


  renderEl() {
    const scrollEl = super.renderEl()
    const clipEl = document.createElement('div')
    clipEl.classList.add('fc-scroller-clip')
    clipEl.appendChild(scrollEl)
    return clipEl
  }


  updateSize() {
    const { scrollEl } = this
    const scrollbarWidths = getScrollbarWidths($(scrollEl)) // the native ones
    const cssProps = { marginLeft: '0px', marginRight: '0px', marginTop: '0px', marginBottom: '0px' }

    // give the inner scrolling div negative margins so that its scrollbars
    // are nudged outside of the bounding box of the wrapper, which is overflow:hidden
    if (this.isHScrollbarsClipped) {
      cssProps.marginTop = -scrollbarWidths.top + 'px'
      cssProps.marginBottom = -scrollbarWidths.bottom + 'px'
    }
    if (this.isVScrollbarsClipped) {
      cssProps.marginLeft = -scrollbarWidths.left + 'px'
      cssProps.marginRight = -scrollbarWidths.right + 'px'
    }

    assignTo(scrollEl.style, cssProps)

    // if we are attempting to hide the scrollbars offscreen, OSX/iOS will still
    // display the floating scrollbars. attach a className to force-hide them.
    if (
      (this.isHScrollbarsClipped || (this.overflowX === 'hidden')) && // should never show?
      (this.isVScrollbarsClipped || (this.overflowY === 'hidden')) && // should never show?
      !( // doesn't have any scrollbar mass
        scrollbarWidths.top ||
        scrollbarWidths.bottom ||
        scrollbarWidths.left ||
        scrollbarWidths.right
      )
    ) {
      scrollEl.classList.add('fc-no-scrollbars')
    } else {
      scrollEl.classList.remove('fc-no-scrollbars')
    }
  }


  /*
  Accounts for 'clipped' scrollbars
  */
  getScrollbarWidths() {
    const widths = getScrollbarWidths($(this.scrollEl))

    if (this.isHScrollbarsClipped) {
      widths.top = 0
      widths.bottom = 0
    }

    if (this.isVScrollbarsClipped) {
      widths.left = 0
      widths.right = 0
    }

    return widths
  }
}
