/**
 * @description Componente da caixa de alerta
 * @author @GuilhermeSantos001
 * @update 14/09/2021
 * @version 1.0.0
 */

import Layout from '@/src/components/layout';

export default class Alerting extends Layout {
  static readonly customName: string = 'rocket-alerting';
  private container: HTMLDivElement;
  private message: HTMLElement;

  constructor() {
    super();

    this.container = this.create_container();
    this.message = this.create_message();

    this.container.appendChild(this.message);
    this.shadow.appendChild(this.container);
    this.animate_start();
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
   * @description Cria o container do alerta
   */
  create_container(): HTMLDivElement {
    const
      container = document.createElement('div');

    container.id = `container-alert-${this.index()}`;
    container.style.zIndex = "9999";
    container.style.opacity = "0";
    container.style.borderRadius = "10px";
    container.style.fontSize = "18px";
    container.setAttribute('role', 'alert');

    this.append_class(
      container,
      'bg-primary bg-gradient border border-warning alert alert-dismissible fade show shadow fixed-top m-2 text-secondary text-truncate'
    );

    return container;
  };

  /**
   * @description Cria o elemento para exibição da mensagem do alerta
   */
  create_message(): HTMLElement {
    const strong = document.createElement('strong');

    strong.innerHTML = this.getAttribute('data-message') || "";

    return strong;
  };

  /**
   * @description Cria a animação de fade-in do alerta
   */
  animate_start() {
    this.create_interval(100, () => {
      let value = Number(this.container.style.opacity);

      if (value < 1) {
        this.container.style.opacity = String(value + 0.2);
      } else {
        this.cancel_interval();
        this.timeout_start();
      };
    });
  };

  /**
   * @description Cria a animação de fade-out do alerta
   */
  timeout_start(): void {
    this.create_timeout(Number(this.getAttribute('data-delay') || 1000), () => {
      this.create_interval(100, () => {
        let value = Number(this.container.style.opacity);

        if (value > 0) {
          this.container.style.opacity = String(value - 0.2);
        } else {
          this.cancel_interval();
          this.remove();
        };
      });
    });
  };
};