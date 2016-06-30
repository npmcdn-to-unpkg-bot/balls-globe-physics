/* */ 
var Render = {};
module.exports = Render;
var Common = require('../core/Common');
var Composite = require('../body/Composite');
var Bounds = require('../geometry/Bounds');
var Events = require('../core/Events');
var Grid = require('../collision/Grid');
var Vector = require('../geometry/Vector');
(function() {
  var _requestAnimationFrame,
      _cancelAnimationFrame;
  if (typeof window !== 'undefined') {
    _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
      window.setTimeout(function() {
        callback(Common.now());
      }, 1000 / 60);
    };
    _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
  }
  Render.create = function(options) {
    var defaults = {
      controller: Render,
      engine: null,
      element: null,
      canvas: null,
      mouse: null,
      frameRequestId: null,
      options: {
        width: 800,
        height: 600,
        pixelRatio: 1,
        background: '#fafafa',
        wireframeBackground: '#222',
        hasBounds: !!options.bounds,
        enabled: true,
        wireframes: true,
        showSleeping: true,
        showDebug: false,
        showBroadphase: false,
        showBounds: false,
        showVelocity: false,
        showCollisions: false,
        showSeparations: false,
        showAxes: false,
        showPositions: false,
        showAngleIndicator: false,
        showIds: false,
        showShadows: false,
        showVertexNumbers: false,
        showConvexHulls: false,
        showInternalEdges: false,
        showMousePosition: false
      }
    };
    var render = Common.extend(defaults, options);
    if (render.canvas) {
      render.canvas.width = render.options.width || render.canvas.width;
      render.canvas.height = render.options.height || render.canvas.height;
    }
    render.mouse = options.mouse;
    render.engine = options.engine;
    render.canvas = render.canvas || _createCanvas(render.options.width, render.options.height);
    render.context = render.canvas.getContext('2d');
    render.textures = {};
    render.bounds = render.bounds || {
      min: {
        x: 0,
        y: 0
      },
      max: {
        x: render.canvas.width,
        y: render.canvas.height
      }
    };
    if (render.options.pixelRatio !== 1) {
      Render.setPixelRatio(render, render.options.pixelRatio);
    }
    if (Common.isElement(render.element)) {
      render.element.appendChild(render.canvas);
    } else {
      Common.log('Render.create: options.element was undefined, render.canvas was created but not appended', 'warn');
    }
    return render;
  };
  Render.run = function(render) {
    (function loop(time) {
      render.frameRequestId = _requestAnimationFrame(loop);
      Render.world(render);
    })();
  };
  Render.stop = function(render) {
    _cancelAnimationFrame(render.frameRequestId);
  };
  Render.setPixelRatio = function(render, pixelRatio) {
    var options = render.options,
        canvas = render.canvas;
    if (pixelRatio === 'auto') {
      pixelRatio = _getPixelRatio(canvas);
    }
    options.pixelRatio = pixelRatio;
    canvas.setAttribute('data-pixel-ratio', pixelRatio);
    canvas.width = options.width * pixelRatio;
    canvas.height = options.height * pixelRatio;
    canvas.style.width = options.width + 'px';
    canvas.style.height = options.height + 'px';
    render.context.scale(pixelRatio, pixelRatio);
  };
  Render.world = function(render) {
    var engine = render.engine,
        world = engine.world,
        canvas = render.canvas,
        context = render.context,
        options = render.options,
        allBodies = Composite.allBodies(world),
        allConstraints = Composite.allConstraints(world),
        background = options.wireframes ? options.wireframeBackground : options.background,
        bodies = [],
        constraints = [],
        i;
    var event = {timestamp: engine.timing.timestamp};
    Events.trigger(render, 'beforeRender', event);
    if (render.currentBackground !== background)
      _applyBackground(render, background);
    context.globalCompositeOperation = 'source-in';
    context.fillStyle = "transparent";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = 'source-over';
    if (options.hasBounds) {
      var boundsWidth = render.bounds.max.x - render.bounds.min.x,
          boundsHeight = render.bounds.max.y - render.bounds.min.y,
          boundsScaleX = boundsWidth / options.width,
          boundsScaleY = boundsHeight / options.height;
      for (i = 0; i < allBodies.length; i++) {
        var body = allBodies[i];
        if (Bounds.overlaps(body.bounds, render.bounds))
          bodies.push(body);
      }
      for (i = 0; i < allConstraints.length; i++) {
        var constraint = allConstraints[i],
            bodyA = constraint.bodyA,
            bodyB = constraint.bodyB,
            pointAWorld = constraint.pointA,
            pointBWorld = constraint.pointB;
        if (bodyA)
          pointAWorld = Vector.add(bodyA.position, constraint.pointA);
        if (bodyB)
          pointBWorld = Vector.add(bodyB.position, constraint.pointB);
        if (!pointAWorld || !pointBWorld)
          continue;
        if (Bounds.contains(render.bounds, pointAWorld) || Bounds.contains(render.bounds, pointBWorld))
          constraints.push(constraint);
      }
      context.scale(1 / boundsScaleX, 1 / boundsScaleY);
      context.translate(-render.bounds.min.x, -render.bounds.min.y);
    } else {
      constraints = allConstraints;
      bodies = allBodies;
    }
    if (!options.wireframes || (engine.enableSleeping && options.showSleeping)) {
      Render.bodies(render, bodies, context);
    } else {
      if (options.showConvexHulls)
        Render.bodyConvexHulls(render, bodies, context);
      Render.bodyWireframes(render, bodies, context);
    }
    if (options.showBounds)
      Render.bodyBounds(render, bodies, context);
    if (options.showAxes || options.showAngleIndicator)
      Render.bodyAxes(render, bodies, context);
    if (options.showPositions)
      Render.bodyPositions(render, bodies, context);
    if (options.showVelocity)
      Render.bodyVelocity(render, bodies, context);
    if (options.showIds)
      Render.bodyIds(render, bodies, context);
    if (options.showSeparations)
      Render.separations(render, engine.pairs.list, context);
    if (options.showCollisions)
      Render.collisions(render, engine.pairs.list, context);
    if (options.showVertexNumbers)
      Render.vertexNumbers(render, bodies, context);
    if (options.showMousePosition)
      Render.mousePosition(render, render.mouse, context);
    Render.constraints(constraints, context);
    if (options.showBroadphase && engine.broadphase.controller === Grid)
      Render.grid(render, engine.broadphase, context);
    if (options.showDebug)
      Render.debug(render, context);
    if (options.hasBounds) {
      context.setTransform(options.pixelRatio, 0, 0, options.pixelRatio, 0, 0);
    }
    Events.trigger(render, 'afterRender', event);
  };
  Render.debug = function(render, context) {
    var c = context,
        engine = render.engine,
        world = engine.world,
        metrics = engine.metrics,
        options = render.options,
        bodies = Composite.allBodies(world),
        space = "    ";
    if (engine.timing.timestamp - (render.debugTimestamp || 0) >= 500) {
      var text = "";
      if (metrics.timing) {
        text += "fps: " + Math.round(metrics.timing.fps) + space;
      }
      if (metrics.extended) {
        if (metrics.timing) {
          text += "delta: " + metrics.timing.delta.toFixed(3) + space;
          text += "correction: " + metrics.timing.correction.toFixed(3) + space;
        }
        text += "bodies: " + bodies.length + space;
        if (engine.broadphase.controller === Grid)
          text += "buckets: " + metrics.buckets + space;
        text += "\n";
        text += "collisions: " + metrics.collisions + space;
        text += "pairs: " + engine.pairs.list.length + space;
        text += "broad: " + metrics.broadEff + space;
        text += "mid: " + metrics.midEff + space;
        text += "narrow: " + metrics.narrowEff + space;
      }
      render.debugString = text;
      render.debugTimestamp = engine.timing.timestamp;
    }
    if (render.debugString) {
      c.font = "12px Arial";
      if (options.wireframes) {
        c.fillStyle = 'rgba(255,255,255,0.5)';
      } else {
        c.fillStyle = 'rgba(0,0,0,0.5)';
      }
      var split = render.debugString.split('\n');
      for (var i = 0; i < split.length; i++) {
        c.fillText(split[i], 50, 50 + i * 18);
      }
    }
  };
  Render.constraints = function(constraints, context) {
    var c = context;
    for (var i = 0; i < constraints.length; i++) {
      var constraint = constraints[i];
      if (!constraint.render.visible || !constraint.pointA || !constraint.pointB)
        continue;
      var bodyA = constraint.bodyA,
          bodyB = constraint.bodyB;
      if (bodyA) {
        c.beginPath();
        c.moveTo(bodyA.position.x + constraint.pointA.x, bodyA.position.y + constraint.pointA.y);
      } else {
        c.beginPath();
        c.moveTo(constraint.pointA.x, constraint.pointA.y);
      }
      if (bodyB) {
        c.lineTo(bodyB.position.x + constraint.pointB.x, bodyB.position.y + constraint.pointB.y);
      } else {
        c.lineTo(constraint.pointB.x, constraint.pointB.y);
      }
      c.lineWidth = constraint.render.lineWidth;
      c.strokeStyle = constraint.render.strokeStyle;
      c.stroke();
    }
  };
  Render.bodyShadows = function(render, bodies, context) {
    var c = context,
        engine = render.engine;
    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      if (!body.render.visible)
        continue;
      if (body.circleRadius) {
        c.beginPath();
        c.arc(body.position.x, body.position.y, body.circleRadius, 0, 2 * Math.PI);
        c.closePath();
      } else {
        c.beginPath();
        c.moveTo(body.vertices[0].x, body.vertices[0].y);
        for (var j = 1; j < body.vertices.length; j++) {
          c.lineTo(body.vertices[j].x, body.vertices[j].y);
        }
        c.closePath();
      }
      var distanceX = body.position.x - render.options.width * 0.5,
          distanceY = body.position.y - render.options.height * 0.2,
          distance = Math.abs(distanceX) + Math.abs(distanceY);
      c.shadowColor = 'rgba(0,0,0,0.15)';
      c.shadowOffsetX = 0.05 * distanceX;
      c.shadowOffsetY = 0.05 * distanceY;
      c.shadowBlur = 1 + 12 * Math.min(1, distance / 1000);
      c.fill();
      c.shadowColor = null;
      c.shadowOffsetX = null;
      c.shadowOffsetY = null;
      c.shadowBlur = null;
    }
  };
  Render.bodies = function(render, bodies, context) {
    var c = context,
        engine = render.engine,
        options = render.options,
        showInternalEdges = options.showInternalEdges || !options.wireframes,
        body,
        part,
        i,
        k;
    for (i = 0; i < bodies.length; i++) {
      body = bodies[i];
      if (!body.render.visible)
        continue;
      for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
        part = body.parts[k];
        if (!part.render.visible)
          continue;
        if (options.showSleeping && body.isSleeping) {
          c.globalAlpha = 0.5 * part.render.opacity;
        } else if (part.render.opacity !== 1) {
          c.globalAlpha = part.render.opacity;
        }
        if (part.render.sprite && part.render.sprite.texture && !options.wireframes) {
          var sprite = part.render.sprite,
              texture = _getTexture(render, sprite.texture);
          c.translate(part.position.x, part.position.y);
          c.rotate(part.angle);
          c.drawImage(texture, texture.width * -sprite.xOffset * sprite.xScale, texture.height * -sprite.yOffset * sprite.yScale, texture.width * sprite.xScale, texture.height * sprite.yScale);
          c.rotate(-part.angle);
          c.translate(-part.position.x, -part.position.y);
        } else {
          if (part.circleRadius) {
            c.beginPath();
            c.arc(part.position.x, part.position.y, part.circleRadius, 0, 2 * Math.PI);
          } else {
            c.beginPath();
            c.moveTo(part.vertices[0].x, part.vertices[0].y);
            for (var j = 1; j < part.vertices.length; j++) {
              if (!part.vertices[j - 1].isInternal || showInternalEdges) {
                c.lineTo(part.vertices[j].x, part.vertices[j].y);
              } else {
                c.moveTo(part.vertices[j].x, part.vertices[j].y);
              }
              if (part.vertices[j].isInternal && !showInternalEdges) {
                c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
              }
            }
            c.lineTo(part.vertices[0].x, part.vertices[0].y);
            c.closePath();
          }
          if (!options.wireframes) {
            c.fillStyle = part.render.fillStyle;
            c.lineWidth = part.render.lineWidth;
            c.strokeStyle = part.render.strokeStyle;
            c.fill();
          } else {
            c.lineWidth = 1;
            c.strokeStyle = '#bbb';
          }
          c.stroke();
        }
        c.globalAlpha = 1;
      }
    }
  };
  Render.bodyWireframes = function(render, bodies, context) {
    var c = context,
        showInternalEdges = render.options.showInternalEdges,
        body,
        part,
        i,
        j,
        k;
    c.beginPath();
    for (i = 0; i < bodies.length; i++) {
      body = bodies[i];
      if (!body.render.visible)
        continue;
      for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
        part = body.parts[k];
        c.moveTo(part.vertices[0].x, part.vertices[0].y);
        for (j = 1; j < part.vertices.length; j++) {
          if (!part.vertices[j - 1].isInternal || showInternalEdges) {
            c.lineTo(part.vertices[j].x, part.vertices[j].y);
          } else {
            c.moveTo(part.vertices[j].x, part.vertices[j].y);
          }
          if (part.vertices[j].isInternal && !showInternalEdges) {
            c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
          }
        }
        c.lineTo(part.vertices[0].x, part.vertices[0].y);
      }
    }
    c.lineWidth = 1;
    c.strokeStyle = '#bbb';
    c.stroke();
  };
  Render.bodyConvexHulls = function(render, bodies, context) {
    var c = context,
        body,
        part,
        i,
        j,
        k;
    c.beginPath();
    for (i = 0; i < bodies.length; i++) {
      body = bodies[i];
      if (!body.render.visible || body.parts.length === 1)
        continue;
      c.moveTo(body.vertices[0].x, body.vertices[0].y);
      for (j = 1; j < body.vertices.length; j++) {
        c.lineTo(body.vertices[j].x, body.vertices[j].y);
      }
      c.lineTo(body.vertices[0].x, body.vertices[0].y);
    }
    c.lineWidth = 1;
    c.strokeStyle = 'rgba(255,255,255,0.2)';
    c.stroke();
  };
  Render.vertexNumbers = function(render, bodies, context) {
    var c = context,
        i,
        j,
        k;
    for (i = 0; i < bodies.length; i++) {
      var parts = bodies[i].parts;
      for (k = parts.length > 1 ? 1 : 0; k < parts.length; k++) {
        var part = parts[k];
        for (j = 0; j < part.vertices.length; j++) {
          c.fillStyle = 'rgba(255,255,255,0.2)';
          c.fillText(i + '_' + j, part.position.x + (part.vertices[j].x - part.position.x) * 0.8, part.position.y + (part.vertices[j].y - part.position.y) * 0.8);
        }
      }
    }
  };
  Render.mousePosition = function(render, mouse, context) {
    var c = context;
    c.fillStyle = 'rgba(255,255,255,0.8)';
    c.fillText(mouse.position.x + '  ' + mouse.position.y, mouse.position.x + 5, mouse.position.y - 5);
  };
  Render.bodyBounds = function(render, bodies, context) {
    var c = context,
        engine = render.engine,
        options = render.options;
    c.beginPath();
    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      if (body.render.visible) {
        var parts = bodies[i].parts;
        for (var j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
          var part = parts[j];
          c.rect(part.bounds.min.x, part.bounds.min.y, part.bounds.max.x - part.bounds.min.x, part.bounds.max.y - part.bounds.min.y);
        }
      }
    }
    if (options.wireframes) {
      c.strokeStyle = 'rgba(255,255,255,0.08)';
    } else {
      c.strokeStyle = 'rgba(0,0,0,0.1)';
    }
    c.lineWidth = 1;
    c.stroke();
  };
  Render.bodyAxes = function(render, bodies, context) {
    var c = context,
        engine = render.engine,
        options = render.options,
        part,
        i,
        j,
        k;
    c.beginPath();
    for (i = 0; i < bodies.length; i++) {
      var body = bodies[i],
          parts = body.parts;
      if (!body.render.visible)
        continue;
      if (options.showAxes) {
        for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
          part = parts[j];
          for (k = 0; k < part.axes.length; k++) {
            var axis = part.axes[k];
            c.moveTo(part.position.x, part.position.y);
            c.lineTo(part.position.x + axis.x * 20, part.position.y + axis.y * 20);
          }
        }
      } else {
        for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
          part = parts[j];
          for (k = 0; k < part.axes.length; k++) {
            c.moveTo(part.position.x, part.position.y);
            c.lineTo((part.vertices[0].x + part.vertices[part.vertices.length - 1].x) / 2, (part.vertices[0].y + part.vertices[part.vertices.length - 1].y) / 2);
          }
        }
      }
    }
    if (options.wireframes) {
      c.strokeStyle = 'indianred';
    } else {
      c.strokeStyle = 'rgba(0,0,0,0.8)';
      c.globalCompositeOperation = 'overlay';
    }
    c.lineWidth = 1;
    c.stroke();
    c.globalCompositeOperation = 'source-over';
  };
  Render.bodyPositions = function(render, bodies, context) {
    var c = context,
        engine = render.engine,
        options = render.options,
        body,
        part,
        i,
        k;
    c.beginPath();
    for (i = 0; i < bodies.length; i++) {
      body = bodies[i];
      if (!body.render.visible)
        continue;
      for (k = 0; k < body.parts.length; k++) {
        part = body.parts[k];
        c.arc(part.position.x, part.position.y, 3, 0, 2 * Math.PI, false);
        c.closePath();
      }
    }
    if (options.wireframes) {
      c.fillStyle = 'indianred';
    } else {
      c.fillStyle = 'rgba(0,0,0,0.5)';
    }
    c.fill();
    c.beginPath();
    for (i = 0; i < bodies.length; i++) {
      body = bodies[i];
      if (body.render.visible) {
        c.arc(body.positionPrev.x, body.positionPrev.y, 2, 0, 2 * Math.PI, false);
        c.closePath();
      }
    }
    c.fillStyle = 'rgba(255,165,0,0.8)';
    c.fill();
  };
  Render.bodyVelocity = function(render, bodies, context) {
    var c = context;
    c.beginPath();
    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      if (!body.render.visible)
        continue;
      c.moveTo(body.position.x, body.position.y);
      c.lineTo(body.position.x + (body.position.x - body.positionPrev.x) * 2, body.position.y + (body.position.y - body.positionPrev.y) * 2);
    }
    c.lineWidth = 3;
    c.strokeStyle = 'cornflowerblue';
    c.stroke();
  };
  Render.bodyIds = function(render, bodies, context) {
    var c = context,
        i,
        j;
    for (i = 0; i < bodies.length; i++) {
      if (!bodies[i].render.visible)
        continue;
      var parts = bodies[i].parts;
      for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
        var part = parts[j];
        c.font = "12px Arial";
        c.fillStyle = 'rgba(255,255,255,0.5)';
        c.fillText(part.id, part.position.x + 10, part.position.y - 10);
      }
    }
  };
  Render.collisions = function(render, pairs, context) {
    var c = context,
        options = render.options,
        pair,
        collision,
        corrected,
        bodyA,
        bodyB,
        i,
        j;
    c.beginPath();
    for (i = 0; i < pairs.length; i++) {
      pair = pairs[i];
      if (!pair.isActive)
        continue;
      collision = pair.collision;
      for (j = 0; j < pair.activeContacts.length; j++) {
        var contact = pair.activeContacts[j],
            vertex = contact.vertex;
        c.rect(vertex.x - 1.5, vertex.y - 1.5, 3.5, 3.5);
      }
    }
    if (options.wireframes) {
      c.fillStyle = 'rgba(255,255,255,0.7)';
    } else {
      c.fillStyle = 'orange';
    }
    c.fill();
    c.beginPath();
    for (i = 0; i < pairs.length; i++) {
      pair = pairs[i];
      if (!pair.isActive)
        continue;
      collision = pair.collision;
      if (pair.activeContacts.length > 0) {
        var normalPosX = pair.activeContacts[0].vertex.x,
            normalPosY = pair.activeContacts[0].vertex.y;
        if (pair.activeContacts.length === 2) {
          normalPosX = (pair.activeContacts[0].vertex.x + pair.activeContacts[1].vertex.x) / 2;
          normalPosY = (pair.activeContacts[0].vertex.y + pair.activeContacts[1].vertex.y) / 2;
        }
        if (collision.bodyB === collision.supports[0].body || collision.bodyA.isStatic === true) {
          c.moveTo(normalPosX - collision.normal.x * 8, normalPosY - collision.normal.y * 8);
        } else {
          c.moveTo(normalPosX + collision.normal.x * 8, normalPosY + collision.normal.y * 8);
        }
        c.lineTo(normalPosX, normalPosY);
      }
    }
    if (options.wireframes) {
      c.strokeStyle = 'rgba(255,165,0,0.7)';
    } else {
      c.strokeStyle = 'orange';
    }
    c.lineWidth = 1;
    c.stroke();
  };
  Render.separations = function(render, pairs, context) {
    var c = context,
        options = render.options,
        pair,
        collision,
        corrected,
        bodyA,
        bodyB,
        i,
        j;
    c.beginPath();
    for (i = 0; i < pairs.length; i++) {
      pair = pairs[i];
      if (!pair.isActive)
        continue;
      collision = pair.collision;
      bodyA = collision.bodyA;
      bodyB = collision.bodyB;
      var k = 1;
      if (!bodyB.isStatic && !bodyA.isStatic)
        k = 0.5;
      if (bodyB.isStatic)
        k = 0;
      c.moveTo(bodyB.position.x, bodyB.position.y);
      c.lineTo(bodyB.position.x - collision.penetration.x * k, bodyB.position.y - collision.penetration.y * k);
      k = 1;
      if (!bodyB.isStatic && !bodyA.isStatic)
        k = 0.5;
      if (bodyA.isStatic)
        k = 0;
      c.moveTo(bodyA.position.x, bodyA.position.y);
      c.lineTo(bodyA.position.x + collision.penetration.x * k, bodyA.position.y + collision.penetration.y * k);
    }
    if (options.wireframes) {
      c.strokeStyle = 'rgba(255,165,0,0.5)';
    } else {
      c.strokeStyle = 'orange';
    }
    c.stroke();
  };
  Render.grid = function(render, grid, context) {
    var c = context,
        options = render.options;
    if (options.wireframes) {
      c.strokeStyle = 'rgba(255,180,0,0.1)';
    } else {
      c.strokeStyle = 'rgba(255,180,0,0.5)';
    }
    c.beginPath();
    var bucketKeys = Common.keys(grid.buckets);
    for (var i = 0; i < bucketKeys.length; i++) {
      var bucketId = bucketKeys[i];
      if (grid.buckets[bucketId].length < 2)
        continue;
      var region = bucketId.split(',');
      c.rect(0.5 + parseInt(region[0], 10) * grid.bucketWidth, 0.5 + parseInt(region[1], 10) * grid.bucketHeight, grid.bucketWidth, grid.bucketHeight);
    }
    c.lineWidth = 1;
    c.stroke();
  };
  Render.inspector = function(inspector, context) {
    var engine = inspector.engine,
        selected = inspector.selected,
        render = inspector.render,
        options = render.options,
        bounds;
    if (options.hasBounds) {
      var boundsWidth = render.bounds.max.x - render.bounds.min.x,
          boundsHeight = render.bounds.max.y - render.bounds.min.y,
          boundsScaleX = boundsWidth / render.options.width,
          boundsScaleY = boundsHeight / render.options.height;
      context.scale(1 / boundsScaleX, 1 / boundsScaleY);
      context.translate(-render.bounds.min.x, -render.bounds.min.y);
    }
    for (var i = 0; i < selected.length; i++) {
      var item = selected[i].data;
      context.translate(0.5, 0.5);
      context.lineWidth = 1;
      context.strokeStyle = 'rgba(255,165,0,0.9)';
      context.setLineDash([1, 2]);
      switch (item.type) {
        case 'body':
          bounds = item.bounds;
          context.beginPath();
          context.rect(Math.floor(bounds.min.x - 3), Math.floor(bounds.min.y - 3), Math.floor(bounds.max.x - bounds.min.x + 6), Math.floor(bounds.max.y - bounds.min.y + 6));
          context.closePath();
          context.stroke();
          break;
        case 'constraint':
          var point = item.pointA;
          if (item.bodyA)
            point = item.pointB;
          context.beginPath();
          context.arc(point.x, point.y, 10, 0, 2 * Math.PI);
          context.closePath();
          context.stroke();
          break;
      }
      context.setLineDash([]);
      context.translate(-0.5, -0.5);
    }
    if (inspector.selectStart !== null) {
      context.translate(0.5, 0.5);
      context.lineWidth = 1;
      context.strokeStyle = 'rgba(255,165,0,0.6)';
      context.fillStyle = 'rgba(255,165,0,0.1)';
      bounds = inspector.selectBounds;
      context.beginPath();
      context.rect(Math.floor(bounds.min.x), Math.floor(bounds.min.y), Math.floor(bounds.max.x - bounds.min.x), Math.floor(bounds.max.y - bounds.min.y));
      context.closePath();
      context.stroke();
      context.fill();
      context.translate(-0.5, -0.5);
    }
    if (options.hasBounds)
      context.setTransform(1, 0, 0, 1, 0, 0);
  };
  var _createCanvas = function(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.oncontextmenu = function() {
      return false;
    };
    canvas.onselectstart = function() {
      return false;
    };
    return canvas;
  };
  var _getPixelRatio = function(canvas) {
    var context = canvas.getContext('2d'),
        devicePixelRatio = window.devicePixelRatio || 1,
        backingStorePixelRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
    return devicePixelRatio / backingStorePixelRatio;
  };
  var _getTexture = function(render, imagePath) {
    var image = render.textures[imagePath];
    if (image)
      return image;
    image = render.textures[imagePath] = new Image();
    image.src = imagePath;
    return image;
  };
  var _applyBackground = function(render, background) {
    var cssBackground = background;
    if (/(jpg|gif|png)$/.test(background))
      cssBackground = 'url(' + background + ')';
    render.canvas.style.background = cssBackground;
    render.canvas.style.backgroundSize = "contain";
    render.currentBackground = background;
  };
})();
