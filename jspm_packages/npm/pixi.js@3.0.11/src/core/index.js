/* */ 
var core = module.exports = Object.assign(require('./const'), require('./math/index'), {
  utils: require('./utils/index'),
  ticker: require('./ticker/index'),
  DisplayObject: require('./display/DisplayObject'),
  Container: require('./display/Container'),
  Sprite: require('./sprites/Sprite'),
  ParticleContainer: require('./particles/ParticleContainer'),
  SpriteRenderer: require('./sprites/webgl/SpriteRenderer'),
  ParticleRenderer: require('./particles/webgl/ParticleRenderer'),
  Text: require('./text/Text'),
  Graphics: require('./graphics/Graphics'),
  GraphicsData: require('./graphics/GraphicsData'),
  GraphicsRenderer: require('./graphics/webgl/GraphicsRenderer'),
  Texture: require('./textures/Texture'),
  BaseTexture: require('./textures/BaseTexture'),
  RenderTexture: require('./textures/RenderTexture'),
  VideoBaseTexture: require('./textures/VideoBaseTexture'),
  TextureUvs: require('./textures/TextureUvs'),
  CanvasRenderer: require('./renderers/canvas/CanvasRenderer'),
  CanvasGraphics: require('./renderers/canvas/utils/CanvasGraphics'),
  CanvasBuffer: require('./renderers/canvas/utils/CanvasBuffer'),
  WebGLRenderer: require('./renderers/webgl/WebGLRenderer'),
  WebGLManager: require('./renderers/webgl/managers/WebGLManager'),
  ShaderManager: require('./renderers/webgl/managers/ShaderManager'),
  Shader: require('./renderers/webgl/shaders/Shader'),
  TextureShader: require('./renderers/webgl/shaders/TextureShader'),
  PrimitiveShader: require('./renderers/webgl/shaders/PrimitiveShader'),
  ComplexPrimitiveShader: require('./renderers/webgl/shaders/ComplexPrimitiveShader'),
  ObjectRenderer: require('./renderers/webgl/utils/ObjectRenderer'),
  RenderTarget: require('./renderers/webgl/utils/RenderTarget'),
  AbstractFilter: require('./renderers/webgl/filters/AbstractFilter'),
  FXAAFilter: require('./renderers/webgl/filters/FXAAFilter'),
  SpriteMaskFilter: require('./renderers/webgl/filters/SpriteMaskFilter'),
  autoDetectRenderer: function(width, height, options, noWebGL) {
    width = width || 800;
    height = height || 600;
    if (!noWebGL && core.utils.isWebGLSupported()) {
      return new core.WebGLRenderer(width, height, options);
    }
    return new core.CanvasRenderer(width, height, options);
  }
});
