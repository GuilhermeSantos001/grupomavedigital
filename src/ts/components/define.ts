import Alerting from '@/src/components/alerting';
import ModalSelect from '@/src/components/modalSelect';

export default function define() {
  customElements.define(Alerting.customName, Alerting);
  customElements.define(ModalSelect.customName, ModalSelect);
};