/* */ 
var Pair = {};
module.exports = Pair;
var Contact = require('./Contact');
(function() {
  Pair.create = function(collision, timestamp) {
    var bodyA = collision.bodyA,
        bodyB = collision.bodyB,
        parentA = collision.parentA,
        parentB = collision.parentB;
    var pair = {
      id: Pair.id(bodyA, bodyB),
      bodyA: bodyA,
      bodyB: bodyB,
      contacts: {},
      activeContacts: [],
      separation: 0,
      isActive: true,
      isSensor: bodyA.isSensor || bodyB.isSensor,
      timeCreated: timestamp,
      timeUpdated: timestamp,
      inverseMass: parentA.inverseMass + parentB.inverseMass,
      friction: Math.min(parentA.friction, parentB.friction),
      frictionStatic: Math.max(parentA.frictionStatic, parentB.frictionStatic),
      restitution: Math.max(parentA.restitution, parentB.restitution),
      slop: Math.max(parentA.slop, parentB.slop)
    };
    Pair.update(pair, collision, timestamp);
    return pair;
  };
  Pair.update = function(pair, collision, timestamp) {
    var contacts = pair.contacts,
        supports = collision.supports,
        activeContacts = pair.activeContacts,
        parentA = collision.parentA,
        parentB = collision.parentB;
    pair.collision = collision;
    pair.inverseMass = parentA.inverseMass + parentB.inverseMass;
    pair.friction = Math.min(parentA.friction, parentB.friction);
    pair.frictionStatic = Math.max(parentA.frictionStatic, parentB.frictionStatic);
    pair.restitution = Math.max(parentA.restitution, parentB.restitution);
    pair.slop = Math.max(parentA.slop, parentB.slop);
    activeContacts.length = 0;
    if (collision.collided) {
      for (var i = 0; i < supports.length; i++) {
        var support = supports[i],
            contactId = Contact.id(support),
            contact = contacts[contactId];
        if (contact) {
          activeContacts.push(contact);
        } else {
          activeContacts.push(contacts[contactId] = Contact.create(support));
        }
      }
      pair.separation = collision.depth;
      Pair.setActive(pair, true, timestamp);
    } else {
      if (pair.isActive === true)
        Pair.setActive(pair, false, timestamp);
    }
  };
  Pair.setActive = function(pair, isActive, timestamp) {
    if (isActive) {
      pair.isActive = true;
      pair.timeUpdated = timestamp;
    } else {
      pair.isActive = false;
      pair.activeContacts.length = 0;
    }
  };
  Pair.id = function(bodyA, bodyB) {
    if (bodyA.id < bodyB.id) {
      return bodyA.id + '_' + bodyB.id;
    } else {
      return bodyB.id + '_' + bodyA.id;
    }
  };
})();
