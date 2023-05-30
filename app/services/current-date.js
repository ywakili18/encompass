import Service from '@ember/service';

export default class CurrentDateService extends Service {
  getCurrentDate() {
    return new Date();
  }
}
