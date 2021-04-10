import { immerable, produce } from 'immer';

abstract class Abstract {
  abstract get foo(): number;
  abstract set foo(value: number);
}

class Klass extends Abstract {
  get foo(): number {
    return 42;
  }
}

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
