/* */ 
var Body = {};
module.exports = Body;
var Vertices = require('../geometry/Vertices');
var Vector = require('../geometry/Vector');
var Sleeping = require('../core/Sleeping');
var Render = require('../render/Render');
var Common = require('../core/Common');
var Bounds = require('../geometry/Bounds');
var Axes = require('../geometry/Axes');
(function() {
  Body._inertiaScale = 4;
  Body._nextCollidingGroupId = 1;
  Body._nextNonCollidingGroupId = -1;
  Body._nextCategory = 0x0001;
  Body.create = function(options) {
    var defaults = {
      id: Common.nextId(),
      type: 'body',
      label: 'Body',
      parts: [],
      angle: 0,
      vertices: Vertices.fromPath('L 0 0 L 40 0 L 40 40 L 0 40'),
      position: {
        x: 0,
        y: 0
      },
      force: {
        x: 0,
        y: 0
      },
      torque: 0,
      positionImpulse: {
        x: 0,
        y: 0
      },
      constraintImpulse: {
        x: 0,
        y: 0,
        angle: 0
      },
      totalContacts: 0,
      speed: 0,
      angularSpeed: 0,
      velocity: {
        x: 0,
        y: 0
      },
      angularVelocity: 0,
      isSensor: false,
      isStatic: false,
      isSleeping: false,
      motion: 0,
      sleepThreshold: 60,
      density: 0.001,
      restitution: 0,
      friction: 0.1,
      frictionStatic: 0.5,
      frictionAir: 0.01,
      collisionFilter: {
        category: 0x0001,
        mask: 0xFFFFFFFF,
        group: 0
      },
      slop: 0.05,
      timeScale: 1,
      render: {
        visible: true,
        opacity: 1,
        sprite: {
          xScale: 1,
          yScale: 1,
          xOffset: 0,
          yOffset: 0
        },
        lineWidth: 1.5
      }
    };
    var body = Common.extend(defaults, options);
    _initProperties(body, options);
    return body;
  };
  Body.nextGroup = function(isNonColliding) {
    if (isNonColliding)
      return Body._nextNonCollidingGroupId--;
    return Body._nextCollidingGroupId++;
  };
  Body.nextCategory = function() {
    Body._nextCategory = Body._nextCategory << 1;
    return Body._nextCategory;
  };
  var _initProperties = function(body, options) {
    Body.set(body, {
      bounds: body.bounds || Bounds.create(body.vertices),
      positionPrev: body.positionPrev || Vector.clone(body.position),
      anglePrev: body.anglePrev || body.angle,
      vertices: body.vertices,
      parts: body.parts || [body],
      isStatic: body.isStatic,
      isSleeping: body.isSleeping,
      parent: body.parent || body
    });
    Vertices.rotate(body.vertices, body.angle, body.position);
    Axes.rotate(body.axes, body.angle);
    Bounds.update(body.bounds, body.vertices, body.velocity);
    Body.set(body, {
      axes: options.axes || body.axes,
      area: options.area || body.area,
      mass: options.mass || body.mass,
      inertia: options.inertia || body.inertia
    });
    var defaultFillStyle = (body.isStatic ? '#eeeeee' : Common.choose(['#556270', '#4ECDC4', '#C7F464', '#FF6B6B', '#C44D58'])),
        defaultStrokeStyle = Common.shadeColor(defaultFillStyle, -20);
    body.render.fillStyle = body.render.fillStyle || defaultFillStyle;
    body.render.strokeStyle = body.render.strokeStyle || defaultStrokeStyle;
    body.render.sprite.xOffset += -(body.bounds.min.x - body.position.x) / (body.bounds.max.x - body.bounds.min.x);
    body.render.sprite.yOffset += -(body.bounds.min.y - body.position.y) / (body.bounds.max.y - body.bounds.min.y);
  };
  Body.set = function(body, settings, value) {
    var property;
    if (typeof settings === 'string') {
      property = settings;
      settings = {};
      settings[property] = value;
    }
    for (property in settings) {
      value = settings[property];
      if (!settings.hasOwnProperty(property))
        continue;
      switch (property) {
        case 'isStatic':
          Body.setStatic(body, value);
          break;
        case 'isSleeping':
          Sleeping.set(body, value);
          break;
        case 'mass':
          Body.setMass(body, value);
          break;
        case 'density':
          Body.setDensity(body, value);
          break;
        case 'inertia':
          Body.setInertia(body, value);
          break;
        case 'vertices':
          Body.setVertices(body, value);
          break;
        case 'position':
          Body.setPosition(body, value);
          break;
        case 'angle':
          Body.setAngle(body, value);
          break;
        case 'velocity':
          Body.setVelocity(body, value);
          break;
        case 'angularVelocity':
          Body.setAngularVelocity(body, value);
          break;
        case 'parts':
          Body.setParts(body, value);
          break;
        default:
          body[property] = value;
      }
    }
  };
  Body.setStatic = function(body, isStatic) {
    for (var i = 0; i < body.parts.length; i++) {
      var part = body.parts[i];
      part.isStatic = isStatic;
      if (isStatic) {
        part.restitution = 0;
        part.friction = 1;
        part.mass = part.inertia = part.density = Infinity;
        part.inverseMass = part.inverseInertia = 0;
        part.positionPrev.x = part.position.x;
        part.positionPrev.y = part.position.y;
        part.anglePrev = part.angle;
        part.angularVelocity = 0;
        part.speed = 0;
        part.angularSpeed = 0;
        part.motion = 0;
      }
    }
  };
  Body.setMass = function(body, mass) {
    body.mass = mass;
    body.inverseMass = 1 / body.mass;
    body.density = body.mass / body.area;
  };
  Body.setDensity = function(body, density) {
    Body.setMass(body, density * body.area);
    body.density = density;
  };
  Body.setInertia = function(body, inertia) {
    body.inertia = inertia;
    body.inverseInertia = 1 / body.inertia;
  };
  Body.setVertices = function(body, vertices) {
    if (vertices[0].body === body) {
      body.vertices = vertices;
    } else {
      body.vertices = Vertices.create(vertices, body);
    }
    body.axes = Axes.fromVertices(body.vertices);
    body.area = Vertices.area(body.vertices);
    Body.setMass(body, body.density * body.area);
    var centre = Vertices.centre(body.vertices);
    Vertices.translate(body.vertices, centre, -1);
    Body.setInertia(body, Body._inertiaScale * Vertices.inertia(body.vertices, body.mass));
    Vertices.translate(body.vertices, body.position);
    Bounds.update(body.bounds, body.vertices, body.velocity);
  };
  Body.setParts = function(body, parts, autoHull) {
    var i;
    parts = parts.slice(0);
    body.parts.length = 0;
    body.parts.push(body);
    body.parent = body;
    for (i = 0; i < parts.length; i++) {
      var part = parts[i];
      if (part !== body) {
        part.parent = body;
        body.parts.push(part);
      }
    }
    if (body.parts.length === 1)
      return;
    autoHull = typeof autoHull !== 'undefined' ? autoHull : true;
    if (autoHull) {
      var vertices = [];
      for (i = 0; i < parts.length; i++) {
        vertices = vertices.concat(parts[i].vertices);
      }
      Vertices.clockwiseSort(vertices);
      var hull = Vertices.hull(vertices),
          hullCentre = Vertices.centre(hull);
      Body.setVertices(body, hull);
      Vertices.translate(body.vertices, hullCentre);
    }
    var total = _totalProperties(body);
    body.area = total.area;
    body.parent = body;
    body.position.x = total.centre.x;
    body.position.y = total.centre.y;
    body.positionPrev.x = total.centre.x;
    body.positionPrev.y = total.centre.y;
    Body.setMass(body, total.mass);
    Body.setInertia(body, total.inertia);
    Body.setPosition(body, total.centre);
  };
  Body.setPosition = function(body, position) {
    var delta = Vector.sub(position, body.position);
    body.positionPrev.x += delta.x;
    body.positionPrev.y += delta.y;
    for (var i = 0; i < body.parts.length; i++) {
      var part = body.parts[i];
      part.position.x += delta.x;
      part.position.y += delta.y;
      Vertices.translate(part.vertices, delta);
      Bounds.update(part.bounds, part.vertices, body.velocity);
    }
  };
  Body.setAngle = function(body, angle) {
    var delta = angle - body.angle;
    body.anglePrev += delta;
    for (var i = 0; i < body.parts.length; i++) {
      var part = body.parts[i];
      part.angle += delta;
      Vertices.rotate(part.vertices, delta, body.position);
      Axes.rotate(part.axes, delta);
      Bounds.update(part.bounds, part.vertices, body.velocity);
      if (i > 0) {
        Vector.rotateAbout(part.position, delta, body.position, part.position);
      }
    }
  };
  Body.setVelocity = function(body, velocity) {
    body.positionPrev.x = body.position.x - velocity.x;
    body.positionPrev.y = body.position.y - velocity.y;
    body.velocity.x = velocity.x;
    body.velocity.y = velocity.y;
    body.speed = Vector.magnitude(body.velocity);
  };
  Body.setAngularVelocity = function(body, velocity) {
    body.anglePrev = body.angle - velocity;
    body.angularVelocity = velocity;
    body.angularSpeed = Math.abs(body.angularVelocity);
  };
  Body.translate = function(body, translation) {
    Body.setPosition(body, Vector.add(body.position, translation));
  };
  Body.rotate = function(body, rotation) {
    Body.setAngle(body, body.angle + rotation);
  };
  Body.scale = function(body, scaleX, scaleY, point) {
    for (var i = 0; i < body.parts.length; i++) {
      var part = body.parts[i];
      Vertices.scale(part.vertices, scaleX, scaleY, body.position);
      part.axes = Axes.fromVertices(part.vertices);
      if (!body.isStatic) {
        part.area = Vertices.area(part.vertices);
        Body.setMass(part, body.density * part.area);
        Vertices.translate(part.vertices, {
          x: -part.position.x,
          y: -part.position.y
        });
        Body.setInertia(part, Vertices.inertia(part.vertices, part.mass));
        Vertices.translate(part.vertices, {
          x: part.position.x,
          y: part.position.y
        });
      }
      Bounds.update(part.bounds, part.vertices, body.velocity);
    }
    if (body.circleRadius) {
      if (scaleX === scaleY) {
        body.circleRadius *= scaleX;
      } else {
        body.circleRadius = null;
      }
    }
    if (!body.isStatic) {
      var total = _totalProperties(body);
      body.area = total.area;
      Body.setMass(body, total.mass);
      Body.setInertia(body, total.inertia);
    }
  };
  Body.update = function(body, deltaTime, timeScale, correction) {
    var deltaTimeSquared = Math.pow(deltaTime * timeScale * body.timeScale, 2);
    var frictionAir = 1 - body.frictionAir * timeScale * body.timeScale,
        velocityPrevX = body.position.x - body.positionPrev.x,
        velocityPrevY = body.position.y - body.positionPrev.y;
    body.velocity.x = (velocityPrevX * frictionAir * correction) + (body.force.x / body.mass) * deltaTimeSquared;
    body.velocity.y = (velocityPrevY * frictionAir * correction) + (body.force.y / body.mass) * deltaTimeSquared;
    body.positionPrev.x = body.position.x;
    body.positionPrev.y = body.position.y;
    body.position.x += body.velocity.x;
    body.position.y += body.velocity.y;
    body.angularVelocity = ((body.angle - body.anglePrev) * frictionAir * correction) + (body.torque / body.inertia) * deltaTimeSquared;
    body.anglePrev = body.angle;
    body.angle += body.angularVelocity;
    body.speed = Vector.magnitude(body.velocity);
    body.angularSpeed = Math.abs(body.angularVelocity);
    for (var i = 0; i < body.parts.length; i++) {
      var part = body.parts[i];
      Vertices.translate(part.vertices, body.velocity);
      if (i > 0) {
        part.position.x += body.velocity.x;
        part.position.y += body.velocity.y;
      }
      if (body.angularVelocity !== 0) {
        Vertices.rotate(part.vertices, body.angularVelocity, body.position);
        Axes.rotate(part.axes, body.angularVelocity);
        if (i > 0) {
          Vector.rotateAbout(part.position, body.angularVelocity, body.position, part.position);
        }
      }
      Bounds.update(part.bounds, part.vertices, body.velocity);
    }
  };
  Body.applyForce = function(body, position, force) {
    body.force.x += force.x;
    body.force.y += force.y;
    var offset = {
      x: position.x - body.position.x,
      y: position.y - body.position.y
    };
    body.torque += offset.x * force.y - offset.y * force.x;
  };
  var _totalProperties = function(body) {
    var properties = {
      mass: 0,
      area: 0,
      inertia: 0,
      centre: {
        x: 0,
        y: 0
      }
    };
    for (var i = body.parts.length === 1 ? 0 : 1; i < body.parts.length; i++) {
      var part = body.parts[i];
      properties.mass += part.mass;
      properties.area += part.area;
      properties.inertia += part.inertia;
      properties.centre = Vector.add(properties.centre, Vector.mult(part.position, part.mass !== Infinity ? part.mass : 1));
    }
    properties.centre = Vector.div(properties.centre, properties.mass !== Infinity ? properties.mass : body.parts.length);
    return properties;
  };
})();
