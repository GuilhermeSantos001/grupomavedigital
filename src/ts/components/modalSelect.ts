/**
 * @description Componente dos modais
 * @author @GuilhermeSantos001
 * @update 15/09/2021
 * @version 1.0.0
 */

import Layout from '@/src/components/layout';

export default class ModalSelect extends Layout {
  static readonly customName: string = 'rocket-modal-select';
  private container: HTMLDivElement;
  private modal: any = false;

  constructor() {
    super();

    this.container = this.create_modal();

    this.shadow.appendChild(this.container);

    this.render();
  };

  /**
   * @description Chama todos os metodos que devem processar quando o elemento
   * é adicionado a pagina
   */
  connectedCallback() { };

  /**
   * @description Chama todos os metodos que devem processar quando o elemento
   * é removido da pagina
   */
  disconnectedCallback() { };

  /**
   * @description Chama todos os metodos que devem processar quando o elemento
   * é movido para outra pagina
   */
  adoptedCallback() { };

  /**
   * @description Chama todos os metodos que devem processar a mudança de
   * atributos
   */
  attributeChangedCallback(name: string, oldValue: string, newValue: string) { };

  /**
   * @description Defini os atributos que serão processados pelo attributeChangedCallback
   */
  static get observedAttributes() { return []; };

  /**
   * @description Cria o container da caixa de seleção
   */
  create_modal(): HTMLDivElement {
    const
      container = document.createElement('div'),
      container_dialog = document.createElement('div'),
      container_content = document.createElement('div'),
      container_header = document.createElement('div'),
      container_body = document.createElement('div'),
      container_footer = document.createElement('div'),
      header_h5 = document.createElement('h5'),
      header_close = document.createElement('button');

    container.id = `container-modal-select-${this.index()}`;
    container.style.opacity = "0";
    container.setAttribute('tabindex', '-1');
    container.setAttribute('aria-labelledby', this.getAttribute('data-aria-labelledby') || "???");
    container.setAttribute('aria-hidden', 'true');

    this.append_class(
      container,
      'modal fade'
    );

    this.append_class(
      container_dialog,
      'modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable'
    );

    this.append_class(
      container_content,
      'modal-content shadow'
    );

    this.append_class(
      container_header,
      'modal-header bg-primary shadow'
    );

    this.append_class(
      header_h5,
      'modal-title text-secondary fw-bold'
    );


    this.append_class(
      header_close,
      `btn-close${this.getAttribute('data-btn-close-white') === 'true' ? ' btn-close-white' : ''}`
    );

    this.append_class(
      container_body,
      'modal-body'
    );

    this.append_class(
      container_footer,
      'modal-footer'
    );

    container.appendChild(container_dialog);
    container_dialog.appendChild(container_content);
    container_content.appendChild(container_header);

    header_h5.id = this.getAttribute('data-aria-labelledby') || "???";
    header_h5.innerText = this.getAttribute('data-header') || "???";
    header_close.setAttribute('type', 'button');
    header_close.setAttribute('data-bs-dismiss', 'modal');
    header_close.setAttribute('aria-label', 'Close');

    container_header.appendChild(header_h5);

    if (this.getAttribute('data-btn-close') === 'true')
      container_header.appendChild(header_close);

    this.compose(this.children, container_body, 'body');
    container_content.appendChild(container_body);

    this.compose(this.children, container_footer, 'footer');
    container_content.appendChild(container_footer);

    return container;
  };

  /**
   * @description Renderiza o modal
   */
  render(): void {
    let
      win: any = window,
      bootstrap: any = win.bootstrap;

    if (!this.modal)
      this.modal = bootstrap.Modal.getOrCreateInstance(this.container);

    this.create_timeout(1000, () => {
      this.container.style.opacity = "1";
      this.show();
      this.cancel_timeout();
    });
  };

  /**
   * @description Exibe o modal
   */
  show(): void {
    if (this.modal) {
      this.modal.show();

      this.execute_animation(this.container, 'jello', 'normal', false);

      this.container.addEventListener('hidden.bs.modal', () => this.container.remove());
    };
  };
};