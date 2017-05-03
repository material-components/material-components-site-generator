import { MDCSimpleMenu } from '@material/menu/';

export function initPlatformMenu() {
  const triggerEl = document.querySelector('.toolbar-platform-chooser__button');
  const menuEl = document.querySelector('.toolbar-platform-chooser__menu');
  if (!menuEl || !triggerEl) {
    return;
  }

  const menu = new MDCSimpleMenu(menuEl);

  menu.listen('MDCSimpleMenu:selected', (e) => {
    window.location = e.detail.item.dataset.href;
  });

  triggerEl.addEventListener('click', () => {
    menu.show();
  });
}
