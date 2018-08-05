function dummy() {

}

beforeEach(() => {
    require('../src/excellent');
    document.body.innerHTML = `
                <div e-bind="main">
                    <div e-bind="first">
                        <div e-bind="nested"></div>
                        <div e-bind="nested"></div>
                        <div e-bind="nested"></div>
                    </div>
                    <div e-bind="second">
                        <div e-bind="nested"></div>
                        <div e-bind="nested"></div>
                    </div>
                </div>
                <div e-bind="last">
                    Empty
                </div>
                <div e-bind="bottom">                    
                </div>`;
    excellent.addController('main', () => {
    });
    excellent.addController('first', () => {
    });
    excellent.addController('second', () => {
    });
    excellent.addController('nested', ctrl => {
        ctrl.node.innerHTML = 'nested';
    });
    excellent.addController('base', ctrl => {
        ctrl.node.innerHTML = 'base';
    });
    excellent.addController('last', ctrl => {
        ctrl.depends(['base']);
        ctrl.onInit = function () {
            ctrl.extend('base');
            ctrl.node.innerHTML += '-last';
        };
    });
    excellent.addController('bottom', ctrl => {
        ctrl.depends(['base', 'last']);
        ctrl.onInit = function () {
            ctrl.extend(['base', 'last']);
            ctrl.node.innerHTML += '-bottom';
        };
    });

    excellent.bind();
});

afterEach(() => {
    document.body.innerHTML = '';
    jest.resetModules();
});

describe('positive', () => {

    describe('globally', () => {
        it('must find all controllers by name', () => {
            expect(excellent.find('nested').length).toBe(5);
            expect(excellent.find('invalid').length).toBe(0);
        });
        it('must find individual controllers by name', () => {
            expect(excellent.findOne('main')).toBeTruthy();
            expect(excellent.findOne('first')).toBeTruthy();
            expect(excellent.findOne('second')).toBeTruthy();
        });
    });

    describe('locally', () => {
        it('must find all children by name', () => {
            const e1 = excellent.findOne('first').find('nested');
            const e2 = excellent.findOne('second').find('nested');
            expect(e1.length).toBe(3);
            expect(e2.length).toBe(2);
            e1.forEach(a => {
                expect(a.node.innerHTML).toBe('nested');
            });
            e2.forEach(a => {
                expect(a.node.innerHTML).toBe('nested');
            });
        });
    });

    describe('inheritance', () => {
        it('must allow single derivation', () => {
            expect(excellent.findOne('last').node.innerHTML).toBe('base-last');
            expect(excellent.findOne('bottom').node.innerHTML).toBe('base-last-bottom');
        });
        it('must hide repeated types through levels', () => {
            const c = excellent.findOne('bottom').node.controllers;
            // we get: bottom, base, last(base):
            // TODO: Problem: Should be 2, not allow this inheritance issue:
            expect(Object.keys(c).length).toBe(3);
            // TODO: Should the singularity of inheritance be enforced?
        });
    });
});

describe('negative', () => {

    beforeAll(() => {
        require('../src/excellent');
    });

    it('must throw on invalid controller names', () => {
        expect(() => {
            excellent.find();
        }).toThrow('Invalid controller name <undefined> specified.');
        expect(() => {
            excellent.find(123);
        }).toThrow('Invalid controller name <123> specified.');
        expect(() => {
            excellent.find(true);
        }).toThrow('Invalid controller name <true> specified.');
        expect(() => {
            excellent.find(dummy);
        }).toThrow('Invalid controller name <function dummy() {}> specified.');
        expect(() => {
            excellent.find('one two');
        }).toThrow('Invalid controller name "one two" specified.');
        expect(() => {
            excellent.findOne();
        }).toThrow('Invalid controller name <undefined> specified.');
        expect(() => {
            excellent.findOne(123);
        }).toThrow('Invalid controller name <123> specified.');
        expect(() => {
            excellent.findOne(false);
        }).toThrow('Invalid controller name <false> specified.');
        expect(() => {
            excellent.findOne(dummy);
        }).toThrow('Invalid controller name <function dummy() {}> specified.');
        expect(() => {
            excellent.findOne('one two');
        }).toThrow('Invalid controller name "one two" specified.');
    });

    it('must throw when unexpected number of controllers found', () => {
        expect(() => {
            excellent.findOne('nested');
        }).toThrow('Global findOne("nested") expected a single controller, but found 5.');
        expect(() => {
            excellent.findOne('first').findOne('nested');
        }).toThrow('Search "first".findOne("nested") expected a single controller, but found 3.');
    });

});
