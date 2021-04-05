import { immerable, produce } from 'immer';

class Toto {
  [immerable] = true;

  value = 0;

  constructor(public tata: Tata) {}

  set(v: number) {
    this.value = v;
  }
}

class Tata {}

const t = new Toto(new Tata());
const r = produce(t, (d) => d.set(42));

console.log(r.tata === t.tata);

console.log(r);
