/* */ 
var Composite = {};
module.exports = Composite;
var Events = require('../core/Events');
var Common = require('../core/Common');
var Body = require('./Body');
(function() {
  Composite.create = function(options) {
    return Common.extend({
      id: Common.nextId(),
      type: 'composite',
      parent: null,
      isModified: false,
      bodies: [],
      constraints: [],
      composites: [],
      label: 'Composite'
    }, options);
  };
  Composite.setModified = function(composite, isModified, updateParents, updateChildren) {
    composite.isModified = isModified;
    if (updateParents && composite.parent) {
      Composite.setModified(composite.parent, isModified, updateParents, updateChildren);
    }
    if (updateChildren) {
      for (var i = 0; i < composite.composites.length; i++) {
        var childComposite = composite.composites[i];
        Composite.setModified(childComposite, isModified, updateParents, updateChildren);
      }
    }
  };
  Composite.add = function(composite, object) {
    var objects = [].concat(object);
    Events.trigger(composite, 'beforeAdd', {object: object});
    for (var i = 0; i < objects.length; i++) {
      var obj = objects[i];
      switch (obj.type) {
        case 'body':
          if (obj.parent !== obj) {
            Common.log('Composite.add: skipped adding a compound body part (you must add its parent instead)', 'warn');
            break;
          }
          Composite.addBody(composite, obj);
          break;
        case 'constraint':
          Composite.addConstraint(composite, obj);
          break;
        case 'composite':
          Composite.addComposite(composite, obj);
          break;
        case 'mouseConstraint':
          Composite.addConstraint(composite, obj.constraint);
          break;
      }
    }
    Events.trigger(composite, 'afterAdd', {object: object});
    return composite;
  };
  Composite.remove = function(composite, object, deep) {
    var objects = [].concat(object);
    Events.trigger(composite, 'beforeRemove', {object: object});
    for (var i = 0; i < objects.length; i++) {
      var obj = objects[i];
      switch (obj.type) {
        case 'body':
          Composite.removeBody(composite, obj, deep);
          break;
        case 'constraint':
          Composite.removeConstraint(composite, obj, deep);
          break;
        case 'composite':
          Composite.removeComposite(composite, obj, deep);
          break;
        case 'mouseConstraint':
          Composite.removeConstraint(composite, obj.constraint);
          break;
      }
    }
    Events.trigger(composite, 'afterRemove', {object: object});
    return composite;
  };
  Composite.addComposite = function(compositeA, compositeB) {
    compositeA.composites.push(compositeB);
    compositeB.parent = compositeA;
    Composite.setModified(compositeA, true, true, false);
    return compositeA;
  };
  Composite.removeComposite = function(compositeA, compositeB, deep) {
    var position = Common.indexOf(compositeA.composites, compositeB);
    if (position !== -1) {
      Composite.removeCompositeAt(compositeA, position);
      Composite.setModified(compositeA, true, true, false);
    }
    if (deep) {
      for (var i = 0; i < compositeA.composites.length; i++) {
        Composite.removeComposite(compositeA.composites[i], compositeB, true);
      }
    }
    return compositeA;
  };
  Composite.removeCompositeAt = function(composite, position) {
    composite.composites.splice(position, 1);
    Composite.setModified(composite, true, true, false);
    return composite;
  };
  Composite.addBody = function(composite, body) {
    composite.bodies.push(body);
    Composite.setModified(composite, true, true, false);
    return composite;
  };
  Composite.removeBody = function(composite, body, deep) {
    var position = Common.indexOf(composite.bodies, body);
    if (position !== -1) {
      Composite.removeBodyAt(composite, position);
      Composite.setModified(composite, true, true, false);
    }
    if (deep) {
      for (var i = 0; i < composite.composites.length; i++) {
        Composite.removeBody(composite.composites[i], body, true);
      }
    }
    return composite;
  };
  Composite.removeBodyAt = function(composite, position) {
    composite.bodies.splice(position, 1);
    Composite.setModified(composite, true, true, false);
    return composite;
  };
  Composite.addConstraint = function(composite, constraint) {
    composite.constraints.push(constraint);
    Composite.setModified(composite, true, true, false);
    return composite;
  };
  Composite.removeConstraint = function(composite, constraint, deep) {
    var position = Common.indexOf(composite.constraints, constraint);
    if (position !== -1) {
      Composite.removeConstraintAt(composite, position);
    }
    if (deep) {
      for (var i = 0; i < composite.composites.length; i++) {
        Composite.removeConstraint(composite.composites[i], constraint, true);
      }
    }
    return composite;
  };
  Composite.removeConstraintAt = function(composite, position) {
    composite.constraints.splice(position, 1);
    Composite.setModified(composite, true, true, false);
    return composite;
  };
  Composite.clear = function(composite, keepStatic, deep) {
    if (deep) {
      for (var i = 0; i < composite.composites.length; i++) {
        Composite.clear(composite.composites[i], keepStatic, true);
      }
    }
    if (keepStatic) {
      composite.bodies = composite.bodies.filter(function(body) {
        return body.isStatic;
      });
    } else {
      composite.bodies.length = 0;
    }
    composite.constraints.length = 0;
    composite.composites.length = 0;
    Composite.setModified(composite, true, true, false);
    return composite;
  };
  Composite.allBodies = function(composite) {
    var bodies = [].concat(composite.bodies);
    for (var i = 0; i < composite.composites.length; i++)
      bodies = bodies.concat(Composite.allBodies(composite.composites[i]));
    return bodies;
  };
  Composite.allConstraints = function(composite) {
    var constraints = [].concat(composite.constraints);
    for (var i = 0; i < composite.composites.length; i++)
      constraints = constraints.concat(Composite.allConstraints(composite.composites[i]));
    return constraints;
  };
  Composite.allComposites = function(composite) {
    var composites = [].concat(composite.composites);
    for (var i = 0; i < composite.composites.length; i++)
      composites = composites.concat(Composite.allComposites(composite.composites[i]));
    return composites;
  };
  Composite.get = function(composite, id, type) {
    var objects,
        object;
    switch (type) {
      case 'body':
        objects = Composite.allBodies(composite);
        break;
      case 'constraint':
        objects = Composite.allConstraints(composite);
        break;
      case 'composite':
        objects = Composite.allComposites(composite).concat(composite);
        break;
    }
    if (!objects)
      return null;
    object = objects.filter(function(object) {
      return object.id.toString() === id.toString();
    });
    return object.length === 0 ? null : object[0];
  };
  Composite.move = function(compositeA, objects, compositeB) {
    Composite.remove(compositeA, objects);
    Composite.add(compositeB, objects);
    return compositeA;
  };
  Composite.rebase = function(composite) {
    var objects = Composite.allBodies(composite).concat(Composite.allConstraints(composite)).concat(Composite.allComposites(composite));
    for (var i = 0; i < objects.length; i++) {
      objects[i].id = Common.nextId();
    }
    Composite.setModified(composite, true, true, false);
    return composite;
  };
  Composite.translate = function(composite, translation, recursive) {
    var bodies = recursive ? Composite.allBodies(composite) : composite.bodies;
    for (var i = 0; i < bodies.length; i++) {
      Body.translate(bodies[i], translation);
    }
    Composite.setModified(composite, true, true, false);
    return composite;
  };
  Composite.rotate = function(composite, rotation, point, recursive) {
    var cos = Math.cos(rotation),
        sin = Math.sin(rotation),
        bodies = recursive ? Composite.allBodies(composite) : composite.bodies;
    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i],
          dx = body.position.x - point.x,
          dy = body.position.y - point.y;
      Body.setPosition(body, {
        x: point.x + (dx * cos - dy * sin),
        y: point.y + (dx * sin + dy * cos)
      });
      Body.rotate(body, rotation);
    }
    Composite.setModified(composite, true, true, false);
    return composite;
  };
  Composite.scale = function(composite, scaleX, scaleY, point, recursive) {
    var bodies = recursive ? Composite.allBodies(composite) : composite.bodies;
    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i],
          dx = body.position.x - point.x,
          dy = body.position.y - point.y;
      Body.setPosition(body, {
        x: point.x + dx * scaleX,
        y: point.y + dy * scaleY
      });
      Body.scale(body, scaleX, scaleY);
    }
    Composite.setModified(composite, true, true, false);
    return composite;
  };
})();
