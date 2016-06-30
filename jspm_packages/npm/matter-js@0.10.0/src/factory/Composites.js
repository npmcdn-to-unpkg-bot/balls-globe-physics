/* */ 
var Composites = {};
module.exports = Composites;
var Composite = require('../body/Composite');
var Constraint = require('../constraint/Constraint');
var Common = require('../core/Common');
var Body = require('../body/Body');
var Bodies = require('./Bodies');
(function() {
  Composites.stack = function(xx, yy, columns, rows, columnGap, rowGap, callback) {
    var stack = Composite.create({label: 'Stack'}),
        x = xx,
        y = yy,
        lastBody,
        i = 0;
    for (var row = 0; row < rows; row++) {
      var maxHeight = 0;
      for (var column = 0; column < columns; column++) {
        var body = callback(x, y, column, row, lastBody, i);
        if (body) {
          var bodyHeight = body.bounds.max.y - body.bounds.min.y,
              bodyWidth = body.bounds.max.x - body.bounds.min.x;
          if (bodyHeight > maxHeight)
            maxHeight = bodyHeight;
          Body.translate(body, {
            x: bodyWidth * 0.5,
            y: bodyHeight * 0.5
          });
          x = body.bounds.max.x + columnGap;
          Composite.addBody(stack, body);
          lastBody = body;
          i += 1;
        } else {
          x += columnGap;
        }
      }
      y += maxHeight + rowGap;
      x = xx;
    }
    return stack;
  };
  Composites.chain = function(composite, xOffsetA, yOffsetA, xOffsetB, yOffsetB, options) {
    var bodies = composite.bodies;
    for (var i = 1; i < bodies.length; i++) {
      var bodyA = bodies[i - 1],
          bodyB = bodies[i],
          bodyAHeight = bodyA.bounds.max.y - bodyA.bounds.min.y,
          bodyAWidth = bodyA.bounds.max.x - bodyA.bounds.min.x,
          bodyBHeight = bodyB.bounds.max.y - bodyB.bounds.min.y,
          bodyBWidth = bodyB.bounds.max.x - bodyB.bounds.min.x;
      var defaults = {
        bodyA: bodyA,
        pointA: {
          x: bodyAWidth * xOffsetA,
          y: bodyAHeight * yOffsetA
        },
        bodyB: bodyB,
        pointB: {
          x: bodyBWidth * xOffsetB,
          y: bodyBHeight * yOffsetB
        }
      };
      var constraint = Common.extend(defaults, options);
      Composite.addConstraint(composite, Constraint.create(constraint));
    }
    composite.label += ' Chain';
    return composite;
  };
  Composites.mesh = function(composite, columns, rows, crossBrace, options) {
    var bodies = composite.bodies,
        row,
        col,
        bodyA,
        bodyB,
        bodyC;
    for (row = 0; row < rows; row++) {
      for (col = 1; col < columns; col++) {
        bodyA = bodies[(col - 1) + (row * columns)];
        bodyB = bodies[col + (row * columns)];
        Composite.addConstraint(composite, Constraint.create(Common.extend({
          bodyA: bodyA,
          bodyB: bodyB
        }, options)));
      }
      if (row > 0) {
        for (col = 0; col < columns; col++) {
          bodyA = bodies[col + ((row - 1) * columns)];
          bodyB = bodies[col + (row * columns)];
          Composite.addConstraint(composite, Constraint.create(Common.extend({
            bodyA: bodyA,
            bodyB: bodyB
          }, options)));
          if (crossBrace && col > 0) {
            bodyC = bodies[(col - 1) + ((row - 1) * columns)];
            Composite.addConstraint(composite, Constraint.create(Common.extend({
              bodyA: bodyC,
              bodyB: bodyB
            }, options)));
          }
          if (crossBrace && col < columns - 1) {
            bodyC = bodies[(col + 1) + ((row - 1) * columns)];
            Composite.addConstraint(composite, Constraint.create(Common.extend({
              bodyA: bodyC,
              bodyB: bodyB
            }, options)));
          }
        }
      }
    }
    composite.label += ' Mesh';
    return composite;
  };
  Composites.pyramid = function(xx, yy, columns, rows, columnGap, rowGap, callback) {
    return Composites.stack(xx, yy, columns, rows, columnGap, rowGap, function(x, y, column, row, lastBody, i) {
      var actualRows = Math.min(rows, Math.ceil(columns / 2)),
          lastBodyWidth = lastBody ? lastBody.bounds.max.x - lastBody.bounds.min.x : 0;
      if (row > actualRows)
        return;
      row = actualRows - row;
      var start = row,
          end = columns - 1 - row;
      if (column < start || column > end)
        return;
      if (i === 1) {
        Body.translate(lastBody, {
          x: (column + (columns % 2 === 1 ? 1 : -1)) * lastBodyWidth,
          y: 0
        });
      }
      var xOffset = lastBody ? column * lastBodyWidth : 0;
      return callback(xx + xOffset + column * columnGap, y, column, row, lastBody, i);
    });
  };
  Composites.newtonsCradle = function(xx, yy, number, size, length) {
    var newtonsCradle = Composite.create({label: 'Newtons Cradle'});
    for (var i = 0; i < number; i++) {
      var separation = 1.9,
          circle = Bodies.circle(xx + i * (size * separation), yy + length, size, {
            inertia: Infinity,
            restitution: 1,
            friction: 0,
            frictionAir: 0.0001,
            slop: 1
          }),
          constraint = Constraint.create({
            pointA: {
              x: xx + i * (size * separation),
              y: yy
            },
            bodyB: circle
          });
      Composite.addBody(newtonsCradle, circle);
      Composite.addConstraint(newtonsCradle, constraint);
    }
    return newtonsCradle;
  };
  Composites.car = function(xx, yy, width, height, wheelSize) {
    var group = Body.nextGroup(true),
        wheelBase = -20,
        wheelAOffset = -width * 0.5 + wheelBase,
        wheelBOffset = width * 0.5 - wheelBase,
        wheelYOffset = 0;
    var car = Composite.create({label: 'Car'}),
        body = Bodies.trapezoid(xx, yy, width, height, 0.3, {
          collisionFilter: {group: group},
          friction: 0.01,
          chamfer: {radius: 10}
        });
    var wheelA = Bodies.circle(xx + wheelAOffset, yy + wheelYOffset, wheelSize, {
      collisionFilter: {group: group},
      friction: 0.8,
      density: 0.01
    });
    var wheelB = Bodies.circle(xx + wheelBOffset, yy + wheelYOffset, wheelSize, {
      collisionFilter: {group: group},
      friction: 0.8,
      density: 0.01
    });
    var axelA = Constraint.create({
      bodyA: body,
      pointA: {
        x: wheelAOffset,
        y: wheelYOffset
      },
      bodyB: wheelA,
      stiffness: 0.2
    });
    var axelB = Constraint.create({
      bodyA: body,
      pointA: {
        x: wheelBOffset,
        y: wheelYOffset
      },
      bodyB: wheelB,
      stiffness: 0.2
    });
    Composite.addBody(car, body);
    Composite.addBody(car, wheelA);
    Composite.addBody(car, wheelB);
    Composite.addConstraint(car, axelA);
    Composite.addConstraint(car, axelB);
    return car;
  };
  Composites.softBody = function(xx, yy, columns, rows, columnGap, rowGap, crossBrace, particleRadius, particleOptions, constraintOptions) {
    particleOptions = Common.extend({inertia: Infinity}, particleOptions);
    constraintOptions = Common.extend({stiffness: 0.4}, constraintOptions);
    var softBody = Composites.stack(xx, yy, columns, rows, columnGap, rowGap, function(x, y) {
      return Bodies.circle(x, y, particleRadius, particleOptions);
    });
    Composites.mesh(softBody, columns, rows, crossBrace, constraintOptions);
    softBody.label = 'Soft Body';
    return softBody;
  };
})();