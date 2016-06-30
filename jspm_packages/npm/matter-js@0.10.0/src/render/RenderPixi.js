/* */ 
var RenderPixi = {};
module.exports = RenderPixi;
var Composite = require('../body/Composite');
var Common = require('../core/Common');
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
  RenderPixi.create = function(options) {
    Common.log('RenderPixi.create: Matter.RenderPixi is deprecated (see docs)', 'warn');
    var defaults = {
      controller: RenderPixi,
      engine: null,
      element: null,
      frameRequestId: null,
      canvas: null,
      renderer: null,
      container: null,
      spriteContainer: null,
      pixiOptions: null,
      options: {
        width: 800,
        height: 600,
        background: '#fafafa',
        wireframeBackground: '#222',
        hasBounds: false,
        enabled: true,
        wireframes: true,
        showSleeping: true,
        showDebug: false,
        showBroadphase: false,
        showBounds: false,
        showVelocity: false,
        showCollisions: false,
        showAxes: false,
        showPositions: false,
        showAngleIndicator: false,
        showIds: false,
        showShadows: false
      }
    };
    var render = Common.extend(defaults, options),
        transparent = !render.options.wireframes && render.options.background === 'transparent';
    render.pixiOptions = render.pixiOptions || {
      view: render.canvas,
      transparent: transparent,
      antialias: true,
      backgroundColor: options.background
    };
    render.mouse = options.mouse;
    render.engine = options.engine;
    render.renderer = render.renderer || new PIXI.WebGLRenderer(render.options.width, render.options.height, render.pixiOptions);
    render.container = render.container || new PIXI.Container();
    render.spriteContainer = render.spriteContainer || new PIXI.Container();
    render.canvas = render.canvas || render.renderer.view;
    render.bounds = render.bounds || {
      min: {
        x: 0,
        y: 0
      },
      max: {
        x: render.options.width,
        y: render.options.height
      }
    };
    render.textures = {};
    render.sprites = {};
    render.primitives = {};
    render.container.addChild(render.spriteContainer);
    if (Common.isElement(render.element)) {
      render.element.appendChild(render.canvas);
    } else {
      Common.log('No "render.element" passed, "render.canvas" was not inserted into document.', 'warn');
    }
    render.canvas.oncontextmenu = function() {
      return false;
    };
    render.canvas.onselectstart = function() {
      return false;
    };
    return render;
  };
  RenderPixi.run = function(render) {
    (function loop(time) {
      render.frameRequestId = _requestAnimationFrame(loop);
      RenderPixi.world(render);
    })();
  };
  RenderPixi.stop = function(render) {
    _cancelAnimationFrame(render.frameRequestId);
  };
  RenderPixi.clear = function(render) {
    var container = render.container,
        spriteContainer = render.spriteContainer;
    while (container.children[0]) {
      container.removeChild(container.children[0]);
    }
    while (spriteContainer.children[0]) {
      spriteContainer.removeChild(spriteContainer.children[0]);
    }
    var bgSprite = render.sprites['bg-0'];
    render.textures = {};
    render.sprites = {};
    render.primitives = {};
    render.sprites['bg-0'] = bgSprite;
    if (bgSprite)
      container.addChildAt(bgSprite, 0);
    render.container.addChild(render.spriteContainer);
    render.currentBackground = null;
    container.scale.set(1, 1);
    container.position.set(0, 0);
  };
  RenderPixi.setBackground = function(render, background) {
    if (render.currentBackground !== background) {
      var isColor = background.indexOf && background.indexOf('#') !== -1,
          bgSprite = render.sprites['bg-0'];
      if (isColor) {
        var color = Common.colorToNumber(background);
        render.renderer.backgroundColor = color;
        if (bgSprite)
          render.container.removeChild(bgSprite);
      } else {
        if (!bgSprite) {
          var texture = _getTexture(render, background);
          bgSprite = render.sprites['bg-0'] = new PIXI.Sprite(texture);
          bgSprite.position.x = 0;
          bgSprite.position.y = 0;
          render.container.addChildAt(bgSprite, 0);
        }
      }
      render.currentBackground = background;
    }
  };
  RenderPixi.world = function(render) {
    var engine = render.engine,
        world = engine.world,
        renderer = render.renderer,
        container = render.container,
        options = render.options,
        bodies = Composite.allBodies(world),
        allConstraints = Composite.allConstraints(world),
        constraints = [],
        i;
    if (options.wireframes) {
      RenderPixi.setBackground(render, options.wireframeBackground);
    } else {
      RenderPixi.setBackground(render, options.background);
    }
    var boundsWidth = render.bounds.max.x - render.bounds.min.x,
        boundsHeight = render.bounds.max.y - render.bounds.min.y,
        boundsScaleX = boundsWidth / render.options.width,
        boundsScaleY = boundsHeight / render.options.height;
    if (options.hasBounds) {
      for (i = 0; i < bodies.length; i++) {
        var body = bodies[i];
        body.render.sprite.visible = Bounds.overlaps(body.bounds, render.bounds);
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
      container.scale.set(1 / boundsScaleX, 1 / boundsScaleY);
      container.position.set(-render.bounds.min.x * (1 / boundsScaleX), -render.bounds.min.y * (1 / boundsScaleY));
    } else {
      constraints = allConstraints;
    }
    for (i = 0; i < bodies.length; i++)
      RenderPixi.body(render, bodies[i]);
    for (i = 0; i < constraints.length; i++)
      RenderPixi.constraint(render, constraints[i]);
    renderer.render(container);
  };
  RenderPixi.constraint = function(render, constraint) {
    var engine = render.engine,
        bodyA = constraint.bodyA,
        bodyB = constraint.bodyB,
        pointA = constraint.pointA,
        pointB = constraint.pointB,
        container = render.container,
        constraintRender = constraint.render,
        primitiveId = 'c-' + constraint.id,
        primitive = render.primitives[primitiveId];
    if (!primitive)
      primitive = render.primitives[primitiveId] = new PIXI.Graphics();
    if (!constraintRender.visible || !constraint.pointA || !constraint.pointB) {
      primitive.clear();
      return;
    }
    if (Common.indexOf(container.children, primitive) === -1)
      container.addChild(primitive);
    primitive.clear();
    primitive.beginFill(0, 0);
    primitive.lineStyle(constraintRender.lineWidth, Common.colorToNumber(constraintRender.strokeStyle), 1);
    if (bodyA) {
      primitive.moveTo(bodyA.position.x + pointA.x, bodyA.position.y + pointA.y);
    } else {
      primitive.moveTo(pointA.x, pointA.y);
    }
    if (bodyB) {
      primitive.lineTo(bodyB.position.x + pointB.x, bodyB.position.y + pointB.y);
    } else {
      primitive.lineTo(pointB.x, pointB.y);
    }
    primitive.endFill();
  };
  RenderPixi.body = function(render, body) {
    var engine = render.engine,
        bodyRender = body.render;
    if (!bodyRender.visible)
      return;
    if (bodyRender.sprite && bodyRender.sprite.texture) {
      var spriteId = 'b-' + body.id,
          sprite = render.sprites[spriteId],
          spriteContainer = render.spriteContainer;
      if (!sprite)
        sprite = render.sprites[spriteId] = _createBodySprite(render, body);
      if (Common.indexOf(spriteContainer.children, sprite) === -1)
        spriteContainer.addChild(sprite);
      sprite.position.x = body.position.x;
      sprite.position.y = body.position.y;
      sprite.rotation = body.angle;
      sprite.scale.x = bodyRender.sprite.xScale || 1;
      sprite.scale.y = bodyRender.sprite.yScale || 1;
    } else {
      var primitiveId = 'b-' + body.id,
          primitive = render.primitives[primitiveId],
          container = render.container;
      if (!primitive) {
        primitive = render.primitives[primitiveId] = _createBodyPrimitive(render, body);
        primitive.initialAngle = body.angle;
      }
      if (Common.indexOf(container.children, primitive) === -1)
        container.addChild(primitive);
      primitive.position.x = body.position.x;
      primitive.position.y = body.position.y;
      primitive.rotation = body.angle - primitive.initialAngle;
    }
  };
  var _createBodySprite = function(render, body) {
    var bodyRender = body.render,
        texturePath = bodyRender.sprite.texture,
        texture = _getTexture(render, texturePath),
        sprite = new PIXI.Sprite(texture);
    sprite.anchor.x = body.render.sprite.xOffset;
    sprite.anchor.y = body.render.sprite.yOffset;
    return sprite;
  };
  var _createBodyPrimitive = function(render, body) {
    var bodyRender = body.render,
        options = render.options,
        primitive = new PIXI.Graphics(),
        fillStyle = Common.colorToNumber(bodyRender.fillStyle),
        strokeStyle = Common.colorToNumber(bodyRender.strokeStyle),
        strokeStyleIndicator = Common.colorToNumber(bodyRender.strokeStyle),
        strokeStyleWireframe = Common.colorToNumber('#bbb'),
        strokeStyleWireframeIndicator = Common.colorToNumber('#CD5C5C'),
        part;
    primitive.clear();
    for (var k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
      part = body.parts[k];
      if (!options.wireframes) {
        primitive.beginFill(fillStyle, 1);
        primitive.lineStyle(bodyRender.lineWidth, strokeStyle, 1);
      } else {
        primitive.beginFill(0, 0);
        primitive.lineStyle(1, strokeStyleWireframe, 1);
      }
      primitive.moveTo(part.vertices[0].x - body.position.x, part.vertices[0].y - body.position.y);
      for (var j = 1; j < part.vertices.length; j++) {
        primitive.lineTo(part.vertices[j].x - body.position.x, part.vertices[j].y - body.position.y);
      }
      primitive.lineTo(part.vertices[0].x - body.position.x, part.vertices[0].y - body.position.y);
      primitive.endFill();
      if (options.showAngleIndicator || options.showAxes) {
        primitive.beginFill(0, 0);
        if (options.wireframes) {
          primitive.lineStyle(1, strokeStyleWireframeIndicator, 1);
        } else {
          primitive.lineStyle(1, strokeStyleIndicator);
        }
        primitive.moveTo(part.position.x - body.position.x, part.position.y - body.position.y);
        primitive.lineTo(((part.vertices[0].x + part.vertices[part.vertices.length - 1].x) / 2 - body.position.x), ((part.vertices[0].y + part.vertices[part.vertices.length - 1].y) / 2 - body.position.y));
        primitive.endFill();
      }
    }
    return primitive;
  };
  var _getTexture = function(render, imagePath) {
    var texture = render.textures[imagePath];
    if (!texture)
      texture = render.textures[imagePath] = PIXI.Texture.fromImage(imagePath);
    return texture;
  };
})();
