import { MDCSimpleMenu } from '@material/menu/';


const MENU_SELECTOR = '.mdc-simple-menu'

export function initMenus() {
  const menuEls = Array.from(document.querySelectorAll(MENU_SELECTOR));
  if (!menuEls.length) {
    return;
  }

  menuEls.forEach((menuEl) => {
    const menu = new MDCSimpleMenu(menuEl);
    menu.listen('MDCSimpleMenu:selected', (e) => {
      console.log(e.detail);
      window.location = e.detail.item.dataset.href;
    });

    const triggerEl = menuEl.parentElement.querySelector('button');
    triggerEl.addEventListener('click', () => {
      menu.show();
    });
  });
}
