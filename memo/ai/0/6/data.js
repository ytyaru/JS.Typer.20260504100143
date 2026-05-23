export class Data {
    static #all = 'B C bln num big str sym obj dic ary cls fn ins des'.split(' ');
    static all(names, ...blacks) {return (Array.isArray(names) ? names : this.#all).flatMap(n=>this[n](...blacks));}
    static without(...blacks) {return this.all(this.#except(this.#all, ...blacks))}
    static B(...blacks) {return this.#wrap(this.#except([Boolean,Number,String], ...blacks).map(C=>new C()))}
    static C(...blacks) {return this.#data([null,undefined,NaN], ...blacks)}
    static P(...blacks) {return this.#data([false,0,'',0n,Symbol.for('a')], ...blacks)}
    static bln(...blacks) {return this.#data([true,false], ...blacks)}
    static num(...blacks) {return this.#data([-1,0,1,0.1,Infinity,-Infinity,Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER+1,Number.MIN_SAFE_INTEGER,Number.MIN_SAFE_INTEGER-1], ...blacks)}
    static big(...blacks) {return this.#data([-1n,0n,1n,BigInt(Number.MAX_SAFE_INTEGER),BigInt(Number.MAX_SAFE_INTEGER)+1n,BigInt(Number.MIN_SAFE_INTEGER),BigInt(Number.MIN_SAFE_INTEGER)-1n], ...blacks)}
    static str(...blacks) {return this.#data(['','a','あ'], ...blacks)}
    static sym(...blacks) {return this.#wrap(this.#except(['a','あ'], ...blacks).map(v=>Symbol.for(v)))}
    static int(...blacks) {return this.#data([-1,0,1,Number.MAX_SAFE_INTEGER,Number.MIN_SAFE_INTEGER], ...blacks)}
    static flt(...blacks) {return this.#data([-0.1,0.1], ...blacks)}
    static ctn() {return this.#wrap([[],{},Object.create(null)])}
    static ary() {return this.#wrap([[], new (class A extends Array{})()])}
    static obj() {return this.#wrap([{}])}
    static dic() {return this.#wrap([Object.create(null)])}
    //static cls() {return this.#wrap([Date,function C(){},class C{},this.#C,this.#D])}
    static cls() {return this.#data([Date,function C(){},class C{},this.#C,this.#D])}
    static ins() {return this.#wrap([new Date(),new (function C(){})(),new (class C{})(),this.#c,this.#d])}
    static #desV = Object.defineProperty({}, 'des', {value:'v'});
    static #desF = Object.defineProperty({}, 'des', {value:()=>'f'});
    static #desG = Object.defineProperty({}, 'des', {get:()=>'g'});
    static #desS = Object.defineProperty({}, 'des', {set:(v)=>'s'});
    static #desA = Object.defineProperty({}, 'des', {get:()=>'ag',set:(v)=>'as'});
    static des() {return this.#data([this.#desV, this.#desF, this.#desG, this.#desS, this.#desA].map(d=>Object.getOwnPropertyDescriptor(d, 'des')))}
    static #AsyncFunction = (async () => {}).constructor;
    static #GeneratorFunction = (function* () {}).constructor;
    static #AsyncGeneratorFunction = (async function* () {}).constructor;
    static #C = class C {
        static sm() {return 'sm'}
        static async sam() {return 'sam'}
        static *sgm() {return 'sgm'}
        static async *sagm() {return 'sagm'}
        static get sg() {return 'sg'}
        static set ss(v) {return 'ss'}
        static get sgs() {return 'sgs'}
        static set sgs(v) {return 'sgs'}
        static get sv() {return 'V'}
        static get sf() {return ()=>'F'}
        m() {return 'm'}
        *gm() {return 'gm'}
        async am() {return 'am'}
        async *agm() {return 'agm'}
        get g() {return 'g'}
        set s(v) {return 's'}
        get gs() {return 'gs'}
        set gs(v) {return 'gs'}
        get v() {return 'v'}
        get f() {return ()=>'f'}
    };
    static #c = new this.#C();
    static #D = class D extends this.#C {constructor(){super()}}
    static #d = new this.#D();
//    static cal() {return this.#data([...this.fn(), ...this.cls()].flatMap(v=>v))}
    // 2. cal() の flatMap 内で、一度ラップを解除（v[0]）してから関数かクラスかを評価する
    static cal() {return this.#data([...this.fn(), ...this.cls()]).flat()}
    static fn() {return this.#data([()=>{}, async()=>{}, this.#C.sm, this.#C.sam, this.#C.sgm, this.#C.sagm, this.#c.m, this.#c.am, this.#c.gm, this.#c.agm, Array.prototype.map, (function(){}).bind(null), function(){}, function fn(){}, async function afn(){}, function *gfn(){}, async function *agfn(){}])}
    //static fn() {return this.#data([()=>{}, async()=>{}, function(){}, function fn(){}, async function afn(){}, function *gfn(){}, async function *agfn(){}, this.#C.M, this.#c.m])}
    //static fn() {return 'arrow clsMethod insMethod native bound functions'.split(' ').flatMap(n=>this[n]())}
    //static fn(...blacks) {return this.#except('arrow clsMethod insMethod native bound functions'.split(' '), ...blacks).flatMap(n=>this[n]())}
    //static fn(...blacks) {return this.#except('arrow clsMethod insMethod native bound functions'.split(' '), ...blacks).flatMap(n=>this[n]()).flat(2)}
//    static fn(...blacks) {return this.#except('arrow clsMethod insMethod native bound functions'.split(' '), ...blacks).flatMap(n=>this[n]())}
    /*
    // 3. fn() をシンプルかつ正確にフラット化して返す
    static fn(...blacks) {
//        const targets = 'arrow clsMethod insMethod native bound functions'.split(' ');
//        return this.#except(targets, ...blacks).flatMap(n => this[n]()).flat(2);
        return this.#except('arrow ... functions'.split(' '), ...blacks).flatMap(n=>this[n]()).flat(2)
    }
    */
    /*
    static arrow() {return this.#data([()=>{}, async()=>{}])}
    static method() {return 'clsMethod insMethod'.split(' ').flatMap(n=>this[n]())}
    static clsMethod() {return this.#data([this.#C.M, this.#C.AM, this.#C.GM, this.#C.AGM])}
    static insMethod() {return this.#data([this.#c.m, this.#c.am, this.#c.gm, this.#c.agm])}
    static native() {return this.#data([Array.prototype.map])}
    static bound() {return this.#data([(function(){}).bind(null)])}
    static functions() {return this.#data([function(){}, function fn(){}, async function afn(){}, function *gfn(){}, async function *agfn(){}])}
    */
    static arrow() {return [()=>{}, async()=>{}].map(v=>[v])}
    static method() {return [this.#C.sm, this.#C.sam, this.#C.sgm, this.#C.sagm, this.#c.m, this.#c.am, this.#c.gm, this.#c.agm].map(v=>[v])}
    static clsMethod() {return [this.#C.sm, this.#C.sam, this.#C.sgm, this.#C.sagm].map(v=>[v])}
    static insMethod() {return [this.#c.m, this.#c.am, this.#c.gm, this.#c.agm].map(v=>[v])}
    static native() {return [Array.prototype.map].map(v=>[v])}
    static bound() {return [(function(){}).bind(null)].map(v=>[v])}
    static functions() {return [function(){}, function fn(){}, async function afn(){}, function *gfn(){}, async function *agfn(){}].map(v=>[v])}

    static #data(values, ...blacks) {return this.#wrap(this.#except(values, ...blacks))}
    static #except(values, ...blacks) {return values.filter(v=>!blacks.includes(v));}
    static #wrap(values) {return values.map(v=>[v])}
}

